import { useState } from 'react';
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import logoImg from './assets/logo.png';
import { supabase } from './supabase';

export default function LoginPage({ onLogin, onRegister }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    setLoading(false);

    if (authError || !data.user) {
      setError(authError?.message === 'Invalid login credentials'
        ? 'Email atau password salah. Silakan coba lagi.'
        : authError?.message || 'Terjadi kesalahan. Silakan coba lagi.');
      setShake(true);
      setTimeout(() => setShake(false), 600);
      return;
    }

    onLogin(data.user);
  };

  return (
    <div style={{
      minHeight: '100vh',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      background: 'linear-gradient(135deg, #0050CC 0%, #007FFF 55%, #00B4FF 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Background decorative blobs */}
      <div style={{ position: 'absolute', top: -80, right: -80, width: 280, height: 280, background: 'rgba(255,255,255,0.07)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -100, left: -60, width: 320, height: 320, background: 'rgba(0,180,255,0.12)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '40%', right: -40, width: 160, height: 160, background: 'rgba(255,255,255,0.05)', borderRadius: '50%', pointerEvents: 'none' }} />

      {/* Logo + Tagline */}
      <div style={{ textAlign: 'center', marginBottom: 28, position: 'relative', zIndex: 1 }}>
        <img
          src={logoImg}
          alt="CPNSkarier Logo"
          style={{ height: 72, objectFit: 'contain', filter: 'brightness(0) invert(1)', display: 'block', margin: '0 auto 12px' }}
        />
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: 500, margin: 0 }}>
          Platform Pencarian Formasi CPNS Indonesia
        </p>
      </div>

      {/* Card */}
      <div style={{
        background: 'white',
        borderRadius: 24,
        padding: '32px 28px',
        width: '100%',
        maxWidth: 400,
        boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
        position: 'relative',
        zIndex: 1,
        animation: shake ? 'shake 0.6s ease' : 'slideUp 0.4s ease',
      }}>

        {/* Card header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', margin: '0 0 4px' }}>
            Selamat Datang! 👋
          </h1>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: 0, fontWeight: 500 }}>
            Masuk untuk mengakses semua fitur
          </p>
        </div>

        {/* Error alert */}
        {error && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 10,
            background: '#fef2f2', border: '1px solid #fecaca',
            borderRadius: 12, padding: '12px 14px', marginBottom: 20,
            animation: 'fadeIn 0.3s ease',
          }}>
            <AlertCircle size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 12, color: '#dc2626', margin: 0, fontWeight: 600, lineHeight: 1.5 }}>
              {error}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#475569', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Email
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Masukkan email"
              required
              style={{
                width: '100%', padding: '13px 14px', borderRadius: 12,
                border: `2px solid ${error ? '#fecaca' : form.email ? '#007FFF' : '#e2e8f0'}`,
                fontSize: 14, fontWeight: 600, color: '#0f172a',
                outline: 'none', background: '#f8fafc',
                boxSizing: 'border-box', fontFamily: 'inherit',
                transition: 'border-color 0.2s',
              }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#475569', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange}
                placeholder="Masukkan password"
                required
                style={{
                  width: '100%', padding: '13px 44px 13px 14px', borderRadius: 12,
                  border: `2px solid ${error ? '#fecaca' : form.password ? '#007FFF' : '#e2e8f0'}`,
                  fontSize: 14, fontWeight: 600, color: '#0f172a',
                  outline: 'none', background: '#f8fafc',
                  boxSizing: 'border-box', fontFamily: 'inherit',
                  transition: 'border-color 0.2s',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  border: 'none', background: 'none', cursor: 'pointer', padding: 4,
                  display: 'flex', alignItems: 'center', color: '#94a3b8',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '14px', borderRadius: 14,
              background: loading ? '#93c5fd' : 'linear-gradient(135deg, #0050CC, #007FFF)',
              color: 'white', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: 15, fontWeight: 800, fontFamily: 'inherit',
              boxShadow: loading ? 'none' : '0 6px 20px rgba(0,127,255,0.35)',
              transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            {loading ? (
              <>
                <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                Memverifikasi...
              </>
            ) : (
              <>
                <LogIn size={16} />
                Masuk Sekarang
              </>
            )}
          </button>
        </form>

        {/* Register link */}
        <div style={{ marginTop: 20, textAlign: 'center', borderTop: '1px solid #f1f5f9', paddingTop: 20 }}>
          <p style={{ fontSize: 13, color: '#64748b', margin: 0, fontWeight: 500 }}>
            Belum punya akun?{' '}
            <button
              onClick={onRegister}
              style={{
                border: 'none', background: 'none', cursor: 'pointer',
                color: '#007FFF', fontWeight: 800, fontSize: 13,
                fontFamily: 'inherit', padding: 0,
                textDecoration: 'underline',
              }}
            >
              Daftar di sini
            </button>
          </p>
        </div>


      </div>

      {/* Footer */}
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 24, fontWeight: 600, position: 'relative', zIndex: 1 }}>
        © CPNSkarier · Semua data formasi resmi
      </p>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-8px); }
          30% { transform: translateX(8px); }
          45% { transform: translateX(-6px); }
          60% { transform: translateX(6px); }
          75% { transform: translateX(-3px); }
          90% { transform: translateX(3px); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        input:focus {
          border-color: #007FFF !important;
          background: white !important;
        }
      `}</style>
    </div>
  );
}
