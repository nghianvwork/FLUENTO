import { useState } from 'react';
import { Users, MessageSquare, Sparkles, Bot } from 'lucide-react';
import toast from 'react-hot-toast';
import { aiApi } from '../../services/apiServices';

const clubs = [
  { id: 1, name: 'Tech Builders Club', members: 1240, focus: 'Product + engineering', level: 'B1-B2' },
  { id: 2, name: 'Marketing Storytellers', members: 780, focus: 'Narrative + pitch', level: 'A2-B1' },
  { id: 3, name: 'Finance Talkroom', members: 512, focus: 'Business English', level: 'B2-C1' },
];

const events = [
  { id: 1, title: 'Global Demo Day', time: 'Thu 20:00', host: 'Coach Anna', seats: '24/40' },
  { id: 2, title: 'Interview Challenge', time: 'Sat 10:00', host: 'AI Moderator', seats: '18/30' },
];

export default function Community() {
  const [joinedClubs, setJoinedClubs] = useState<number[]>([1]);
  const [message, setMessage] = useState('');
  const [thread, setThread] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: 'Xin chao! Minh la ENOVA AI. Ban muon thong bao gi toi cong dong?' }
  ]);
  const [sending, setSending] = useState(false);

  const toggleClub = (id: number) => {
    setJoinedClubs((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]);
    toast.success('Community updated');
  };

  const sendMessage = async () => {
    if (!message.trim()) return;
    const next = [...thread, { role: 'user', text: message }];
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
          <button className="btn btn-primary" onClick={() => toast.success('Matching started')}><Sparkles size={16} /> Find a partner</button>
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
              <button className="btn btn-sm btn-secondary" onClick={() => toggleClub(club.id)}>
                {joinedClubs.includes(club.id) ? 'Joined' : 'Join'}
              </button>
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
                <div className="text-sm text-muted">{event.time} · {event.host}</div>
              </div>
              <button className="btn btn-sm btn-primary" onClick={() => toast.success('Seat reserved')}>{event.seats}</button>
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
