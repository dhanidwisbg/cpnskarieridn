import { Search, Lock, TrendingUp } from 'lucide-react';

export default function PaywallPage({ onUpgrade, user }) {
  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#f8fafc', minHeight: '100vh', color: '#0f172a' }}>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #0050CC 0%, #007FFF 60%, #00B4FF 100%)',
        padding: '48px 20px 70px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, background: 'rgba(255,255,255,0.08)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -40, width: 200, height: 200, background: 'rgba(0,180,255,0.15)', borderRadius: '50%' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ color: 'white', fontSize: 30, fontWeight: 900, lineHeight: 1.2, margin: '0 0 10px', letterSpacing: -0.5 }}>
            Cek Referensi Formasi<br /><span style={{ color: '#FCD34D' }}>CPNS Lulusan Kamu</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 500, margin: 0, lineHeight: 1.6 }}>
            Akses penuh ke <strong style={{ color: 'white' }}>semua formasi</strong> CPNS 2024
          </p>
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 16px 100px' }}>

        {/* Search card — disabled/blurred */}
        <div style={{ marginTop: -32, position: 'relative', zIndex: 10 }}>
          <div style={{
            background: 'white',
            borderRadius: 20,
            boxShadow: '0 8px 32px rgba(0,127,255,0.12)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            filter: 'blur(4px)',
            pointerEvents: 'none',
            userSelect: 'none',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderBottom: '1px solid #f1f5f9' }}>
              <Search size={18} color="#007FFF" style={{ flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: '#94a3b8' }}>
                E.g. S-1 Teknologi Informasi
              </span>
            </div>
          </div>
        </div>

        {/* Paywall CTA */}
        <div style={{ marginTop: 32, textAlign: 'center' }}>
          <div style={{
            background: 'white',
            borderRadius: 24,
            border: '1px solid #f1f5f9',
            padding: '32px 24px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
          }}>
            {/* Lock icon */}
            <div style={{
              width: 64, height: 64,
              background: 'linear-gradient(135deg, #fff7ed, #ffedd5)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <Lock size={28} color="#ea580c" />
            </div>

            <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', margin: '0 0 10px' }}>
              Hasil Pencarian Terkunci
            </h2>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 24px', lineHeight: 1.7 }}>
              Upgrade ke Premium untuk melihat seluruh hasil pencarian dan mengunduh dokumen formasi CPNS 2024.
            </p>

            <button
              onClick={onUpgrade}
              style={{
                width: '100%',
                padding: '15px',
                borderRadius: 14,
                background: 'linear-gradient(135deg, #0050CC, #007FFF)',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                fontSize: 15,
                fontWeight: 800,
                fontFamily: 'inherit',
                boxShadow: '0 6px 20px rgba(0,127,255,0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'all 0.2s',
              }}
            >
              <TrendingUp size={18} />
              Upgrade Premium — Rp 39.000
            </button>

            <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 12, fontWeight: 500 }}>
              Sekali bayar · Akses seumur hidup
            </p>
          </div>
        </div>

      </div>

      {/* Footer */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)',
        borderTop: '1px solid #e2e8f0', padding: '10px 20px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.06)'
      }}>
        <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>© CPNSKarier</span>
      </div>
    </div>
  );
}
