import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

// ─── Menu items ───────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: "Rooms & Suites",  path: "/" },
  { label: "Dining",          path: "#" },
  { label: "Spa & Wellness",  path: "#" },
  { label: "Events",          path: "#" },
  { label: "Gallery",         path: "#" },
  { label: "About",           path: "#" },
  { label: "Contact",         path: "#contact" },
];

// ─── Hero slides ──────────────────────────────────────────────────────────────
const SLIDES = [
  {
    img: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1920&q=80",
    tagline: "The Grand Dame of South Asia",
    sub: "Timeless luxury in the heart of Sri Lanka",
  },
  {
    img: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1920&q=80",
    tagline: "Where Heritage Meets Comfort",
    sub: "Rooms and suites curated for the discerning traveller",
  },
  {
    img: "https://images.unsplash.com/photo-1540541338537-71cf3b7e5f69?auto=format&fit=crop&w=1920&q=80",
    tagline: "Dine Among the Clouds",
    sub: "Exquisite cuisine overlooking the misty mountains",
  },
  {
    img: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1920&q=80",
    tagline: "Unwind in Pure Serenity",
    sub: "Award-winning spa and wellness experiences",
  },
];

export default function LandingPage({ token }) {
  const navigate          = useNavigate();
  const [menuOpen, setMenuOpen]   = useState(false);
  const [slide,    setSlide]      = useState(0);
  const [animIn,   setAnimIn]     = useState(true);
  const [scrolled, setScrolled]   = useState(false);
  const contactRef = useRef(null);
  const timerRef   = useRef(null);

  // Auto-advance slides
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setAnimIn(false);
      setTimeout(() => {
        setSlide(s => (s + 1) % SLIDES.length);
        setAnimIn(true);
      }, 600);
    }, 6000);
    return () => clearInterval(timerRef.current);
  }, []);

  // Navbar shrink on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menu on ESC
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const goToSlide = (i) => {
    setAnimIn(false);
    setTimeout(() => { setSlide(i); setAnimIn(true); }, 400);
    clearInterval(timerRef.current);
  };

  const scrollToContact = () => {
    setMenuOpen(false);
    contactRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Montserrat:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }

        /* ── LANDING ROOT ── */
        .lp-root { font-family: 'Montserrat', sans-serif; background: #0a0a0a; color: #fff; }

        /* ── NAVBAR ── */
        .lp-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 200;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 40px; height: 80px;
          transition: background 0.4s, height 0.4s, backdrop-filter 0.4s;
        }
        .lp-nav.scrolled {
          background: rgba(10,10,10,0.92);
          backdrop-filter: blur(12px);
          height: 64px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }

        /* Left: Reserve Now */
        .nav-reserve-btn {
          padding: 10px 24px;
          background: #b8952a;
          color: #fff;
          border: none; border-radius: 0;
          font-family: 'Montserrat', sans-serif;
          font-size: 11px; font-weight: 600;
          letter-spacing: 0.18em; text-transform: uppercase;
          cursor: pointer; transition: background 0.2s;
          text-decoration: none; display: flex; align-items: center;
        }
        .nav-reserve-btn:hover { background: #a07d20; }

        /* Center: Logo */
        .nav-logo {
          position: absolute; left: 50%; transform: translateX(-50%);
          display: flex; flex-direction: column; align-items: center; gap: 2px;
          text-decoration: none; cursor: pointer;
        }
        .nav-logo-icon {
          width: 48px; height: 48px;
          background: rgba(184,149,42,0.15);
          border: 1.5px solid rgba(184,149,42,0.5);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 22px;
          transition: transform 0.3s;
        }
        .nav-logo:hover .nav-logo-icon { transform: scale(1.08); }
        .nav-logo-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 13px; font-weight: 600;
          letter-spacing: 0.3em; text-transform: uppercase;
          color: #fff;
        }
        .nav-logo-est {
          font-size: 9px; letter-spacing: 0.25em;
          color: rgba(255,255,255,0.45); text-transform: uppercase;
        }

        /* Right: auth + menu */
        .nav-right { display: flex; align-items: center; gap: 16px; }
        .nav-auth-link {
          font-size: 11px; font-weight: 500; letter-spacing: 0.14em;
          text-transform: uppercase; color: rgba(255,255,255,0.8);
          text-decoration: none; transition: color 0.2s;
        }
        .nav-auth-link:hover { color: #b8952a; }
        .nav-auth-sep { color: rgba(255,255,255,0.25); font-size: 12px; }
        .nav-menu-btn {
          display: flex; align-items: center; gap: 10px;
          background: none; border: 1.5px solid rgba(255,255,255,0.3);
          color: #fff; padding: 8px 16px; cursor: pointer;
          font-family: 'Montserrat', sans-serif;
          font-size: 11px; font-weight: 500; letter-spacing: 0.2em;
          text-transform: uppercase; transition: all 0.2s;
        }
        .nav-menu-btn:hover { border-color: rgba(255,255,255,0.7); }
        .hamburger { display: flex; flex-direction: column; gap: 4px; width: 18px; }
        .hamburger span { height: 1.5px; background: #fff; border-radius: 2px; display: block; transition: all 0.3s; }
        .hamburger.open span:nth-child(1) { transform: rotate(45deg) translate(4px, 4px); }
        .hamburger.open span:nth-child(2) { opacity: 0; }
        .hamburger.open span:nth-child(3) { transform: rotate(-45deg) translate(4px, -4px); }

        /* ── SLIDE MENU OVERLAY ── */
        .slide-menu-overlay {
          position: fixed; inset: 0; z-index: 300;
          background: rgba(0,0,0,0.6);
          opacity: 0; pointer-events: none;
          transition: opacity 0.4s;
        }
        .slide-menu-overlay.open { opacity: 1; pointer-events: all; }

        .slide-menu {
          position: fixed; top: 0; right: 0; bottom: 0;
          width: min(420px, 90vw); z-index: 310;
          background: #0d0d0d;
          border-left: 1px solid rgba(184,149,42,0.2);
          transform: translateX(100%);
          transition: transform 0.5s cubic-bezier(0.77, 0, 0.175, 1);
          display: flex; flex-direction: column;
          padding: 0;
          overflow-y: auto;
        }
        .slide-menu.open { transform: translateX(0); }

        /* Menu header */
        .slide-menu-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 28px 36px; border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .slide-menu-logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 20px; font-weight: 600; letter-spacing: 0.2em;
          color: #b8952a; text-transform: uppercase;
        }
        .slide-menu-close {
          background: none; border: none; color: rgba(255,255,255,0.5);
          font-size: 24px; cursor: pointer; line-height: 1;
          transition: color 0.2s;
        }
        .slide-menu-close:hover { color: #fff; }

        /* Menu links */
        .slide-menu-links { padding: 36px; flex: 1; }
        .slide-menu-link {
          display: block;
          font-family: 'Cormorant Garamond', serif;
          font-size: 32px; font-weight: 300; font-style: italic;
          color: rgba(255,255,255,0.85);
          text-decoration: none; line-height: 1;
          padding: 14px 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          letter-spacing: 0.02em;
          transition: color 0.2s, padding-left 0.25s;
          cursor: pointer;
        }
        .slide-menu-link:hover { color: #b8952a; padding-left: 12px; }
        .slide-menu-link:last-child { border-bottom: none; }

        /* Menu auth buttons */
        .slide-menu-auth {
          padding: 28px 36px;
          border-top: 1px solid rgba(255,255,255,0.06);
          display: flex; gap: 12px;
        }
        .slide-menu-auth a {
          flex: 1; text-align: center;
          padding: 12px; font-size: 11px; font-weight: 600;
          letter-spacing: 0.15em; text-transform: uppercase;
          text-decoration: none; transition: all 0.2s;
        }
        .slide-menu-auth .btn-login {
          border: 1.5px solid rgba(255,255,255,0.25); color: rgba(255,255,255,0.8);
        }
        .slide-menu-auth .btn-login:hover { border-color: #fff; color: #fff; }
        .slide-menu-auth .btn-register { background: #b8952a; color: #fff; }
        .slide-menu-auth .btn-register:hover { background: #a07d20; }

        /* Menu contact info */
        .slide-menu-contact {
          padding: 24px 36px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .smc-label { font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; color: #b8952a; margin-bottom: 10px; }
        .smc-item { font-size: 12.5px; color: rgba(255,255,255,0.5); margin-bottom: 6px; }

        /* ── HERO ── */
        .lp-hero {
          position: relative; height: 100vh; min-height: 600px;
          overflow: hidden;
        }

        .hero-img {
          position: absolute; inset: 0;
          background-size: cover; background-position: center;
          transition: opacity 0.6s ease, transform 8s ease;
        }
        .hero-img.in  { opacity: 1; transform: scale(1.04); }
        .hero-img.out { opacity: 0; transform: scale(1); }

        /* Dark overlay */
        .hero-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(0,0,0,0.25) 0%,
            rgba(0,0,0,0.1)  40%,
            rgba(0,0,0,0.55) 85%,
            rgba(0,0,0,0.85) 100%
          );
        }

        /* Hero content */
        .hero-content {
          position: absolute; bottom: 100px; left: 60px; right: 60px;
          z-index: 2;
        }
        .hero-tagline {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(40px, 6vw, 76px);
          font-weight: 300; font-style: italic;
          line-height: 1.1; color: #fff;
          text-shadow: 0 2px 20px rgba(0,0,0,0.3);
          opacity: 0; transform: translateY(20px);
          transition: opacity 0.7s 0.1s, transform 0.7s 0.1s;
        }
        .hero-tagline.in { opacity: 1; transform: translateY(0); }

        .hero-sub {
          font-size: 13px; font-weight: 300; letter-spacing: 0.15em;
          text-transform: uppercase; color: rgba(255,255,255,0.65);
          margin-top: 14px;
          opacity: 0; transform: translateY(14px);
          transition: opacity 0.7s 0.25s, transform 0.7s 0.25s;
        }
        .hero-sub.in { opacity: 1; transform: translateY(0); }

        .hero-cta-row {
          display: flex; align-items: center; gap: 20px; margin-top: 32px;
          opacity: 0; transform: translateY(14px);
          transition: opacity 0.7s 0.4s, transform 0.7s 0.4s;
        }
        .hero-cta-row.in { opacity: 1; transform: translateY(0); }

        .hero-btn-primary {
          padding: 14px 36px; background: #b8952a; color: #fff;
          border: none; font-family: 'Montserrat', sans-serif;
          font-size: 11px; font-weight: 600; letter-spacing: 0.2em;
          text-transform: uppercase; cursor: pointer;
          text-decoration: none; transition: background 0.2s;
          display: inline-block;
        }
        .hero-btn-primary:hover { background: #a07d20; }

        .hero-btn-ghost {
          padding: 14px 36px; background: transparent;
          border: 1.5px solid rgba(255,255,255,0.45); color: #fff;
          font-family: 'Montserrat', sans-serif;
          font-size: 11px; font-weight: 500; letter-spacing: 0.2em;
          text-transform: uppercase; cursor: pointer;
          text-decoration: none; transition: border-color 0.2s;
          display: inline-block;
        }
        .hero-btn-ghost:hover { border-color: rgba(255,255,255,0.9); }

        /* Slide dots */
        .hero-dots {
          position: absolute; bottom: 40px; left: 60px;
          display: flex; gap: 10px; z-index: 2;
        }
        .hero-dot {
          width: 28px; height: 2px; background: rgba(255,255,255,0.3);
          cursor: pointer; transition: background 0.3s, width 0.3s;
          border: none;
        }
        .hero-dot.active { background: #b8952a; width: 44px; }

        /* Scroll indicator */
        .scroll-indicator {
          position: absolute; bottom: 36px; right: 60px;
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          z-index: 2; opacity: 0.55;
        }
        .scroll-indicator span {
          font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase;
          writing-mode: vertical-rl; color: #fff;
        }
        .scroll-line {
          width: 1px; height: 50px; background: #fff;
          animation: scrollPulse 2s ease-in-out infinite;
        }
        @keyframes scrollPulse {
          0%,100% { transform: scaleY(1); opacity: 0.55; }
          50%      { transform: scaleY(0.4); opacity: 0.2; }
        }

        /* ── INTRO SECTION ── */
        .lp-intro {
          background: #0d0d0d;
          padding: 100px 60px;
          display: flex; gap: 80px; align-items: center;
          max-width: 1200px; margin: 0 auto;
        }
        .intro-text { flex: 1; }
        .intro-label {
          font-size: 10px; letter-spacing: 0.3em; text-transform: uppercase;
          color: #b8952a; margin-bottom: 20px;
        }
        .intro-heading {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(32px, 4vw, 52px); font-weight: 300;
          line-height: 1.2; color: #fff; margin-bottom: 24px;
        }
        .intro-heading em { font-style: italic; color: #b8952a; }
        .intro-body {
          font-size: 13.5px; font-weight: 300; line-height: 1.9;
          color: rgba(255,255,255,0.55); max-width: 480px;
        }
        .intro-divider {
          width: 1px; height: 200px;
          background: linear-gradient(to bottom, transparent, rgba(184,149,42,0.4), transparent);
          flex-shrink: 0;
        }
        .intro-stats { display: flex; flex-direction: column; gap: 36px; }
        .stat-num {
          font-family: 'Cormorant Garamond', serif;
          font-size: 52px; font-weight: 300; color: #b8952a; line-height: 1;
        }
        .stat-label {
          font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase;
          color: rgba(255,255,255,0.4); margin-top: 4px;
        }

        /* ── ROOMS TEASER ── */
        .lp-rooms {
          background: #080808;
          padding: 80px 60px;
          text-align: center;
        }
        .section-label {
          font-size: 10px; letter-spacing: 0.3em; text-transform: uppercase;
          color: #b8952a; margin-bottom: 16px;
        }
        .section-heading {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(28px, 4vw, 48px); font-weight: 300; font-style: italic;
          color: #fff; margin-bottom: 48px;
        }
        .rooms-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px;
          max-width: 1100px; margin: 0 auto 40px;
        }
        .room-tile {
          position: relative; height: 360px; overflow: hidden; cursor: pointer;
        }
        .room-tile img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform 0.6s ease;
        }
        .room-tile:hover img { transform: scale(1.07); }
        .room-tile-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%);
          display: flex; flex-direction: column; justify-content: flex-end;
          padding: 24px;
        }
        .room-tile-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px; font-weight: 300; font-style: italic; color: #fff;
        }
        .room-tile-price {
          font-size: 11px; letter-spacing: 0.1em; color: #b8952a; margin-top: 4px;
        }
        .lp-rooms-btn {
          display: inline-block; padding: 14px 44px;
          border: 1.5px solid rgba(184,149,42,0.6); color: #b8952a;
          font-family: 'Montserrat', sans-serif;
          font-size: 11px; font-weight: 500; letter-spacing: 0.2em;
          text-transform: uppercase; text-decoration: none;
          transition: all 0.2s;
        }
        .lp-rooms-btn:hover { background: #b8952a; color: #fff; border-color: #b8952a; }

        /* ── CONTACT / FOOTER ── */
        .lp-contact {
          background: #050505;
          border-top: 1px solid rgba(184,149,42,0.15);
          padding: 80px 60px 50px;
        }
        .contact-inner { max-width: 1100px; margin: 0 auto; }
        .contact-grid {
          display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 60px;
          margin-bottom: 60px;
        }

        .contact-logo-col .logo-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px; font-weight: 300; letter-spacing: 0.2em;
          color: #fff; text-transform: uppercase; margin-bottom: 6px;
        }
        .contact-logo-col .logo-tagline {
          font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase;
          color: #b8952a; margin-bottom: 20px;
        }
        .contact-logo-col p {
          font-size: 13px; font-weight: 300; line-height: 1.8;
          color: rgba(255,255,255,0.4); max-width: 280px;
        }

        .contact-col-title {
          font-size: 10px; letter-spacing: 0.25em; text-transform: uppercase;
          color: #b8952a; margin-bottom: 18px;
        }

        /* Contact items */
        .contact-item {
          display: flex; align-items: flex-start; gap: 12px;
          margin-bottom: 18px;
        }
        .contact-item-icon {
          width: 32px; height: 32px; border-radius: 50%;
          background: rgba(184,149,42,0.1);
          border: 1px solid rgba(184,149,42,0.25);
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; flex-shrink: 0;
        }
        .contact-item-body {}
        .contact-item-label {
          font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase;
          color: rgba(255,255,255,0.3); margin-bottom: 3px;
        }
        .contact-item-val {
          font-size: 13.5px; font-weight: 400; color: rgba(255,255,255,0.75);
          text-decoration: none; transition: color 0.2s;
        }
        a.contact-item-val:hover { color: #b8952a; }

        /* Quick links */
        .quick-link {
          display: block; font-size: 13px; font-weight: 300;
          color: rgba(255,255,255,0.45); text-decoration: none;
          margin-bottom: 10px; transition: color 0.2s;
          letter-spacing: 0.04em;
        }
        .quick-link:hover { color: #b8952a; }

        /* Social */
        .social-row { display: flex; gap: 12px; }
        .social-btn {
          width: 38px; height: 38px; border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.15);
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
          text-decoration: none;
        }
        .social-btn:hover { border-color: #b8952a; background: rgba(184,149,42,0.1); }

        /* Footer bottom */
        .contact-bottom {
          border-top: 1px solid rgba(255,255,255,0.06);
          padding-top: 28px;
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 14px;
        }
        .contact-bottom p {
          font-size: 11px; color: rgba(255,255,255,0.25);
          letter-spacing: 0.05em;
        }
        .contact-bottom-links { display: flex; gap: 24px; }
        .contact-bottom-links a {
          font-size: 11px; color: rgba(255,255,255,0.25);
          text-decoration: none; transition: color 0.2s;
        }
        .contact-bottom-links a:hover { color: rgba(255,255,255,0.6); }

        /* ── GOLD LINE DECORATION ── */
        .gold-line {
          height: 1px;
          background: linear-gradient(to right, transparent, #b8952a, transparent);
        }

        /* ── MOBILE ── */
        @media (max-width: 768px) {
          .lp-nav { padding: 0 20px; }
          .hero-content { left: 24px; right: 24px; bottom: 80px; }
          .hero-dots { left: 24px; }
          .scroll-indicator { display: none; }
          .lp-intro { flex-direction: column; padding: 60px 24px; gap: 40px; }
          .intro-divider { display: none; }
          .intro-stats { flex-direction: row; gap: 32px; }
          .lp-rooms { padding: 60px 24px; }
          .rooms-grid { grid-template-columns: 1fr; }
          .room-tile { height: 260px; }
          .contact-grid { grid-template-columns: 1fr 1fr; gap: 40px; }
          .lp-contact { padding: 60px 24px 40px; }
          .nav-auth-link, .nav-auth-sep { display: none; }
        }
      `}</style>

      <div className="lp-root">

        {/* ── NAVBAR ── */}
        <nav className={`lp-nav ${scrolled ? "scrolled" : ""}`}>

          {/* Left */}
          <Link to="/rooms" className="nav-reserve-btn">Reserve Now</Link>

          {/* Center: Logo */}
          <div className="nav-logo" onClick={() => window.scrollTo({top:0,behavior:"smooth"})}>
            <div className="nav-logo-icon">🏨</div>
            <span className="nav-logo-name">HotelAI</span>
            <span className="nav-logo-est">Est. 2024</span>
          </div>

          {/* Right */}
          <div className="nav-right">
            {!token ? (
              <>
                <Link to="/login"    className="nav-auth-link">Sign In</Link>
                <span className="nav-auth-sep">|</span>
                <Link to="/register" className="nav-auth-link">Register</Link>
              </>
            ) : (
              <Link to="/dashboard" className="nav-auth-link">My Bookings</Link>
            )}
            <button className="nav-menu-btn" onClick={() => setMenuOpen(true)}>
              <div className="hamburger">
                <span/><span/><span/>
              </div>
              Menu
            </button>
          </div>
        </nav>

        {/* ── SLIDE MENU ── */}
        <div className={`slide-menu-overlay ${menuOpen ? "open" : ""}`} onClick={() => setMenuOpen(false)} />
        <div className={`slide-menu ${menuOpen ? "open" : ""}`}>
          <div className="slide-menu-header">
            <span className="slide-menu-logo">🏨 HotelAI</span>
            <button className="slide-menu-close" onClick={() => setMenuOpen(false)}>✕</button>
          </div>

          <div className="slide-menu-links">
            {NAV_LINKS.map(link => (
              link.path === "#contact"
                ? <span key={link.label} className="slide-menu-link" onClick={scrollToContact}>{link.label}</span>
                : <Link key={link.label} to={link.path} className="slide-menu-link" onClick={() => setMenuOpen(false)}>{link.label}</Link>
            ))}
          </div>

          <div className="slide-menu-contact">
            <div className="smc-label">Contact</div>
            <div className="smc-item">📞 +94 52 222 2881</div>
            <div className="smc-item">💬 +94 77 123 4567 (WhatsApp)</div>
            <div className="smc-item">✉️ reservations@hotelai.lk</div>
          </div>

          {!token && (
            <div className="slide-menu-auth">
              <Link to="/login"    className="btn-login"    onClick={() => setMenuOpen(false)}>Sign In</Link>
              <Link to="/register" className="btn-register" onClick={() => setMenuOpen(false)}>Create Account</Link>
            </div>
          )}
        </div>

        {/* ── HERO ── */}
        <section className="lp-hero">
          <div
            className={`hero-img ${animIn ? "in" : "out"}`}
            style={{ backgroundImage: `url(${SLIDES[slide].img})` }}
          />
          <div className="hero-overlay" />

          <div className="hero-content">
            <div className={`hero-tagline ${animIn ? "in" : ""}`}>
              {SLIDES[slide].tagline}
            </div>
            <div className={`hero-sub ${animIn ? "in" : ""}`}>
              {SLIDES[slide].sub}
            </div>
            <div className={`hero-cta-row ${animIn ? "in" : ""}`}>
              <Link to="/rooms" className="hero-btn-primary">Explore Rooms</Link>
              <span className="hero-btn-ghost" onClick={scrollToContact}>Contact Us</span>
            </div>
          </div>

          {/* Slide dots */}
          <div className="hero-dots">
            {SLIDES.map((_, i) => (
              <button key={i} className={`hero-dot ${i === slide ? "active" : ""}`} onClick={() => goToSlide(i)} />
            ))}
          </div>

          {/* Scroll cue */}
          <div className="scroll-indicator">
            <span>Scroll</span>
            <div className="scroll-line" />
          </div>
        </section>

        {/* ── INTRO ── */}
        <section>
          <div className="lp-intro">
            <div className="intro-text">
              <div className="intro-label">Welcome to HotelAI</div>
              <h2 className="intro-heading">
                Where every stay becomes<br/>
                <em>an unforgettable story</em>
              </h2>
              <p className="intro-body">
                Nestled in the heart of Sri Lanka, HotelAI blends timeless colonial architecture with modern luxury. From our celebrated restaurant to our award-winning spa, every detail has been curated to create moments that linger long after you leave.
              </p>
            </div>
            <div className="intro-divider" />
            <div className="intro-stats">
              <div>
                <div className="stat-num">48</div>
                <div className="stat-label">Luxury Rooms</div>
              </div>
              <div>
                <div className="stat-num">140+</div>
                <div className="stat-label">Years of Heritage</div>
              </div>
              <div>
                <div className="stat-num">5★</div>
                <div className="stat-label">Rating</div>
              </div>
            </div>
          </div>
          <div className="gold-line" />
        </section>

        {/* ── ROOMS TEASER ── */}
        <section className="lp-rooms">
          <div className="section-label">Accommodation</div>
          <h2 className="section-heading">Rooms & Suites</h2>
          <div className="rooms-grid">
            {[
              { name: "Ocean View Suite",      price: "From Rs. 22,000 / night", img: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80" },
              { name: "Deluxe Double Room",    price: "From Rs. 18,000 / night", img: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=600&q=80" },
              { name: "Superior Single Room",  price: "From Rs. 11,000 / night", img: "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=600&q=80" },
            ].map(r => (
              <div key={r.name} className="room-tile" onClick={() => navigate("/rooms")}>
                <img src={r.img} alt={r.name} />
                <div className="room-tile-overlay">
                  <div className="room-tile-name">{r.name}</div>
                  <div className="room-tile-price">{r.price}</div>
                </div>
              </div>
            ))}
          </div>
          <Link to="/rooms" className="lp-rooms-btn">View All Rooms</Link>
        </section>

        <div className="gold-line" />

        {/* ── CONTACT / FOOTER ── */}
        <footer className="lp-contact" ref={contactRef} id="contact">
          <div className="contact-inner">
            <div className="contact-grid">

              {/* Brand col */}
              <div className="contact-logo-col">
                <div className="logo-name">🏨 HotelAI</div>
                <div className="logo-tagline">Luxury Hotel & Resort</div>
                <p>Experience the finest hospitality in Sri Lanka. A sanctuary of elegance, comfort, and genuine warmth.</p>
                <div className="social-row" style={{ marginTop: 24 }}>
                  <a className="social-btn" href="#" title="Facebook">📘</a>
                  <a className="social-btn" href="#" title="Instagram">📸</a>
                  <a className="social-btn" href="#" title="Twitter">🐦</a>
                  <a className="social-btn" href="#" title="TripAdvisor">🦉</a>
                </div>
              </div>

              {/* Contact */}
              <div>
                <div className="contact-col-title">Get in Touch</div>

                <div className="contact-item">
                  <div className="contact-item-icon">📞</div>
                  <div className="contact-item-body">
                    <div className="contact-item-label">Phone</div>
                    <a className="contact-item-val" href="tel:+94522222881">+94 52 222 2881</a>
                  </div>
                </div>

                <div className="contact-item">
                  <div className="contact-item-icon">💬</div>
                  <div className="contact-item-body">
                    <div className="contact-item-label">WhatsApp</div>
                    <a className="contact-item-val" href="https://wa.me/94771234567" target="_blank" rel="noreferrer">+94 77 123 4567</a>
                  </div>
                </div>

                <div className="contact-item">
                  <div className="contact-item-icon">✉️</div>
                  <div className="contact-item-body">
                    <div className="contact-item-label">Email</div>
                    <a className="contact-item-val" href="mailto:reservations@hotelai.lk">reservations@hotelai.lk</a>
                  </div>
                </div>

                <div className="contact-item">
                  <div className="contact-item-icon">📍</div>
                  <div className="contact-item-body">
                    <div className="contact-item-label">Address</div>
                    <span className="contact-item-val">Grand Hotel Road,<br/>Nuwara Eliya, Sri Lanka</span>
                  </div>
                </div>
              </div>

              {/* Quick links */}
              <div>
                <div className="contact-col-title">Quick Links</div>
                <Link to="/rooms" className="quick-link" onClick={() => window.scrollTo(0,0)}>Rooms & Suites</Link>
                <a href="#"          className="quick-link">Dining</a>
                <a href="#"          className="quick-link">Spa & Wellness</a>
                <a href="#"          className="quick-link">Events & Weddings</a>
                <a href="#"          className="quick-link">Gallery</a>
                <a href="#"          className="quick-link">About Us</a>
                {!token ? (
                  <>
                    <Link to="/login"    className="quick-link">Sign In</Link>
                    <Link to="/register" className="quick-link">Create Account</Link>
                  </>
                ) : (
                  <Link to="/dashboard" className="quick-link">My Bookings</Link>
                )}
              </div>

              {/* Hours */}
              <div>
                <div className="contact-col-title">Opening Hours</div>
                <div style={{ fontSize:12.5, color:"rgba(255,255,255,0.4)", lineHeight:2 }}>
                  <div style={{ color:"rgba(255,255,255,0.6)", marginBottom:4 }}>Reception</div>
                  <div>24 hours / 7 days</div>
                  <div style={{ color:"rgba(255,255,255,0.6)", marginTop:16, marginBottom:4 }}>Restaurant</div>
                  <div>Breakfast: 7:00 – 10:30</div>
                  <div>Lunch: 12:00 – 14:30</div>
                  <div>Dinner: 19:00 – 22:30</div>
                  <div style={{ color:"rgba(255,255,255,0.6)", marginTop:16, marginBottom:4 }}>Spa</div>
                  <div>Daily: 9:00 – 20:00</div>
                </div>
              </div>

            </div>

            {/* Bottom bar */}
            <div className="contact-bottom">
              <p>© 2026 HotelAI. All rights reserved.</p>
              <div className="contact-bottom-links">
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
                <a href="#">Cookie Policy</a>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
