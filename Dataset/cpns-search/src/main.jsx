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
import { supabase } from './supabase'

function Root() {
  const [user, setUser] = useState(undefined); // undefined = loading
  const [profile, setProfile] = useState(null);
  const [page, setPage] = useState('landing'); // 'landing' | 'login' | 'register' | 'app' | 'purchase' | 'admin'
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          setUser(session?.user ?? null);
          if (session?.user) {
            setPage('app');
            fetchProfile(session.user.id);
          }
        }
      } catch {
        if (mounted) setUser(null);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null);
        if (session?.user) {
          setPage('app');
          fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setPage('landing');
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId) => {
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
    return <LandingPage onLogin={() => setPage('login')} />;
  }

  // Logged in but not verified (and not an admin)
  if (profile && !profile.is_verified && profile.role !== 'admin') {
    return <WaitingVerification user={user} onLogout={handleLogout} />;
  }

  // Admin Dashboard
  if (page === 'admin' && profile?.role === 'admin') {
    return <AdminDashboard onBack={() => setPage('app')} />;
  }

  // Logged in & Verified — Main App Area
  return (
    <>
      {page === 'purchase' ? (
        <PurchasePage user={user} onBack={() => setPage('app')} />
      ) : (
        <App 
          user={user} 
          userProfile={profile}
          onLogout={handleLogout} 
          onUpgrade={() => setPage('purchase')} 
          onOpenAdmin={() => setPage('admin')}
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
