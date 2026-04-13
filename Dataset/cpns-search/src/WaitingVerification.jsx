import { Clock, MessageCircle, LogOut } from 'lucide-react';
import logoImg from './assets/logo-transparan.png';

export default function WaitingVerification({ user, onLogout }) {
  const handleContactAdmin = () => {
    const message = encodeURIComponent(`Halo Admin CPNSKarier, saya baru saja mendaftar dengan email: ${user.email}. Mohon bantuannya untuk verifikasi akun saya agar bisa mengakses fitur pencarian formasi. Terima kasih!`);
    window.open(`https://wa.me/628123456789?text=${message}`, '_blank'); // Replace with actual admin number if known
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

      <div style={{ textAlign: 'center', marginBottom: 28, position: 'relative', zIndex: 1 }}>
        <img
          src={logoImg}
          alt="CPNSkarier Logo"
          style={{ height: 72, objectFit: 'contain', filter: 'brightness(0) invert(1)', display: 'block', margin: '0 auto 12px' }}
        />
      </div>

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
        <div style={{ width: 64, height: 64, background: '#eff6ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <Clock size={32} color="#007FFF" className="animate-pulse" />
        </div>
        
        <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', margin: '0 0 12px' }}>
          Akun Sedang Diverifikasi ⏳
        </h2>
        
        <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 24px', lineHeight: 1.7 }}>
          Pendaftaran kamu berhasil! Saat ini admin kami sedang melakukan verifikasi akun secara manual untuk menjaga kualitas layanan.<br /><br />
          Biasanya membutuhkan waktu <strong>5-15 menit</strong>. Silakan cek kembali secara berkala.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            onClick={handleContactAdmin}
            style={{
              width: '100%', padding: '14px', borderRadius: 14,
              background: '#22c55e',
              color: 'white', border: 'none', cursor: 'pointer',
              fontSize: 14, fontWeight: 800, fontFamily: 'inherit',
              boxShadow: '0 6px 20px rgba(34,197,94,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all 0.2s',
            }}
          >
            <MessageCircle size={18} />
            Hubungi Admin (WhatsApp)
          </button>

          <button
            onClick={() => window.location.reload()}
            style={{
              width: '100%', padding: '14px', borderRadius: 14,
              background: '#f1f5f9',
              color: '#475569', border: 'none', cursor: 'pointer',
              fontSize: 14, fontWeight: 700, fontFamily: 'inherit',
              transition: 'all 0.2s',
            }}
          >
            Refresh Halaman
          </button>
        </div>

        <button
          onClick={onLogout}
          style={{
            marginTop: 24,
            width: '100%', padding: '10px', borderRadius: 12,
            background: 'none',
            color: '#ef4444', border: '1px solid #fee2e2', cursor: 'pointer',
            fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            transition: 'all 0.2s',
          }}
        >
          <LogOut size={14} />
          Keluar
        </button>
      </div>

      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 24, fontWeight: 600, position: 'relative', zIndex: 1 }}>
        © CPNSKarier · Verifikasi Manual untuk Keamanan
      </p>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.7; }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}
