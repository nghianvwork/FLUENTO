import { useState } from 'react';
import { Flame, Target, Trophy, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const weeklyChallenges = [
  { id: 1, title: '7-Day Speaking Sprint', desc: 'Join any speaking room daily', progress: 5, goal: 7, reward: '500 XP' },
  { id: 2, title: 'Vocabulary Heatwave', desc: 'Learn 50 new words', progress: 28, goal: 50, reward: 'Accent Pack' },
  { id: 3, title: 'Roleplay Mastery', desc: 'Finish 5 roleplay sessions', progress: 3, goal: 5, reward: 'AI Coach Boost' },
];

const dailyMissions = [
  { id: 1, title: 'Shadow 3 sentences', reward: '+80 XP', icon: '🎙️' },
  { id: 2, title: 'Complete 1 career lesson', reward: '+120 XP', icon: '💼' },
  { id: 3, title: 'Send 3 voice messages', reward: '+60 XP', icon: '💬' },
];

export default function Challenges() {
  const [claimed, setClaimed] = useState<number[]>([]);

  const claim = (id: number) => {
    setClaimed((prev) => [...prev, id]);
    toast.success('Reward claimed');
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Challenges</div>
        <div className="page-subtitle">Push streaks, unlock rewards, and level up faster</div>
      </div>

      <div className="card admin-hero" style={{ marginBottom: 24 }}>
        <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontWeight: 700 }}>Weekly Momentum</div>
            <div className="text-sm text-muted">Finish 3 missions to unlock a bonus badge</div>
          </div>
          <div className="pill pill-orange"><Flame size={14} /> 5-day streak</div>
        </div>
      </div>

      <div className="card-grid">
        {weeklyChallenges.map((c) => (
          <div key={c.id} className="card">
            <div className="card-header">
              <div>
                <div className="card-title">{c.title}</div>
                <div className="card-desc">{c.desc}</div>
              </div>
              <Target size={18} color="var(--accent-cyan)" />
            </div>
            <div className="progress-bar" style={{ marginBottom: 12 }}>
              <div className="progress-fill" style={{ width: `${(c.progress / c.goal) * 100}%` }} />
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted">{c.progress}/{c.goal} completed</div>
              <div className="pill pill-green"><Trophy size={12} /> {c.reward}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="page-title" style={{ fontSize: 20, marginTop: 32, marginBottom: 16 }}>Daily Missions</div>
      <div className="card-grid">
        {dailyMissions.map((m) => (
          <div key={m.id} className="card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-12">
                <div className="card-icon" style={{ background: 'var(--bg-tertiary)' }}>{m.icon}</div>
                <div>
                  <div style={{ fontWeight: 700 }}>{m.title}</div>
                  <div className="text-sm text-muted">Reward {m.reward}</div>
                </div>
              </div>
              <button className="btn btn-sm btn-secondary" disabled={claimed.includes(m.id)} onClick={() => claim(m.id)}>
                <Zap size={14} /> {claimed.includes(m.id) ? 'Claimed' : 'Claim'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
