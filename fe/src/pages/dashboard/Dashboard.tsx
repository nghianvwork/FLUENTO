import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../../services/apiServices';
import { DashboardData } from '../../types';
import { Flame, BookOpen, MessageSquare, Target, TrendingUp, Zap, ArrowRight, Clock } from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    userApi.getDashboard().then(res => setData(res.data.data)).catch(() => {
      setData({ streakCount: 7, totalXp: 2450, wordsLearned: 156, lessonsCompleted: 23, roleplayMinutes: 180, cefrLevel: 'B1', dailyGoalMinutes: 15, todayMinutes: 8, todayProgress: 0.53 });
    });
  }, []);

  if (!data) return <div className="text-center text-muted" style={{ padding: 100 }}>Loading...</div>;

  const quickActions = [
    { icon: MessageSquare, label: 'AI Roleplay', desc: 'Luyện hội thoại với AI', path: '/app/roleplay', color: 'var(--primary)' },
    { icon: BookOpen, label: 'Career English', desc: 'Học theo ngành nghề', path: '/app/career', color: 'var(--accent-cyan)' },
    { icon: Target, label: 'Accent Coach', desc: 'Luyện phát âm', path: '/app/accent', color: 'var(--accent-pink)' },
    { icon: Zap, label: 'Speaking Room', desc: 'Nói chuyện nhóm', path: '/app/speaking', color: 'var(--accent-green)' },
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Xin chào! 👋</div>
        <div className="page-subtitle">Hãy tiếp tục hành trình học tiếng Anh của bạn</div>
      </div>

      {/* Daily Progress */}
      <div className="card mb-24" style={{ background: 'linear-gradient(135deg, rgba(108,92,231,0.1), rgba(0,206,201,0.05))' }}>
        <div className="flex items-center justify-between mb-16">
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Tiến độ hôm nay</div>
            <div className="text-sm text-muted">{data.todayMinutes}/{data.dailyGoalMinutes} phút</div>
          </div>
          <div className="flex items-center gap-8">
            <Flame size={20} color="var(--accent-orange)" />
            <span style={{ fontWeight: 800, fontSize: 20 }}>{data.streakCount}</span>
            <span className="text-sm text-muted">ngày streak</span>
          </div>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${data.todayProgress * 100}%` }} />
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--primary-light)' }}>{data.totalXp}</div>
          <div className="stat-label">Tổng XP</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--accent-cyan)' }}>{data.wordsLearned}</div>
          <div className="stat-label">Từ đã học</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--accent-green)' }}>{data.lessonsCompleted}</div>
          <div className="stat-label">Bài đã hoàn thành</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--accent-orange)' }}>{data.cefrLevel}</div>
          <div className="stat-label">Trình độ CEFR</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="page-title" style={{ fontSize: 20, marginBottom: 16 }}>Bắt đầu nhanh</div>
      <div className="card-grid">
        {quickActions.map((action, i) => (
          <div key={i} className="card" style={{ cursor: 'pointer' }} onClick={() => navigate(action.path)}>
            <div className="flex items-center gap-16">
              <div className="card-icon" style={{ background: `${action.color}15`, color: action.color }}>
                <action.icon size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>{action.label}</div>
                <div className="text-sm text-muted">{action.desc}</div>
              </div>
              <ArrowRight size={18} color="var(--text-muted)" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
