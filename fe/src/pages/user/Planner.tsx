import { useState } from 'react';
import { Calendar, Clock, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const recommendedBlocks = [
  { id: 1, title: 'Accent Focus', duration: 15, time: '07:30', color: 'var(--accent-pink)' },
  { id: 2, title: 'Roleplay Sprint', duration: 20, time: '12:30', color: 'var(--primary)' },
  { id: 3, title: 'Content Immersion', duration: 25, time: '20:00', color: 'var(--accent-cyan)' },
];

export default function Planner() {
  const [schedule, setSchedule] = useState<Record<string, typeof recommendedBlocks>>({
    Mon: [recommendedBlocks[0]],
    Tue: [recommendedBlocks[1]],
    Wed: [recommendedBlocks[2]],
    Thu: [],
    Fri: [recommendedBlocks[1]],
    Sat: [],
    Sun: [],
  });

  const addBlock = (day: string, block: typeof recommendedBlocks[0]) => {
    setSchedule((prev) => ({ ...prev, [day]: [...prev[day], block] }));
    toast.success(`Added to ${day} plan`);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Learning Planner</div>
        <div className="page-subtitle">Build a weekly rhythm with AI-suggested sessions</div>
      </div>

      <div className="card admin-hero" style={{ marginBottom: 24 }}>
        <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontWeight: 700 }}>Weekly Goal</div>
            <div className="text-sm text-muted">Hit 180 minutes this week</div>
          </div>
          <div className="pill pill-cyan"><Calendar size={14} /> 4/7 days planned</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <div>
            <div className="card-title">AI Recommendations</div>
            <div className="card-desc">Optimized for your energy and streak</div>
          </div>
          <Sparkles size={18} color="var(--accent-cyan)" />
        </div>
        <div className="flex gap-12" style={{ flexWrap: 'wrap' }}>
          {recommendedBlocks.map((block) => (
            <div key={block.id} className="plan-pill" style={{ borderColor: block.color }}>
              <div style={{ fontWeight: 700 }}>{block.title}</div>
              <div className="text-sm text-muted"><Clock size={12} /> {block.time} · {block.duration}m</div>
              <button className="btn btn-sm btn-secondary" onClick={() => addBlock('Thu', block)}>Add to Thu</button>
            </div>
          ))}
        </div>
      </div>

      <div className="planner-grid">
        {days.map((day) => (
          <div key={day} className="planner-day card">
            <div className="flex items-center justify-between mb-16">
              <div style={{ fontWeight: 700 }}>{day}</div>
              <span className="pill pill-cyan">{schedule[day].length} blocks</span>
            </div>
            {schedule[day].length === 0 ? (
              <div className="text-sm text-muted">No sessions yet</div>
            ) : (
              <div className="flex flex-col gap-8">
                {schedule[day].map((block, idx) => (
                  <div key={`${block.id}-${idx}`} className="plan-block" style={{ borderLeftColor: block.color }}>
                    <div style={{ fontWeight: 600 }}>{block.title}</div>
                    <div className="text-sm text-muted">{block.time} · {block.duration}m</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
