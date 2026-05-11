import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { speakingApi } from '../../services/apiServices';
import { SpeakingRoom, SpeakingRoomHistory } from '../../types';
import { Users, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RoomList() {
  const [rooms, setRooms] = useState<SpeakingRoom[]>([]);
  const [history, setHistory] = useState<SpeakingRoomHistory[]>([]);
  const [viewMode, setViewMode] = useState<'rooms' | 'history'>('rooms');
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyFilter, setHistoryFilter] = useState('ALL');
  const [historySort, setHistorySort] = useState<'latest' | 'duration'>('latest');
  const navigate = useNavigate();

  useEffect(() => {
    speakingApi.getRooms()
      .then(res => setRooms(res.data.data))
      .catch(() => {
        toast.error('Khong tai duoc danh sach phong');
        setRooms([]);
      });
  }, []);

  useEffect(() => {
    if (viewMode !== 'history') return;
    setHistoryLoading(true);
    speakingApi.getMyHistory()
      .then(res => setHistory(res.data.data || []))
      .catch(() => setHistory([]))
      .finally(() => setHistoryLoading(false));
  }, [viewMode]);

  const handleJoin = async (roomId: number) => {
    let joined = false;
    try {
      await speakingApi.joinRoom(roomId);
      toast.success('Đã tham gia phòng!');
      joined = true;
    } catch {
      toast.error('Khong the tham gia phong');
    }
    if (joined) {
      navigate(`/app/speaking/${roomId}`);
    }
  };

  const uniqueRooms = Array.from(
    new Map(history.map(entry => [entry.roomId, entry.roomTitle])).entries()
  ).map(([roomId, roomTitle]) => ({ roomId, roomTitle }));

  const filteredHistory = historyFilter === 'ALL'
    ? history
    : history.filter(entry => String(entry.roomId) === historyFilter);

  const sortedHistory = [...filteredHistory].sort((a, b) => {
    if (historySort === 'duration') {
      return b.durationSeconds - a.durationSeconds;
    }
    return new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime();
  });

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const rest = seconds % 60;
    if (minutes <= 0) return `${rest}s`;
    return `${minutes}m ${rest}s`;
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">🗣️ Social Speaking Rooms</div>
        <div className="page-subtitle">Phòng thảo luận 24/7 — tham gia bất cứ lúc nào</div>
      </div>

      <div className="flex gap-8 mb-16">
        <button className={`btn btn-sm ${viewMode === 'rooms' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setViewMode('rooms')}>Phong dang hoat dong</button>
        <button className={`btn btn-sm ${viewMode === 'history' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setViewMode('history')}>Lich su tham gia</button>
      </div>

      {viewMode === 'rooms' ? (
        <div className="card-grid">
          {rooms.map(room => (
            <div key={room.id} className="room-card">
              <div className="room-header">
                <div className="room-status">LIVE</div>
                <span className={`badge ${room.roomType === 'DEBATE' ? 'badge-red' : 'badge-cyan'}`}>{room.roomType}</span>
              </div>
              <div className="card-title" style={{ marginBottom: 8 }}>{room.title}</div>
              <div className="card-desc" style={{ marginBottom: 16 }}>{room.topic}</div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-8">
                  <Users size={16} color="var(--text-muted)" />
                  <span className="text-sm" style={{ color: room.currentParticipants >= room.maxParticipants ? 'var(--accent-red)' : 'var(--text-secondary)' }}>
                    {room.currentParticipants}/{room.maxParticipants}
                  </span>
                  <span className={`badge ${room.difficultyLevel === 'BEGINNER' ? 'badge-green' : room.difficultyLevel === 'INTERMEDIATE' ? 'badge-orange' : 'badge-red'}`}>
                    {room.difficultyLevel}
                  </span>
                </div>
                <button className="btn btn-sm btn-primary" onClick={() => handleJoin(room.id)}
                  disabled={room.currentParticipants >= room.maxParticipants}>
                  <LogIn size={14} /> {room.currentParticipants >= room.maxParticipants ? 'Đầy' : 'Tham gia'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="flex items-center gap-12" style={{ marginBottom: 16, flexWrap: 'wrap' }}>
            <div className="text-sm text-muted">Loc theo phong:</div>
            <select
              className="input"
              value={historyFilter}
              onChange={(e) => setHistoryFilter(e.target.value)}
              style={{ maxWidth: 320 }}
            >
              <option value="ALL">Tat ca phong</option>
              {uniqueRooms.map(room => (
                <option key={room.roomId} value={String(room.roomId)}>{room.roomTitle}</option>
              ))}
            </select>
            <div className="text-sm text-muted">Sap xep:</div>
            <select
              className="input"
              value={historySort}
              onChange={(e) => setHistorySort(e.target.value as 'latest' | 'duration')}
              style={{ maxWidth: 220 }}
            >
              <option value="latest">Gan nhat</option>
              <option value="duration">Thoi luong</option>
            </select>
          </div>
          {historyLoading ? (
            <div className="text-muted" style={{ padding: 24 }}>Dang tai lich su...</div>
          ) : sortedHistory.length === 0 ? (
            <div className="text-muted" style={{ padding: 24 }}>Chua co lich su tham gia.</div>
          ) : (
            <div className="flex flex-col gap-12">
              {sortedHistory.map(entry => (
                <div key={entry.id} className="card" style={{ background: 'var(--bg-tertiary)' }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div style={{ fontWeight: 700, marginBottom: 4 }}>{entry.roomTitle}</div>
                      <div className="text-sm text-muted">
                        {new Date(entry.joinedAt).toLocaleString('vi-VN')} - {entry.leftAt ? new Date(entry.leftAt).toLocaleString('vi-VN') : 'Dang tham gia'}
                      </div>
                    </div>
                    <div className="flex gap-8" style={{ flexWrap: 'wrap' }}>
                      <div className="pill pill-cyan" style={{ fontSize: 12 }}>
                        Thoi luong: {formatDuration(entry.durationSeconds)}
                      </div>
                      <div className="pill pill-green" style={{ fontSize: 12 }}>
                        Speaking: {formatDuration(entry.speakingTimeSeconds || 0)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
