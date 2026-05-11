import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './stores/authStore';
import Landing from './pages/public/Landing';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import Dashboard from './pages/dashboard/Dashboard';
import ScenarioList from './pages/roleplay/ScenarioList';
import RoleplayChat from './pages/roleplay/RoleplayChat';
import CareerSetup from './pages/career/CareerSetup';
import VocabularyMap from './pages/career/VocabularyMap';
import DailyLesson from './pages/career/DailyLesson';
import AccentCoach from './pages/accent/AccentCoach';
import ContentFeed from './pages/content/ContentFeed';
import ContentPlayer from './pages/content/ContentPlayer';
import MyVocabulary from './pages/content/MyVocabulary';
import MyNotes from './pages/content/MyNotes';
import MyTranslations from './pages/content/MyTranslations';
import MyTests from './pages/content/MyTests';
import LearningPath from './pages/content/LearningPath';
import SpacedRepetition from './pages/content/SpacedRepetition';
import RoomList from './pages/speaking/RoomList';
import SpeakingRoomPage from './pages/speaking/SpeakingRoom';
import DNAReport from './pages/performance/DNAReport';
import Profile from './pages/profile/Profile';
import Billing from './pages/payments/Billing';
import VnpayReturn from './pages/payments/VnpayReturn.tsx';
import Challenges from './pages/user/Challenges';
import Achievements from './pages/user/Achievements';
import Planner from './pages/user/Planner';
import Community from './pages/user/Community';
import CommunityClub from './pages/user/CommunityClub';
import Journal from './pages/user/Journal';
import Notifications from './pages/user/Notifications';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminContent from './pages/admin/AdminContent';
import AdminRoleplay from './pages/admin/AdminRoleplay';
import AdminSpeakingRooms from './pages/admin/AdminSpeakingRooms';
import AdminTests from './pages/admin/AdminTests';
import AdminReports from './pages/admin/AdminReports';
import AdminModeration from './pages/admin/AdminModeration';
import AdminSettings from './pages/admin/AdminSettings';
import Layout from './components/layout/Layout';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isHydrated } = useAuthStore();
  if (!isHydrated) return <div className="text-center text-muted" style={{ padding: 100 }}>Loading...</div>;
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isHydrated } = useAuthStore();
  if (!isHydrated) return <div className="text-center text-muted" style={{ padding: 100 }}>Loading...</div>;
  const role = (user?.role || '').toUpperCase();
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'ROLE_ADMIN' || role === 'ROLE_SUPER_ADMIN';
  return isAdmin ? <>{children}</> : <Navigate to="/app" />;
}

export default function App() {
  const { loadFromStorage } = useAuthStore();

  useEffect(() => { loadFromStorage(); }, [loadFromStorage]);

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{
        style: { background: '#1A1A3E', color: '#F5F6FA', border: '1px solid rgba(255,255,255,0.06)' }
      }} />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/app" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="roleplay" element={<ScenarioList />} />
          <Route path="roleplay/:id" element={<RoleplayChat />} />
          <Route path="career" element={<CareerSetup />} />
          <Route path="career/:id/vocab" element={<VocabularyMap />} />
          <Route path="career/:id/lesson" element={<DailyLesson />} />
          <Route path="accent" element={<AccentCoach />} />
          <Route path="content" element={<ContentFeed />} />
          <Route path="content/:id" element={<ContentPlayer />} />
          <Route path="content/my-vocabulary" element={<MyVocabulary />} />
          <Route path="content/srs" element={<SpacedRepetition />} />
          <Route path="content/my-notes" element={<MyNotes />} />
          <Route path="content/my-translations" element={<MyTranslations />} />
          <Route path="content/my-tests" element={<MyTests />} />
          <Route path="admin/content" element={<AdminRoute><AdminContent /></AdminRoute>} />
          <Route path="admin/scenarios" element={<AdminRoute><AdminRoleplay /></AdminRoute>} />
          <Route path="admin/speaking-rooms" element={<AdminRoute><AdminSpeakingRooms /></AdminRoute>} />
          <Route path="admin/tests" element={<AdminRoute><AdminTests /></AdminRoute>} />
          <Route path="content/learning-path" element={<LearningPath />} />
          <Route path="speaking" element={<RoomList />} />
          <Route path="speaking/:id" element={<SpeakingRoomPage />} />
          <Route path="performance" element={<DNAReport />} />
          <Route path="challenges" element={<Challenges />} />
          <Route path="achievements" element={<Achievements />} />
          <Route path="planner" element={<Planner />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="community" element={<Community />} />
          <Route path="community/clubs/:id" element={<CommunityClub />} />
          <Route path="journal" element={<Journal />} />
          <Route path="profile" element={<Profile />} />
          <Route path="payment" element={<Billing />} />
          <Route path="payment/vnpay-return" element={<VnpayReturn />} />
          <Route path="admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="admin/content" element={<AdminRoute><AdminContent /></AdminRoute>} />
          <Route path="admin/roleplay" element={<AdminRoute><AdminRoleplay /></AdminRoute>} />
          <Route path="admin/rooms" element={<AdminRoute><AdminSpeakingRooms /></AdminRoute>} />
          <Route path="admin/reports" element={<AdminRoute><AdminReports /></AdminRoute>} />
          <Route path="admin/moderation" element={<AdminRoute><AdminModeration /></AdminRoute>} />
          <Route path="admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
