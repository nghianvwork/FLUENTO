import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import {
  LayoutDashboard, MessageSquare, Briefcase, Mic, BookOpen,
  Users, BarChart3, User, LogOut, Sparkles, Trophy, Calendar, Target,
  Shield, FileText, Flag, Settings, CreditCard, Languages, ClipboardCheck
} from 'lucide-react';

const navSections = [
  {
    title: 'Core',
    items: [
      { path: '/app', icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/app/roleplay', icon: MessageSquare, label: 'AI Roleplay' },
      { path: '/app/career', icon: Briefcase, label: 'Career English' },
      { path: '/app/accent', icon: Mic, label: 'Accent Coach' },
      { path: '/app/content', icon: BookOpen, label: 'Content Hub' },
    ],
  },
  {
    title: 'Learning Tools',
    items: [
      { path: '/app/content/my-translations', icon: Languages, label: 'My Translations' },
      { path: '/app/content/my-tests', icon: ClipboardCheck, label: 'My Tests' },
    ],

  },
  {
    title: 'Community',
    items: [
      { path: '/app/speaking', icon: Users, label: 'Speaking Rooms' },
      { path: '/app/community', icon: Users, label: 'Community' },
      { path: '/app/journal', icon: BookOpen, label: 'Journal' },
    ],
  },
  {
    title: 'Progress',
    items: [
      { path: '/app/performance', icon: BarChart3, label: 'DNA Report' },
      { path: '/app/challenges', icon: Target, label: 'Challenges' },
      { path: '/app/achievements', icon: Trophy, label: 'Achievements' },
      { path: '/app/planner', icon: Calendar, label: 'Learning Planner' },
      { path: '/app/payment', icon: CreditCard, label: 'Billing' },
      { path: '/app/profile', icon: User, label: 'Profile' },
    ],
  },
];

const adminCommunitySection = {
  title: 'Community',
  items: [
    { path: '/app/community', icon: Users, label: 'Community' },
  ],
};

const adminItems = [
  { path: '/app/admin', icon: Shield, label: 'Admin Overview' },
  { path: '/app/admin/users', icon: Users, label: 'Users' },
  { path: '/app/admin/content', icon: FileText, label: 'Content' },
  { path: '/app/admin/roleplay', icon: MessageSquare, label: 'Roleplay' },
  { path: '/app/admin/rooms', icon: Mic, label: 'Speaking Rooms' },
  { path: '/app/admin/tests', icon: ClipboardCheck, label: 'Tests' },
  { path: '/app/admin/reports', icon: BarChart3, label: 'Reports' },
  { path: '/app/admin/moderation', icon: Flag, label: 'Moderation' },
  { path: '/app/admin/settings', icon: Settings, label: 'Settings' },
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const role = (user?.role || '').toUpperCase();
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'ROLE_ADMIN' || role === 'ROLE_SUPER_ADMIN';
  const isActive = (path: string) => (path === '/app' ? location.pathname === '/app' : location.pathname.startsWith(path));
  const isAdminRoute = location.pathname.startsWith('/app/admin');

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo" onClick={() => navigate('/')} role="button">ENOVA</div>
        <div className="sidebar-tagline">AI English Learning Platform</div>
        <nav className="sidebar-nav">
          {!isAdmin && !isAdminRoute && navSections.map((section) => (
            <div key={section.title} className="sidebar-section">
              <div className="sidebar-section-title">{section.title}</div>
              {section.items.map((item) => (
                <button
                  key={item.path}
                  className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                  onClick={() => navigate(item.path)}
                >
                  <item.icon size={20} />
                  {item.label}
                </button>
              ))}
            </div>
          ))}
          {isAdmin && (
            <div className="sidebar-section">
              <div className="sidebar-section-title">{adminCommunitySection.title}</div>
              {adminCommunitySection.items.map((item) => (
                <button
                  key={item.path}
                  className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                  onClick={() => navigate(item.path)}
                >
                  <item.icon size={20} />
                  {item.label}
                </button>
              ))}
            </div>
          )}
          {isAdmin && (
            <div className="sidebar-section">
              <div className="sidebar-section-title">Admin</div>
              {adminItems.map((item) => (
                <button
                  key={item.path}
                  className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                  onClick={() => navigate(item.path)}
                >
                  <item.icon size={20} />
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </nav>
        <div className="sidebar-footer">
          <div style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={14} color="var(--accent-orange)" />
              <span>{user?.fullName || 'User'}</span>
            </div>
          </div>
          <button className="nav-item" onClick={handleLogout}>
            <LogOut size={20} /> Đăng xuất
          </button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
