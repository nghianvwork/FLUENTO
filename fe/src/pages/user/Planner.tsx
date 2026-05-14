import { useState, useEffect } from 'react';
import { Calendar, Clock, Sparkles, Trash2, CheckCircle } from 'lucide-react';
import { learningApi } from '../../services/apiServices';
import toast from 'react-hot-toast';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface PlanBlock {
  id: number;
  title: string;
  dayOfWeek: string;
  startTime: string;
  durationMinutes: number;
  color: string;
  isCompleted: boolean;
}

const recommendedBlocks = [
  { id: 1, title: 'Accent Focus', durationMinutes: 15, startTime: '07:30', color: 'var(--accent-pink)' },
  { id: 2, title: 'Roleplay Sprint', durationMinutes: 20, startTime: '12:30', color: 'var(--primary)' },
  { id: 3, title: 'Content Immersion', durationMinutes: 25, startTime: '20:00', color: 'var(--accent-cyan)' },
];

export default function Planner() {
  const [schedule, setSchedule] = useState<Record<string, PlanBlock[]>>({
    Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: [], Sun: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlanner();
  }, []);

  const fetchPlanner = async () => {
    try {
      const res = await learningApi.getPlanner();
      const blocks: PlanBlock[] = res.data.data;
      const newSchedule: Record<string, PlanBlock[]> = {
        Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: [], Sun: []
      };
      blocks.forEach(b => {
        if (newSchedule[b.dayOfWeek]) newSchedule[b.dayOfWeek].push(b);
      });
      setSchedule(newSchedule);
    } catch {
      toast.error('Failed to load planner');
    } finally {
      setLoading(false);
    }
  };

  const addBlock = async (day: string, block: any) => {
    try {
      const res = await learningApi.addPlanBlock({
        title: block.title,
        dayOfWeek: day,
        startTime: block.startTime,
        durationMinutes: block.durationMinutes,
        color: block.color
      });
      setSchedule(prev => ({
        ...prev,
        [day]: [...prev[day], res.data.data]
      }));
      toast.success(`Added to ${day} plan`);
    } catch {
      toast.error('Failed to add block');
    }
  };

  const toggleComplete = async (block: PlanBlock) => {
    try {
      const res = await learningApi.togglePlanBlock(block.id);
      setSchedule(prev => ({
        ...prev,
        [block.dayOfWeek]: prev[block.dayOfWeek].map(b => b.id === block.id ? res.data.data : b)
      }));
      toast.success(res.data.data.isCompleted ? 'Block completed!' : 'Block reset');
    } catch {
      toast.error('Failed to update');
    }
  };

  const deleteBlock = async (block: PlanBlock) => {
    try {
      await learningApi.deletePlanBlock(block.id);
      setSchedule(prev => ({
        ...prev,
        [block.dayOfWeek]: prev[block.dayOfWeek].filter(b => b.id !== block.id)
      }));
      toast.success('Block removed');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const totalMinutes = Object.values(schedule).flat().reduce((acc, curr) => acc + curr.durationMinutes, 0);
  const completedMinutes = Object.values(schedule).flat()
    .filter(b => b.isCompleted)
    .reduce((acc, curr) => acc + curr.durationMinutes, 0);

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Learning Planner</div>
        <div className="page-subtitle">Build a weekly rhythm with AI-suggested sessions</div>
      </div>

      <div className="card admin-hero" style={{ marginBottom: 24 }}>
        <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontWeight: 700 }}>Weekly Progress</div>
            <div className="text-sm text-muted">{completedMinutes} / {totalMinutes} minutes completed</div>
          </div>
          <div className="pill pill-cyan"><Calendar size={14} /> Goal: 180m/week</div>
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
              <div className="text-sm text-muted"><Clock size={12} /> {block.startTime} · {block.durationMinutes}m</div>
              <div className="flex gap-4 mt-8">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(d => (
                  <button key={d} className="btn btn-xs btn-secondary" style={{ fontSize: 10, padding: '2px 4px' }} onClick={() => addBlock(d, block)}>{d}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-40">Loading your plan...</div>
      ) : (
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
                  {schedule[day].map((block) => (
                    <div key={block.id} className="plan-block" style={{ borderLeftColor: block.color, opacity: block.isCompleted ? 0.6 : 1 }}>
                      <div className="flex justify-between items-start">
                        <div style={{ fontWeight: 600, textDecoration: block.isCompleted ? 'line-through' : 'none' }}>{block.title}</div>
                        <div className="flex gap-4">
                           <button onClick={() => toggleComplete(block)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: block.isCompleted ? 'var(--accent-green)' : 'var(--text-muted)' }}><CheckCircle size={14} /></button>
                           <button onClick={() => deleteBlock(block)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><Trash2 size={14} /></button>
                        </div>
                      </div>
                      <div className="text-sm text-muted">{block.startTime} · {block.durationMinutes}m</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
