import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Sparkles, MessageSquare, Briefcase, Mic, BookOpen, Users, BarChart3, ArrowRight, Zap, Globe } from 'lucide-react';

const features = [
  { icon: '🎭', title: 'AI Roleplay Scenarios™', desc: 'Hội thoại theo tình huống nghề nghiệp thực với AI đóng vai đối tác giao tiếp', color: 'var(--primary)' },
  { icon: '💼', title: 'Career English Engine', desc: 'Lộ trình từ vựng theo ngành: IT, Marketing, Y tế, Tài chính và hơn 15 ngành', color: 'var(--accent-cyan)' },
  { icon: '🎙️', title: 'Real-Time Accent Coach', desc: 'Phân tích phát âm sâu: intonation, stress, rhythm — so sánh với người bản ngữ', color: 'var(--accent-pink)' },
  { icon: '🧠', title: 'Emotion-Aware Tutor', desc: 'AI nhận diện tâm trạng người học để điều chỉnh phong cách dạy phù hợp', color: 'var(--accent-orange)' },
  { icon: '📱', title: 'Content Immersion Mode', desc: 'Học qua nội dung thực: YouTube, podcast, LinkedIn — highlight từ mới tự động', color: 'var(--accent-green)' },
  { icon: '🗣️', title: 'Social Speaking Rooms', desc: 'Phòng thảo luận 24/7, AI moderator, matching thông minh theo trình độ', color: 'var(--accent-red)' },
  { icon: '🧬', title: 'Performance DNA Report', desc: 'Báo cáo chi tiết hàng tuần: error patterns, strength map, CEFR estimation', color: 'var(--primary-light)' },
];

const plans = [
  { name: 'Free', price: '0đ', period: '/mãi mãi', features: ['30 phút AI Roleplay/ngày', '10 từ mới/ngày', '2 lần Speaking Room/tuần', 'Accent Coach cơ bản'] },
  { name: 'Premium', price: '149.000đ', period: '/tháng', features: ['Không giới hạn AI Roleplay', 'Đầy đủ Career Paths', 'Speaking Rooms không giới hạn', 'DNA Report hàng tuần', 'Content Immersion Mode', 'Emotion-Aware Tutor'], featured: true },
  { name: 'Premium Plus', price: '249.000đ', period: '/tháng', features: ['Tất cả tính năng Premium', '4 buổi 1-1 gia sư bản ngữ', 'Chứng chỉ ngành nghề', 'Priority support', 'Offline mode'] },
];

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div>
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="landing-nav-logo" onClick={() => navigate('/')} role="button">ENOVA</div>
        <div className="landing-nav-links">
          <a href="#features">Tính năng</a>
          <a href="#pricing">Bảng giá</a>
          {isAuthenticated ? (
            <>
              <button className="btn btn-sm btn-secondary" onClick={() => navigate('/app')}>Vào ứng dụng</button>
              <button className="btn btn-sm btn-primary" onClick={handleLogout}>Đăng xuất</button>
            </>
          ) : (
            <>
              <button className="btn btn-sm btn-secondary" onClick={() => navigate('/login')}>Đăng nhập</button>
              <button className="btn btn-sm btn-primary" onClick={() => navigate('/register')}>Bắt đầu miễn phí</button>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge"><Sparkles size={14} /> Nền tảng #1 Việt Nam</div>
          <h1>Học Tiếng Anh<br /><span className="gradient-text">Như Người Bản Ngữ</span></h1>
          <p>ENOVA sử dụng AI thế hệ mới để giúp bạn tự tin giao tiếp tiếng Anh trong công việc và cuộc sống — không phải học như robot.</p>
          <div className="hero-buttons">
            {isAuthenticated ? (
              <>
                <button className="btn btn-lg btn-primary" onClick={() => navigate('/app')}>
                  Vào ứng dụng <ArrowRight size={18} />
                </button>
                <button className="btn btn-lg btn-secondary" onClick={handleLogout}>
                  Đăng xuất {user?.fullName ? `(${user.fullName})` : ''}
                </button>
              </>
            ) : (
              <>
                <button className="btn btn-lg btn-primary" onClick={() => navigate('/register')}>
                  Học thử miễn phí <ArrowRight size={18} />
                </button>
                <button className="btn btn-lg btn-secondary" onClick={() => navigate('/login')}>
                  Đăng nhập
                </button>
              </>
            )}
          </div>
          <div style={{ display: 'flex', gap: 48, justifyContent: 'center', marginTop: 48 }} className="animate-in animate-in-delay-3">
            <div className="text-center"><div style={{ fontSize: 28, fontWeight: 800 }}>200+</div><div className="text-sm text-muted">Tình huống AI</div></div>
            <div className="text-center"><div style={{ fontSize: 28, fontWeight: 800 }}>15+</div><div className="text-sm text-muted">Ngành nghề</div></div>
            <div className="text-center"><div style={{ fontSize: 28, fontWeight: 800 }}>10K+</div><div className="text-sm text-muted">Người dùng</div></div>
            <div className="text-center"><div style={{ fontSize: 28, fontWeight: 800 }}>24/7</div><div className="text-sm text-muted">Speaking Rooms</div></div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="features-section">
        <div className="section-title">7 Tính Năng Đột Phá</div>
        <div className="section-subtitle">Mỗi tính năng giải quyết một điểm đau cụ thể mà các đối thủ chưa làm được</div>
        <div className="card-grid">
          {features.map((f, i) => (
            <div key={i} className="feature-card animate-in" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="feature-icon" style={{ background: `${f.color}15` }}>{f.icon}</div>
              <div className="feature-title">{f.title}</div>
              <div className="feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="features-section">
        <div className="section-title">Bảng Giá</div>
        <div className="section-subtitle">Bắt đầu miễn phí — nâng cấp khi bạn sẵn sàng</div>
        <div className="pricing-grid">
          {plans.map((plan, i) => (
            <div key={i} className={`pricing-card ${plan.featured ? 'featured' : ''}`}>
              <div className="pricing-name">{plan.name}</div>
              <div className="pricing-price">{plan.price}</div>
              <div className="pricing-period">{plan.period}</div>
              <ul className="pricing-features">
                {plan.features.map((f, j) => <li key={j}>{f}</li>)}
              </ul>
              <button className={`btn btn-full ${plan.featured ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => navigate('/register')}>
                {plan.featured ? 'Bắt đầu ngay' : 'Chọn gói này'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '48px', borderTop: '1px solid var(--border)' }}>
        <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, background: 'linear-gradient(135deg, var(--primary), var(--accent-cyan))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ENOVA</div>
        <div className="text-muted text-sm">© 2026 ENOVA. Nền tảng học tiếng Anh AI thế hệ mới.</div>
      </footer>
    </div>
  );
}
