import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// ─── Google Icon ───────────────────────────────────────────────────────────────
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 48 48" style={{ display: "block" }}>
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

// ─── Facebook Icon ─────────────────────────────────────────────────────────────
const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2" style={{ display: "block" }}>
    <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.025 4.388 11.019 10.125 11.927v-8.437H7.078v-3.49h3.047V9.43c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.247h3.328l-.532 3.49h-2.796v8.437C19.612 23.092 24 18.098 24 12.073z"/>
  </svg>
);

// ─── Eye Icons ─────────────────────────────────────────────────────────────────
const EyeOpen = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeClosed = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

// ─── Icons ─────────────────────────────────────────────────────────────────────
const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);
const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

// ─── Main Register Component ───────────────────────────────────────────────────
function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: "", email: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async () => {
    if (!form.username || !form.email || !form.password || !form.confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      await axios.post("http://localhost:8000/api/register/", {
        username: form.username,
        email: form.email,
        password: form.password,
      });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 1800);
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.response?.data?.username?.[0] || "Registration failed. Please try again.";
      setError(msg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => { if (e.key === "Enter") handleSubmit(); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .reg-root {
          font-family: 'DM Sans', sans-serif;
          display: flex;
          height: 100vh;
          background: #eef2f7;
          padding: 20px;
          gap: 20px;
        }

        /* ── LEFT HERO ── */
        .reg-hero {
          flex: 1;
          border-radius: 20px;
          overflow: hidden;
          position: relative;
          background-image: url('https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80');
          background-size: cover;
          background-position: center;
          display: flex;
          align-items: flex-end;
        }
        .reg-hero::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.1) 55%, transparent 100%);
        }
        .reg-hero-content {
          position: relative;
          z-index: 1;
          padding: 36px;
          color: #fff;
        }
        .reg-hero-content h2 { font-size: 26px; font-weight: 700; margin-bottom: 8px; }
        .reg-hero-content p { font-size: 14px; opacity: 0.85; margin-bottom: 18px; line-height: 1.5; }
        .reg-hero-features { list-style: none; display: flex; flex-direction: column; gap: 8px; }
        .reg-hero-features li { display: flex; align-items: center; gap: 10px; font-size: 13.5px; opacity: 0.9; }
        .feature-dot { width: 8px; height: 8px; border-radius: 50%; background: #60a5fa; flex-shrink: 0; }

        /* ── RIGHT PANEL ── */
        .reg-right {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow-y: auto;
        }
        .reg-card {
          width: 100%;
          max-width: 420px;
          background: #fff;
          border-radius: 20px;
          padding: 40px 40px 36px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.08);
          margin: auto;
        }

        /* App icon */
        .reg-app-icon {
          width: 56px; height: 56px;
          background: #2563eb;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
        }

        .reg-card h2 { text-align: center; font-size: 22px; font-weight: 700; color: #111827; margin-bottom: 6px; }
        .reg-card .subtitle { text-align: center; font-size: 13.5px; color: #6b7280; margin-bottom: 24px; }

        /* ── FIELDS ── */
        .field-group { margin-bottom: 14px; }
        .field-label { font-size: 13.5px; font-weight: 600; color: #374151; margin-bottom: 7px; }
        .input-wrap { position: relative; display: flex; align-items: center; }
        .input-icon { position: absolute; left: 13px; display: flex; align-items: center; pointer-events: none; }
        .reg-input {
          width: 100%;
          padding: 11px 40px 11px 40px;
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          color: #111827;
          background: #f9fafb;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }
        .reg-input::placeholder { color: #9ca3af; }
        .reg-input:focus {
          border-color: #2563eb;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
        }
        .reg-input.no-right-pad { padding-right: 14px; }
        .eye-toggle {
          position: absolute; right: 13px;
          background: none; border: none; cursor: pointer;
          display: flex; align-items: center; padding: 2px;
        }

        /* ── ERROR / SUCCESS ── */
        .reg-error { font-size: 12.5px; color: #dc2626; margin-top: -6px; margin-bottom: 8px; padding: 0 2px; }
        .reg-success {
          text-align: center; font-size: 14px; font-weight: 600;
          color: #16a34a; background: #f0fdf4; border: 1.5px solid #bbf7d0;
          border-radius: 10px; padding: 12px; margin-bottom: 14px;
        }

        /* ── CREATE ACCOUNT BUTTON ── */
        .btn-create {
          width: 100%; padding: 13px;
          background: #2563eb; color: #fff;
          border: none; border-radius: 10px;
          font-size: 15px; font-weight: 700;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer; margin-top: 4px;
          transition: background 0.18s, transform 0.12s, box-shadow 0.18s;
          box-shadow: 0 4px 14px rgba(37,99,235,0.3);
        }
        .btn-create:hover:not(:disabled) { background: #1d4ed8; box-shadow: 0 6px 20px rgba(37,99,235,0.38); transform: translateY(-1px); }
        .btn-create:active:not(:disabled) { transform: translateY(0); }
        .btn-create:disabled { opacity: 0.65; cursor: not-allowed; }

        /* ── DIVIDER ── */
        .or-divider {
          display: flex; align-items: center; gap: 12px;
          margin: 20px 0; color: #9ca3af;
          font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase;
        }
        .or-divider::before, .or-divider::after { content: ''; flex: 1; height: 1px; background: #e5e7eb; }

        /* ── SOCIAL ── */
        .social-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .btn-social {
          display: flex; align-items: center; justify-content: center; gap: 9px;
          padding: 11px 16px;
          border: 1.5px solid #e5e7eb; border-radius: 10px;
          background: #fff; font-size: 14px; font-weight: 600;
          font-family: 'DM Sans', sans-serif; color: #111827;
          cursor: pointer; transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;
        }
        .btn-social:hover { background: #f9fafb; border-color: #d1d5db; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }

        /* ── FOOTER ── */
        .reg-footer { text-align: center; margin-top: 20px; font-size: 13.5px; color: #6b7280; }
        .reg-footer a { color: #2563eb; font-weight: 600; text-decoration: none; }
        .reg-footer a:hover { text-decoration: underline; }

        /* ── SPINNER ── */
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff;
          border-radius: 50%; display: inline-block;
          animation: spin 0.7s linear infinite;
          margin-right: 8px; vertical-align: middle;
        }

        @media (max-width: 700px) {
          .reg-hero { display: none; }
          .reg-root { padding: 0; background: #fff; }
          .reg-card { border-radius: 0; box-shadow: none; padding: 36px 24px; }
        }
      `}</style>

      <div className="reg-root">

        {/* ── LEFT: Hero ── */}
        <div className="reg-hero">
          <div className="reg-hero-content">
            <h2>Welcome to HotelAI</h2>
            <p>Experience seamless hotel bookings<br/>powered by artificial intelligence</p>
            <ul className="reg-hero-features">
              <li><span className="feature-dot" />AI-powered room recommendations</li>
              <li><span className="feature-dot" />24/7 chatbot assistance</li>
              <li><span className="feature-dot" />Instant booking confirmation</li>
            </ul>
          </div>
        </div>

        {/* ── RIGHT: Register Card ── */}
        <div className="reg-right">
          <div className="reg-card">

            {/* App icon */}
            <div className="reg-app-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="7" height="7" rx="1.5" fill="white"/>
                <rect x="14" y="3" width="7" height="7" rx="1.5" fill="white"/>
                <rect x="3" y="14" width="7" height="7" rx="1.5" fill="white"/>
                <rect x="14" y="14" width="7" height="7" rx="1.5" fill="white"/>
              </svg>
            </div>

            <h2>Create Account</h2>
            <p className="subtitle">Join us to start booking your perfect stay</p>

            {success && (
              <div className="reg-success">✓ Account created! Redirecting to sign in…</div>
            )}

            {/* Username */}
            <div className="field-group">
              <div className="field-label">Username</div>
              <div className="input-wrap">
                <span className="input-icon"><UserIcon /></span>
                <input
                  className="reg-input reg-input no-right-pad"
                  name="username"
                  placeholder="Choose a username"
                  value={form.username}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Email */}
            <div className="field-group">
              <div className="field-label">Email Address</div>
              <div className="input-wrap">
                <span className="input-icon"><MailIcon /></span>
                <input
                  className="reg-input no-right-pad"
                  name="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={form.email}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="field-group">
              <div className="field-label">Password</div>
              <div className="input-wrap">
                <span className="input-icon"><LockIcon /></span>
                <input
                  className="reg-input"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  autoComplete="new-password"
                />
                <button className="eye-toggle" onClick={() => setShowPassword(v => !v)} type="button" tabIndex={-1}>
                  {showPassword ? <EyeClosed /> : <EyeOpen />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="field-group">
              <div className="field-label">Confirm Password</div>
              <div className="input-wrap">
                <span className="input-icon"><LockIcon /></span>
                <input
                  className="reg-input"
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  autoComplete="new-password"
                />
                <button className="eye-toggle" onClick={() => setShowConfirm(v => !v)} type="button" tabIndex={-1}>
                  {showConfirm ? <EyeClosed /> : <EyeOpen />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && <p className="reg-error">{error}</p>}

            {/* Create Account */}
            <button className="btn-create" onClick={handleSubmit} disabled={loading || success}>
              {loading && <span className="spinner" />}
              {loading ? "Creating account…" : "Create Account"}
            </button>

            {/* OR divider */}
            <div className="or-divider">or continue with</div>

            {/* Social */}
            <div className="social-row">
              <button className="btn-social"><GoogleIcon /> Google</button>
              <button className="btn-social"><FacebookIcon /> Facebook</button>
            </div>

            {/* Footer */}
            <p className="reg-footer">
              Already have an account? <a href="/login">Sign in</a>
            </p>

          </div>
        </div>

      </div>
    </>
  );
}

export default Register;
