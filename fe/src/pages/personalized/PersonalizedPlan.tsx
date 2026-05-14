import { useEffect, useMemo, useState } from 'react';
import { personalizedApi } from '../../services/apiServices';
import { PersonalizedPlan } from '../../types';
import { Calendar, Sparkles, Target, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

interface WeeklyItem {
  day: string;
  focus: string;
  activities: Array<{ type: string; title: string; minutes: number; skills?: string[] }>;
}

export default function PersonalizedPlanPage() {
  const [plan, setPlan] = useState<PersonalizedPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [focus, setFocus] = useState('');
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState<number | undefined>(undefined);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    personalizedApi.getPlan()
      .then(res => setPlan(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const weeklyPlan: WeeklyItem[] = useMemo(() => {
    if (!plan?.planJson) return [];
    try {
      const parsed = JSON.parse(plan.planJson);
      return parsed.weeklyPlan || [];
    } catch {
      return [];
    }
  }, [plan?.planJson]);

  const recommendations = useMemo(() => {
    if (!plan?.planJson) return [];
    try {
      const parsed = JSON.parse(plan.planJson);
      return parsed.recommendedLessons || [];
    } catch {
      return [];
    }
  }, [plan?.planJson]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await personalizedApi.generatePlan({ focus, dailyGoalMinutes });
      setPlan(res.data.data);
      toast.success('Đã tạo lộ trình cá nhân hóa');
    } catch {
      toast.error('Không thể tạo lộ trình');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">✨ Lộ trình cá nhân hóa</div>
        <div className="page-subtitle">AI gợi ý bài học phù hợp theo mục tiêu và thói quen học</div>
      </div>

      <div className="card mb-24" style={{ maxWidth: 720 }}>
        <div className="flex items-center gap-12 mb-16">
          <Sparkles size={18} style={{ color: 'var(--primary)' }} />
          <div style={{ fontWeight: 600 }}>Tạo lộ trình mới</div>
        </div>
        <div className="input-group">
          <label className="input-label">Mục tiêu/Foucs</label>
          <input className="input" value={focus} onChange={(e) => setFocus(e.target.value)} placeholder="Speaking, IELTS 6.5, Business emails..." />
        </div>
        <div className="input-group">
          <label className="input-label">Mục tiêu phút/ngày (tuỳ chọn)</label>
          <input
            className="input"
            type="number"
            min={5}
            max={120}
            value={dailyGoalMinutes ?? ''}
            onChange={(e) => setDailyGoalMinutes(e.target.value ? Number(e.target.value) : undefined)}
            placeholder="15"
          />
        </div>
        <button className="btn btn-primary" onClick={handleGenerate} disabled={generating}>
          {generating ? 'Đang tạo...' : 'Tạo lộ trình'}
        </button>
      </div>

      {loading ? (
        <div className="text-center" style={{ padding: 80 }}>Loading plan...</div>
      ) : plan ? (
        <div>
          <div className="card mb-24">
            <div className="flex items-center gap-12 mb-8">
              <Target size={18} style={{ color: 'var(--accent-green)' }} />
              <div style={{ fontWeight: 700 }}>{plan.title}</div>
            </div>
            {plan.summary && <div className="text-sm text-muted" style={{ marginBottom: 12 }}>{plan.summary}</div>}
            <div className="flex flex-wrap gap-12">
              <span className="badge badge-primary">{plan.cefrLevel} → {plan.targetLevel}</span>
              <span className="badge badge-cyan">{plan.dailyGoalMinutes} phút/ngày</span>
            </div>
          </div>

          <div className="card mb-24">
            <div className="card-title mb-12">📆 Kế hoạch tuần</div>
            {weeklyPlan.length === 0 ? (
              <div className="text-muted">Chưa có kế hoạch tuần.</div>
            ) : (
              <div className="flex flex-col gap-12">
                {weeklyPlan.map((day, idx) => (
                  <div key={idx} className="card" style={{ background: 'var(--bg-tertiary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <Calendar size={14} />
                      <div style={{ fontWeight: 600 }}>{day.day}</div>
                      <span className="badge badge-orange">{day.focus}</span>
                    </div>
                    <div className="flex flex-col gap-8">
                      {day.activities?.map((act, aIdx) => (
                        <div key={aIdx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: 600 }}>{act.title}</div>
                            <div className="text-xs text-muted">{act.type} {act.skills ? `• ${act.skills.join(', ')}` : ''}</div>
                          </div>
                          <div className="flex items-center gap-6 text-sm text-muted"><Clock size={12} /> {act.minutes}m</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <div className="card-title mb-12">🎯 Gợi ý bài học</div>
            {recommendations.length === 0 ? (
              <div className="text-muted">Chưa có gợi ý.</div>
            ) : (
              <div className="flex flex-col gap-12">
                {recommendations.map((rec: any, idx: number) => (
                  <div key={idx} className="card" style={{ background: 'var(--bg-tertiary)' }}>
                    <div style={{ fontWeight: 600 }}>{rec.title}</div>
                    <div className="text-sm text-muted">Level {rec.level} • {rec.reason}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center text-muted" style={{ padding: 60 }}>Chưa có lộ trình. Hãy tạo mới.</div>
      )}
    </div>
  );
}
