import { useEffect, useState } from 'react';
import { Trophy, Award } from 'lucide-react';
import { achievementApi } from '../../services/apiServices';
import toast from 'react-hot-toast';

interface Achievement {
  id: number;
  achievementKey: string;
  title: string;
  desc: string;
  icon: string;
  xpReward: number;
  progress: number;
  isEarned: boolean;
  earnedAt: string | null;
}

export default function Achievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAchievements = async () => {
    try {
      const res = await achievementApi.getAchievements();
      setAchievements(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  if (loading) return <div className="text-center text-muted" style={{ padding: 100 }}>Loading achievements...</div>;

  const earnedCount = achievements.filter(a => a.isEarned).length;
  const badgesToNextRank = Math.max(0, 15 - earnedCount);

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
            <div className="text-sm text-muted">
              {badgesToNextRank > 0 ? `Collect ${badgesToNextRank} more badges to reach Platinum` : 'You reached the Platinum rank!'}
            </div>
          </div>
          <div className="pill pill-green"><Trophy size={14} /> {earnedCount} badges</div>
        </div>
      </div>

      <div className="card-grid">
        {achievements.length > 0 ? achievements.map((a) => (
          <div key={a.id} className={`card badge-card ${a.isEarned ? 'earned' : ''}`} style={{ opacity: a.isEarned ? 1 : 0.7 }}>
            <div className="badge-icon">{a.icon || '🏆'}</div>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>{a.title}</div>
            <div className="text-sm text-muted" style={{ marginBottom: 12, minHeight: 40 }}>{a.desc}</div>
            
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${a.progress}%`, background: a.isEarned ? 'var(--accent-green)' : 'var(--primary)' }} />
            </div>
            
            <div className="flex items-center justify-between" style={{ marginTop: 8 }}>
              <div className="text-sm text-muted">{a.progress}% completed</div>
              {a.isEarned && <Award size={16} color="var(--accent-green)" />}
            </div>
          </div>
        )) : (
          <div className="text-muted text-center" style={{ gridColumn: '1 / -1', padding: 40 }}>
            No achievements found. Start learning to earn your first badge!
          </div>
        )}
      </div>
    </div>
  );
}
