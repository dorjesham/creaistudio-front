// ============================================================
// CreAI Studio - Main App with Routing + Auth Guard
// ============================================================
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { getSession } from '@/lib/authLocalStorage';
import { useStore } from '@/store/useStore';
import Navbar from '@/components/Navbar';
import AchievementPopup from '@/components/AchievementPopup';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import EditorPage from '@/pages/EditorPage';
import CreateProjectPage from '@/pages/CreateProjectPage';
import PlayerPage from '@/pages/PlayerPage';
import ExplorePage from '@/pages/ExplorePage';
import './App.css';

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

// Auto-restore session from localStorage
function SessionRestore() {
  const { setUser, login } = useStore();
  useEffect(() => {
    const session = getSession();
    if (session) {
      setUser(session);
      login();
    }
  }, [setUser, login]);
  return null;
}

// Route guard: require login
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useStore();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

// Layout wrapper
function Layout({ children, showNav = true }: { children: React.ReactNode; showNav?: boolean }) {
  const location = useLocation();
  const isPlayer = location.pathname.startsWith('/play');

  return (
    <div className="min-h-screen bg-black">
      {showNav && !isPlayer && <Navbar />}
      {children}
    </div>
  );
}

function App() {
  return (
    <>
      <ScrollToTop />
      <SessionRestore />
      <AchievementPopup />
      <Routes>
        <Route path="/" element={<Layout showNav={true}><HomePage /></Layout>} />
        <Route path="/login" element={<Layout showNav={false}><LoginPage /></Layout>} />
        <Route path="/explore" element={<Layout><ExplorePage /></Layout>} />
        <Route path="/dashboard" element={<Layout><AuthGuard><DashboardPage /></AuthGuard></Layout>} />
        <Route path="/editor" element={<Layout showNav={false}><AuthGuard><EditorPage /></AuthGuard></Layout>} />
        <Route path="/create" element={<Layout><AuthGuard><CreateProjectPage /></AuthGuard></Layout>} />
        <Route path="/play/:slug" element={<Layout showNav={false}><PlayerPage /></Layout>} />
      </Routes>
    </>
  );
}

export default App;
