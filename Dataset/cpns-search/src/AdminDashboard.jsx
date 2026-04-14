import { useState, useEffect, useCallback } from 'react';
import {
  Users, CheckCircle, XCircle, Search, ArrowLeft,
  CreditCard, Clock, RefreshCcw, ShieldCheck, BadgeCheck,
  AlertCircle, Loader2
} from 'lucide-react';
import { supabase } from './supabase';

// ─── Supabase Admin Client (service role key digunakan via Edge Function)
// Untuk membaca email, kita query via RPC atau join ke auth.users.
// Di sini kita ambil data dari user_profiles saja + panggil edge function untuk update.

export default function AdminDashboard({ onBack }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('unpaid'); // 'all' | 'paid' | 'unpaid'
  const [updatingId, setUpdatingId] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const [stats, setStats] = useState({ total: 0, paid: 0, unpaid: 0 });

  const showToast = (msg, type = 'success') => {
    setToastMsg({ msg, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch user_profiles + email via Supabase RPC atau SQL join
      // Fallback: hanya bisa ambil id dari user_profiles karena RLS.
      // Kita coba ambil email via auth admin (diperlukan service role / RPC khusus).
      // Untuk sementara, kita tampilkan data dari user_profiles saja.
      const { data: profiles, error } = await supabase
        .from('user_profiles')
        .select('id, is_paid, paid_at, midtrans_order_id, created_at, role, is_verified')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Coba tambahkan email via auth.users jika punya akses (admin only)
      // Gunakan supabase.auth.admin.listUsers() jika service key tersedia
      let enriched = profiles || [];
      try {
        const { data: adminData } = await supabase.auth.admin.listUsers();
        if (adminData?.users) {
          const emailMap = {};
          adminData.users.forEach(u => { emailMap[u.id] = u.email; });
          enriched = enriched.map(p => ({ ...p, email: emailMap[p.id] || null }));
        }
      } catch (_) {
        // auth.admin tidak tersedia dengan anon key — tampilkan tanpa email
      }

      setUsers(enriched);
      const paid = enriched.filter(p => p.is_paid).length;
      setStats({ total: enriched.length, paid, unpaid: enriched.length - paid });
    } catch (err) {
      showToast('Gagal memuat data: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleMarkPaid = async (userId) => {
    setUpdatingId(userId);
    const { error } = await supabase
      .from('user_profiles')
      .update({
        is_paid: true,
        paid_at: new Date().toISOString(),
        is_verified: true,
      })
      .eq('id', userId);

    if (error) {
      showToast('Gagal: ' + error.message, 'error');
    } else {
      showToast('✅ User berhasil ditandai sebagai PAID!', 'success');
      fetchUsers();
    }
    setUpdatingId(null);
  };

  const filteredUsers = users.filter(u => {
    const searchTerm = search.toLowerCase();
    const matchesSearch =
      u.id.toLowerCase().includes(searchTerm) ||
      (u.email && u.email.toLowerCase().includes(searchTerm)) ||
      (u.midtrans_order_id && u.midtrans_order_id.toLowerCase().includes(searchTerm));

    if (filter === 'paid') return u.is_paid && matchesSearch;
    if (filter === 'unpaid') return !u.is_paid && matchesSearch;
    return matchesSearch;
  });

  const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif",
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
      color: '#f8fafc',
      padding: '0 0 60px',
    }}>

      {/* ── TOP NAV ── */}
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '14px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <button
          onClick={onBack}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 10, padding: '7px 14px',
            color: '#94a3b8', fontWeight: 700, cursor: 'pointer', fontSize: 13,
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.13)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
        >
          <ArrowLeft size={15} /> Kembali
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            borderRadius: 10, padding: '6px 8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <ShieldCheck size={18} color="white" />
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 900, fontSize: 16, letterSpacing: -0.3 }}>Admin Panel</p>
            <p style={{ margin: 0, fontSize: 11, color: '#64748b', fontWeight: 600 }}>CPNSKarier.id</p>
          </div>
        </div>

        <button
          onClick={fetchUsers}
          disabled={loading}
          style={{
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 10, padding: '7px 10px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.13)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
        >
          <RefreshCcw size={16} color="#94a3b8" style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
        </button>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 20px 0' }}>

        {/* ── HERO TITLE ── */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{
            fontSize: 30, fontWeight: 900, margin: '0 0 6px',
            background: 'linear-gradient(90deg, #a5b4fc, #c4b5fd)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            letterSpacing: -0.8,
          }}>
            Manajemen Pembayaran 💳
          </h1>
          <p style={{ fontSize: 14, color: '#64748b', fontWeight: 500, margin: 0 }}>
            Tandai user sebagai sudah membayar untuk mengaktifkan akses premium mereka.
          </p>
        </div>

        {/* ── STATS ── */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 14, marginBottom: 28
        }}>
          {[
            { label: 'Total User', value: stats.total, color: '#a5b4fc', bg: 'rgba(99,102,241,0.12)', icon: <Users size={18} color="#a5b4fc" /> },
            { label: 'Sudah Bayar', value: stats.paid, color: '#4ade80', bg: 'rgba(74,222,128,0.12)', icon: <BadgeCheck size={18} color="#4ade80" /> },
            { label: 'Belum Bayar', value: stats.unpaid, color: '#fb923c', bg: 'rgba(251,146,60,0.12)', icon: <AlertCircle size={18} color="#fb923c" /> },
          ].map(s => (
            <div key={s.label} style={{
              background: s.bg, border: `1px solid ${s.color}22`,
              borderRadius: 18, padding: '18px 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              backdropFilter: 'blur(8px)',
            }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 800, color: s.color, textTransform: 'uppercase', margin: '0 0 6px', letterSpacing: 0.5 }}>{s.label}</p>
                <p style={{ fontSize: 28, fontWeight: 900, color: '#f8fafc', margin: 0 }}>{s.value}</p>
              </div>
              <div style={{ background: `${s.color}22`, borderRadius: 12, padding: 10 }}>{s.icon}</div>
            </div>
          ))}
        </div>

        {/* ── SEARCH & FILTER ── */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{
            flex: 1, minWidth: 220,
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12, padding: '10px 14px',
            display: 'flex', alignItems: 'center', gap: 8
          }}>
            <Search size={16} color="#64748b" />
            <input
              type="text"
              placeholder="Cari email, ID, atau Order ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                flex: 1, border: 'none', outline: 'none',
                background: 'transparent', color: '#f8fafc',
                fontSize: 14, fontWeight: 600,
              }}
            />
          </div>

          <div style={{
            display: 'flex', background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12, padding: 4, gap: 2
          }}>
            {[
              { key: 'unpaid', label: 'Belum Bayar' },
              { key: 'paid', label: 'Sudah Bayar' },
              { key: 'all', label: 'Semua' },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setFilter(t.key)}
                style={{
                  padding: '7px 14px', borderRadius: 9, fontSize: 12, fontWeight: 700,
                  border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                  background: filter === t.key ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'transparent',
                  color: filter === t.key ? 'white' : '#64748b',
                  boxShadow: filter === t.key ? '0 4px 12px rgba(99,102,241,0.3)' : 'none',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── USER LIST ── */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <Loader2 size={36} color="#6366f1" style={{ margin: '0 auto 14px', display: 'block', animation: 'spin 1s linear infinite' }} />
            <p style={{ color: '#64748b', fontWeight: 600, fontSize: 14 }}>Memuat data pengguna...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '70px 20px',
            background: 'rgba(255,255,255,0.03)', borderRadius: 20,
            border: '1px solid rgba(255,255,255,0.07)'
          }}>
            <Users size={44} color="#334155" style={{ margin: '0 auto 16px', display: 'block' }} />
            <h4 style={{ fontSize: 16, fontWeight: 800, color: '#475569', margin: '0 0 4px' }}>Tidak Ada Data</h4>
            <p style={{ fontSize: 13, color: '#334155', margin: 0 }}>Coba ubah filter atau kata kunci pencarian.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filteredUsers.map(user => (
              <UserRow
                key={user.id}
                user={user}
                isUpdating={updatingId === user.id}
                onMarkPaid={handleMarkPaid}
                formatDate={formatDate}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── TOAST ── */}
      {toastMsg && (
        <div style={{
          position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
          background: toastMsg.type === 'success'
            ? 'linear-gradient(135deg, #166534, #15803d)'
            : 'linear-gradient(135deg, #7f1d1d, #b91c1c)',
          color: 'white', padding: '12px 24px', borderRadius: 14,
          fontWeight: 700, fontSize: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          zIndex: 999, whiteSpace: 'nowrap',
          animation: 'slideUp 0.3s ease',
        }}>
          {toastMsg.msg}
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideUp {
          from { opacity: 0; transform: translate(-50%, 16px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }
        input::placeholder { color: #475569; }
      `}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
function UserRow({ user, isUpdating, onMarkPaid, formatDate }) {
  const isPaid = user.is_paid;

  return (
    <div style={{
      background: isPaid
        ? 'rgba(74,222,128,0.04)'
        : 'rgba(255,255,255,0.04)',
      border: isPaid
        ? '1px solid rgba(74,222,128,0.18)'
        : '1px solid rgba(255,255,255,0.08)',
      borderRadius: 18,
      padding: '16px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
      transition: 'border 0.3s',
    }}>
      {/* Left: avatar + info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
        {/* Avatar */}
        <div style={{
          width: 46, height: 46, borderRadius: 14, flexShrink: 0,
          background: isPaid ? 'rgba(74,222,128,0.15)' : 'rgba(251,146,60,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: isPaid ? '2px solid rgba(74,222,128,0.3)' : '2px solid rgba(251,146,60,0.25)',
        }}>
          {isPaid
            ? <BadgeCheck size={22} color="#4ade80" />
            : <CreditCard size={22} color="#fb923c" />
          }
        </div>

        {/* Info */}
        <div style={{ minWidth: 0 }}>
          {/* Email or fallback ID */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <p style={{
              fontSize: 14, fontWeight: 800, color: '#f1f5f9',
              margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {user.email || `ID: ${user.id.slice(0, 12)}...`}
            </p>
            {/* Badges */}
            {user.role === 'admin' && (
              <span style={{
                fontSize: 10, background: 'rgba(99,102,241,0.2)', color: '#a5b4fc',
                padding: '2px 7px', borderRadius: 5, fontWeight: 900,
                border: '1px solid rgba(99,102,241,0.3)',
              }}>ADMIN</span>
            )}
            <span style={{
              fontSize: 10, padding: '2px 8px', borderRadius: 5, fontWeight: 800,
              background: isPaid ? 'rgba(74,222,128,0.15)' : 'rgba(251,146,60,0.12)',
              color: isPaid ? '#4ade80' : '#fb923c',
              border: isPaid ? '1px solid rgba(74,222,128,0.25)' : '1px solid rgba(251,146,60,0.2)',
            }}>
              {isPaid ? 'PAID' : 'UNPAID'}
            </span>
          </div>

          {/* Sub-info */}
          <div style={{ display: 'flex', gap: 16, marginTop: 4, flexWrap: 'wrap' }}>
            <p style={{ fontSize: 11, color: '#475569', margin: 0, fontWeight: 600 }}>
              🗓 Daftar: {formatDate(user.created_at)}
            </p>
            {user.midtrans_order_id && (
              <p style={{ fontSize: 11, color: '#475569', margin: 0, fontWeight: 600 }}>
                🏷 Order: {user.midtrans_order_id}
              </p>
            )}
            {isPaid && user.paid_at && (
              <p style={{ fontSize: 11, color: '#4ade80', margin: 0, fontWeight: 600 }}>
                ✅ Bayar: {formatDate(user.paid_at)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Right: Action button */}
      <div style={{ flexShrink: 0 }}>
        {isPaid ? (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)',
            borderRadius: 12, padding: '8px 14px',
          }}>
            <CheckCircle size={15} color="#4ade80" />
            <span style={{ fontSize: 12, fontWeight: 800, color: '#4ade80' }}>Sudah Bayar</span>
          </div>
        ) : (
          <button
            onClick={() => onMarkPaid(user.id)}
            disabled={isUpdating}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              background: isUpdating
                ? 'rgba(99,102,241,0.5)'
                : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              border: 'none', borderRadius: 12,
              padding: '9px 18px', cursor: isUpdating ? 'not-allowed' : 'pointer',
              color: 'white', fontSize: 13, fontWeight: 800,
              boxShadow: isUpdating ? 'none' : '0 4px 16px rgba(99,102,241,0.4)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { if (!isUpdating) e.currentTarget.style.boxShadow = '0 6px 20px rgba(99,102,241,0.55)'; }}
            onMouseLeave={e => { if (!isUpdating) e.currentTarget.style.boxShadow = '0 4px 16px rgba(99,102,241,0.4)'; }}
          >
            {isUpdating
              ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Memproses...</>
              : <><BadgeCheck size={15} /> Tandai PAID</>
            }
          </button>
        )}
      </div>
    </div>
  );
}
