import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import { useState } from "react";
import Login      from "./pages/Login";
import Register   from "./pages/Register";
import Home       from "./pages/Home";
import Dashboard  from "./pages/Dashboard";
import RoomDetail from "./pages/RoomDetail";
import Payment    from "./pages/Payment";
import LandingPage from "./pages/LandingPage";  // 🔥 NEW

// ─── Navbar (hidden on landing, login, register, payment) ────────────────────
function Navbar({ token, username, onLogout }) {
  const location = useLocation();
  const hideNav  = ["/", "/login", "/register", "/payment"].includes(location.pathname);
  if (hideNav) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        .navbar { font-family:'DM Sans',sans-serif; display:flex; justify-content:space-between; align-items:center; padding:0 28px; height:60px; background:#0f172a; box-shadow:0 1px 0 rgba(255,255,255,0.06); position:sticky; top:0; z-index:100; }
        .navbar-left { display:flex; align-items:center; gap:28px; }
        .navbar-brand { display:flex; align-items:center; gap:9px; font-size:16px; font-weight:700; color:#fff; text-decoration:none; }
        .navbar-brand-icon { width:32px; height:32px; background:#2563eb; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:16px; }
        .nav-link { font-size:14px; font-weight:500; color:#94a3b8; text-decoration:none; transition:color 0.15s; padding:4px 0; border-bottom:2px solid transparent; }
        .nav-link:hover { color:#fff; }
        .nav-link.active { color:#fff; border-bottom-color:#2563eb; }
        .navbar-right { display:flex; align-items:center; gap:12px; }
        .nav-username { font-size:13.5px; font-weight:600; color:#cbd5e1; background:rgba(255,255,255,0.07); padding:6px 12px; border-radius:20px; display:flex; align-items:center; gap:6px; }
        .nav-avatar { width:24px; height:24px; border-radius:50%; background:#2563eb; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; color:#fff; }
        .nav-btn-outline { font-size:13.5px; font-weight:600; color:#cbd5e1; text-decoration:none; padding:7px 14px; border:1.5px solid rgba(255,255,255,0.15); border-radius:8px; transition:all 0.15s; font-family:'DM Sans',sans-serif; background:transparent; cursor:pointer; }
        .nav-btn-outline:hover { color:#fff; border-color:rgba(255,255,255,0.35); }
        .nav-btn-primary { font-size:13.5px; font-weight:600; color:#fff; text-decoration:none; padding:7px 16px; background:#2563eb; border-radius:8px; transition:background 0.15s; font-family:'DM Sans',sans-serif; }
        .nav-btn-primary:hover { background:#1d4ed8; }
        .logout-btn { font-size:13.5px; font-weight:600; color:#fca5a5; background:rgba(239,68,68,0.1); border:1.5px solid rgba(239,68,68,0.25); border-radius:8px; padding:7px 14px; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all 0.15s; }
        .logout-btn:hover { background:rgba(239,68,68,0.2); }
      `}</style>
      <nav className="navbar">
        <div className="navbar-left">
          <Link to="/" className="navbar-brand">
            <div className="navbar-brand-icon">🏨</div>
            HotelAI
          </Link>
          {token && (
            <>
              <Link to="/rooms" className={`nav-link ${location.pathname==="/rooms"?"active":""}`}>Rooms</Link>
              <Link to="/dashboard" className={`nav-link ${location.pathname==="/dashboard"?"active":""}`}>Dashboard</Link>
            </>
          )}
        </div>
        <div className="navbar-right">
          {!token ? (
            <>
              <Link to="/login"    className="nav-btn-outline">Login</Link>
              <Link to="/register" className="nav-btn-primary">Register</Link>
            </>
          ) : (
            <>
              <div className="nav-username">
                <div className="nav-avatar">{username?.[0]?.toUpperCase()||"U"}</div>
                {username}
              </div>
              <button className="logout-btn" onClick={onLogout}>Logout</button>
            </>
          )}
        </div>
      </nav>
    </>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const username = localStorage.getItem("username");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setToken(null);
  };

  return (
    <Router>
      <Navbar token={token} username={username} onLogout={handleLogout} />
      <Routes>
        {/* 🔥 Landing page is the new root */}
        <Route path="/"          element={<LandingPage token={token} />} />

        {/* Rooms listing (was /) */}
        <Route path="/rooms"     element={<Home />} />

        {/* Room detail */}
        <Route path="/room/:id"  element={<RoomDetail />} />

        {/* Payment — protected */}
        <Route path="/payment"   element={token ? <Payment /> : <Navigate to="/login" />} />

        {/* Auth */}
        <Route path="/login"     element={!token ? <Login setToken={setToken} /> : <Navigate to="/dashboard" />} />
        <Route path="/register"  element={!token ? <Register /> : <Navigate to="/dashboard" />} />

        {/* Dashboard — protected */}
        <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;