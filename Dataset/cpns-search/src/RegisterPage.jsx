import { useState } from 'react';
import { Eye, EyeOff, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import logoImg from './assets/logo.png';
import { supabase } from './supabase';

export default function RegisterPage({ onBack }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [shake, setShake] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const validatePassword = () => {
    if (form.password.length < 6) {
      return 'Password minimal 6 karakter';
    }
    if (form.password !== form.confirmPassword) {
      return 'Password tidak cocok';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validatePassword();
    if (validationError) {
      setError(validationError);
      setShake(true);
      setTimeout(() => setShake(false), 600);
      return;
    }

    setLoading(true);
    setError('');

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { name: form.name },
      },
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message || 'Terjadi kesalahan saat registrasi.');
      setShake(true);
      setTimeout(() => setShake(false), 600);
      return;
    }

    if (data.user && !data.session) {
      setSuccess(true);
      return;
    }

    setSuccess(true);
  };

  if (success) {
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
        <div style={{ position: 'absolute', top: -80, right: -80, width: 280, height: 280, background: 'rgba(255,255,255,0.07)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -100, left: -60, width: 320, height: 320, background: 'rgba(0,180,255,0.12)', borderRadius: '50%', pointerEvents: 'none' }} />

        <div style={{
          background: 'white',
          borderRadius: 24,
          padding: '36px 28px',
          width: '100%',
          maxWidth: 400,
          boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          animation: 'slideUp 0.4s ease',
        }}>
          <div style={{ width: 64, height: 64, background: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <CheckCircle2 size={32} color="#22c55e" />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', margin: '0 0 10px' }}>
            Registrasi Berhasil! 🎉
          </h2>
          <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 24px', lineHeight: 1.7 }}>
            Kami telah mengirim link verifikasi ke <strong style={{ color: '#0f172a' }}>{form.email}</strong>.<br />
            Silakan cek email kamu untuk mengaktifkan akun.
          </p>
          <button
            onClick={onBack}
            style={{
              width: '100%', padding: '14px', borderRadius: 14,
              background: 'linear-gradient(135deg, #0050CC, #007FFF)',
              color: 'white', border: 'none', cursor: 'pointer',
              fontSize: 15, fontWeight: 800, fontFamily: 'inherit',
              boxShadow: '0 6px 20px rgba(0,127,255,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all 0.2s',
            }}
          >
            Kembali ke Login
          </button>
        </div>

        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 24, fontWeight: 600, position: 'relative', zIndex: 1 }}>
          © CPNSKarier · Semua data formasi resmi
        </p>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    );
  }

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

        {/* Back button */}
        <button
          onClick={onBack}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            border: 'none', background: 'none', cursor: 'pointer',
            color: '#94a3b8', fontSize: 12, fontWeight: 700,
            fontFamily: 'inherit', padding: 0, marginBottom: 16,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
          Kembali ke Login
        </button>

        {/* Card header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', margin: '0 0 4px' }}>
            Buat Akun Baru 👋
          </h1>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: 0, fontWeight: 500 }}>
            Daftar untuk mengakses semua fitur
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
          {/* Name */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#475569', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Nama Lengkap
            </label>
            <input
              id="reg-name"
              name="name"
              type="text"
              autoComplete="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Masukkan nama lengkap"
              required
              style={{
                width: '100%', padding: '13px 14px', borderRadius: 12,
                border: '2px solid #e2e8f0',
                fontSize: 14, fontWeight: 600, color: '#0f172a',
                outline: 'none', background: '#f8fafc',
                boxSizing: 'border-box', fontFamily: 'inherit',
                transition: 'border-color 0.2s',
              }}
            />
          </div>

          {/* Email */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#475569', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Email
            </label>
            <input
              id="reg-email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              placeholder="contoh@email.com"
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
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#475569', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="reg-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={form.password}
                onChange={handleChange}
                placeholder="Minimal 6 karakter"
                required
                style={{
                  width: '100%', padding: '13px 44px 13px 14px', borderRadius: 12,
                  border: `2px solid ${error?.includes('Password') ? '#fecaca' : form.password ? '#007FFF' : '#e2e8f0'}`,
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

          {/* Confirm Password */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#475569', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Konfirmasi Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="reg-confirm"
                name="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Ulangi password"
                required
                style={{
                  width: '100%', padding: '13px 44px 13px 14px', borderRadius: 12,
                  border: `2px solid ${error?.includes('cocok') ? '#fecaca' : form.confirmPassword ? '#007FFF' : '#e2e8f0'}`,
                  fontSize: 14, fontWeight: 600, color: '#0f172a',
                  outline: 'none', background: '#f8fafc',
                  boxSizing: 'border-box', fontFamily: 'inherit',
                  transition: 'border-color 0.2s',
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  border: 'none', background: 'none', cursor: 'pointer', padding: 4,
                  display: 'flex', alignItems: 'center', color: '#94a3b8',
                }}
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button
            id="reg-submit"
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
                Mendaftarkan...
              </>
            ) : (
              <>
                <UserPlus size={16} />
                Daftar Sekarang
              </>
            )}
          </button>
        </form>

      </div>

      {/* Footer */}
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 24, fontWeight: 600, position: 'relative', zIndex: 1 }}>
        © CPNSKarier · Semua data formasi resmi
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
