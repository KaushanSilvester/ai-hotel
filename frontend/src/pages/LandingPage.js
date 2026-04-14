import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

const NAV_LINKS = [
  { label: "Rooms & Suites", path: "/rooms" },
  { label: "Dining",         path: "#" },
  { label: "Spa & Wellness", path: "#" },
  { label: "Events",         path: "#" },
  { label: "Gallery",        path: "#" },
  { label: "About",          path: "#" },
  { label: "Contact",        path: "#contact" },
];

const SLIDES = [
  { img: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1920&q=80", tagline: "The Grand Dame of South Asia",    sub: "Timeless luxury in the heart of Sri Lanka" },
  { img: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1920&q=80", tagline: "Where Heritage Meets Comfort",  sub: "Rooms and suites curated for the discerning traveller" },
  { img: "https://images.unsplash.com/photo-1540541338537-71cf3b7e5f69?auto=format&fit=crop&w=1920&q=80", tagline: "Dine Among the Clouds",          sub: "Exquisite cuisine overlooking the misty mountains" },
  { img: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1920&q=80", tagline: "Unwind in Pure Serenity",          sub: "Award-winning spa and wellness experiences" },
];

// ─── Theme tokens ─────────────────────────────────────────────────────────────
const THEMES = {
  dark: {
    // backgrounds
    pageBg:       "#0a0a0a",
    introBg:      "#0d0d0d",
    roomsBg:      "#080808",
    footerBg:     "#050505",
    menuBg:       "#0d0d0d",
    navScrollBg:  "rgba(10,10,10,0.92)",
    // text
    textPrimary:  "#ffffff",
    textMuted:    "rgba(255,255,255,0.55)",
    textFaint:    "rgba(255,255,255,0.4)",
    textFaintest: "rgba(255,255,255,0.25)",
    // borders
    borderFaint:  "rgba(255,255,255,0.06)",
    borderMid:    "rgba(255,255,255,0.07)",
    // nav
    navAuthColor: "rgba(255,255,255,0.8)",
    navAuthSep:   "rgba(255,255,255,0.25)",
    navMenuBorder:"rgba(255,255,255,0.3)",
    navMenuColor: "#ffffff",
    hamburgerBg:  "#ffffff",
    // menu links
    menuLinkColor:"rgba(255,255,255,0.85)",
    menuItemBorder:"rgba(255,255,255,0.05)",
    menuCloseFaint:"rgba(255,255,255,0.5)",
    menuLoginBorder:"rgba(255,255,255,0.25)",
    menuLoginColor:"rgba(255,255,255,0.8)",
    smcColor:     "rgba(255,255,255,0.5)",
    // hours text
    hoursText:    "rgba(255,255,255,0.4)",
    hoursLabel:   "rgba(255,255,255,0.6)",
    // toggle
    toggleBg:     "rgba(255,255,255,0.1)",
    toggleBorder: "rgba(255,255,255,0.2)",
    toggleColor:  "#ffffff",
    icon:         "🌙",
    label:        "Light",
  },
  light: {
    pageBg:       "#f5f0e8",
    introBg:      "#faf7f2",
    roomsBg:      "#f0ebe0",
    footerBg:     "#1a1612",
    menuBg:       "#faf7f2",
    navScrollBg:  "rgba(245,240,232,0.95)",
    textPrimary:  "#1a1410",
    textMuted:    "rgba(26,20,16,0.6)",
    textFaint:    "rgba(26,20,16,0.45)",
    textFaintest: "rgba(26,20,16,0.3)",
    borderFaint:  "rgba(26,20,16,0.08)",
    borderMid:    "rgba(26,20,16,0.08)",
    navAuthColor: "rgba(26,20,16,0.75)",
    navAuthSep:   "rgba(26,20,16,0.2)",
    navMenuBorder:"rgba(26,20,16,0.25)",
    navMenuColor: "#1a1410",
    hamburgerBg:  "#1a1410",
    menuLinkColor:"rgba(26,20,16,0.85)",
    menuItemBorder:"rgba(26,20,16,0.06)",
    menuCloseFaint:"rgba(26,20,16,0.4)",
    menuLoginBorder:"rgba(26,20,16,0.25)",
    menuLoginColor:"rgba(26,20,16,0.75)",
    smcColor:     "rgba(26,20,16,0.5)",
    hoursText:    "rgba(255,255,255,0.4)",
    hoursLabel:   "rgba(255,255,255,0.6)",
    toggleBg:     "rgba(26,20,16,0.08)",
    toggleBorder: "rgba(26,20,16,0.18)",
    toggleColor:  "#1a1410",
    icon:         "☀️",
    label:        "Dark",
  },
};

export default function LandingPage({ token }) {
  const navigate = useNavigate();

  // 🔥 Theme state — persist in localStorage
  const [theme, setTheme] = useState(() => localStorage.getItem("lp_theme") || "dark");
  const t = THEMES[theme];

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("lp_theme", next);
  };

  const [menuOpen, setMenuOpen] = useState(false);
  const [slide,    setSlide]    = useState(0);
  const [animIn,   setAnimIn]   = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const contactRef = useRef(null);
  const timerRef   = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setAnimIn(false);
      setTimeout(() => { setSlide(s => (s + 1) % SLIDES.length); setAnimIn(true); }, 600);
    }, 6000);
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
        @import url('https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,500;0,6..96,600;1,6..96,400;1,6..96,500&family=Jost:wght@300;400;500;600&display=swap');
        /* ── Bodoni Moda display settings ── */
        .bd { font-family:'Bodoni Moda','Didot','Playfair Display',Georgia,serif !important; font-optical-sizing:auto !important; font-variation-settings:'opsz' 96 !important; }
        h1,h2,h3,
        .hero-tagline,.hero-title,.page-title,.section-heading,.rd-room-name,
        .intro-heading,.room-name,.results-title,.dash-title,.summary-title,
        .processing-title,.success-title,.stat-value,.bc-price,.price-amt,
        .bc-total,.modal-title,.topbar-title,.rd-topbar-title,.login-logo,
        .slide-menu-link,.slide-menu-logo,.nav-logo-name,.room-tile-name,
        .contact-logo-col .logo-name,.hero-title,.page-title,.reg-logo,
        .dash-logo,.booking-card,.bc-room-name,.empty-title,.section-heading {
          font-family: 'Bodoni Moda', 'Didot', 'Playfair Display', Georgia, serif !important;
          font-optical-sizing: auto;
          font-variation-settings: 'opsz' 96;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }

        .lp-root {
          font-family: 'Jost', 'Gill Sans', sans-serif;
          background: ${t.pageBg};
          color: ${t.textPrimary};
          transition: background 0.4s, color 0.4s;
        }

        /* ── NAVBAR ── */
        .lp-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 200;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 40px; height: 80px;
          transition: background 0.4s, height 0.4s, backdrop-filter 0.4s, border-color 0.4s;
        }
        .lp-nav.scrolled {
          background: ${t.navScrollBg};
          backdrop-filter: blur(14px);
          height: 64px;
          border-bottom: 1px solid ${t.borderMid};
        }

        /* Reserve Now */
        .nav-reserve-btn {
          padding: 10px 24px; background: #b8952a; color: #fff;
          border: none; font-family: 'Jost', 'Gill Sans', sans-serif;
          font-size: 11px; font-weight: 600; letter-spacing: 0.18em;
          text-transform: uppercase; cursor: pointer;
          text-decoration: none; display: flex; align-items: center;
          transition: background 0.2s;
        }
        .nav-reserve-btn:hover { background: #a07d20; }

        /* Center logo */
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
          font-size: 22px; transition: transform 0.3s;
        }
        .nav-logo:hover .nav-logo-icon { transform: scale(1.08); }
        .nav-logo-name {
          font-family: 'Bodoni Moda', 'Didot', 'Playfair Display', Georgia, serif; font-optical-sizing: auto;
          font-size: 13px; font-weight: 600; letter-spacing: 0.3em;
          text-transform: uppercase; color: ${t.textPrimary};
          transition: color 0.4s;
        }
        .nav-logo-est {
          font-size: 9px; letter-spacing: 0.25em;
          color: ${t.textFaint}; text-transform: uppercase;
          transition: color 0.4s;
        }

        /* Right: auth + menu */
        .nav-right { display: flex; align-items: center; gap: 10px; }

        .nav-signin-btn {
          padding: 8px 20px;
          border: 1.5px solid rgba(184,149,42,0.55);
          color: #b8952a; background: transparent;
          font-family: 'Jost', sans-serif;
          font-size: 10px; font-weight: 600; letter-spacing: 0.18em;
          text-transform: uppercase; text-decoration: none;
          cursor: pointer; transition: all 0.2s;
          display: inline-flex; align-items: center;
        }
        .nav-signin-btn:hover { background: rgba(184,149,42,0.12); border-color: #b8952a; }

        .nav-register-btn {
          padding: 8px 20px;
          background: #b8952a; color: #fff; border: none;
          font-family: 'Jost', sans-serif;
          font-size: 10px; font-weight: 600; letter-spacing: 0.18em;
          text-transform: uppercase; text-decoration: none;
          cursor: pointer; transition: background 0.2s;
          display: inline-flex; align-items: center;
        }
        .nav-register-btn:hover { background: #a07d20; }

        .nav-user-chip {
          display: flex; align-items: center; gap: 8px;
          background: rgba(184,149,42,0.1);
          border: 1px solid rgba(184,149,42,0.3);
          padding: 7px 14px; color: #b8952a;
          font-size: 11px; font-weight: 500; letter-spacing: 0.08em;
          text-decoration: none; transition: all 0.2s;
        }
        .nav-user-chip:hover { background: rgba(184,149,42,0.18); }
        .nav-user-avatar {
          width: 22px; height: 22px; background: #b8952a; color: #fff;
          display: flex; align-items: center; justify-content: center;
          font-size: 10px; font-weight: 700; border-radius: 50%;
        }
        .nav-logout-btn {
          padding: 7px 16px; background: transparent;
          border: 1px solid rgba(220,38,38,0.3);
          color: rgba(220,38,38,0.65);
          font-family: 'Jost', sans-serif;
          font-size: 10px; font-weight: 500; letter-spacing: 0.14em;
          text-transform: uppercase; cursor: pointer; transition: all 0.2s;
        }
        .nav-logout-btn:hover { border-color: rgba(220,38,38,0.6); color: #ef4444; background: rgba(220,38,38,0.06); }
        .nav-auth-sep { display: none; }

        /* 🔥 Theme toggle button */
        .theme-toggle {
          display: flex; align-items: center; gap: 6px;
          background: ${t.toggleBg};
          border: 1.5px solid ${t.toggleBorder};
          color: ${t.toggleColor};
          padding: 7px 12px; cursor: pointer;
          font-family: 'Jost', 'Gill Sans', sans-serif;
          font-size: 11px; font-weight: 500; letter-spacing: 0.1em;
          transition: all 0.3s; border-radius: 20px;
        }
        .theme-toggle:hover { border-color: #b8952a; color: #b8952a; }
        .theme-toggle-icon { font-size: 14px; transition: transform 0.4s; }
        .theme-toggle:hover .theme-toggle-icon { transform: rotate(20deg) scale(1.2); }

        /* Menu button */
        .nav-menu-btn {
          display: flex; align-items: center; gap: 10px;
          background: none; border: 1.5px solid ${t.navMenuBorder};
          color: ${t.navMenuColor}; padding: 8px 16px; cursor: pointer;
          font-family: 'Jost', 'Gill Sans', sans-serif;
          font-size: 11px; font-weight: 500; letter-spacing: 0.2em;
          text-transform: uppercase; transition: all 0.3s;
        }
        .nav-menu-btn:hover { border-color: #b8952a; color: #b8952a; }
        .hamburger { display: flex; flex-direction: column; gap: 4px; width: 18px; }
        .hamburger span { height: 1.5px; background: ${t.hamburgerBg}; border-radius: 2px; display: block; transition: all 0.3s; }

        /* Auth buttons */
        .nav-signin-btn {
          font-size: 10px; font-weight: 600; letter-spacing: 0.18em;
          text-transform: uppercase; color: rgba(255,255,255,0.85);
          text-decoration: none; padding: 8px 18px;
          border: 1px solid rgba(255,255,255,0.3);
          transition: all 0.2s; white-space: nowrap;
          display: flex; align-items: center;
        }
        .nav-signin-btn:hover { border-color: #b8952a; color: #b8952a; }

        .nav-register-btn {
          font-size: 10px; font-weight: 600; letter-spacing: 0.18em;
          text-transform: uppercase; color: #fff;
          text-decoration: none; padding: 8px 18px;
          background: #b8952a; border: 1px solid #b8952a;
          transition: all 0.2s; white-space: nowrap;
          display: flex; align-items: center;
        }
        .nav-register-btn:hover { background: #a07d20; border-color: #a07d20; }

        .nav-logout-btn {
          font-size: 10px; font-weight: 600; letter-spacing: 0.18em;
          text-transform: uppercase; color: rgba(220,38,38,0.75);
          background: none; padding: 8px 16px;
          border: 1px solid rgba(220,38,38,0.25);
          cursor: pointer; font-family: 'Jost', sans-serif;
          transition: all 0.2s; white-space: nowrap;
        }
        .nav-logout-btn:hover { border-color: rgba(220,38,38,0.6); color: #ef4444; }

        /* ── SLIDE MENU ── */
        .slide-menu-overlay {
          position: fixed; inset: 0; z-index: 300;
          background: rgba(0,0,0,0.5);
          opacity: 0; pointer-events: none; transition: opacity 0.4s;
        }
        .slide-menu-overlay.open { opacity: 1; pointer-events: all; }

        .slide-menu {
          position: fixed; top: 0; right: 0; bottom: 0;
          width: min(420px, 90vw); z-index: 310;
          background: ${t.menuBg};
          border-left: 1px solid rgba(184,149,42,0.2);
          transform: translateX(100%);
          transition: transform 0.5s cubic-bezier(0.77,0,0.175,1), background 0.4s;
          display: flex; flex-direction: column;
          overflow-y: auto;
        }
        .slide-menu.open { transform: translateX(0); }

        .slide-menu-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 28px 36px; border-bottom: 1px solid ${t.borderFaint};
        }
        .slide-menu-logo {
          font-family: 'Bodoni Moda', 'Didot', 'Playfair Display', Georgia, serif; font-optical-sizing: auto;
          font-size: 20px; font-weight: 600; letter-spacing: 0.2em;
          color: #b8952a; text-transform: uppercase;
        }
        .slide-menu-close {
          background: none; border: none; color: ${t.menuCloseFaint};
          font-size: 24px; cursor: pointer; transition: color 0.2s;
        }
        .slide-menu-close:hover { color: #b8952a; }

        .slide-menu-links { padding: 36px; flex: 1; }
        .slide-menu-link {
          display: block;
          font-family: 'Bodoni Moda', 'Didot', 'Playfair Display', Georgia, serif; font-optical-sizing: auto;
          font-size: 32px; font-weight: 400; font-style: italic;
          color: ${t.menuLinkColor};
          text-decoration: none; line-height: 1;
          padding: 14px 0;
          border-bottom: 1px solid ${t.menuItemBorder};
          letter-spacing: 0.02em;
          transition: color 0.2s, padding-left 0.25s;
          cursor: pointer;
        }
        .slide-menu-link:hover { color: #b8952a; padding-left: 12px; }
        .slide-menu-link:last-child { border-bottom: none; }

        /* Theme toggle inside menu */
        .menu-theme-row {
          padding: 20px 36px;
          border-top: 1px solid ${t.borderFaint};
          display: flex; align-items: center; justify-content: space-between;
        }
        .menu-theme-label {
          font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase;
          color: ${t.textFaint};
        }
        .menu-theme-switch {
          display: flex; align-items: center; gap: 10px;
          background: ${t.toggleBg};
          border: 1.5px solid ${t.toggleBorder};
          border-radius: 24px; padding: 6px 14px;
          cursor: pointer; font-family: 'Jost', 'Gill Sans', sans-serif;
          font-size: 11px; font-weight: 600; letter-spacing: 0.1em;
          color: ${t.toggleColor};
          transition: all 0.3s;
        }
        .menu-theme-switch:hover { border-color: #b8952a; color: #b8952a; }

        /* Switch pill */
        .toggle-pill {
          width: 44px; height: 24px; border-radius: 12px;
          background: ${theme === "dark" ? "#1a1a1a" : "#e0d8cc"};
          border: 1.5px solid ${theme === "dark" ? "rgba(255,255,255,0.15)" : "rgba(26,20,16,0.2)"};
          position: relative; cursor: pointer; transition: background 0.3s;
          display: flex; align-items: center; padding: 2px;
        }
        .toggle-knob {
          width: 18px; height: 18px; border-radius: 50%;
          background: #b8952a;
          transform: translateX(${theme === "dark" ? "0" : "20px"});
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
          display: flex; align-items: center; justify-content: center;
          font-size: 10px;
        }

        .slide-menu-auth {
          padding: 28px 36px;
          border-top: 1px solid ${t.borderFaint};
          display: flex; gap: 12px;
        }
        .slide-menu-auth a {
          flex: 1; text-align: center; padding: 12px;
          font-size: 11px; font-weight: 600; letter-spacing: 0.15em;
          text-transform: uppercase; text-decoration: none; transition: all 0.2s;
        }
        .btn-login  { border: 1.5px solid ${t.menuLoginBorder}; color: ${t.menuLoginColor}; }
        .btn-login:hover { border-color: #b8952a; color: #b8952a; }
        .btn-register { background: #b8952a; color: #fff; }
        .btn-register:hover { background: #a07d20; }

        .slide-menu-contact { padding: 24px 36px; border-top: 1px solid ${t.borderFaint}; }
        .smc-label { font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; color: #b8952a; margin-bottom: 10px; }
        .smc-item { font-size: 12.5px; color: ${t.smcColor}; margin-bottom: 6px; transition: color 0.4s; }

        /* ── HERO ── */
        .lp-hero { position: relative; height: 100vh; min-height: 600px; overflow: hidden; }
        .hero-img { position: absolute; inset: 0; background-size: cover; background-position: center; transition: opacity 0.6s ease, transform 8s ease; }
        .hero-img.in  { opacity: 1; transform: scale(1.04); }
        .hero-img.out { opacity: 0; transform: scale(1); }
        .hero-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.08) 40%, rgba(0,0,0,0.5) 85%, rgba(0,0,0,0.82) 100%);
        }
        .hero-content { position: absolute; bottom: 100px; left: 60px; right: 60px; z-index: 2; }
        .hero-tagline {
          font-family: 'Bodoni Moda', 'Didot', 'Playfair Display', Georgia, serif; font-optical-sizing: auto;
          font-size: clamp(40px, 6vw, 76px);
          font-weight: 400; font-style: italic; line-height: 1.1; color: #fff;
          text-shadow: 0 2px 20px rgba(0,0,0,0.3);
          opacity: 0; transform: translateY(20px);
          transition: opacity 0.7s 0.1s, transform 0.7s 0.1s;
        }
        .hero-tagline.in { opacity: 1; transform: translateY(0); }
        .hero-sub {
          font-size: 13px; font-weight: 300; letter-spacing: 0.15em;
          text-transform: uppercase; color: rgba(255,255,255,0.65); margin-top: 14px;
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
          padding: 14px 36px; background: #b8952a; color: #fff; border: none;
          font-family: 'Jost', 'Gill Sans', sans-serif; font-size: 11px; font-weight: 600;
          letter-spacing: 0.2em; text-transform: uppercase; cursor: pointer;
          text-decoration: none; transition: background 0.2s; display: inline-block;
        }
        .hero-btn-primary:hover { background: #a07d20; }
        .hero-btn-ghost {
          padding: 14px 36px; background: transparent;
          border: 1.5px solid rgba(255,255,255,0.45); color: #fff;
          font-family: 'Jost', 'Gill Sans', sans-serif; font-size: 11px; font-weight: 500;
          letter-spacing: 0.2em; text-transform: uppercase; cursor: pointer;
          text-decoration: none; transition: border-color 0.2s; display: inline-block;
        }
        .hero-btn-ghost:hover { border-color: rgba(255,255,255,0.9); }
        /* Hero auth row */
        .hero-auth-row {
          display: flex; align-items: center; gap: 14px; margin-top: 20px;
          opacity: 0; transform: translateY(14px);
          transition: opacity 0.7s 0.55s, transform 0.7s 0.55s;
        }
        .hero-auth-row.in { opacity: 1; transform: translateY(0); }
        .hero-auth-signin { font-size: 10px; font-weight: 500; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(255,255,255,0.7); text-decoration: none; padding: 8px 20px; border: 1px solid rgba(255,255,255,0.3); transition: all 0.2s; display: inline-flex; align-items: center; }
        .hero-auth-signin:hover { border-color: rgba(255,255,255,0.7); color: #fff; }
        .hero-auth-register { font-size: 10px; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: #fff; text-decoration: none; padding: 8px 20px; background: rgba(184,149,42,0.85); border: 1px solid #b8952a; transition: all 0.2s; display: inline-flex; align-items: center; }
        .hero-auth-register:hover { background: #b8952a; }
        .hero-auth-logout { font-size: 10px; font-weight: 500; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(220,38,38,0.75); background: none; padding: 8px 18px; border: 1px solid rgba(220,38,38,0.3); cursor: pointer; font-family: 'Jost', sans-serif; transition: all 0.2s; }
        .hero-auth-logout:hover { color: #ef4444; border-color: rgba(220,38,38,0.6); }

        .hero-dots { position: absolute; bottom: 40px; left: 60px; display: flex; gap: 10px; z-index: 2; }
        .hero-dot { width: 28px; height: 2px; background: rgba(255,255,255,0.3); cursor: pointer; transition: background 0.3s, width 0.3s; border: none; }
        .hero-dot.active { background: #b8952a; width: 44px; }
        .scroll-indicator { position: absolute; bottom: 36px; right: 60px; display: flex; flex-direction: column; align-items: center; gap: 8px; z-index: 2; opacity: 0.55; }
        .scroll-indicator span { font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; writing-mode: vertical-rl; color: #fff; }
        .scroll-line { width: 1px; height: 50px; background: #fff; animation: scrollPulse 2s ease-in-out infinite; }
        @keyframes scrollPulse { 0%,100%{transform:scaleY(1);opacity:0.55;} 50%{transform:scaleY(0.4);opacity:0.2;} }

        /* ── INTRO ── */
        .lp-intro-wrap { background: ${t.introBg}; transition: background 0.4s; }
        .lp-intro {
          padding: 100px 60px; display: flex; gap: 80px; align-items: center;
          max-width: 1200px; margin: 0 auto;
        }
        .intro-text { flex: 1; }
        .intro-label { font-size: 10px; letter-spacing: 0.3em; text-transform: uppercase; color: #b8952a; margin-bottom: 20px; }
        .intro-heading { font-family: 'Bodoni Moda', 'Didot', 'Playfair Display', Georgia, serif; font-optical-sizing: auto; font-size: clamp(32px, 4vw, 52px); font-weight: 400; line-height: 1.2; color: ${t.textPrimary}; margin-bottom: 24px; transition: color 0.4s; }
        .intro-heading em { font-style: italic; color: #b8952a; }
        .intro-body { font-size: 13.5px; font-weight: 300; line-height: 1.9; color: ${t.textMuted}; max-width: 480px; transition: color 0.4s; }
        .intro-divider { width: 1px; height: 200px; background: linear-gradient(to bottom, transparent, rgba(184,149,42,0.4), transparent); flex-shrink: 0; }
        .intro-stats { display: flex; flex-direction: column; gap: 36px; }
        .stat-num { font-family: 'Bodoni Moda', 'Didot', 'Playfair Display', Georgia, serif; font-optical-sizing: auto; font-size: 52px; font-weight: 400; color: #b8952a; line-height: 1; }
        .stat-label { font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: ${t.textFaint}; margin-top: 4px; transition: color 0.4s; }

        /* ── ROOMS ── */
        .lp-rooms { background: ${t.roomsBg}; padding: 80px 60px; text-align: center; transition: background 0.4s; }
        .section-label { font-size: 10px; letter-spacing: 0.3em; text-transform: uppercase; color: #b8952a; margin-bottom: 16px; }
        .section-heading { font-family: 'Bodoni Moda', 'Didot', 'Playfair Display', Georgia, serif; font-optical-sizing: auto; font-size: clamp(28px, 4vw, 48px); font-weight: 400; font-style: italic; color: ${t.textPrimary}; margin-bottom: 48px; transition: color 0.4s; }
        .rooms-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; max-width: 1100px; margin: 0 auto 40px; }
        .room-tile { position: relative; height: 360px; overflow: hidden; cursor: pointer; }
        .room-tile img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s ease; }
        .room-tile:hover img { transform: scale(1.07); }
        .room-tile-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%); display: flex; flex-direction: column; justify-content: flex-end; padding: 24px; }
        .room-tile-name { font-family: 'Bodoni Moda', 'Didot', 'Playfair Display', Georgia, serif; font-optical-sizing: auto; font-size: 22px; font-weight: 400; font-style: italic; color: #fff; }
        .room-tile-price { font-size: 11px; letter-spacing: 0.1em; color: #b8952a; margin-top: 4px; }
        .lp-rooms-btn { display: inline-block; padding: 14px 44px; border: 1.5px solid rgba(184,149,42,0.6); color: #b8952a; font-family: 'Jost', 'Gill Sans', sans-serif; font-size: 11px; font-weight: 500; letter-spacing: 0.2em; text-transform: uppercase; text-decoration: none; transition: all 0.2s; }
        .lp-rooms-btn:hover { background: #b8952a; color: #fff; border-color: #b8952a; }

        .gold-line { height: 1px; background: linear-gradient(to right, transparent, #b8952a, transparent); }

        /* ── FOOTER ── */
        .lp-contact { background: ${t.footerBg}; border-top: 1px solid rgba(184,149,42,0.15); padding: 80px 60px 50px; transition: background 0.4s; }
        .contact-inner { max-width: 1100px; margin: 0 auto; }
        .contact-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 60px; margin-bottom: 60px; }
        .contact-logo-col .logo-name { font-family: 'Bodoni Moda', 'Didot', 'Playfair Display', Georgia, serif; font-optical-sizing: auto; font-size: 28px; font-weight: 400; letter-spacing: 0.2em; color: #fff; text-transform: uppercase; margin-bottom: 6px; }
        .contact-logo-col .logo-tagline { font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: #b8952a; margin-bottom: 20px; }
        .contact-logo-col p { font-size: 13px; font-weight: 300; line-height: 1.8; color: rgba(255,255,255,0.4); max-width: 280px; }
        .contact-col-title { font-size: 10px; letter-spacing: 0.25em; text-transform: uppercase; color: #b8952a; margin-bottom: 18px; }
        .contact-item { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 18px; }
        .contact-item-icon { width: 32px; height: 32px; border-radius: 50%; background: rgba(184,149,42,0.1); border: 1px solid rgba(184,149,42,0.25); display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; }
        .contact-item-label { font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(255,255,255,0.3); margin-bottom: 3px; }
        .contact-item-val { font-size: 13.5px; font-weight: 400; color: rgba(255,255,255,0.75); text-decoration: none; transition: color 0.2s; }
        a.contact-item-val:hover { color: #b8952a; }
        .quick-link { display: block; font-size: 13px; font-weight: 300; color: rgba(255,255,255,0.45); text-decoration: none; margin-bottom: 10px; transition: color 0.2s; }
        .quick-link:hover { color: #b8952a; }
        .social-row { display: flex; gap: 12px; }
        .social-btn { width: 38px; height: 38px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; font-size: 16px; cursor: pointer; transition: border-color 0.2s, background 0.2s; text-decoration: none; }
        .social-btn:hover { border-color: #b8952a; background: rgba(184,149,42,0.1); }
        .contact-bottom { border-top: 1px solid rgba(255,255,255,0.06); padding-top: 28px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px; }
        .contact-bottom p { font-size: 11px; color: rgba(255,255,255,0.25); letter-spacing: 0.05em; }
        .contact-bottom-links { display: flex; gap: 24px; }
        .contact-bottom-links a { font-size: 11px; color: rgba(255,255,255,0.25); text-decoration: none; transition: color 0.2s; }
        .contact-bottom-links a:hover { color: rgba(255,255,255,0.6); }

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
          .theme-label { display: none; }
        }
      `}</style>

      <div className="lp-root">

        {/* ── NAVBAR ── */}
        <nav className={`lp-nav ${scrolled ? "scrolled" : ""}`}>
          <Link to="/rooms" className="nav-reserve-btn">Reserve Now</Link>

          <div className="nav-logo" onClick={() => window.scrollTo({top:0,behavior:"smooth"})}>
            <div className="nav-logo-icon">🏨</div>
            <span className="nav-logo-name">HotelAI</span>
            <span className="nav-logo-est">Est. 2024</span>
          </div>

          <div className="nav-right">
            {!token ? (
              <>
                <Link to="/login"    className="nav-signin-btn">Sign In</Link>
                <Link to="/register" className="nav-register-btn">Register</Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" className="nav-signin-btn">My Bookings</Link>
                <button className="nav-logout-btn" onClick={() => { localStorage.removeItem("token"); localStorage.removeItem("username"); window.location.reload(); }}>Sign Out</button>
              </>
            )}

            {/* 🔥 Theme toggle */}
            <button className="theme-toggle" onClick={toggleTheme} title={`Switch to ${t.label} mode`}>
              <span className="theme-toggle-icon">{t.icon}</span>
              <span className="theme-label">{t.label}</span>
            </button>

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

          {/* Theme toggle inside menu */}
          <div className="menu-theme-row">
            <span className="menu-theme-label">Appearance</span>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontSize:11, color: theme==="dark" ? "#b8952a" : "rgba(184,149,42,0.4)", letterSpacing:"0.1em" }}>DARK</span>
              <div className="toggle-pill" onClick={toggleTheme}>
                <div className="toggle-knob">{theme === "dark" ? "🌙" : "☀️"}</div>
              </div>
              <span style={{ fontSize:11, color: theme==="light" ? "#b8952a" : "rgba(184,149,42,0.4)", letterSpacing:"0.1em" }}>LIGHT</span>
            </div>
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
          <div className={`hero-img ${animIn ? "in" : "out"}`} style={{ backgroundImage: `url(${SLIDES[slide].img})` }} />
          <div className="hero-overlay" />
          <div className="hero-content">
            <div className={`hero-tagline ${animIn ? "in" : ""}`}>{SLIDES[slide].tagline}</div>
            <div className={`hero-sub ${animIn ? "in" : ""}`}>{SLIDES[slide].sub}</div>
            <div className={`hero-cta-row ${animIn ? "in" : ""}`}>
              <Link to="/rooms" className="hero-btn-primary">Explore Rooms</Link>
              <span className="hero-btn-ghost" onClick={scrollToContact}>Contact Us</span>
            </div>

            {/* Auth buttons in hero */}
            {!token ? (
              <div className={`hero-auth-row ${animIn ? "in" : ""}`}>
                <Link to="/login"    className="hero-auth-signin">Sign In</Link>
                <Link to="/register" className="hero-auth-register">Create Account →</Link>
              </div>
            ) : (
              <div className={`hero-auth-row ${animIn ? "in" : ""}`}>
                <Link to="/dashboard" className="hero-auth-signin">My Bookings</Link>
                <button className="hero-auth-logout" onClick={() => { localStorage.removeItem("token"); localStorage.removeItem("username"); window.location.reload(); }}>Sign Out</button>
              </div>
            )}
          </div>
          <div className="hero-dots">
            {SLIDES.map((_, i) => (
              <button key={i} className={`hero-dot ${i === slide ? "active" : ""}`} onClick={() => goToSlide(i)} />
            ))}
          </div>
          <div className="scroll-indicator">
            <span>Scroll</span>
            <div className="scroll-line" />
          </div>
        </section>

        {/* ── INTRO ── */}
        <div className="lp-intro-wrap">
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
              <div><div className="stat-num">48</div><div className="stat-label">Luxury Rooms</div></div>
              <div><div className="stat-num">140+</div><div className="stat-label">Years of Heritage</div></div>
              <div><div className="stat-num">5★</div><div className="stat-label">Rating</div></div>
            </div>
          </div>
          <div className="gold-line" />
        </div>

        {/* ── ROOMS TEASER ── */}
        <section className="lp-rooms">
          <div className="section-label">Accommodation</div>
          <h2 className="section-heading">Rooms & Suites</h2>
          <div className="rooms-grid">
            {[
              { name:"Ocean View Suite",     price:"From Rs. 22,000 / night", img:"https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80" },
              { name:"Deluxe Double Room",   price:"From Rs. 18,000 / night", img:"https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=600&q=80" },
              { name:"Superior Single Room", price:"From Rs. 11,000 / night", img:"https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=600&q=80" },
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

        {/* ── FOOTER ── */}
        <footer className="lp-contact" ref={contactRef} id="contact">
          <div className="contact-inner">
            <div className="contact-grid">
              <div className="contact-logo-col">
                <div className="logo-name">🏨 HotelAI</div>
                <div className="logo-tagline">Luxury Hotel & Resort</div>
                <p>Experience the finest hospitality in Sri Lanka. A sanctuary of elegance, comfort, and genuine warmth.</p>
                <div className="social-row" style={{ marginTop:24 }}>
                  <a className="social-btn" href="#" title="Facebook">📘</a>
                  <a className="social-btn" href="#" title="Instagram">📸</a>
                  <a className="social-btn" href="#" title="Twitter">🐦</a>
                  <a className="social-btn" href="#" title="TripAdvisor">🦉</a>
                </div>
              </div>

              <div>
                <div className="contact-col-title">Get in Touch</div>
                <div className="contact-item">
                  <div className="contact-item-icon">📞</div>
                  <div><div className="contact-item-label">Phone</div><a className="contact-item-val" href="tel:+94522222881">+94 52 222 2881</a></div>
                </div>
                <div className="contact-item">
                  <div className="contact-item-icon">💬</div>
                  <div><div className="contact-item-label">WhatsApp</div><a className="contact-item-val" href="https://wa.me/94771234567" target="_blank" rel="noreferrer">+94 77 123 4567</a></div>
                </div>
                <div className="contact-item">
                  <div className="contact-item-icon">✉️</div>
                  <div><div className="contact-item-label">Email</div><a className="contact-item-val" href="mailto:reservations@hotelai.lk">reservations@hotelai.lk</a></div>
                </div>
                <div className="contact-item">
                  <div className="contact-item-icon">📍</div>
                  <div><div className="contact-item-label">Address</div><span className="contact-item-val">Grand Hotel Road,<br/>Nuwara Eliya, Sri Lanka</span></div>
                </div>
              </div>

              <div>
                <div className="contact-col-title">Quick Links</div>
                <Link to="/rooms" className="quick-link">Rooms & Suites</Link>
                <a href="#" className="quick-link">Dining</a>
                <a href="#" className="quick-link">Spa & Wellness</a>
                <a href="#" className="quick-link">Events & Weddings</a>
                <a href="#" className="quick-link">Gallery</a>
                <a href="#" className="quick-link">About Us</a>
                {!token ? (
                  <><Link to="/login" className="quick-link">Sign In</Link><Link to="/register" className="quick-link">Create Account</Link></>
                ) : (
                  <Link to="/dashboard" className="quick-link">My Bookings</Link>
                )}
              </div>

              <div>
                <div className="contact-col-title">Opening Hours</div>
                <div style={{ fontSize:12.5, color:t.hoursText, lineHeight:2, transition:"color 0.4s" }}>
                  <div style={{ color:t.hoursLabel, marginBottom:4 }}>Reception</div>
                  <div>24 hours / 7 days</div>
                  <div style={{ color:t.hoursLabel, marginTop:16, marginBottom:4 }}>Restaurant</div>
                  <div>Breakfast: 7:00 – 10:30</div>
                  <div>Lunch: 12:00 – 14:30</div>
                  <div>Dinner: 19:00 – 22:30</div>
                  <div style={{ color:t.hoursLabel, marginTop:16, marginBottom:4 }}>Spa</div>
                  <div>Daily: 9:00 – 20:00</div>
                </div>
              </div>
            </div>

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