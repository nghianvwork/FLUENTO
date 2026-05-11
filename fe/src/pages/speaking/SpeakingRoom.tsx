import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { speakingApi } from '../../services/apiServices';
import { useAuthStore } from '../../stores/authStore';
import { SpeakingRoom, SpeakingRoomHistory } from '../../types';
import { Mic, MicOff, PhoneOff, Users, Activity } from 'lucide-react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import toast from 'react-hot-toast';

type SignalMessage = {
  type: string;
  payload?: string;
  senderId?: number;
  roomId?: number;
};

type RemoteStream = {
  peerId: number;
  stream: MediaStream;
};

const ICE_SERVERS: RTCIceServer[] = [{ urls: 'stun:stun.l.google.com:19302' }];

function AudioTile({ label, stream, muted }: { label: string; stream: MediaStream; muted?: boolean }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="audio-tile">
      <div className="audio-tile-header">
        <div className="audio-dot" />
        <span>{label}</span>
      </div>
      <audio ref={audioRef} autoPlay playsInline muted={muted} />
    </div>
  );
}

export default function SpeakingRoomPage() {
  const { id } = useParams();
  const roomId = Number(id);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [room, setRoom] = useState<SpeakingRoom | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<RemoteStream[]>([]);
  const [connected, setConnected] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [status, setStatus] = useState('Idle');
  const [history, setHistory] = useState<SpeakingRoomHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const myId = useMemo(() => user?.userId ?? Math.floor(Math.random() * 1_000_000_000), [user?.userId]);
  const clientRef = useRef<Client | null>(null);
  const peersRef = useRef<Map<number, RTCPeerConnection>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    speakingApi.getRooms()
      .then((res) => {
        const found = res.data.data.find((r: SpeakingRoom) => r.id === roomId);
        setRoom(found || null);
      })
      .catch(() => setRoom(null));
  }, [roomId]);

  useEffect(() => {
    if (!roomId) return;
    setHistoryLoading(true);
    speakingApi.getHistory(roomId)
      .then((res) => setHistory(res.data.data || []))
      .catch(() => {
        toast.error('Khong tai duoc lich su phong');
        setHistory([]);
      })
      .finally(() => setHistoryLoading(false));
  }, [roomId]);

  useEffect(() => {
    return () => {
      leaveRoom();
    };
  }, []);

  const getPeer = (peerId: number) => {
    const existing = peersRef.current.get(peerId);
    if (existing) return existing;

    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => pc.addTrack(track, localStreamRef.current!));
    }

    pc.ontrack = (event) => {
      const stream = event.streams[0];
      setRemoteStreams((prev) => (prev.some((p) => p.peerId === peerId) ? prev : [...prev, { peerId, stream }]));
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal('ICE', { targetId: peerId, candidate: event.candidate });
      }
    };

    pc.onconnectionstatechange = () => {
      if (['failed', 'disconnected', 'closed'].includes(pc.connectionState)) {
        removePeer(peerId);
      }
    };

    peersRef.current.set(peerId, pc);
    return pc;
  };

  const removePeer = (peerId: number) => {
    const pc = peersRef.current.get(peerId);
    if (pc) pc.close();
    peersRef.current.delete(peerId);
    setRemoteStreams((prev) => prev.filter((p) => p.peerId !== peerId));
  };

  const sendSignal = (type: string, payload?: Record<string, any>) => {
    const client = clientRef.current;
    if (!client || !client.connected) return;
    client.publish({
      destination: `/app/rooms/${roomId}/signal`,
      body: JSON.stringify({ type, payload: payload ? JSON.stringify(payload) : '', senderId: myId }),
    });
  };

  const handleSignal = async (message: SignalMessage) => {
    const senderId = Number(message.senderId);
    if (!senderId || senderId === myId) return;
    const payload = message.payload ? JSON.parse(message.payload) : {};
    if (payload.targetId && payload.targetId !== myId) return;

    if (message.type === 'JOIN') {
      const shouldOffer = myId > senderId;
      if (shouldOffer) {
        const pc = getPeer(senderId);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        sendSignal('OFFER', { targetId: senderId, sdp: pc.localDescription });
      } else {
        getPeer(senderId);
      }
      return;
    }

    if (message.type === 'OFFER') {
      const pc = getPeer(senderId);
      await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      sendSignal('ANSWER', { targetId: senderId, sdp: pc.localDescription });
      return;
    }

    if (message.type === 'ANSWER') {
      const pc = peersRef.current.get(senderId);
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
      }
      return;
    }

    if (message.type === 'ICE') {
      const pc = peersRef.current.get(senderId);
      if (pc && payload.candidate) {
        await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
      }
      return;
    }

    if (message.type === 'LEAVE') {
      removePeer(senderId);
    }
  };

  const connectRoom = async () => {
    if (connected) return;
    if (!roomId) return toast.error('Invalid room');
    setStatus('Requesting microphone');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      setLocalStream(stream);
      localStreamRef.current = stream;
      setMicEnabled(true);

      const client = new Client({
        webSocketFactory: () => new SockJS('/ws'),
        reconnectDelay: 3000,
        onConnect: () => {
          client.subscribe(`/topic/rooms/${roomId}`, (frame) => {
            const body = JSON.parse(frame.body) as SignalMessage;
            handleSignal(body);
          });
          sendSignal('JOIN', { name: user?.fullName || 'User' });
          setStatus('Connected');
          setConnected(true);
        },
        onStompError: () => {
          setStatus('Signaling error');
          toast.error('Cannot connect signaling server');
        },
      });

      client.activate();
      clientRef.current = client;
    } catch {
      setStatus('Microphone blocked');
      toast.error('Cannot access microphone');
    }
  };

  const toggleMic = () => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
      setMicEnabled(track.enabled);
    });
  };

  const leaveRoom = async () => {
    sendSignal('LEAVE');
    peersRef.current.forEach((pc) => pc.close());
    peersRef.current.clear();
    setRemoteStreams([]);
    if (clientRef.current) {
      clientRef.current.deactivate();
      clientRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
      setLocalStream(null);
    }
    if (connected) {
      try { await speakingApi.leaveRoom(roomId); } catch { /* ignore */ }
    }
    setConnected(false);
    setStatus('Idle');
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const rest = seconds % 60;
    if (minutes <= 0) return `${rest}s`;
    return `${minutes}m ${rest}s`;
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">🎙️ Speaking Room</div>
        <div className="page-subtitle">{room?.title || `Room #${roomId}`}</div>
      </div>

      <div className="card mb-24" style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div className="flex items-center gap-8">
          <Activity size={16} color="var(--accent-cyan)" />
          <span className="text-sm text-muted">{status}</span>
        </div>
        <div className="flex items-center gap-8">
          <Users size={16} color="var(--text-muted)" />
          <span className="text-sm">{1 + remoteStreams.length} participants</span>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 12 }}>
          <button className="btn btn-secondary" onClick={toggleMic} disabled={!localStreamRef.current}>
            {micEnabled ? <><Mic size={16} /> Mute</> : <><MicOff size={16} /> Unmute</>}
          </button>
          {!connected ? (
            <button className="btn btn-primary" onClick={connectRoom}>Join with Mic</button>
          ) : (
            <button className="btn btn-accent" onClick={() => { leaveRoom(); navigate('/app/speaking'); }}>
              <PhoneOff size={16} /> Leave room
            </button>
          )}
        </div>
      </div>

      <div className="audio-grid">
        {localStream && (
          <AudioTile label={`${user?.fullName || 'You'} (you)`} stream={localStream} muted />
        )}
        {remoteStreams.map((item) => (
          <AudioTile key={item.peerId} label={`Peer ${item.peerId}`} stream={item.stream} />
        ))}
        {!localStream && (
          <div className="card text-muted" style={{ padding: 32 }}>Click "Join with Mic" to connect.</div>
        )}
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <div className="card-title" style={{ marginBottom: 12 }}>Lich su tham gia</div>
        {historyLoading ? (
          <div className="text-muted" style={{ padding: 16 }}>Dang tai lich su...</div>
        ) : history.length === 0 ? (
          <div className="text-muted" style={{ padding: 16 }}>Chua co lich su trong phong nay.</div>
        ) : (
          <div className="flex flex-col gap-12">
            {history.map((entry) => (
              <div key={entry.id} className="card" style={{ background: 'var(--bg-tertiary)' }}>
                <div className="flex justify-between items-start">
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>{entry.roomTitle}</div>
                    <div className="text-sm text-muted">
                      {new Date(entry.joinedAt).toLocaleString('vi-VN')} - {entry.leftAt ? new Date(entry.leftAt).toLocaleString('vi-VN') : 'Dang tham gia'}
                    </div>
                  </div>
                  <div className="pill pill-cyan" style={{ fontSize: 12 }}>
                    {formatDuration(entry.durationSeconds)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
