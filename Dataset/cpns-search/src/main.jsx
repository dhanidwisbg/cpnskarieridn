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
  const [page, setPage] = useState('landing');
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Sync state with URL path
  const navigate = (newPage, replace = false) => {
    setPage(newPage);
    let path = '/';
    if (newPage === 'admin') path = '/admin';
    else if (newPage === 'terms') path = '/syarat-ketentuan';
    else if (newPage === 'privacy') path = '/kebijakan-privasi';
    else if (newPage === 'login') path = '/login';
    else if (newPage === 'register') path = '/register';

    if (window.location.pathname !== path) {
      if (replace) {
        window.history.replaceState({ page: newPage }, '', path);
      } else {
        window.history.pushState({ page: newPage }, '', path);
      }
    }
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
      else if (initialPath === '/login') targetPage = 'login';
      else if (initialPath === '/register') targetPage = 'register';
      else targetPage = 'landing';

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          setUser(session?.user ?? null);
          if (session?.user) {
            // let the user effect handle routing
            if (targetPage !== 'login' && targetPage !== 'register' && targetPage !== 'landing') {
               setPage(targetPage);
            }
          } else {
             // Force page on anonymous route
             setPage(targetPage);
          }
        }
      } catch {
        if (mounted) {
           setUser(null);
           setPage(targetPage);
        }
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
      else if (path === '/login') setPage('login');
      else if (path === '/register') setPage('register');
      else setPage('landing');
    };
    window.addEventListener('popstate', handlePopState);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Handle routing based on user state
  useEffect(() => {
    if (user === undefined) return;

    const path = window.location.pathname;
    
    if (user) {
      let target = 'app';
      if (path === '/admin') target = 'admin';
      else if (path === '/syarat-ketentuan') target = 'terms';
      else if (path === '/kebijakan-privasi') target = 'privacy';
      // If user is accessing login or register while logged in, redirect them to app
      navigate(target, true);
      fetchProfile(user.id);
    } else {
      setProfile(null);
      if (path === '/admin') navigate('login', true);
      else if (path === '/syarat-ketentuan') navigate('terms', true);
      else if (path === '/kebijakan-privasi') navigate('privacy', true);
      else if (path === '/register') navigate('register', true);
      else if (path === '/login') navigate('login', true);
      else navigate('landing', true);
    }
  }, [user]);

  const fetchProfile = async (userId) => {
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
    navigate('landing');
  };

  if (user === undefined || (user && loadingProfile)) {
    return (
      <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#f8fafc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ width: 32, height: 32, border: '3px solid #e2e8f0', borderTopColor: '#007FFF', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) {
    if (page === 'register') return <RegisterPage onBack={() => navigate('login')} />;
    if (page === 'login')    return <LoginPage onLogin={(u) => { setUser(u); navigate('app'); }} onRegister={() => navigate('register')} onBack={() => navigate('landing')} />;
    if (page === 'terms')    return <TermsPage onBack={() => navigate('landing')} />;
    if (page === 'privacy')  return <PrivacyPage onBack={() => navigate('landing')} />;
    return <LandingPage onLogin={() => navigate('login')} onTermsClick={() => navigate('terms')} onPrivacyClick={() => navigate('privacy')} />;
  }

  if (page === 'terms') return <TermsPage onBack={() => navigate('app')} />;
  if (page === 'privacy') return <PrivacyPage onBack={() => navigate('app')} />;

  if (profile && !profile.is_verified && profile.role !== 'admin') {
    return <WaitingVerification user={user} onLogout={handleLogout} />;
  }

  if (page === 'admin' && profile?.role === 'admin') {
    return <AdminDashboard onBack={() => navigate('app')} />;
  }

  return (
    <>
      {page === 'purchase' ? (
        <PurchasePage user={user} onBack={() => navigate('app')} />
      ) : (
        <App 
          user={user} 
          userProfile={profile}
          onLogout={handleLogout} 
          onUpgrade={() => navigate('purchase')} 
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
