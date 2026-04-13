import { useState, useEffect } from 'react';
import { 
  Users, CheckCircle, XCircle, Search, ArrowLeft, 
  ShieldCheck, Clock, ShieldAlert, MoreVertical,
  Check, Trash2, Filter, RefreshCcw
} from 'lucide-react';
import { supabase } from './supabase';

export default function AdminDashboard({ onBack }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('unverified'); // 'all', 'verified', 'unverified'
  const [stats, setStats] = useState({ total: 0, verified: 0, unverified: 0 });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    // Note: We're fetching from public.user_profiles. 
    // We'd ideally need user emails too, but they are in auth.users.
    // If you haven't linked emails to public profile, we might only see IDs.
    // Let's assume you have metadata or we can at least show IDs/names if available.
    
    const { data: profiles, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
    } else {
      setUsers(profiles || []);
      
      const total = profiles.length;
      const verified = profiles.filter(p => p.is_verified).length;
      const unverified = total - verified;
      setStats({ total, verified, unverified });
    }
    setLoading(false);
  };

  const handleVerify = async (userId, status) => {
    const { error } = await supabase
      .from('user_profiles')
      .update({ is_verified: status })
      .eq('id', userId);

    if (error) {
      alert('Gagal mengupdate status: ' + error.message);
    } else {
      fetchUsers();
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.id.toLowerCase().includes(search.toLowerCase()) || 
                          (u.midtrans_order_id && u.midtrans_order_id.toLowerCase().includes(search.toLowerCase()));
    
    if (filter === 'verified') return u.is_verified && matchesSearch;
    if (filter === 'unverified') return !u.is_verified && matchesSearch;
    return matchesSearch;
  });

  return (
    <div style={{
      minHeight: '100vh',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      background: '#f8fafc',
      color: '#0f172a',
      padding: '24px 16px',
    }}>
      {/* Header */}
      <div style={{ maxWidth: 800, margin: '0 auto', marginBottom: 24 }}>
        <button 
          onClick={onBack}
          style={{ 
            display: 'flex', alignItems: 'center', gap: 6, border: 'none', background: 'none', 
            color: '#64748b', fontWeight: 700, cursor: 'pointer', fontSize: 13, marginBottom: 16,
            padding: 0
          }}
        >
          <ArrowLeft size={16} /> Kembali ke Aplikasi
        </button>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 900, margin: '0 0 4px', letterSpacing: -0.5 }}>
              Admin Dashboard 🛠️
            </h1>
            <p style={{ fontSize: 13, color: '#64748b', fontWeight: 500, margin: 0 }}>
              Kelola verifikasi dan akses pengguna CPNSKarier
            </p>
          </div>
          <button 
            onClick={fetchUsers}
            disabled={loading}
            style={{ 
              background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, padding: 8,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <RefreshCcw size={18} color="#64748b" className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ 
        maxWidth: 800, margin: '0 auto 24px', display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 
      }}>
        <div style={{ background: 'white', padding: 16, borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <p style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>Total User</p>
          <p style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', margin: 0 }}>{stats.total}</p>
        </div>
        <div style={{ background: 'white', padding: 16, borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <p style={{ fontSize: 11, fontWeight: 800, color: '#22c55e', textTransform: 'uppercase', marginBottom: 4 }}>Verified</p>
          <p style={{ fontSize: 20, fontWeight: 900, color: '#22c55e', margin: 0 }}>{stats.verified}</p>
        </div>
        <div style={{ background: 'white', padding: 16, borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <p style={{ fontSize: 11, fontWeight: 800, color: '#ef4444', textTransform: 'uppercase', marginBottom: 4 }}>Pending</p>
          <p style={{ fontSize: 20, fontWeight: 900, color: '#ef4444', margin: 0 }}>{stats.unverified}</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div style={{ maxWidth: 800, margin: '0 auto 20px', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ 
          flex: 1, minWidth: 200, background: 'white', borderRadius: 12, border: '1px solid #e2e8f0',
          padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8 
        }}>
          <Search size={16} color="#94a3b8" />
          <input 
            type="text" 
            placeholder="Cari ID User..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: 'none', outline: 'none', fontSize: 14, fontWeight: 600, width: '100%' }}
          />
        </div>
        
        <div style={{ display: 'flex', background: '#f1f5f9', p: 4, borderRadius: 12, padding: 4 }}>
          {['unverified', 'verified', 'all'].map(t => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              style={{
                padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                background: filter === t ? 'white' : 'transparent',
                color: filter === t ? '#007FFF' : '#64748b',
                boxShadow: filter === t ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
              }}
            >
              {t === 'unverified' ? 'Pending' : t === 'verified' ? 'Verified' : 'Semua'}
            </button>
          ))}
        </div>
      </div>

      {/* User List */}
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
             <Clock size={32} color="#cbd5e1" className="animate-spin" style={{ margin: '0 auto 12px' }} />
             <p style={{ fontSize: 14, color: '#94a3b8', fontWeight: 600 }}>Memuat penguna...</p>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filteredUsers.map(user => (
              <div 
                key={user.id} 
                style={{ 
                  background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', 
                  padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ 
                    width: 44, height: 44, borderRadius: 12, background: user.is_verified ? '#f0fdf4' : '#fff7ed',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {user.is_verified ? <ShieldCheck size={20} color="#22c55e" /> : <Clock size={20} color="#ea580c" />}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <p style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', margin: 0 }}>User ID: {user.id.slice(0, 8)}...</p>
                      {user.role === 'admin' && (
                        <span style={{ fontSize: 10, background: '#eef2ff', color: '#4338ca', padding: '1px 6px', borderRadius: 4, fontWeight: 900 }}>ADMIN</span>
                      )}
                    </div>
                    {user.midtrans_order_id && (
                       <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0', fontWeight: 600 }}>Order ID: {user.midtrans_order_id}</p>
                    )}
                    <p style={{ fontSize: 10, color: '#cbd5e1', margin: '2px 0 0', fontWeight: 500 }}>Terdaftar: {new Date(user.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  {user.is_verified ? (
                    <button 
                      onClick={() => handleVerify(user.id, false)}
                      style={{ 
                        padding: '8px 12px', borderRadius: 10, background: '#fef2f2', border: 'none',
                        color: '#ef4444', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 4
                      }}
                    >
                      Batalkan Verifikasi
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleVerify(user.id, true)}
                      style={{ 
                        padding: '8px 16px', borderRadius: 10, background: '#007FFF', border: 'none',
                        color: 'white', fontSize: 12, fontWeight: 800, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 4, boxShadow: '0 4px 10px rgba(0,127,255,0.2)'
                      }}
                    >
                      <Check size={16} /> Verifikasi
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: 20, border: '1px solid #f1f5f9' }}>
            <Users size={40} color="#e2e8f0" style={{ margin: '0 auto 16px' }} />
            <h4 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>Tidak Ada Pengguna</h4>
            <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>Tidak ditemukan pengguna dengan filter ini.</p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
}
