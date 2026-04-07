import { useState, useMemo, useEffect, useRef } from 'react';
import Fuse from 'fuse.js';
import { Search, FileText, ChevronDown, X, Building2, MapPin, Sparkles, GraduationCap, Briefcase, SlidersHorizontal, LogOut } from 'lucide-react';
import agencyData from './data.json';
import driveMapping from './drive_mapping.json';
import logoImg from './assets/logo.png';
import { supabase } from './supabase';

function App({ user, onLogout, onUpgrade }) {
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(30);
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [selectedEducation, setSelectedEducation] = useState('Semua');
  const [selectedInstansi, setSelectedInstansi] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isPaid, setIsPaid] = useState(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check is_paid status (server-side, bypasses RLS)
  useEffect(() => {
    const checkPaid = async () => {
      try {
        const res = await fetch(`/api/payment-status?userId=${user.id}`);
        const data = await res.json();
        setIsPaid(data.isPaid ?? false);
      } catch {
        setIsPaid(false);
      }
    };
    checkPaid();
  }, [user.id]);

  // Poll for payment success (when returning from Midtrans)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
      window.history.replaceState({}, '', window.location.pathname);
      const interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/payment-status?userId=${user.id}`);
          const data = await res.json();
          if (data.isPaid) {
            setIsPaid(true);
            clearInterval(interval);
          }
        } catch {
          // ignore
        }
      }, 2000);

      // Stop polling after 5 minutes
      setTimeout(() => clearInterval(interval), 300000);
      return () => clearInterval(interval);
    }
  }, [user.id]);

  const allUniqueInstansi = useMemo(() => {
    return Array.from(new Set(agencyData.map(d => d.instansi))).sort();
  }, []);

  const educationRegex = {
    'S1': /s[- ]?1\b/i,
    'S2': /s[- ]?2\b/i,
    'S3': /s[- ]?3\b/i,
    'D1': /d[- ]?(i|1)\b/i,
    'D3': /d[- ]?(iii|3)\b/i,
    'D4': /d[- ]?(iv|4)\b/i
  };

  const baseResults = useMemo(() => {
    let filtered = agencyData;
    if (selectedCategory !== 'Semua') {
      filtered = filtered.filter(item => {
        const isDaerah = item.instansi.includes('Kab.') || item.instansi.includes('Kota') || item.instansi.includes('Prov');
        return selectedCategory === 'Daerah' ? isDaerah : !isDaerah;
      });
    }
    if (selectedEducation !== 'Semua') {
      const regex = educationRegex[selectedEducation];
      if (regex) {
        filtered = filtered.filter(item => regex.test(item.jurusan));
      }
    }
    if (selectedInstansi.trim() !== '') {
      filtered = filtered.filter(item => item.instansi.toLowerCase() === selectedInstansi.toLowerCase());
    }
    return filtered;
  }, [selectedCategory, selectedEducation, selectedInstansi]);

  const fuse = useMemo(() => new Fuse(baseResults, {
    keys: ['jurusan', 'instansi'],
    threshold: 0.35,
  }), [baseResults]);

  const results = useMemo(() => {
    if (!query.trim()) return baseResults;
    return fuse.search(query).map(r => r.item);
  }, [query, fuse, baseResults]);

  const displayed = useMemo(() => results.slice(0, limit), [results, limit]);
  const activeFilters = (selectedCategory !== 'Semua' ? 1 : 0) + (selectedEducation !== 'Semua' ? 1 : 0) + (selectedInstansi ? 1 : 0);

  const clearAll = () => {
    setQuery('');
    setSelectedCategory('Semua');
    setSelectedEducation('Semua');
    setSelectedInstansi('');
    setLimit(30);
    setShowFilters(false);
  };

  // Loading state
  if (isPaid === null) {
    return (
      <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#f8fafc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ width: 32, height: 32, border: '3px solid #e2e8f0', borderTopColor: '#007FFF', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Not paid — show paywall
  if (!isPaid) {
    return (
      <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#f8fafc', minHeight: '100vh', color: '#0f172a' }}>
        {/* Hero */}
        <div style={{ background: 'linear-gradient(135deg, #0050CC 0%, #007FFF 60%, #00B4FF 100%)', padding: '48px 20px 70px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, background: 'rgba(255,255,255,0.08)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', bottom: -60, left: -40, width: 200, height: 200, background: 'rgba(0,180,255,0.15)', borderRadius: '50%' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
              <img src={logoImg} alt="CPNS Karier Logo" style={{ height: 100, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
            </div>
            <h1 style={{ color: 'white', fontSize: 30, fontWeight: 900, lineHeight: 1.2, margin: '0 0 10px', letterSpacing: -0.5 }}>
              Cek Referensi Formasi<br /><span style={{ color: '#FCD34D' }}>CPNS Lulusan Kamu</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 500, margin: 0, lineHeight: 1.6 }}>
              Akses penuh ke <strong style={{ color: 'white' }}>semua formasi</strong> CPFNS 2024
            </p>
          </div>
        </div>

        <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 16px 100px' }}>
          {/* Blurred search */}
          <div style={{ marginTop: -32, position: 'relative', zIndex: 10 }}>
            <div style={{ background: 'white', borderRadius: 20, boxShadow: '0 8px 32px rgba(0,127,255,0.12)', border: '1px solid #e2e8f0', overflow: 'hidden', filter: 'blur(4px)', pointerEvents: 'none', userSelect: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderBottom: '1px solid #f1f5f9' }}>
                <Search size={18} color="#007FFF" style={{ flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: '#94a3b8' }}>E.g. S-1 Teknologi Informasi</span>
              </div>
            </div>
          </div>

          {/* Paywall CTA */}
          <div style={{ marginTop: 32, textAlign: 'center' }}>
            <div style={{ background: 'white', borderRadius: 24, border: '1px solid #f1f5f9', padding: '32px 24px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
              <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg, #fff7ed, #ffedd5)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', margin: '0 0 10px' }}>Hasil Pencarian Terkunci</h2>
              <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 24px', lineHeight: 1.7 }}>
                Upgrade ke Premium untuk melihat seluruh hasil pencarian dan mengunduh dokumen formasi CPFNS 2024.
              </p>
              <button
                onClick={onUpgrade}
                style={{ width: '100%', padding: '15px', borderRadius: 14, background: 'linear-gradient(135deg, #0050CC, #007FFF)', color: 'white', border: 'none', cursor: 'pointer', fontSize: 15, fontWeight: 800, fontFamily: 'inherit', boxShadow: '0 6px 20px rgba(0,127,255,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                Upgrade Premium — Rp 39.000
              </button>
              <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 12, fontWeight: 500 }}>Sekali bayar · Akses seumur hidup</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', borderTop: '1px solid #e2e8f0', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 -4px 20px rgba(0,0,0,0.06)' }}>
          <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>© CPUsKarier</span>
          <button onClick={() => setShowLogoutConfirm(true)} style={{ display: 'flex', alignItems: 'center', gap: 5, border: 'none', background: '#fef2f2', borderRadius: 999, padding: '6px 10px', cursor: 'pointer', color: '#ef4444', fontSize: 11, fontWeight: 700, fontFamily: 'inherit' }}>
            <LogOut size={12} />Keluar
          </button>
        </div>

        {/* Logout Modal */}
        {showLogoutConfirm && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, animation: 'fadeIn 0.2s ease' }}>
            <div style={{ background: 'white', borderRadius: 20, padding: '28px 24px', width: '100%', maxWidth: 320, boxShadow: '0 24px 64px rgba(0,0,0,0.2)', animation: 'slideUp 0.25s ease', textAlign: 'center' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <LogOut size={22} color="#ef4444" />
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 900, color: '#0f172a', margin: '0 0 8px' }}>Keluar dari aplikasi?</h3>
              <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 24px', lineHeight: 1.6 }}>Kamu perlu login ulang untuk mengakses halaman ini.</p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setShowLogoutConfirm(false)} style={{ flex: 1, padding: '12px', borderRadius: 12, border: '2px solid #e2e8f0', background: 'white', color: '#475569', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Batal</button>
                <button onClick={() => { setShowLogoutConfirm(false); onLogout(); }} style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(239,68,68,0.35)' }}>Ya, Keluar</button>
              </div>
            </div>
          </div>
        )}

        <style>{`
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#f8fafc', minHeight: '100vh', color: '#0f172a' }}>

      {/* STICKY SEARCH BAR */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        transform: isScrolled ? 'translateY(0)' : 'translateY(-100%)',
        opacity: isScrolled ? 1 : 0,
        transition: 'transform 0.3s ease, opacity 0.3s ease',
        padding: '10px 16px',
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e2e8f0',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f1f5f9', borderRadius: 14, padding: '10px 14px' }}>
          <Search size={16} color="#007FFF" />
          <input
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setLimit(30); }}
            placeholder="Cari jurusan atau instansi..."
            style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 14, fontWeight: 600, color: '#0f172a' }}
          />
          {query && <button onClick={() => setQuery('')} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}><X size={16} color="#94a3b8" /></button>}
        </div>
      </div>

      {/* HERO */}
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
          {/* Logo — centered, replaces badge */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <img
              src={logoImg}
              alt="CPNS Karier Logo"
              style={{ height: 100, objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
            />
          </div>
          <h1 style={{ color: 'white', fontSize: 30, fontWeight: 900, lineHeight: 1.2, margin: '0 0 10px', letterSpacing: -0.5 }}>
            Cek Referensi Formasi<br /><span style={{ color: '#FCD34D' }}>CPNS Lulusan Kamu</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 500, margin: 0, lineHeight: 1.6 }}>
            <strong style={{ color: 'white' }}>{agencyData.length.toLocaleString()}</strong> formasi dari<br />Instansi Pusat &amp; Daerah Berdasarkan CPNS 2024
          </p>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="main-content">

        {/* FLOATING SEARCH CARD */}
        <div className="search-section">
          <div style={{ background: 'white', borderRadius: 20, boxShadow: '0 8px 32px rgba(0,127,255,0.12)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>

          {/* Search input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderBottom: '1px solid #f1f5f9' }}>
            <Search size={18} color="#007FFF" style={{ flexShrink: 0 }} />
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={e => { setQuery(e.target.value); setLimit(30); }}
              placeholder="E.g. S-1 Teknologi Informasi"
              style={{
                flex: 1, border: 'none', outline: 'none', fontSize: 15,
                fontWeight: 600, color: '#0f172a', background: 'transparent'
              }}
            />
            {query && (
              <button onClick={() => setQuery('')} style={{ border: 'none', background: '#f1f5f9', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                <X size={14} color="#64748b" />
              </button>
            )}
          </div>

          {/* Filter toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px' }}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, border: 'none', background: 'none', cursor: 'pointer',
                color: showFilters ? '#007FFF' : '#64748b', fontWeight: 700, fontSize: 13,
                fontFamily: 'inherit', padding: 0
              }}
            >
              <SlidersHorizontal size={15} />
              Filter
              {activeFilters > 0 && (
                <span style={{ background: '#007FFF', color: 'white', borderRadius: '50%', width: 18, height: 18, fontSize: 10, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {activeFilters}
                </span>
              )}
            </button>
            {(activeFilters > 0 || query) && (
              <button onClick={clearAll} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 12, fontWeight: 700, fontFamily: 'inherit', padding: 0 }}>
                Reset semua
              </button>
            )}
          </div>

          {/* Expanded filters */}
          {showFilters && (
            <div style={{ padding: '0 16px 16px', borderTop: '1px solid #f8fafc' }}>
              <p style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.5, margin: '12px 0 8px' }}>Kategori</p>
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                {['Semua', 'Pusat', 'Daerah'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => { setSelectedCategory(cat); setLimit(30); }}
                    style={{
                      padding: '8px 16px', borderRadius: 10, fontWeight: 700, fontSize: 13,
                      cursor: 'pointer', border: 'none', fontFamily: 'inherit',
                      background: selectedCategory === cat ? '#007FFF' : '#f1f5f9',
                      color: selectedCategory === cat ? 'white' : '#64748b',
                      boxShadow: selectedCategory === cat ? '0 4px 12px rgba(0,127,255,0.3)' : 'none',
                      transition: 'all 0.2s'
                    }}
                  >{cat}</button>
                ))}
              </div>
              <p style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.5, margin: '12px 0 8px' }}>Pendidikan</p>
              <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                {['Semua', 'S1', 'S2', 'S3', 'D1', 'D3', 'D4'].map(edu => (
                  <button
                    key={edu}
                    onClick={() => { setSelectedEducation(edu); setLimit(30); }}
                    style={{
                      padding: '8px 16px', borderRadius: 10, fontWeight: 700, fontSize: 13,
                      cursor: 'pointer', border: 'none', fontFamily: 'inherit',
                      background: selectedEducation === edu ? '#007FFF' : '#f1f5f9',
                      color: selectedEducation === edu ? 'white' : '#64748b',
                      boxShadow: selectedEducation === edu ? '0 4px 12px rgba(0,127,255,0.3)' : 'none',
                      transition: 'all 0.2s'
                    }}
                  >{edu}</button>
                ))}
              </div>
              <p style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.5, margin: '0 0 8px' }}>Nama Instansi</p>
              <div style={{ position: 'relative' }}>
                <input
                  list="instansi-list"
                  value={selectedInstansi}
                  onChange={e => { setSelectedInstansi(e.target.value); setLimit(30); }}
                  placeholder="Semua instansi..."
                  style={{
                    width: '100%', padding: '10px 36px 10px 12px', borderRadius: 10, border: '2px solid',
                    borderColor: selectedInstansi ? '#007FFF' : '#e2e8f0', outline: 'none',
                    fontSize: 13, fontWeight: 600, color: '#0f172a', background: '#f8fafc',
                    boxSizing: 'border-box', fontFamily: 'inherit'
                  }}
                />
                {selectedInstansi && (
                  <button onClick={() => setSelectedInstansi('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                    <X size={14} color="#94a3b8" />
                  </button>
                )}
                <datalist id="instansi-list">
                  {allUniqueInstansi.map(i => <option key={i} value={i} />)}
                </datalist>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RESULTS */}
      <div className="results-section">


        {/* Cards */}
        <div className="results-grid">
          {displayed.length > 0 ? (
            <>
              {displayed.map((item) => {
                const isDaerah = item.instansi.includes('Kab.') || item.instansi.includes('Kota') || item.instansi.includes('Prov');
                const filename = item.link_pdf.split('/').pop();
                const driveId = driveMapping[filename] || driveMapping[decodeURIComponent(filename)];
                const pdfHref = driveId
                  ? `https://drive.google.com/file/d/${driveId}/view`
                  : `https://drive.google.com/drive/folders/1CdGGrC9BAY4hp6vui16iV6TL3cvLDUfL?q=${encodeURIComponent(filename)}`;

                return (
                  <div key={item.id} className="result-card">
                    {/* Badge row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        padding: '3px 9px', borderRadius: 999, fontSize: 10, fontWeight: 800,
                        background: isDaerah ? '#fff7ed' : '#eff6ff',
                        color: isDaerah ? '#ea580c' : '#2563eb'
                      }}>
                        {isDaerah ? <MapPin size={10} /> : <Building2 size={10} />}
                        {isDaerah ? 'Daerah' : 'Pusat'}
                      </span>
                      <span style={{ fontSize: 10, color: '#cbd5e1', fontWeight: 700 }}>#{item.id}</span>
                    </div>

                    {/* Instansi */}
                    <p style={{ fontSize: 11, fontWeight: 800, color: '#007FFF', textTransform: 'uppercase', letterSpacing: 0.8, margin: '0 0 4px', lineHeight: 1.4 }}>
                      {item.instansi}
                    </p>

                    {/* Jurusan */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 12 }}>
                      <GraduationCap size={16} color="#cbd5e1" style={{ flexShrink: 0, marginTop: 2 }} />
                      <p style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1.4 }}>
                        {item.jurusan}
                      </p>
                    </div>

                    {/* Button */}
                    <a
                      href={pdfHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        background: '#007FFF', color: 'white', borderRadius: 12,
                        padding: '11px 16px', fontWeight: 700, fontSize: 13,
                        textDecoration: 'none', boxShadow: '0 4px 12px rgba(0,127,255,0.25)',
                        transition: 'background 0.2s'
                      }}
                    >
                      <FileText size={15} />
                      Buka Dokumen PDF
                    </a>
                  </div>
                );
              })}

              {/* Load more */}
              {results.length > limit && (
                <button
                  onClick={() => setLimit(p => p + 50)}
                  style={{
                    width: '100%', padding: '18px', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: 6, background: 'white', borderRadius: 16,
                    border: '2px dashed #bfdbfe', cursor: 'pointer', color: '#007FFF',
                    fontFamily: 'inherit', transition: 'border-color 0.2s'
                  }}
                >
                  <ChevronDown size={22} />
                  <span style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>
                    {Math.min(50, results.length - limit).toLocaleString()} dari {(results.length - limit).toLocaleString()} formasi berikutnya
                  </span>
                </button>
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: 20, border: '1px solid #f1f5f9' }}>
              <div style={{ width: 64, height: 64, background: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Search size={28} color="#e2e8f0" />
              </div>
              <h4 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', margin: '0 0 8px' }}>Tidak Ditemukan</h4>
              <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 20px', lineHeight: 1.6 }}>
                Tidak ada formasi untuk "<span style={{ color: '#007FFF', fontWeight: 700 }}>{query || selectedInstansi}</span>". Coba kata kunci lain.
              </p>
              <button onClick={clearAll} style={{ background: '#007FFF', color: 'white', border: 'none', borderRadius: 12, padding: '12px 24px', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(0,127,255,0.3)' }}>
                Reset Pencarian
              </button>
            </div>
          )}
        </div>
      </div>
      </div>

      {/* FOOTER BAR */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)',
        borderTop: '1px solid #e2e8f0', padding: '10px 20px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.06)'
      }}>
        <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>© CPNSkarier</span>
        {user && (
          <button
            id="logout-btn"
            onClick={() => setShowLogoutConfirm(true)}
            title="Keluar"
            style={{ display: 'flex', alignItems: 'center', gap: 5, border: 'none', background: '#fef2f2', borderRadius: 999, padding: '6px 10px', cursor: 'pointer', color: '#ef4444', fontSize: 11, fontWeight: 700, fontFamily: 'inherit' }}
          >
            <LogOut size={12} />
            Keluar
          </button>
        )}
      </div>

      <style>{`
        /* RESPONSIVE LAYOUT CLASSES */
        .main-content {
          display: flex;
          flex-direction: column;
        }
        .search-section {
          padding: 0 16px;
          margin-top: -32px;
          position: relative;
          z-index: 10;
          max-width: 480px;
          margin-left: auto;
          margin-right: auto;
          width: 100%;
        }
        .results-section {
          padding: 20px 16px 100px;
          max-width: 480px;
          margin: 0 auto;
          width: 100%;
        }
        .results-grid {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .result-card {
          background: white;
          border-radius: 16px;
          border: 1px solid #f1f5f9;
          padding: 14px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
        }

        /* DESKTOP LAYOUT */
        @media (min-width: 1024px) {
          .main-content {
            flex-direction: column;
            align-items: center;
            max-width: 1400px;
            margin: 0 auto;
            padding: 0 32px;
            gap: 20px;
          }
          .search-section {
            width: 100%;
            max-width: 680px;
            margin-top: -48px;
            position: relative;
            z-index: 10;
            padding: 0;
          }
          .results-section {
            width: 100%;
            padding: 24px 0 100px 0;
            max-width: none;
            margin: 0;
          }
          .results-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
          }
          .result-card {
            display: flex;
            flex-direction: column;
          }
          .result-card > a {
            margin-top: auto;
          }
          .result-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 24px rgba(0,127,255,0.12);
            border-color: #bfdbfe;
          }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
        input { font-family: 'Plus Jakarta Sans', sans-serif; }
        a:active { opacity: 0.85; transform: scale(0.99); }
      `}</style>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 999,
          background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 16, animation: 'fadeIn 0.2s ease',
        }}>
          <div style={{
            background: 'white', borderRadius: 20, padding: '28px 24px',
            width: '100%', maxWidth: 320, boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
            animation: 'slideUp 0.25s ease', textAlign: 'center',
          }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <LogOut size={22} color="#ef4444" />
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 900, color: '#0f172a', margin: '0 0 8px' }}>Keluar dari aplikasi?</h3>
            <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 24px', lineHeight: 1.6 }}>
              Kamu perlu login ulang untuk mengakses halaman ini.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                style={{
                  flex: 1, padding: '12px', borderRadius: 12, border: '2px solid #e2e8f0',
                  background: 'white', color: '#475569', fontSize: 13, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Batal
              </button>
              <button
                id="confirm-logout-btn"
                onClick={() => { setShowLogoutConfirm(false); onLogout(); }}
                style={{
                  flex: 1, padding: '12px', borderRadius: 12, border: 'none',
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: 'white', fontSize: 13, fontWeight: 800,
                  cursor: 'pointer', fontFamily: 'inherit',
                  boxShadow: '0 4px 14px rgba(239,68,68,0.35)',
                }}
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
