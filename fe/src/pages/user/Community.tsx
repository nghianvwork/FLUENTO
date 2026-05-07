import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, MessageSquare, Sparkles, Bot } from 'lucide-react';
import toast from 'react-hot-toast';
import { aiApi, communityApi } from '../../services/apiServices';
import { CommunityClub, CommunityEvent } from '../../types';

export default function Community() {
  type ThreadMessage = { role: 'user' | 'ai'; text: string };
  const navigate = useNavigate();
  const [clubs, setClubs] = useState<CommunityClub[]>([]);
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [message, setMessage] = useState('');
  const [thread, setThread] = useState<ThreadMessage[]>([
    { role: 'ai', text: 'Xin chao! Minh la ENOVA AI. Ban muon thong bao gi toi cong dong?' }
  ]);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadCommunity = async () => {
      setLoading(true);
      try {
        const [clubsRes, eventsRes] = await Promise.all([
          communityApi.getClubs(),
          communityApi.getEvents(),
        ]);
        setClubs(clubsRes.data.data);
        setEvents(eventsRes.data.data);
      } catch {
        setClubs([
          { id: 1, name: 'Tech Builders Club', members: 1240, focus: 'Product + engineering', level: 'B1-B2', joined: false },
          { id: 2, name: 'Marketing Storytellers', members: 780, focus: 'Narrative + pitch', level: 'A2-B1', joined: false },
          { id: 3, name: 'Finance Talkroom', members: 512, focus: 'Business English', level: 'B2-C1', joined: false },
        ]);
        setEvents([
          { id: 1, title: 'Global Demo Day', timeLabel: 'Thu 20:00', host: 'Coach Anna', reserved: 24, capacity: 40, reservedByUser: false },
          { id: 2, title: 'Interview Challenge', timeLabel: 'Sat 10:00', host: 'AI Moderator', reserved: 18, capacity: 30, reservedByUser: false },
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadCommunity();
  }, []);

  const toggleClub = async (club: CommunityClub) => {
    try {
      const res = club.joined
        ? await communityApi.leaveClub(club.id)
        : await communityApi.joinClub(club.id);
      const updated = res.data.data as CommunityClub;
      setClubs((prev) => prev.map((item) => item.id === updated.id ? updated : item));
      toast.success(updated.joined ? 'Joined club' : 'Left club');
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Unable to update club';
      toast.error(message);
    }
  };

  const toggleReservation = async (event: CommunityEvent) => {
    try {
      const res = event.reservedByUser
        ? await communityApi.cancelReservation(event.id)
        : await communityApi.reserveEvent(event.id);
      const updated = res.data.data as CommunityEvent;
      setEvents((prev) => prev.map((item) => item.id === updated.id ? updated : item));
      toast.success(updated.reservedByUser ? 'Seat reserved' : 'Reservation canceled');
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Unable to reserve seat';
      toast.error(message);
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) return;
    const next: ThreadMessage[] = [...thread, { role: 'user', text: message }];
    setThread(next);
    setMessage('');
    setSending(true);
    try {
      const res = await aiApi.chat({ message, context: 'Community announcements and engagement', tone: 'professional' });
      setThread([...next, { role: 'ai', text: res.data.data.reply }]);
    } catch {
      setThread([...next, { role: 'ai', text: 'AI is unavailable right now. Please try again.' }]);
    } finally {
      setSending(false);
    }
  };

  const handleMatch = async () => {
    try {
      const res = await communityApi.match();
      const match = res.data.data;
      toast.success(`Matched with ${match.memberName} in ${match.clubName}`);
    } catch (err: any) {
      const message = err?.response?.data?.message || 'No match found';
      toast.error(message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Community</div>
        <div className="page-subtitle">Find your tribe, practice together, and level up faster</div>
      </div>

      <div className="card admin-hero" style={{ marginBottom: 24 }}>
        <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontWeight: 700 }}>Smart Match</div>
            <div className="text-sm text-muted">AI pairs you with peers at the same level</div>
          </div>
          <button className="btn btn-primary" onClick={handleMatch} disabled={loading}><Sparkles size={16} /> Find a partner</button>
        </div>
      </div>

      <div className="card-grid">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Learning Clubs</div>
              <div className="card-desc">Topic-based micro communities</div>
            </div>
            <Users size={18} color="var(--accent-cyan)" />
          </div>
          {clubs.map((club) => (
            <div key={club.id} className="flex items-center justify-between" style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{club.name}</div>
                <div className="text-sm text-muted">{club.focus} · {club.level} · {club.members} members</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-sm btn-secondary" onClick={() => toggleClub(club)} disabled={loading}>
                  {club.joined ? 'Joined' : 'Join'}
                </button>
                <button className="btn btn-sm btn-primary" onClick={() => navigate(`/app/community/clubs/${club.id}`)}>
                  View
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Upcoming Events</div>
              <div className="card-desc">Live sessions hosted weekly</div>
            </div>
            <MessageSquare size={18} color="var(--accent-orange)" />
          </div>
          {events.map((event) => (
            <div key={event.id} className="flex items-center justify-between" style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{event.title}</div>
                <div className="text-sm text-muted">{event.timeLabel} · {event.host}</div>
              </div>
              <button
                className="btn btn-sm btn-primary"
                onClick={() => toggleReservation(event)}
                disabled={loading || (!event.reservedByUser && event.reserved >= event.capacity)}
              >
                {event.reserved}/{event.capacity}
              </button>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">AI Community Assistant</div>
              <div className="card-desc">Draft announcements or replies fast</div>
            </div>
            <Bot size={18} color="var(--accent-cyan)" />
          </div>
          <div style={{ maxHeight: 240, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {thread.map((msg, idx) => (
              <div key={idx} className={`chat-message ${msg.role === 'user' ? 'user' : 'ai'}`} style={{ maxWidth: '100%' }}>
                {msg.text}
              </div>
            ))}
          </div>
          <div className="chat-input-area" style={{ marginTop: 16, padding: 0, borderTop: 'none' }}>
            <input
              className="chat-input"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Viet thong bao cho cong dong..."
            />
            <button className="btn btn-primary" onClick={sendMessage} disabled={sending}>
              {sending ? '...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
