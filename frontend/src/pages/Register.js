import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const EyeOpen   = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>);
const EyeClosed = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>);

const THEMES = {
  dark:  { pageBg:"#0a0a0a", cardBg:"#0d0d0d", inputBg:"#1a1a1a", inputBorder:"rgba(255,255,255,0.1)", textPrimary:"#fff", textSecondary:"rgba(255,255,255,0.55)", textMuted:"rgba(255,255,255,0.3)", border:"rgba(255,255,255,0.08)", divider:"rgba(255,255,255,0.06)", socialBg:"rgba(255,255,255,0.04)", socialBorder:"rgba(255,255,255,0.1)", toggleBg:"rgba(255,255,255,0.06)", toggleBorder:"rgba(255,255,255,0.12)", toggleColor:"rgba(255,255,255,0.7)" },
  light: { pageBg:"#f5f0e8", cardBg:"#faf7f2", inputBg:"#f0ebe0", inputBorder:"rgba(26,20,16,0.12)", textPrimary:"#1a1410", textSecondary:"rgba(26,20,16,0.55)", textMuted:"rgba(26,20,16,0.35)", border:"rgba(26,20,16,0.09)", divider:"rgba(26,20,16,0.07)", socialBg:"rgba(26,20,16,0.03)", socialBorder:"rgba(26,20,16,0.1)", toggleBg:"rgba(26,20,16,0.06)", toggleBorder:"rgba(26,20,16,0.14)", toggleColor:"rgba(26,20,16,0.65)" },
};

function Register() {
  const navigate = useNavigate();

  const [theme, setTheme] = useState(() => localStorage.getItem("lp_theme") || "dark");
  const T = THEMES[theme];
  const toggleTheme = () => { const n=theme==="dark"?"light":"dark"; setTheme(n); localStorage.setItem("lp_theme",n); };

  const [form,setForm]                   = useState({username:"",email:"",password:"",confirmPassword:""});
  const [showPassword,setShowPassword]   = useState(false);
  const [showConfirm,setShowConfirm]     = useState(false);
  const [loading,setLoading]             = useState(false);
  const [error,setError]                 = useState("");
  const [success,setSuccess]             = useState(false);

  const handleChange = (e) => { setForm({...form,[e.target.name]:e.target.value}); if(error) setError(""); };
  const handleKeyDown = (e) => { if(e.key==="Enter") handleSubmit(); };

  const handleSubmit = async () => {
    if(!form.username||!form.email||!form.password||!form.confirmPassword){ setError("Please fill in all fields."); return; }
    if(form.password!==form.confirmPassword){ setError("Passwords do not match."); return; }
    if(form.password.length<6){ setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      await axios.post("http://localhost:8000/api/register/",{username:form.username,email:form.email,password:form.password});
      setSuccess(true);
      setTimeout(()=>navigate("/login"),1800);
    } catch(err) {
      setError(err?.response?.data?.detail||err?.response?.data?.username?.[0]||"Registration failed. Please try again.");
    } finally { setLoading(false); }
  };

  const inp = { width:"100%", padding:"12px 14px 12px 42px", border:`1px solid ${T.inputBorder}`, background:T.inputBg, color:T.textPrimary, fontSize:13, fontFamily:"'Jost', 'Gill Sans', sans-serif", outline:"none", transition:"border-color 0.2s, background 0.4s", letterSpacing:"0.03em" };

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

        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'Jost', 'Gill Sans', sans-serif;background:${T.pageBg};transition:background 0.4s;}
        .reg-root{font-family:'Jost', 'Gill Sans', sans-serif;display:flex;min-height:100vh;background:${T.pageBg};transition:background 0.4s;}
        .reg-hero{flex:1;position:relative;background-image:url('https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80');background-size:cover;background-position:center;display:flex;align-items:flex-end;}
        .reg-hero::after{content:'';position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,0.82) 0%,rgba(0,0,0,0.15) 55%,transparent 100%);}
        .reg-hero-content{position:relative;z-index:1;padding:48px;}
        .hero-eyebrow{font-size:9px;letter-spacing:0.35em;text-transform:uppercase;color:#b8952a;margin-bottom:14px;}
        .hero-title{font-family:'Bodoni Moda','Didot','Playfair Display',Georgia,serif;font-optical-sizing:auto;font-optical-sizing:auto;font-size:40px;font-weight:400;font-style:italic;color:#fff;line-height:1.2;margin-bottom:16px;}
        .hero-sub{font-size:12px;font-weight:300;color:rgba(255,255,255,0.6);line-height:1.8;margin-bottom:22px;letter-spacing:0.04em;}
        .hero-features{list-style:none;display:flex;flex-direction:column;gap:10px;}
        .hero-features li{display:flex;align-items:center;gap:12px;font-size:11px;color:rgba(255,255,255,0.7);letter-spacing:0.06em;}
        .hero-dot{width:6px;height:6px;background:#b8952a;flex-shrink:0;}
        .reg-right{width:480px;flex-shrink:0;display:flex;flex-direction:column;justify-content:flex-start;padding:40px 52px;background:${T.cardBg};overflow-y:auto;transition:background 0.4s;}
        .reg-top-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:40px;}
        .reg-logo{font-family:'Bodoni Moda','Didot','Playfair Display',Georgia,serif;font-optical-sizing:auto;font-optical-sizing:auto;font-size:18px;font-weight:400;letter-spacing:0.2em;text-transform:uppercase;color:${T.textPrimary};text-decoration:none;transition:color 0.4s;}
        .theme-btn{display:flex;align-items:center;gap:7px;background:${T.toggleBg};border:1px solid ${T.toggleBorder};color:${T.toggleColor};padding:6px 12px;border-radius:20px;cursor:pointer;font-family:'Jost', 'Gill Sans', sans-serif;font-size:10px;letter-spacing:0.1em;transition:all 0.3s;}
        .theme-btn:hover{border-color:#b8952a;color:#b8952a;}
        .toggle-pill{width:34px;height:18px;border-radius:9px;background:${theme==="dark"?"#1a1a1a":"#e0d8cc"};border:1px solid ${theme==="dark"?"rgba(255,255,255,0.1)":"rgba(26,20,16,0.15)"};display:flex;align-items:center;padding:2px;transition:background 0.3s;}
        .toggle-knob{width:12px;height:12px;border-radius:50%;background:#b8952a;transform:translateX(${theme==="dark"?"0":"16px"});transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1);}
        .page-eyebrow{font-size:9px;letter-spacing:0.3em;text-transform:uppercase;color:#b8952a;margin-bottom:10px;}
        .page-title{font-family:'Bodoni Moda','Didot','Playfair Display',Georgia,serif;font-optical-sizing:auto;font-optical-sizing:auto;font-size:30px;font-weight:400;color:${T.textPrimary};margin-bottom:6px;transition:color 0.4s;}
        .page-sub{font-size:11px;font-weight:300;color:${T.textMuted};letter-spacing:0.06em;margin-bottom:28px;transition:color 0.4s;}
        .field-group{margin-bottom:14px;}
        .field-label{font-size:9px;letter-spacing:0.22em;text-transform:uppercase;color:${T.textMuted};margin-bottom:7px;display:block;transition:color 0.4s;}
        .input-wrap{position:relative;display:flex;align-items:center;}
        .input-icon{position:absolute;left:14px;display:flex;color:${T.textMuted};pointer-events:none;}
        .eye-btn{position:absolute;right:14px;background:none;border:none;cursor:pointer;color:${T.textMuted};display:flex;transition:color 0.2s;}
        .eye-btn:hover{color:#b8952a;}
        .form-error{font-size:11px;color:"#dc2626";background:rgba(220,38,38,0.07);border:1px solid rgba(220,38,38,0.25);padding:10px 14px;margin-bottom:14px;letter-spacing:0.03em;}
        .form-success{font-size:11px;color:#16a34a;background:rgba(22,163,74,0.07);border:1px solid rgba(22,163,74,0.25);padding:10px 14px;margin-bottom:14px;letter-spacing:0.06em;text-align:center;}
        .submit-btn{width:100%;padding:14px;background:#b8952a;color:#fff;border:none;font-family:'Jost', 'Gill Sans', sans-serif;font-size:10px;font-weight:600;letter-spacing:0.25em;text-transform:uppercase;cursor:pointer;margin-top:4px;transition:background 0.2s,transform 0.12s;}
        .submit-btn:hover:not(:disabled){background:#a07d20;transform:translateY(-1px);}
        .submit-btn:active:not(:disabled){transform:translateY(0);}
        .submit-btn:disabled{opacity:0.6;cursor:not-allowed;}
        .or-divider{display:flex;align-items:center;gap:14px;margin:22px 0;color:${T.textMuted};font-size:9px;letter-spacing:0.25em;text-transform:uppercase;}
        .or-divider::before,.or-divider::after{content:'';flex:1;height:1px;background:${T.divider};}
        .social-row{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
        .social-btn{display:flex;align-items:center;justify-content:center;gap:8px;padding:11px;border:1px solid ${T.socialBorder};background:${T.socialBg};color:${T.textSecondary};font-family:'Jost', 'Gill Sans', sans-serif;font-size:11px;font-weight:500;cursor:pointer;letter-spacing:0.08em;transition:all 0.2s;}
        .social-btn:hover{border-color:#b8952a;color:#b8952a;}
        .reg-footer{text-align:center;margin-top:22px;font-size:11px;color:${T.textMuted};letter-spacing:0.05em;}
        .reg-footer a{color:#b8952a;text-decoration:none;font-weight:500;}
        .reg-footer a:hover{text-decoration:underline;}
        @keyframes spin{to{transform:rotate(360deg);}}
        .spinner{width:14px;height:14px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;display:inline-block;animation:spin 0.7s linear infinite;margin-right:8px;vertical-align:middle;}
        @media(max-width:768px){.reg-hero{display:none;}.reg-right{width:100%;padding:32px 24px;}}
      `}</style>

      <div className="reg-root">
        <div className="reg-hero">
          <div className="reg-hero-content">
            <div className="hero-eyebrow">Join HotelAI</div>
            <div className="hero-title">Begin Your<br/>Luxury Journey</div>
            <p className="hero-sub">Create your account and unlock access<br/>to exclusive rates and personalised stays.</p>
            <ul className="hero-features">
              <li><span className="hero-dot"/><span>Exclusive member rates</span></li>
              <li><span className="hero-dot"/><span>Manage all bookings in one place</span></li>
              <li><span className="hero-dot"/><span>Early access to new offers</span></li>
            </ul>
          </div>
        </div>

        <div className="reg-right">
          <div className="reg-top-row">
            <a href="/" className="reg-logo">🏨 HotelAI</a>
            <button className="theme-btn" onClick={toggleTheme}>
              <span style={{fontSize:13}}>{theme==="dark"?"🌙":"☀️"}</span>
              <div className="toggle-pill"><div className="toggle-knob"/></div>
            </button>
          </div>

          <div className="page-eyebrow">New Account</div>
          <div className="page-title">Create Account</div>
          <p className="page-sub">Join us to start booking your perfect stay</p>

          {success && <div className="form-success">✓ Account created! Redirecting to sign in…</div>}

          {/* Username */}
          <div className="field-group">
            <label className="field-label">Username</label>
            <div className="input-wrap">
              <span className="input-icon"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></span>
              <input name="username" placeholder="Choose a username" value={form.username} onChange={handleChange} onKeyDown={handleKeyDown} autoComplete="username" style={inp} onFocus={e=>e.target.style.borderColor="#b8952a"} onBlur={e=>e.target.style.borderColor=T.inputBorder}/>
            </div>
          </div>

          {/* Email */}
          <div className="field-group">
            <label className="field-label">Email Address</label>
            <div className="input-wrap">
              <span className="input-icon"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></span>
              <input name="email" type="email" placeholder="your.email@example.com" value={form.email} onChange={handleChange} onKeyDown={handleKeyDown} autoComplete="email" style={inp} onFocus={e=>e.target.style.borderColor="#b8952a"} onBlur={e=>e.target.style.borderColor=T.inputBorder}/>
            </div>
          </div>

          {/* Password */}
          <div className="field-group">
            <label className="field-label">Password</label>
            <div className="input-wrap">
              <span className="input-icon"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span>
              <input name="password" type={showPassword?"text":"password"} placeholder="At least 6 characters" value={form.password} onChange={handleChange} onKeyDown={handleKeyDown} style={inp} onFocus={e=>e.target.style.borderColor="#b8952a"} onBlur={e=>e.target.style.borderColor=T.inputBorder}/>
              <button className="eye-btn" onClick={()=>setShowPassword(v=>!v)} type="button" tabIndex={-1}>{showPassword?<EyeClosed/>:<EyeOpen/>}</button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="field-group">
            <label className="field-label">Confirm Password</label>
            <div className="input-wrap">
              <span className="input-icon"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span>
              <input name="confirmPassword" type={showConfirm?"text":"password"} placeholder="Repeat your password" value={form.confirmPassword} onChange={handleChange} onKeyDown={handleKeyDown} style={inp} onFocus={e=>e.target.style.borderColor="#b8952a"} onBlur={e=>e.target.style.borderColor=T.inputBorder}/>
              <button className="eye-btn" onClick={()=>setShowConfirm(v=>!v)} type="button" tabIndex={-1}>{showConfirm?<EyeClosed/>:<EyeOpen/>}</button>
            </div>
          </div>

          {error && <div className="form-error" style={{color:"#dc2626"}}>⚠️ {error}</div>}

          <button className="submit-btn" onClick={handleSubmit} disabled={loading||success}>
            {loading&&<span className="spinner"/>}
            {loading?"Creating account…":"Create Account"}
          </button>

          <div className="or-divider">or continue with</div>

          <div className="social-row">
            <button className="social-btn">
              <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
              Google
            </button>
            <button className="social-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.025 4.388 11.019 10.125 11.927v-8.437H7.078v-3.49h3.047V9.43c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.247h3.328l-.532 3.49h-2.796v8.437C19.612 23.092 24 18.098 24 12.073z"/></svg>
              Facebook
            </button>
          </div>

          <p className="reg-footer">Already have an account? <a href="/login">Sign in</a></p>
        </div>
      </div>
    </>
  );
}

export default Register;