import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import LandingPage from './LandingPage.jsx'
import LoginPage from './LoginPage.jsx'
import RegisterPage from './RegisterPage.jsx'
import PurchasePage from './PurchasePage.jsx'
import WaitingVerification from './WaitingVerification.jsx'
import AdminDashboard from './AdminDashboard.jsx'
import TermsPage from './TermsPage.jsx'
import PrivacyPage from './PrivacyPage.jsx'
import { supabase } from './supabase'

function Root() {
  const [user, setUser] = useState(undefined); // undefined = loading
  const [profile, setProfile] = useState(null);
  const [page, setPage] = useState('landing'); // 'landing' | 'login' | 'register' | 'app' | 'purchase' | 'admin'
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Sync state with URL path
  const navigate = (newPage) => {
    setPage(newPage);
    let path = '/';
    if (newPage === 'admin') path = '/admin';
    else if (newPage === 'terms') path = '/syarat-ketentuan';
    else if (newPage === 'privacy') path = '/kebijakan-privasi';
    window.history.pushState({ page: newPage }, '', path);
  };

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      // Detect initial path
      const initialPath = window.location.pathname;
      let targetPage = 'app';
      if (initialPath === '/admin') targetPage = 'admin';
      else if (initialPath === '/syarat-ketentuan') targetPage = 'terms';
      else if (initialPath === '/kebijakan-privasi') targetPage = 'privacy';

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          setUser(session?.user ?? null);
          if (session?.user) {
            setPage(targetPage);
            fetchProfile(session.user.id);
          } else {
            // Keep track so we can redirect after login if needed
            if (initialPath === '/admin') setPage('login');
            else if (initialPath === '/syarat-ketentuan') setPage('terms');
            else if (initialPath === '/kebijakan-privasi') setPage('privacy');
          }
        }
      } catch {
        if (mounted) setUser(null);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (mounted) {
        setUser(session?.user ?? null);
      }
    });

    // Handle browser back/forward buttons
    const handlePopState = (e) => {
      const path = window.location.pathname;
      if (path === '/admin') setPage('admin');
      else if (path === '/syarat-ketentuan') setPage('terms');
      else if (path === '/kebijakan-privasi') setPage('privacy');
      else setPage('landing'); // Simplify fallback
    };
    window.addEventListener('popstate', handlePopState);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Fetch profile whenever user changes
  useEffect(() => {
    if (user) {
      const path = window.location.pathname;
      let target = 'app';
      if (path === '/admin') target = 'admin';
      else if (path === '/syarat-ketentuan') target = 'terms';
      else if (path === '/kebijakan-privasi') target = 'privacy';
      setPage(target);
      fetchProfile(user.id);
    } else if (user === null) {
      setProfile(null);
      const path = window.location.pathname;
      if (path === '/admin') setPage('login');
      else if (path === '/syarat-ketentuan') setPage('terms');
      else if (path === '/kebijakan-privasi') setPage('privacy');
      else setPage('landing');
    }
  }, [user]);

  const fetchProfile = async (userId) => {
    // Handle dummy admin
    if (userId === 'dummy-admin-id') {
      setProfile({ is_verified: true, role: 'admin' });
      return;
    }

    setLoadingProfile(true);
    const { data, error } = await supabase
      .from('user_profiles')
      .select('is_verified, role')
      .eq('id', userId)
      .single();
    
    if (!error && data) {
      setProfile(data);
    }
    setLoadingProfile(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setPage('landing');
    window.history.pushState({}, '', '/');
  };

  // Loading
  if (user === undefined || (user && loadingProfile)) {
    return (
      <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#f8fafc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ width: 32, height: 32, border: '3px solid #e2e8f0', borderTopColor: '#007FFF', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Not logged in — routing antar halaman publik
  if (!user) {
    if (page === 'register') return <RegisterPage onBack={() => setPage('login')} />;
    if (page === 'login')    return <LoginPage onLogin={(u) => setUser(u)} onRegister={() => setPage('register')} onBack={() => setPage('landing')} />;
    if (page === 'terms')    return <TermsPage onBack={() => navigate('landing')} />;
    if (page === 'privacy')  return <PrivacyPage onBack={() => navigate('landing')} />;
    return <LandingPage onLogin={() => setPage('login')} onTermsClick={() => navigate('terms')} onPrivacyClick={() => navigate('privacy')} />;
  }

  // Handle docs for logged-in users too
  if (page === 'terms') return <TermsPage onBack={() => navigate('app')} />;
  if (page === 'privacy') return <PrivacyPage onBack={() => navigate('app')} />;

  // Logged in but not verified (and not an admin)
  if (profile && !profile.is_verified && profile.role !== 'admin') {
    return <WaitingVerification user={user} onLogout={handleLogout} />;
  }

  // Admin Dashboard
  if (page === 'admin' && profile?.role === 'admin') {
    return <AdminDashboard onBack={() => navigate('app')} />;
  }

  // Logged in & Verified — Main App Area
  return (
    <>
      {page === 'purchase' ? (
        <PurchasePage user={user} onBack={() => navigate('app')} />
      ) : (
        <App 
          user={user} 
          userProfile={profile}
          onLogout={handleLogout} 
          onUpgrade={() => setPage('purchase')} 
          onOpenAdmin={() => navigate('admin')}
        />
      )}
    </>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
