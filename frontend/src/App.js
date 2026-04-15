import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import { useState } from "react";
import Login          from "./pages/Login";
import Register       from "./pages/Register";
import Home           from "./pages/Home";
import Dashboard      from "./pages/Dashboard";
import RoomDetail     from "./pages/RoomDetail";
import Payment        from "./pages/Payment";
import LandingPage    from "./pages/LandingPage";
import AdminDashboard from "./pages/AdminDashboard"; // 🔥 Admin panel
import HotelChatbot   from "./pages/HotelChatbot";    // 🔥 AI Chatbot
import AdminToolbar       from "./pages/Admintoolbar";       // 🔥 Admin Toolbar
import AdminNotifications from "./pages/AdminNotifications"; // 🔥 Notifications

// ─── Admin guard ──────────────────────────────────────────────────────────────
function AdminRoute({ children }) {
  const isAdmin = localStorage.getItem("is_admin") === "true";
  const token   = localStorage.getItem("token");
  if (!token)   return <Navigate to="/login" />;
  if (!isAdmin) return <Navigate to="/dashboard" />;
  return children;
}

// ─── Navbar (hidden on admin, landing, login, register, payment) ──────────────
function Navbar({ token, username, onLogout }) {
  const location = useLocation();
  const hideOn   = ["/", "/login", "/register", "/payment", "/admin"];
  if (hideOn.some(p => location.pathname.startsWith(p))) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Jost:wght@400;500;600;700&display=swap');
        .navbar { font-family:'Jost',sans-serif; display:flex; justify-content:space-between; align-items:center; padding:0 28px; height:60px; background:#0f172a; box-shadow:0 1px 0 rgba(255,255,255,0.06); position:sticky; top:0; z-index:100; }
        .navbar-left { display:flex; align-items:center; gap:28px; }
        .navbar-brand { display:flex; align-items:center; gap:9px; font-size:16px; font-weight:600; color:#fff; text-decoration:none; }
        .navbar-brand-icon { width:32px; height:32px; background:#b8952a; border-radius:0; display:flex; align-items:center; justify-content:center; font-size:16px; }
        .nav-link { font-size:13px; font-weight:500; color:#94a3b8; text-decoration:none; transition:color 0.15s; padding:4px 0; border-bottom:2px solid transparent; letter-spacing:0.06em; }
        .nav-link:hover { color:#fff; }
        .nav-link.active { color:#fff; border-bottom-color:#b8952a; }
        .navbar-right { display:flex; align-items:center; gap:12px; }
        .nav-username { font-size:12px; font-weight:500; color:#cbd5e1; background:rgba(255,255,255,0.07); padding:6px 12px; display:flex; align-items:center; gap:6px; letter-spacing:0.06em; }
        .nav-avatar { width:24px; height:24px; background:#b8952a; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; color:#fff; }
        .nav-btn-outline { font-size:11px; font-weight:500; color:#cbd5e1; text-decoration:none; padding:7px 14px; border:1px solid rgba(255,255,255,0.15); transition:all 0.15s; font-family:'Jost',sans-serif; background:transparent; cursor:pointer; letter-spacing:0.1em; }
        .nav-btn-outline:hover { color:#fff; border-color:rgba(255,255,255,0.35); }
        .nav-btn-primary { font-size:11px; font-weight:600; color:#fff; text-decoration:none; padding:7px 16px; background:#b8952a; transition:background 0.15s; font-family:'Jost',sans-serif; letter-spacing:0.1em; }
        .nav-btn-primary:hover { background:#a07d20; }
        .logout-btn { font-size:11px; font-weight:500; color:rgba(220,38,38,0.75); background:rgba(220,38,38,0.08); border:1px solid rgba(220,38,38,0.2); padding:7px 14px; cursor:pointer; font-family:'Jost',sans-serif; transition:all 0.15s; letter-spacing:0.08em; }
        .logout-btn:hover { background:rgba(220,38,38,0.15); }
      `}</style>
      <nav className="navbar">
        <div className="navbar-left">
          <Link to="/" className="navbar-brand">
            <div className="navbar-brand-icon">🏨</div>
            HotelAI
          </Link>
          {token && (
            <>
              <Link to="/rooms"     className={`nav-link ${location.pathname==="/rooms"?"active":""}`}>Rooms</Link>
              <Link to="/dashboard" className={`nav-link ${location.pathname==="/dashboard"?"active":""}`}>My Bookings</Link>
            </>
          )}
        </div>
        <div className="navbar-right">
          {!token ? (
            <>
              <Link to="/login"    className="nav-btn-outline">Sign In</Link>
              <Link to="/register" className="nav-btn-primary">Register</Link>
            </>
          ) : (
            <>
              <div className="nav-username">
                <div className="nav-avatar">{username?.[0]?.toUpperCase()||"U"}</div>
                {username}
              </div>
              {localStorage.getItem("is_admin")==="true"&&(
                <Link to="/admin" className="nav-btn-outline" style={{color:"#b8952a",borderColor:"rgba(184,149,42,0.4)"}}>Admin</Link>
              )}
              <button className="logout-btn" onClick={onLogout}>Sign Out</button>
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
    localStorage.removeItem("is_admin");
    setToken(null);
  };

  return (
    <Router>
      <Navbar token={token} username={username} onLogout={handleLogout} />
      <Routes>
        <Route path="/"          element={<LandingPage token={token} />} />
        <Route path="/rooms"     element={<Home />} />
        <Route path="/room/:id"  element={<RoomDetail />} />
        <Route path="/payment"   element={token ? <Payment /> : <Navigate to="/login" />} />
        <Route path="/login"     element={!token ? <Login setToken={setToken} /> : <Navigate to="/dashboard" />} />
        <Route path="/register"  element={!token ? <Register /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" />} />

        {/* 🔥 Admin panel — only for staff/superusers */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      </Routes>

      {/* 🔥 AI Chatbot — visible on all pages except admin */}
      <HotelChatbot />

      {/* 🔥 Admin Toolbar — visible on all pages when admin logged in */}
      <AdminToolbar />

      {/* 🔥 Admin Notifications Bell — fixed top-right, ALL pages */}
      <AdminNotifications />
    </Router>
  );
}

export default App;