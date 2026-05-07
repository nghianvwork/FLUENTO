import { Trophy } from 'lucide-react';

const achievements = [
  { id: 1, title: 'First Conversation', desc: 'Complete your first AI roleplay', progress: 100, icon: '🎭' },
  { id: 2, title: 'Accent Explorer', desc: 'Practice 5 different accents', progress: 60, icon: '🎙️' },
  { id: 3, title: 'Career Builder', desc: 'Finish 3 career paths', progress: 40, icon: '💼' },
  { id: 4, title: 'Night Owl', desc: 'Study after 11pm 5 times', progress: 80, icon: '🌙' },
  { id: 5, title: 'Word Collector', desc: 'Learn 300 new words', progress: 25, icon: '📚' },
  { id: 6, title: 'Speaking Marathon', desc: 'Accumulate 10 hours in rooms', progress: 55, icon: '🏃' },
];

export default function Achievements() {
  return (
    <div>
      <div className="page-header">
        <div className="page-title">Achievements</div>
        <div className="page-subtitle">Track milestones and unlock rare badges</div>
      </div>

      <div className="card admin-hero" style={{ marginBottom: 24 }}>
        <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontWeight: 700 }}>Legend Rank</div>
            <div className="text-sm text-muted">Collect 6 more badges to reach Platinum</div>
          </div>
          <div className="pill pill-green"><Trophy size={14} /> 12 badges</div>
        </div>
      </div>

      <div className="card-grid">
        {achievements.map((a) => (
          <div key={a.id} className="card badge-card">
            <div className="badge-icon">{a.icon}</div>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>{a.title}</div>
            <div className="text-sm text-muted" style={{ marginBottom: 12 }}>{a.desc}</div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${a.progress}%` }} />
            </div>
            <div className="text-sm text-muted" style={{ marginTop: 8 }}>{a.progress}% completed</div>
          </div>
        ))}
      </div>
    </div>
  );
}
