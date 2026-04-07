import { useEffect, useRef, useState } from 'react';
import logoImg from './assets/logo-transparan.png';

export default function LandingPage({ onLogin }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [placeholder, setPlaceholder] = useState('S-1 Teknologi Informasi');
  const revealRef = useRef([]);

  const demoTexts = [
    'S-1 Teknologi Informasi', 'S-1 Akuntansi', 'S-1 Ilmu Hukum',
    'D-3 Teknik Sipil', 'S-2 Manajemen', 'S-1 Teknik Elektro', 'S-1 Psikologi',
  ];

  // Scroll & reveal
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });

    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } }),
      { threshold: 0.12 }
    );
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % demoTexts.length;
      setPlaceholder(demoTexts[idx]);
    }, 2800);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  const goToApp = (e) => { e.preventDefault(); onLogin(); };
  const toggleFaq = (id) => setOpenFaq(openFaq === id ? null : id);

  return (
    <>
      {/* ===== Inject Google Font ===== */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

      <style>{`
        /* ========== LANDING PAGE SCOPED STYLES ========== */
        .lp-root *, .lp-root *::before, .lp-root *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .lp-root { font-family: 'Plus Jakarta Sans', sans-serif; background: #f8fafc; color: #0f172a; overflow-x: hidden; -webkit-tap-highlight-color: transparent; }
        :root {
          --blue-dark: #0050CC; --blue: #007FFF; --blue-light: #00B4FF;
          --blue-pale: #eff6ff; --yellow: #FCD34D; --yellow-dark: #F59E0B;
          --slate-900: #0f172a; --slate-700: #334155; --slate-500: #64748b;
          --slate-300: #cbd5e1; --slate-100: #f1f5f9; --slate-50: #f8fafc; --white: #ffffff;
          --grad-hero: linear-gradient(135deg,#0050CC 0%,#007FFF 55%,#00B4FF 100%);
          --shadow-card: 0 4px 24px rgba(0,0,0,.07); --shadow-blue: 0 8px 28px rgba(0,127,255,.3);
          --radius-xl: 24px; --radius-lg: 16px; --radius-md: 12px; --radius-sm: 8px; --radius-full: 9999px;
        }
        .lp-root .container { max-width:1140px; margin:0 auto; padding:0 24px; }
        .lp-root .btn { display:inline-flex; align-items:center; justify-content:center; gap:8px; font-family:inherit; font-weight:800; font-size:15px; cursor:pointer; border:none; border-radius:var(--radius-md); padding:14px 28px; transition:transform .2s,box-shadow .2s; text-decoration:none; white-space:nowrap; }
        .lp-root .btn:hover { transform:translateY(-2px); }
        .lp-root .btn:active { transform:translateY(0); }
        .lp-root .btn-primary { background:var(--grad-hero); color:var(--white); box-shadow:var(--shadow-blue); }
        .lp-root .btn-ghost { background:rgba(255,255,255,.12); color:var(--white); border:2px solid rgba(255,255,255,.35); backdrop-filter:blur(8px); }
        .lp-root .btn-ghost:hover { background:rgba(255,255,255,.2); }
        .lp-root .btn-white { background:var(--white); color:var(--blue); box-shadow:0 8px 28px rgba(0,0,0,.12); }
        .lp-root .btn-white:hover { box-shadow:0 12px 40px rgba(0,0,0,.18); }

        /* NAVBAR */
        .lp-root #lp-navbar { position:fixed; top:0; left:0; right:0; z-index:100; padding:0 24px; transition:background .3s,box-shadow .3s; }
        .lp-root #lp-navbar.scrolled { background:rgba(255,255,255,.92); backdrop-filter:blur(16px); box-shadow:0 2px 20px rgba(0,0,0,.08); }
        .lp-root .nav-inner { max-width:1140px; margin:0 auto; height:68px; display:flex; align-items:center; justify-content:space-between; }
        .lp-root .nav-logo { display:flex; align-items:center; gap:10px; font-size:20px; font-weight:900; color:var(--white); text-decoration:none; letter-spacing:-.5px; transition:color .3s; }
        .lp-root #lp-navbar.scrolled .nav-logo { color:var(--slate-900); }
        .lp-root .nav-logo-badge { width:40px; height:40px; border-radius:10px; background:var(--grad-hero); display:flex; align-items:center; justify-content:center; overflow:hidden; flex-shrink:0; box-shadow:0 4px 12px rgba(0,127,255,.4); }
        .lp-root .nav-logo-badge img { width:100%; height:100%; object-fit:contain; }
        .lp-root .nav-links { display:flex; align-items:center; gap:32px; list-style:none; }
        .lp-root .nav-links a { font-weight:700; font-size:14px; color:rgba(255,255,255,.85); text-decoration:none; transition:color .2s; }
        .lp-root .nav-links a:hover { color:var(--white); }
        .lp-root #lp-navbar.scrolled .nav-links a { color:var(--slate-500); }
        .lp-root #lp-navbar.scrolled .nav-links a:hover { color:var(--blue); }
        .lp-root .nav-cta { font-size:13px; padding:10px 20px; background:var(--white); color:var(--blue); border-radius:var(--radius-md); font-weight:800; box-shadow:0 4px 16px rgba(0,0,0,.12); transition:transform .2s,box-shadow .2s; }
        .lp-root .nav-cta:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(0,0,0,.15); }
        .lp-root #lp-navbar.scrolled .nav-cta { background:var(--grad-hero); color:var(--white); box-shadow:var(--shadow-blue); }
        .lp-root .nav-hamburger { display:none; flex-direction:column; gap:5px; cursor:pointer; padding:4px; background:none; border:none; }
        .lp-root .nav-hamburger span { width:22px; height:2px; background:var(--white); border-radius:2px; transition:background .3s; }
        .lp-root #lp-navbar.scrolled .nav-hamburger span { background:var(--slate-700); }
        .lp-root .mobile-menu { display:none; position:fixed; top:68px; left:0; right:0; background:var(--white); border-bottom:1px solid var(--slate-100); padding:20px 24px; box-shadow:0 8px 32px rgba(0,0,0,.1); flex-direction:column; gap:16px; z-index:99; }
        .lp-root .mobile-menu.open { display:flex; }
        .lp-root .mobile-menu a { font-weight:700; font-size:15px; color:var(--slate-700); text-decoration:none; padding:8px 0; border-bottom:1px solid var(--slate-100); }
        .lp-root .mobile-menu a:last-child { border-bottom:none; }

        /* HERO */
        .lp-root #hero { background:var(--grad-hero); padding:160px 24px 120px; position:relative; overflow:hidden; text-align:center; }
        .lp-root .hero-blob { position:absolute; border-radius:50%; pointer-events:none; }
        .lp-root .hero-blob-1 { top:-80px; right:-80px; width:320px; height:320px; background:rgba(255,255,255,.06); }
        .lp-root .hero-blob-2 { bottom:-100px; left:-60px; width:400px; height:400px; background:rgba(0,180,255,.12); }
        .lp-root .hero-blob-3 { top:50%; left:50%; transform:translate(-50%,-50%); width:600px; height:600px; background:radial-gradient(circle,rgba(0,80,204,.3) 0%,transparent 70%); }
        .lp-root .hero-inner { position:relative; z-index:1; max-width:760px; margin:0 auto; }
        .lp-root .hero-badge { display:inline-flex; align-items:center; gap:6px; background:rgba(255,255,255,.15); backdrop-filter:blur(8px); border:1px solid rgba(255,255,255,.25); border-radius:var(--radius-full); padding:6px 16px; margin-bottom:28px; font-size:12px; font-weight:700; color:var(--white); letter-spacing:.5px; text-transform:uppercase; animation:fadeInDown .6s ease; }
        .lp-root .hero-badge-dot { width:6px; height:6px; border-radius:50%; background:var(--yellow); animation:pulse-dot 2s infinite; }
        @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.6;transform:scale(1.4)} }
        @keyframes fadeInDown { from{opacity:0;transform:translateY(-20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .lp-root .hero-title { font-size:clamp(36px,6vw,60px); font-weight:900; color:var(--white); line-height:1.1; letter-spacing:-1.5px; margin-bottom:20px; animation:fadeInDown .7s ease .1s both; }
        .lp-root .hero-title .accent { color:var(--yellow); }
        .lp-root .hero-subtitle { font-size:clamp(15px,2vw,18px); font-weight:500; color:rgba(255,255,255,.82); line-height:1.7; margin-bottom:40px; animation:fadeInDown .7s ease .2s both; }
        .lp-root .hero-actions { display:flex; gap:14px; justify-content:center; flex-wrap:wrap; margin-bottom:48px; animation:fadeInDown .7s ease .3s both; }
        .lp-root .hero-search { max-width:540px; margin:0 auto; background:var(--white); border-radius:var(--radius-lg); box-shadow:0 16px 48px rgba(0,0,0,.18); display:flex; align-items:center; gap:12px; padding:14px 20px; animation:fadeInUp .7s ease .4s both; cursor:pointer; }
        .lp-root .hero-search-icon { color:var(--blue); font-size:18px; flex-shrink:0; }
        .lp-root .hero-search input { flex:1; border:none; outline:none; font-size:15px; font-weight:600; color:var(--slate-500); font-family:inherit; background:transparent; cursor:pointer; }
        .lp-root .hero-search-btn { background:var(--grad-hero); color:var(--white); border:none; border-radius:var(--radius-sm); padding:10px 18px; font-weight:800; font-size:13px; cursor:pointer; font-family:inherit; white-space:nowrap; box-shadow:0 4px 14px rgba(0,127,255,.4); transition:transform .2s; }
        .lp-root .hero-search-btn:hover { transform:translateY(-1px); }
        .lp-root .hero-stats { display:flex; gap:32px; justify-content:center; flex-wrap:wrap; margin-top:40px; animation:fadeInUp .7s ease .5s both; }
        .lp-root .hero-stat { text-align:center; }
        .lp-root .hero-stat-num { font-size:28px; font-weight:900; color:var(--white); letter-spacing:-1px; }
        .lp-root .hero-stat-label { font-size:11px; font-weight:600; color:rgba(255,255,255,.65); text-transform:uppercase; letter-spacing:.8px; margin-top:2px; }
        .lp-root .hero-stat-divider { width:1px; background:rgba(255,255,255,.2); align-self:stretch; }
        .lp-root .float-cards { display:flex; flex-wrap:wrap; justify-content:center; gap:12px; margin-top:40px; animation:fadeInUp .7s ease .6s both; }
        .lp-root .float-card { background:rgba(255,255,255,.15); backdrop-filter:blur(12px); border:1px solid rgba(255,255,255,.25); border-radius:var(--radius-lg); padding:12px 16px; display:flex; align-items:center; gap:10px; }
        .lp-root .float-card-icon { font-size:20px; }
        .lp-root .float-card-text { font-size:13px; font-weight:700; color:var(--white); line-height:1.4; }
        .lp-root .float-card-text small { display:block; font-weight:500; color:rgba(255,255,255,.7); font-size:11px; }
        .lp-root .float-card-badge { display:inline-block; background:rgba(255,255,255,.2); color:var(--white); font-size:10px; font-weight:700; padding:2px 8px; border-radius:var(--radius-full); margin-top:4px; }

        /* SOCIAL PROOF */
        .lp-root #social-proof { background:var(--white); border-bottom:1px solid var(--slate-100); padding:20px 24px; box-shadow:0 4px 24px rgba(0,0,0,.05); }
        .lp-root .proof-inner { max-width:1140px; margin:0 auto; display:flex; align-items:center; justify-content:center; gap:8px 28px; flex-wrap:wrap; }
        .lp-root .proof-item { display:flex; align-items:center; gap:8px; font-size:13px; font-weight:700; color:var(--slate-700); }
        .lp-root .proof-icon { font-size:16px; }
        .lp-root .proof-divider { color:var(--slate-300); font-size:18px; }

        /* SECTIONS */
        .lp-root section { padding:100px 24px; }
        .lp-root .section-tag { display:inline-block; font-size:11px; font-weight:800; letter-spacing:2px; text-transform:uppercase; color:var(--blue); background:var(--blue-pale); padding:5px 14px; border-radius:var(--radius-full); margin-bottom:16px; }
        .lp-root .section-title { font-size:clamp(28px,4vw,42px); font-weight:900; letter-spacing:-1px; color:var(--slate-900); margin-bottom:14px; }
        .lp-root .section-subtitle { font-size:16px; color:var(--slate-500); font-weight:500; line-height:1.7; max-width:560px; }
        .lp-root .section-header { text-align:center; margin-bottom:64px; }
        .lp-root .section-header .section-subtitle { margin:0 auto; }

        /* FEATURES */
        .lp-root #features { background:var(--white); }
        .lp-root .features-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(300px,1fr)); gap:24px; }
        .lp-root .feature-card { background:var(--slate-50); border-radius:var(--radius-xl); padding:36px 32px; border:1px solid var(--slate-100); transition:transform .3s,box-shadow .3s,border-color .3s; position:relative; overflow:hidden; }
        .lp-root .feature-card::before { content:''; position:absolute; inset:0; opacity:0; background:linear-gradient(135deg,var(--blue-pale) 0%,transparent 60%); transition:opacity .3s; }
        .lp-root .feature-card:hover::before { opacity:1; }
        .lp-root .feature-card:hover { transform:translateY(-6px); box-shadow:0 20px 48px rgba(0,127,255,.1); border-color:#bfdbfe; }
        .lp-root .feature-icon-wrap { width:64px; height:64px; border-radius:18px; display:flex; align-items:center; justify-content:center; font-size:28px; margin-bottom:24px; position:relative; z-index:1; }
        .lp-root .feature-icon-wrap.blue { background:linear-gradient(135deg,#dbeafe,#bfdbfe); }
        .lp-root .feature-icon-wrap.purple { background:linear-gradient(135deg,#ede9fe,#ddd6fe); }
        .lp-root .feature-icon-wrap.green { background:linear-gradient(135deg,#dcfce7,#bbf7d0); }
        .lp-root .feature-title { font-size:20px; font-weight:800; color:var(--slate-900); margin-bottom:10px; position:relative; z-index:1; }
        .lp-root .feature-desc { font-size:14px; color:var(--slate-500); line-height:1.75; position:relative; z-index:1; }

        /* HOW IT WORKS */
        .lp-root #how-it-works { background:var(--slate-50); }
        .lp-root .steps-container { position:relative; display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:32px; }
        .lp-root .step-card { text-align:center; position:relative; }
        .lp-root .step-num-wrap { position:relative; display:inline-block; margin-bottom:28px; }
        .lp-root .step-num { width:72px; height:72px; border-radius:50%; background:var(--grad-hero); color:var(--white); display:flex; align-items:center; justify-content:center; font-size:26px; font-weight:900; margin:0 auto; box-shadow:0 8px 24px rgba(0,127,255,.38); position:relative; z-index:1; }
        .lp-root .step-ring { position:absolute; top:-6px; left:50%; transform:translateX(-50%); width:84px; height:84px; border-radius:50%; border:2px dashed rgba(0,127,255,.25); animation:lp-spin 12s linear infinite; }
        @keyframes lp-spin { to { transform:translateX(-50%) rotate(360deg); } }
        .lp-root .step-connector { display:none; position:absolute; top:36px; left:calc(50% + 36px); width:calc(100% - 72px); height:2px; background:linear-gradient(90deg,#bfdbfe,transparent); }
        @media(min-width:768px) { .lp-root .step-connector { display:block; } }
        .lp-root .step-title { font-size:19px; font-weight:800; color:var(--slate-900); margin-bottom:10px; }
        .lp-root .step-desc { font-size:14px; color:var(--slate-500); line-height:1.75; max-width:260px; margin:0 auto; }

        /* PRICING */
        .lp-root #harga { background:var(--white); }
        .lp-root .pricing-wrapper { display:flex; justify-content:center; }
        .lp-root .pricing-card { background:var(--white); border-radius:var(--radius-xl); border:2px solid var(--blue); max-width:480px; width:100%; box-shadow:0 24px 64px rgba(0,127,255,.14); overflow:hidden; position:relative; }
        .lp-root .pricing-badge { position:absolute; top:20px; right:20px; background:var(--yellow); color:#92400e; font-size:11px; font-weight:800; padding:5px 12px; border-radius:var(--radius-full); z-index:2; }
        .lp-root .pricing-header { background:var(--grad-hero); padding:36px 40px; text-align:center; position:relative; overflow:hidden; }
        .lp-root .pricing-header::after { content:''; position:absolute; bottom:-1px; left:0; right:0; height:40px; background:var(--white); border-radius:40px 40px 0 0; }
        .lp-root .pricing-crown { width:72px; height:72px; border-radius:50%; background:linear-gradient(135deg,var(--yellow),var(--yellow-dark)); display:flex; align-items:center; justify-content:center; margin:0 auto 16px; font-size:32px; box-shadow:0 8px 24px rgba(245,158,11,.4); }
        .lp-root .pricing-plan { font-size:14px; font-weight:700; color:rgba(255,255,255,.75); letter-spacing:1px; text-transform:uppercase; margin-bottom:12px; }
        .lp-root .pricing-price { font-size:40px; font-weight:900; color:var(--white); letter-spacing:-1.5px; }
        .lp-root .pricing-price span { font-size:16px; font-weight:600; opacity:.8; }
        .lp-root .pricing-body { padding:40px 36px 32px; }
        .lp-root .pricing-benefits { list-style:none; display:flex; flex-direction:column; gap:14px; margin-bottom:28px; }
        .lp-root .pricing-benefit { display:flex; align-items:center; gap:10px; font-size:15px; color:var(--slate-700); font-weight:600; }
        .lp-root .benefit-check { font-size:16px; flex-shrink:0; }
        .lp-root .pricing-btn { width:100%; padding:18px; background:var(--grad-hero); color:var(--white); border:none; border-radius:var(--radius-md); font-size:16px; font-weight:800; cursor:pointer; font-family:inherit; box-shadow:var(--shadow-blue); transition:transform .2s,box-shadow .2s; }
        .lp-root .pricing-btn:hover { transform:translateY(-2px); box-shadow:0 12px 36px rgba(0,127,255,.45); }
        .lp-root .pricing-note { text-align:center; margin-top:16px; font-size:12px; color:var(--slate-500); }

        /* FAQ */
        .lp-root #faq { background:var(--slate-50); }
        .lp-root .faq-list { max-width:680px; margin:0 auto; display:flex; flex-direction:column; gap:12px; }
        .lp-root .faq-item { background:var(--white); border-radius:var(--radius-lg); border:1px solid var(--slate-100); overflow:hidden; box-shadow:var(--shadow-card); transition:box-shadow .3s; }
        .lp-root .faq-item:hover { box-shadow:0 8px 28px rgba(0,127,255,.08); }
        .lp-root .faq-question { width:100%; display:flex; align-items:center; justify-content:space-between; padding:20px 24px; background:none; border:none; cursor:pointer; font-family:inherit; font-size:15px; font-weight:700; color:var(--slate-900); text-align:left; gap:16px; }
        .lp-root .faq-icon { width:28px; height:28px; border-radius:50%; background:var(--blue-pale); color:var(--blue); display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0; transition:transform .3s,background .3s; font-weight:400; }
        .lp-root .faq-item.open .faq-icon { transform:rotate(45deg); background:var(--blue); color:var(--white); }
        .lp-root .faq-answer { max-height:0; overflow:hidden; transition:max-height .35s ease; padding:0 24px; font-size:14px; color:var(--slate-500); line-height:1.75; }
        .lp-root .faq-item.open .faq-answer { max-height:200px; padding:0 24px 20px; }

        /* CTA BANNER */
        .lp-root #cta-banner { background:var(--grad-hero); padding:100px 24px; text-align:center; position:relative; overflow:hidden; }
        .lp-root .cta-blob-1 { position:absolute; top:-80px; left:-80px; width:300px; height:300px; border-radius:50%; background:rgba(255,255,255,.06); pointer-events:none; }
        .lp-root .cta-blob-2 { position:absolute; bottom:-60px; right:-60px; width:240px; height:240px; border-radius:50%; background:rgba(0,180,255,.1); pointer-events:none; }
        .lp-root .cta-inner { position:relative; z-index:1; max-width:640px; margin:0 auto; }
        .lp-root .cta-emoji { font-size:48px; display:block; margin-bottom:20px; }
        .lp-root .cta-title { font-size:clamp(26px,4vw,40px); font-weight:900; color:var(--white); letter-spacing:-1px; margin-bottom:16px; line-height:1.15; }
        .lp-root .cta-subtitle { font-size:16px; color:rgba(255,255,255,.8); font-weight:500; line-height:1.7; margin-bottom:36px; }
        .lp-root .cta-actions { display:flex; gap:14px; justify-content:center; flex-wrap:wrap; }
        .lp-root .cta-guarantee { margin-top:24px; font-size:12px; color:rgba(255,255,255,.6); font-weight:600; }

        /* FOOTER */
        .lp-root footer { background:var(--slate-900); color:rgba(255,255,255,.65); padding:56px 24px 32px; }
        .lp-root .footer-inner { max-width:1140px; margin:0 auto; }
        .lp-root .footer-top { display:flex; align-items:flex-start; justify-content:space-between; flex-wrap:wrap; gap:32px; margin-bottom:48px; }
        .lp-root .footer-brand { max-width:300px; }
        .lp-root .footer-logo { display:flex; align-items:center; gap:10px; font-size:20px; font-weight:900; color:var(--white); margin-bottom:14px; text-decoration:none; letter-spacing:-.5px; }
        .lp-root .footer-logo-badge { width:40px; height:40px; border-radius:10px; background:var(--grad-hero); display:flex; align-items:center; justify-content:center; overflow:hidden; flex-shrink:0; }
        .lp-root .footer-logo-badge img { width:100%; height:100%; object-fit:contain; }
        .lp-root .footer-desc { font-size:13px; line-height:1.75; }
        .lp-root .footer-links-title { font-size:12px; font-weight:800; color:var(--white); letter-spacing:1.5px; text-transform:uppercase; margin-bottom:16px; }
        .lp-root .footer-links { list-style:none; display:flex; flex-direction:column; gap:10px; }
        .lp-root .footer-links a { font-size:13px; color:rgba(255,255,255,.55); text-decoration:none; transition:color .2s; }
        .lp-root .footer-links a:hover { color:var(--white); }
        .lp-root .footer-divider { height:1px; background:rgba(255,255,255,.08); margin-bottom:28px; }
        .lp-root .footer-bottom { display:flex; align-items:center; justify-content:center; }
        .lp-root .footer-copy { font-size:12px; }

        /* REVEAL ANIMATION */
        .lp-root .reveal { opacity:0; transform:translateY(24px); transition:opacity .6s ease,transform .6s ease; }
        .lp-root .reveal.visible { opacity:1; transform:none; }
        .lp-root .reveal-delay-1 { transition-delay:.1s; }
        .lp-root .reveal-delay-2 { transition-delay:.2s; }
        .lp-root .reveal-delay-3 { transition-delay:.3s; }

        /* RESPONSIVE */
        @media(max-width:768px) {
          .lp-root .nav-links, .lp-root .nav-cta-wrap { display:none; }
          .lp-root .nav-hamburger { display:flex; }
          .lp-root #hero { padding:120px 24px 80px; }
          .lp-root .hero-stats { gap:20px; }
          .lp-root .hero-stat-divider { display:none; }
          .lp-root .float-cards { display:none; }
          .lp-root .footer-top { flex-direction:column; }
          .lp-root .pricing-body { padding:32px 24px 24px; }
        }
      `}</style>

      <div className="lp-root">
        {/* NAVBAR */}
        <nav id="lp-navbar" className={scrolled ? 'scrolled' : ''}>
          <div className="nav-inner">
            <a href="#" className="nav-logo" onClick={(e) => e.preventDefault()}>
              <div className="nav-logo-badge"><img src={logoImg} alt="CPNSkarier" /></div>
              CPNSkarier
            </a>
            <ul className="nav-links">
              <li><a href="#features">Fitur</a></li>
              <li><a href="#harga">Harga</a></li>
              <li><a href="#faq">FAQ</a></li>
            </ul>
            <div className="nav-cta-wrap">
              <button className="btn nav-cta" onClick={onLogin}>Mulai Sekarang</button>
            </div>
            <button className="nav-hamburger" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
              <span /><span /><span />
            </button>
          </div>
        </nav>

        {/* MOBILE MENU */}
        <div className={`mobile-menu${mobileOpen ? ' open' : ''}`}>
          <a href="#features" onClick={() => setMobileOpen(false)}>Fitur</a>
          <a href="#harga" onClick={() => setMobileOpen(false)}>Harga</a>
          <a href="#faq" onClick={() => setMobileOpen(false)}>FAQ</a>
          <button onClick={() => { setMobileOpen(false); onLogin(); }} style={{ color: 'var(--blue)', border: 'none', background: 'var(--blue-pale)', padding: '12px 16px', borderRadius: '10px', textAlign: 'center', fontFamily: 'inherit', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
            Mulai Sekarang →
          </button>
        </div>

        {/* HERO */}
        <section id="hero">
          <div className="hero-blob hero-blob-1" />
          <div className="hero-blob hero-blob-2" />
          <div className="hero-blob hero-blob-3" />
          <div className="hero-inner">
            <div className="hero-badge"><div className="hero-badge-dot" /> CPNS 2024 — Data Formasi Resmi</div>
            <h1 className="hero-title">Temukan Formasi CPNS<br />yang Cocok untuk <span className="accent">Jurusanmu</span></h1>
            <p className="hero-subtitle">Cari dari ribuan formasi instansi pusat &amp; daerah berdasarkan jurusan kuliah kamu — cepat, akurat, dan langsung ke dokumen resminya.</p>
            <div className="hero-actions">
              <button className="btn btn-white" id="hero-cta-primary" onClick={onLogin}>🚀 Cek Formasi Sekarang</button>
              <a href="#how-it-works" className="btn btn-ghost" id="hero-cta-secondary">Lihat Cara Kerja →</a>
            </div>
            <div className="hero-search" onClick={onLogin} title="Klik untuk mulai pencarian">
              <span className="hero-search-icon">🔍</span>
              <input type="text" placeholder={placeholder} readOnly />
              <button className="hero-search-btn" onClick={(e) => { e.stopPropagation(); onLogin(); }}>Cari Formasi</button>
            </div>
            <div className="hero-stats">
              <div className="hero-stat"><div className="hero-stat-num">5.000+</div><div className="hero-stat-label">Formasi</div></div>
              <div className="hero-stat-divider" />
              <div className="hero-stat"><div className="hero-stat-num">300+</div><div className="hero-stat-label">Instansi</div></div>
              <div className="hero-stat-divider" />
              <div className="hero-stat"><div className="hero-stat-num">34</div><div className="hero-stat-label">Provinsi</div></div>
              <div className="hero-stat-divider" />
              <div className="hero-stat"><div className="hero-stat-num">Rp39rb</div><div className="hero-stat-label">Lifetime</div></div>
            </div>
            <div className="float-cards">
              {[['🏦','Kementerian Keuangan','S-1 Akuntansi'],['⚖️','Mahkamah Agung','S-1 Ilmu Hukum'],['💻','BSSN','S-1 Teknik Informatika'],['🏥','Kemenkes RI','S-1 Kesehatan Masyarakat']].map(([icon, name, major]) => (
                <div className="float-card" key={name}>
                  <span className="float-card-icon">{icon}</span>
                  <div className="float-card-text">{name}<small>{major}</small><span className="float-card-badge">✓ Ada Formasi</span></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SOCIAL PROOF */}
        <div id="social-proof">
          <div className="proof-inner">
            <div className="proof-item"><span className="proof-icon">📊</span><span>Data dari <strong>5.000+ formasi</strong></span></div>
            <span className="proof-divider">·</span>
            <div className="proof-item"><span className="proof-icon">🏛️</span><span>Instansi Pusat &amp; Daerah</span></div>
            <span className="proof-divider">·</span>
            <div className="proof-item"><span className="proof-icon">✅</span><span>CPNS 2024 Resmi</span></div>
            <span className="proof-divider">·</span>
            <div className="proof-item"><span className="proof-icon">🔒</span><span>Pembayaran Aman via Midtrans</span></div>
          </div>
        </div>

        {/* FEATURES */}
        <section id="features">
          <div className="container">
            <div className="section-header">
              <div className="section-tag reveal">Fitur Unggulan</div>
              <h2 className="section-title reveal reveal-delay-1">Semua yang Kamu Butuhkan<br />untuk Daftar CPNS</h2>
              <p className="section-subtitle reveal reveal-delay-2">Dirancang khusus untuk membantu lulusan Indonesia menemukan formasi yang tepat sesuai jurusan dengan cepat dan mudah.</p>
            </div>
            <div className="features-grid">
              {[
                ['blue','🔍','Pencarian Cerdas','Cari formasi berdasarkan jurusan, instansi, atau jenjang pendidikan dalam hitungan detik. Didukung fuzzy search agar tetap menemukan hasil walau ada typo.'],
                ['purple','📄','Akses Dokumen Resmi','Buka langsung file PDF pengumuman formasi dari setiap instansi yang membuka lowongan. Tidak perlu cari manual di website masing-masing instansi.'],
                ['green','🎯','Filter Pintar','Filter berdasarkan kategori instansi (Pusat/Daerah), jenjang pendidikan (S1, S2, D3, dll), dan nama instansi spesifik untuk hasil yang lebih terarah.'],
              ].map(([color, icon, title, desc], i) => (
                <div className={`feature-card reveal${i > 0 ? ` reveal-delay-${i}` : ''}`} key={title}>
                  <div className={`feature-icon-wrap ${color}`}>{icon}</div>
                  <h3 className="feature-title">{title}</h3>
                  <p className="feature-desc">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works">
          <div className="container">
            <div className="section-header">
              <div className="section-tag reveal">Cara Kerja</div>
              <h2 className="section-title reveal reveal-delay-1">Cara Kerja<br />CPNSkarier</h2>
              <p className="section-subtitle reveal reveal-delay-2">Tiga langkah mudah untuk menemukan semua formasi CPNS yang relevan dengan latar belakang pendidikanmu.</p>
            </div>
            <div className="steps-container">
              {[
                ['Daftar & Login','Buat akun gratis dalam 30 detik. Cukup email dan password — tidak butuh data tambahan.'],
                ['Cari Formasi','Ketik jurusan kamu dan lihat semua instansi yang membuka formasi untukmu — filter sesuai kebutuhan.'],
                ['Buka Dokumen','Klik kartu formasi dan langsung buka dokumen PDF resmi instansi tersebut. Cek persyaratan dan langsung daftar!'],
              ].map(([title, desc], i) => (
                <div className={`step-card reveal${i > 0 ? ` reveal-delay-${i}` : ''}`} key={title}>
                  <div className="step-num-wrap">
                    <div className="step-ring" style={i === 1 ? { animationDirection: 'reverse' } : {}} />
                    <div className="step-num">{i + 1}</div>
                  </div>
                  {i < 2 && <div className="step-connector" />}
                  <h3 className="step-title">{title}</h3>
                  <p className="step-desc">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section id="harga">
          <div className="container">
            <div className="section-header">
              <div className="section-tag reveal">Harga</div>
              <h2 className="section-title reveal reveal-delay-1">Satu Harga,<br />Akses Seumur Hidup</h2>
              <p className="section-subtitle reveal reveal-delay-2">Investasi terkecil untuk persiapan karier terbaik. Tidak ada biaya bulanan, tidak ada kejutan.</p>
            </div>
            <div className="pricing-wrapper reveal">
              <div className="pricing-card">
                <div className="pricing-badge">🔥 Terpopuler</div>
                <div className="pricing-header">
                  <div className="pricing-crown">👑</div>
                  <div className="pricing-plan">Premium</div>
                  <div className="pricing-price">Rp 39.000 <span>/ seumur hidup</span></div>
                </div>
                <div className="pricing-body">
                  <ul className="pricing-benefits">
                    {['Akses penuh ke semua formasi CPNS 2024','Download dokumen PDF tanpa batasan','Filter by instansi, kategori, dan jurusan','Data diperbarui secara berkala','Akses seumur hidup (tidak perlu langganan)'].map((b) => (
                      <li className="pricing-benefit" key={b}><span className="benefit-check">✅</span>{b}</li>
                    ))}
                  </ul>
                  <button className="pricing-btn" id="pricing-cta-btn" onClick={onLogin}>💳 Beli Sekarang — Rp 39.000</button>
                  <p className="pricing-note">Sekali bayar · Tidak ada biaya tersembunyi · Akses langsung setelah pembayaran</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq">
          <div className="container">
            <div className="section-header">
              <div className="section-tag reveal">FAQ</div>
              <h2 className="section-title reveal reveal-delay-1">Pertanyaan yang<br />Sering Ditanyakan</h2>
            </div>
            <div className="faq-list">
              {[
                ['faq1','Apakah data formasi yang tersedia resmi?','Ya, semua data bersumber dari dokumen PDF resmi CPNS 2024 yang diterbitkan oleh masing-masing instansi pemerintah. Kami mengompilasi data ini agar mudah kamu akses dalam satu platform.'],
                ['faq2','Apakah akses berlaku seumur hidup?','Ya, cukup bayar sekali dan akses tidak akan kedaluwarsa. Tidak ada biaya langganan bulanan atau tahunan. Bayar satu kali, nikmati selamanya.'],
                ['faq3','Metode pembayaran apa yang tersedia?','Pembayaran menggunakan Midtrans — mendukung transfer bank (BCA, BNI, BRI, Mandiri), QRIS, e-wallet (GoPay, OVO, Dana, ShopeePay), dan kartu kredit/debit.'],
                ['faq4','Apakah ada versi gratis?','Kamu bisa mendaftar gratis dan melihat halaman aplikasi, namun hasil pencarian formasi CPNS memerlukan akses Premium. Dengan hanya Rp 39.000, kamu sudah bisa mengakses seluruh database formasi secara penuh.'],
              ].map(([id, q, a]) => (
                <div className={`faq-item reveal${openFaq === id ? ' open' : ''}`} key={id}>
                  <button className="faq-question" onClick={() => toggleFaq(id)}>
                    <span className="faq-q-text">{q}</span>
                    <span className="faq-icon">+</span>
                  </button>
                  <div className="faq-answer">{a}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA BANNER */}
        <section id="cta-banner">
          <div className="cta-blob-1" /><div className="cta-blob-2" />
          <div className="cta-inner">
            <span className="cta-emoji">🎯</span>
            <h2 className="cta-title">Jangan sampai ketinggalan formasi CPNS yang cocok untukmu</h2>
            <p className="cta-subtitle">Ribuan formasi sudah menunggumu. Mulai pencarian sekarang dan temukan instansi yang membuka lowongan untuk jurusanmu.</p>
            <div className="cta-actions">
              <button className="btn btn-white" id="banner-cta-primary" onClick={onLogin}>🚀 Mulai Sekarang — Rp 39.000</button>
              <a href="#features" className="btn btn-ghost" id="banner-cta-secondary">Pelajari Fitur →</a>
            </div>
            <p className="cta-guarantee">🔒 Sekali bayar · Akses seumur hidup · Pembayaran aman via Midtrans</p>
          </div>
        </section>

        {/* FOOTER */}
        <footer>
          <div className="footer-inner">
            <div className="footer-top">
              <div className="footer-brand">
                <a href="#" className="footer-logo" onClick={(e) => e.preventDefault()}>
                  <div className="footer-logo-badge"><img src={logoImg} alt="CPNSkarier" /></div>
                  CPNSkarier
                </a>
                <p className="footer-desc">Platform pencarian formasi CPNS 2024 terlengkap. Temukan instansi yang membuka lowongan untuk jurusanmu dalam hitungan detik.</p>
              </div>
              <div>
                <div className="footer-links-title">Navigasi</div>
                <ul className="footer-links">
                  <li><a href="#features">Fitur</a></li>
                  <li><a href="#how-it-works">Cara Kerja</a></li>
                  <li><a href="#harga">Harga</a></li>
                  <li><a href="#faq">FAQ</a></li>
                </ul>
              </div>
              <div>
                <div className="footer-links-title">Legal</div>
                <ul className="footer-links">
                  <li><button onClick={onLogin} style={{background:'none',border:'none',color:'rgba(255,255,255,.55)',cursor:'pointer',fontFamily:'inherit',fontSize:13,padding:0}}>Syarat &amp; Ketentuan</button></li>
                  <li><button onClick={onLogin} style={{background:'none',border:'none',color:'rgba(255,255,255,.55)',cursor:'pointer',fontFamily:'inherit',fontSize:13,padding:0}}>Kebijakan Privasi</button></li>
                  <li><a href="mailto:cpnskarierindonesia@gmail.com">Kontak</a></li>
                </ul>
              </div>
              <div>
                <div className="footer-links-title">Hubungi Kami</div>
                <ul className="footer-links">
                  <li><a href="mailto:cpnskarierindonesia@gmail.com">cpnskarierindonesia@gmail.com</a></li>
                  <li><button onClick={onLogin} style={{background:'none',border:'none',color:'rgba(255,255,255,.55)',cursor:'pointer',fontFamily:'inherit',fontSize:13,padding:0}}>Buka Aplikasi →</button></li>
                </ul>
              </div>
            </div>
            <div className="footer-divider" />
            <div className="footer-bottom">
              <span className="footer-copy">© 2026 CPNSkarier. Semua hak dilindungi.</span>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
