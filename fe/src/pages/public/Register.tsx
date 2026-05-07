import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { authApi } from '../../services/apiServices';
import toast from 'react-hot-toast';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) navigate('/app');
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.register({ email, password, fullName });
      login(res.data.data);
      toast.success('Đăng ký thành công! Chào mừng bạn đến ENOVA!');
      navigate('/app');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">ENOVA</div>
        <div className="auth-subtitle">Tạo tài khoản và bắt đầu hành trình</div>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Họ và tên</label>
            <input className="input" type="text" placeholder="Nguyễn Văn A"
              value={fullName} onChange={e => setFullName(e.target.value)} required />
          </div>
          <div className="input-group">
            <label className="input-label">Email</label>
            <input className="input" type="email" placeholder="your@email.com"
              value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="input-group">
            <label className="input-label">Mật khẩu</label>
            <input className="input" type="password" placeholder="Tối thiểu 6 ký tự"
              value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
          </div>
          <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
            {loading ? 'Đang tạo tài khoản...' : 'Đăng ký miễn phí'}
          </button>
        </form>
        <div className="auth-footer">
          Đã có tài khoản? <a href="/login" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>Đăng nhập</a>
        </div>
      </div>
    </div>
  );
}
