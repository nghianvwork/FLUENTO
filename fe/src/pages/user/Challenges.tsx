import { useState, useEffect } from 'react';
import { Flame, Target, Trophy, Zap } from 'lucide-react';
import { challengeApi } from '../../services/apiServices';
import toast from 'react-hot-toast';

interface Challenge {
  id: number;
  title: string;
  desc: string;
  type: string;
  progress: number;
  goal: number;
  reward: string;
  icon: string;
  isClaimed: boolean;
}

export default function Challenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChallenges = async () => {
    try {
      const res = await challengeApi.getChallenges();
      setChallenges(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load challenges');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const claim = async (id: number) => {
    try {
      await challengeApi.claimReward(id);
      setChallenges(prev => prev.map(c => c.id === id ? { ...c, isClaimed: true } : c));
      toast.success('Reward claimed!');
    } catch (err) {
      toast.error('Cannot claim reward yet');
    }
  };

  if (loading) return <div className="text-center text-muted" style={{ padding: 100 }}>Loading challenges...</div>;

  const weeklyChallenges = challenges.filter(c => c.type === 'WEEKLY');
  const dailyMissions = challenges.filter(c => c.type === 'DAILY');

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
            <div className="text-sm text-muted">Finish missions to unlock a bonus badge</div>
          </div>
          <div className="pill pill-orange"><Flame size={14} /> Keep going!</div>
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
            {c.progress >= c.goal && !c.isClaimed && (
              <button className="btn btn-sm btn-primary w-full mt-12" onClick={() => claim(c.id)}>
                Claim Reward
              </button>
            )}
            {c.isClaimed && (
              <button className="btn btn-sm btn-secondary w-full mt-12" disabled>
                Claimed
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="page-title" style={{ fontSize: 20, marginTop: 32, marginBottom: 16 }}>Daily Missions</div>
      <div className="card-grid">
        {dailyMissions.map((m) => (
          <div key={m.id} className="card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-12">
                <div className="card-icon" style={{ background: 'var(--bg-tertiary)' }}>{m.icon || '🏆'}</div>
                <div>
                  <div style={{ fontWeight: 700 }}>{m.title}</div>
                  <div className="text-sm text-muted">Reward {m.reward}</div>
                  <div className="text-sm text-muted">{m.progress}/{m.goal} completed</div>
                </div>
              </div>
              <button 
                className="btn btn-sm btn-secondary" 
                disabled={m.isClaimed || m.progress < m.goal} 
                onClick={() => claim(m.id)}>
                <Zap size={14} /> {m.isClaimed ? 'Claimed' : 'Claim'}
              </button>
            </div>
          </div>
        ))}
        {dailyMissions.length === 0 && <div className="text-muted">No daily missions available right now.</div>}
      </div>
    </div>
  );
}
