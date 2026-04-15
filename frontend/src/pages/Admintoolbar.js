import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

/**
 * AdminToolbar
 * ============
 * A floating toolbar that appears on EVERY page when an admin is logged in.
 * Gives quick access to common admin actions without going to /admin.
 *
 * Usage: Add <AdminToolbar /> inside <Router> in App.js
 */
export default function AdminToolbar() {
  const navigate    = useNavigate();
  const location    = useLocation();
  const isAdmin     = localStorage.getItem("is_admin") === "true";
  const token       = localStorage.getItem("token");

  const [open,       setOpen]       = useState(false);
  const [stats,      setStats]      = useState(null);
  const [collapsed,  setCollapsed]  = useState(false);

  const hideOn    = ["/admin", "/login", "/register"];
  const shouldHide = !isAdmin || !token || hideOn.some(p => location.pathname.startsWith(p));
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  // 🔥 Hooks must come BEFORE any early return
  useEffect(() => {
    if (!shouldHide && open && !stats) {
      axios.get("http://localhost:8000/api/admin-panel/stats/", authHeader)
        .then(r => setStats(r.data))
        .catch(() => {});
    }
  }, [open, shouldHide]);

  // Early return AFTER all hooks
  if (shouldHide) return null;

  const theme = localStorage.getItem("lp_theme") || "dark";
  const isDark = theme === "dark";

  const bg      = isDark ? "#111"    : "#faf7f2";
  const border  = isDark ? "rgba(184,149,42,0.35)" : "rgba(184,149,42,0.4)";
  const text    = isDark ? "#fff"    : "#1a1410";
  const muted   = isDark ? "rgba(255,255,255,0.45)" : "rgba(26,20,16,0.45)";
  const itemBg  = isDark ? "#1a1a1a" : "#f0ebe0";
  const hoverBg = isDark ? "rgba(184,149,42,0.1)" : "rgba(184,149,42,0.08)";

  // (quick links handled inline below)

  return (
    <>
      <style>{`
        .adm-toolbar {
          position: fixed; bottom: 0; left: 0; right: 0; z-index: 9000;
          font-family: 'Jost', sans-serif;
          transition: transform 0.3s ease;
        }
        .adm-toolbar.collapsed { transform: translateY(calc(100% - 36px)); }

        .adm-toolbar-tab {
          display: flex; align-items: center; gap: 8px;
          background: #b8952a; color: #fff;
          padding: 6px 16px; font-size: 9px; font-weight: 700;
          letter-spacing: 0.2em; text-transform: uppercase;
          cursor: pointer; width: fit-content; border-radius: 6px 6px 0 0;
          margin-left: 24px; user-select: none;
          box-shadow: 0 -2px 12px rgba(184,149,42,0.3);
        }
        .adm-toolbar-body {
          background: ${bg};
          border-top: 2px solid #b8952a;
          padding: 14px 24px;
          display: flex; align-items: center; gap: 12px;
          flex-wrap: wrap;
          box-shadow: 0 -4px 20px rgba(0,0,0,0.2);
          overflow-x: auto;
        }
        .adm-toolbar-section {
          display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
        }
        .adm-sep {
          width: 1px; height: 28px;
          background: ${border}; flex-shrink: 0;
        }
        .adm-stat {
          display: flex; flex-direction: column; align-items: center;
          background: ${itemBg}; border: 1px solid ${border};
          padding: 6px 14px; min-width: 70px;
        }
        .adm-stat-num {
          font-family: 'Bodoni Moda', Georgia, serif;
          font-size: 18px; font-weight: 400; color: #b8952a;
          font-optical-sizing: auto; line-height: 1;
        }
        .adm-stat-label {
          font-size: 8px; letter-spacing: 0.15em; text-transform: uppercase;
          color: ${muted}; margin-top: 2px;
        }
        .adm-quick-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 7px 14px; background: ${itemBg};
          border: 1px solid ${border}; color: ${text};
          font-family: 'Jost', sans-serif; font-size: 10px;
          font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase;
          cursor: pointer; transition: all 0.2s; white-space: nowrap;
        }
        .adm-quick-btn:hover { background: ${hoverBg}; border-color: #b8952a; color: #b8952a; }
        .adm-page-label {
          font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase;
          color: ${muted}; padding: 0 4px;
        }
        @media(max-width:768px) {
          .adm-toolbar-body { padding: 10px 14px; gap: 8px; }
          .adm-stat { min-width: 55px; padding: 5px 10px; }
          .adm-stat-num { font-size: 15px; }
        }
      `}</style>

      <div className={`adm-toolbar ${collapsed ? "collapsed" : ""}`}>

        {/* Tab handle */}
        <div className="adm-toolbar-tab" onClick={() => setCollapsed(c => !c)}>
          <span>⚙</span>
          <span>Admin Controls</span>
          <span style={{ marginLeft: 4, opacity: 0.7 }}>{collapsed ? "▲" : "▼"}</span>
        </div>

        {/* Body */}
        <div className="adm-toolbar-body">

          {/* Live stats */}
          {stats && (
            <>
              <div className="adm-toolbar-section">
                <span className="adm-page-label">Live</span>
                {[
                  { num: stats.total_reservations,  label: "Bookings" },
                  { num: stats.checkins_today,       label: "Check-ins" },
                  { num: stats.checkouts_today,      label: "Check-outs" },
                  { num: stats.available_rooms + "/" + stats.total_rooms, label: "Available" },
                  { num: "Rs. " + Math.round(stats.monthly_revenue/1000) + "k", label: "This Month" },
                ].map(s => (
                  <div key={s.label} className="adm-stat">
                    <div className="adm-stat-num">{s.num}</div>
                    <div className="adm-stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="adm-sep"/>
            </>
          )}

          {/* Page-specific quick actions */}
          <div className="adm-toolbar-section">
            <span className="adm-page-label">Quick</span>

            {/* Always available */}
            <button className="adm-quick-btn" onClick={() => navigate("/admin")}>
              📊 Dashboard
            </button>

            {/* On rooms page — add room shortcut */}
            {location.pathname === "/rooms" && (
              <button className="adm-quick-btn" onClick={() => {
                navigate("/admin");
                localStorage.setItem("admin_tab", "rooms");
              }}>
                ➕ Add Room
              </button>
            )}

            {/* On room detail — edit this room */}
            {location.pathname.startsWith("/room/") && (
              <button className="adm-quick-btn" onClick={() => {
                navigate("/admin");
                localStorage.setItem("admin_tab", "rooms");
              }}>
                ✏️ Edit This Room
              </button>
            )}

            <button className="adm-quick-btn" onClick={() => {
              navigate("/admin");
              localStorage.setItem("admin_tab", "bookings");
            }}>
              📅 Manage Bookings
            </button>

            <button className="adm-quick-btn" onClick={() => {
              navigate("/admin");
              localStorage.setItem("admin_tab", "rooms");
            }}>
              🛏 Manage Rooms
            </button>

            <button className="adm-quick-btn" onClick={() => {
              navigate("/admin");
              localStorage.setItem("admin_tab", "users");
            }}>
              👥 Manage Guests
            </button>

            <button className="adm-quick-btn" onClick={() => {
              navigate("/admin");
              localStorage.setItem("admin_tab", "reviews");
            }}>
              ⭐ Manage Reviews
            </button>
          </div>

          <div className="adm-sep"/>

          {/* Load stats button if not loaded */}
          {!stats && (
            <button className="adm-quick-btn" onClick={() => {
              axios.get("http://localhost:8000/api/admin-panel/stats/", authHeader)
                .then(r => setStats(r.data)).catch(() => {});
            }}>
              📈 Load Stats
            </button>
          )}

          <span className="adm-page-label" style={{ marginLeft: "auto" }}>Page: {location.pathname}</span>

        </div>
      </div>
    </>
  );
}