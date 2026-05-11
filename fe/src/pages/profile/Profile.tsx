import { useState, useEffect } from 'react';
import { userApi } from '../../services/apiServices';
import { useAuthStore } from '../../stores/authStore';
import { UserProfile } from '../../types';
import { Save } from 'lucide-react';
import toast from 'react-hot-toast';

const cefrLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const accents = ['AMERICAN', 'BRITISH', 'AUSTRALIAN', 'SINGAPORE'];

export default function Profile() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ displayName: '', nativeLanguage: '', cefrLevel: '', targetLevel: '', dailyGoalMinutes: 15, preferredAccent: '', careerIndustry: '', careerGoal: '' });

  useEffect(() => {
    setLoading(true);
    userApi.getProfile().then(res => {
      const p = res.data.data;
      setProfile(p);
      setForm({
        displayName: p.displayName || '',
        nativeLanguage: p.nativeLanguage || 'Vietnamese',
        cefrLevel: p.cefrLevel || 'A1',
        targetLevel: p.targetLevel || 'B2',
        dailyGoalMinutes: p.dailyGoalMinutes || 15,
        preferredAccent: p.preferredAccent || 'AMERICAN',
        careerIndustry: p.careerIndustry || '',
        careerGoal: p.careerGoal || '',
      });
    }).catch((err) => {
      toast.error(err.response?.data?.message || 'Khong tai duoc profile');
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    try {
      const res = await userApi.updateProfile(form);
      const p = res.data.data;
      setProfile(p);
      setForm({
        displayName: p.displayName || '',
        nativeLanguage: p.nativeLanguage || 'Vietnamese',
        cefrLevel: p.cefrLevel || 'A1',
        targetLevel: p.targetLevel || 'B2',
        dailyGoalMinutes: p.dailyGoalMinutes || 15,
        preferredAccent: p.preferredAccent || 'AMERICAN',
        careerIndustry: p.careerIndustry || '',
        careerGoal: p.careerGoal || '',
      });
      toast.success('Profile updated!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Cap nhat that bai');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">👤 Profile & Settings</div>
        <div className="page-subtitle">Cập nhật thông tin cá nhân và mục tiêu học tập</div>
      </div>

      <div style={{ maxWidth: 600 }}>
        {loading && (
          <div className="text-center text-muted" style={{ padding: 40 }}>Dang tai profile...</div>
        )}
        {/* Stats */}
        {profile && (
          <div className="stats-grid mb-24">
            <div className="stat-card"><div className="stat-value" style={{ fontSize: 24, color: 'var(--accent-orange)' }}>{profile.streakCount}🔥</div><div className="stat-label">Streak</div></div>
            <div className="stat-card"><div className="stat-value" style={{ fontSize: 24, color: 'var(--primary-light)' }}>{profile.totalXp}</div><div className="stat-label">XP</div></div>
            <div className="stat-card"><div className="stat-value" style={{ fontSize: 24, color: 'var(--accent-cyan)' }}>{profile.totalWordsLearned}</div><div className="stat-label">Words</div></div>
          </div>
        )}

        <div className="card">
          <div className="input-group">
            <label className="input-label">Tên hiển thị</label>
            <input className="input" value={form.displayName} onChange={e => setForm({...form, displayName: e.target.value})} />
          </div>
          <div className="input-group">
            <label className="input-label">Trình độ hiện tại</label>
            <select className="input" value={form.cefrLevel} onChange={e => setForm({...form, cefrLevel: e.target.value})}>
              {cefrLevels.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Mục tiêu trình độ</label>
            <select className="input" value={form.targetLevel} onChange={e => setForm({...form, targetLevel: e.target.value})}>
              {cefrLevels.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Giọng yêu thích</label>
            <select className="input" value={form.preferredAccent} onChange={e => setForm({...form, preferredAccent: e.target.value})}>
              {accents.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Mục tiêu hàng ngày (phút)</label>
            <input className="input" type="number" min={5} max={120} value={form.dailyGoalMinutes}
              onChange={e => setForm({...form, dailyGoalMinutes: Number(e.target.value)})} />
          </div>
          <div className="input-group">
            <label className="input-label">Ngành nghề</label>
            <input className="input" placeholder="IT, Marketing, Finance..." value={form.careerIndustry}
              onChange={e => setForm({...form, careerIndustry: e.target.value})} />
          </div>
          <div className="input-group">
            <label className="input-label">Mục tiêu nghề nghiệp</label>
            <input className="input" placeholder="Làm việc ở công ty nước ngoài trong 6 tháng" value={form.careerGoal}
              onChange={e => setForm({...form, careerGoal: e.target.value})} />
          </div>
          <button className="btn btn-primary btn-full" onClick={handleSave}><Save size={16} /> Lưu thay đổi</button>
        </div>
      </div>
    </div>
  );
}
