import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import LandingPage from './LandingPage.jsx'
import LoginPage from './LoginPage.jsx'
import RegisterPage from './RegisterPage.jsx'
import PurchasePage from './PurchasePage.jsx'
import { supabase } from './supabase'

function Root() {
  const [user, setUser] = useState(undefined); // undefined = loading
  const [page, setPage] = useState('landing'); // 'landing' | 'login' | 'register' | 'app' | 'purchase'

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          setUser(session?.user ?? null);
          // Jika sudah login, langsung ke app
          if (session?.user) setPage('app');
        }
      } catch {
        if (mounted) setUser(null);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null);
        if (session?.user) setPage('app');
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Loading
  if (user === undefined) {
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

  // Logged in
  return page === 'purchase'
    ? <PurchasePage user={user} onBack={() => setPage('app')} />
    : <App user={user} onLogout={() => { setUser(null); setPage('landing'); }} onUpgrade={() => setPage('purchase')} />;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
