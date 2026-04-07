import { useState } from 'react';
import { CreditCard, CheckCircle2, AlertCircle, Crown } from 'lucide-react';
import logoImg from './assets/logo.png';

const API_URL = '';

const BENEFITS = [
  'Akses penuh ke semua formasi CPNS 2024',
  'Download dokumen PDF tanpa batasan',
  'Filter by instansi, kategori, dan jurusan',
  'Data diperbarui secara berkala',
  'Akses seumur hidup (1 perangkat)',
];

export default function PurchasePage({ user, onBack }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePurchase = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/api/create-transaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, email: user.email }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('API server tidak ditemukan. Pastikan server berjalan (npm run dev:api)');
        }
        throw new Error(data.error || 'Gagal membuat transaksi');
      }

      // Redirect to Midtrans payment page
      window.location.href = data.redirectUrl;

    } catch (err) {
      setError(err.message || 'Terjadi kesalahan. Silakan coba lagi.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      background: 'linear-gradient(135deg, #0050CC 0%, #007FFF 55%, #00B4FF 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '24px 16px',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Background blobs */}
      <div style={{ position: 'absolute', top: -80, right: -80, width: 280, height: 280, background: 'rgba(255,255,255,0.07)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -100, left: -60, width: 320, height: 320, background: 'rgba(0,180,255,0.12)', borderRadius: '50%', pointerEvents: 'none' }} />

      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 24, position: 'relative', zIndex: 1 }}>
        <img src={logoImg} alt="CPNSkarier Logo"
          style={{ height: 64, objectFit: 'contain', filter: 'brightness(0) invert(1)', display: 'block', margin: '0 auto 10px' }} />
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: 500, margin: 0 }}>
          Unlock Akses Penuh
        </p>
      </div>

      {/* Card */}
      <div style={{
        background: 'white',
        borderRadius: 24,
        padding: '32px 28px',
        width: '100%',
        maxWidth: 440,
        boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
        position: 'relative',
        zIndex: 1,
        animation: 'slideUp 0.4s ease',
      }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 72, height: 72, background: 'linear-gradient(135deg, #FCD34D, #F59E0B)',
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(245,158,11,0.35)',
          }}>
            <Crown size={36} color="white" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', margin: '0 0 6px' }}>
            Upgrade ke Premium
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: 0, lineHeight: 1.6 }}>
            Akses tidak terbatas ke seluruh fitur dan data formasi CPNS
          </p>
        </div>

        {/* Benefits */}
        <div style={{ marginBottom: 28 }}>
          {BENEFITS.map((benefit, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 22, height: 22, background: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                <CheckCircle2 size={14} color="#22c55e" />
              </div>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#334155', margin: 0, lineHeight: 1.5 }}>{benefit}</p>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: '#f1f5f9', marginBottom: 24 }} />

        {/* Price */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <span style={{ fontSize: 28, fontWeight: 900, color: '#0f172a' }}>
              Rp 39.000
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', background: '#f8fafc', borderRadius: 999, padding: '3px 10px', border: '1px solid #e2e8f0' }}>
              Sekali Bayar
            </span>
          </div>
          <p style={{ textAlign: 'center', fontSize: 11, color: '#94a3b8', marginTop: 4, fontWeight: 500 }}>
            Tidak ada biaya tersembunyi
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#fef2f2', border: '1px solid #fecaca',
            borderRadius: 12, padding: '12px 14px', marginBottom: 16,
            animation: 'fadeIn 0.3s ease',
          }}>
            <AlertCircle size={16} color="#ef4444" style={{ flexShrink: 0 }} />
            <p style={{ fontSize: 12, color: '#dc2626', margin: 0, fontWeight: 600 }}>{error}</p>
          </div>
        )}

        {/* Purchase button */}
        <button
          onClick={handlePurchase}
          disabled={loading}
          style={{
            width: '100%', padding: '15px', borderRadius: 14,
            background: loading ? '#93c5fd' : 'linear-gradient(135deg, #0050CC, #007FFF)',
            color: 'white', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: 15, fontWeight: 800, fontFamily: 'inherit',
            boxShadow: loading ? 'none' : '0 6px 20px rgba(0,127,255,0.35)',
            transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          }}
        >
          {loading ? (
            <>
              <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
              Mengalihkan ke pembayaran...
            </>
          ) : (
            <>
              <CreditCard size={18} />
              Bayar Sekarang dengan Midtrans
            </>
          )}
        </button>

        {/* Back */}
        <div style={{ marginTop: 20, textAlign: 'center', borderTop: '1px solid #f1f5f9', paddingTop: 20 }}>
          <button
            onClick={onBack}
            style={{
              border: 'none', background: 'none', cursor: 'pointer',
              color: '#94a3b8', fontWeight: 700, fontSize: 13,
              fontFamily: 'inherit', padding: 0,
            }}
          >
            ← Kembali ke pencarian
          </button>
        </div>

      </div>

      {/* Footer */}
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 24, fontWeight: 600, position: 'relative', zIndex: 1 }}>
        © CPUsKarier · Semua data formasi resmi
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
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
