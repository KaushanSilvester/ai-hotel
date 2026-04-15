import { useState, useEffect, useRef } from "react";

export default function AdminNotifications() {
  const isAdmin = localStorage.getItem("is_admin") === "true";
  const token   = localStorage.getItem("token");

  const [notifications, setNotifications] = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [open,          setOpen]          = useState(false);
  const [toasts,        setToasts]        = useState([]);
  const prevCount = useRef(-1);
  const panelRef  = useRef(null);

  const theme  = localStorage.getItem("lp_theme") || "dark";
  const isDark = theme === "dark";
  const bg     = isDark ? "#111"    : "#faf7f2";
  const border = isDark ? "rgba(184,149,42,0.35)" : "rgba(184,149,42,0.4)";
  const text   = isDark ? "#fff"    : "#1a1410";
  const muted  = isDark ? "rgba(255,255,255,0.5)" : "rgba(26,20,16,0.45)";
  const itemBg = isDark ? "#1a1a1a" : "#f0ebe0";

  // ── Simple fetch with no dependencies ────────────────────────────────────
  const fetchNow = () => {
    if (!isAdmin || !token) return;

    fetch("http://localhost:8000/api/admin-notifications/", {
      headers: { "Authorization": "Bearer " + token }
    })
    .then(r => {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    })
    .then(data => {
      const notifs = data.notifications || [];
      const count  = data.unread_count  || 0;

      setNotifications(notifs);
      setUnreadCount(count);

      // Show toast for new ones
      if (prevCount.current >= 0 && count > prevCount.current) {
        const newOnes = notifs.filter(n => !n.read).slice(0, count - prevCount.current);
        newOnes.forEach(n => addToast(n));
      }
      prevCount.current = count;
    })
    .catch(err => console.warn("[AdminNotif] fetch failed:", err.message));
  };

  useEffect(() => {
    if (!isAdmin || !token) return;

    // Fetch immediately
    fetchNow();

    // Then every 10 seconds
    const timer = setInterval(fetchNow, 5000); // every 5 seconds
    return () => clearInterval(timer);
  }, []); // empty deps — intentional, avoids re-subscription issues

  // Close panel on outside click
  useEffect(() => {
    const handler = e => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Toast ────────────────────────────────────────────────────────────────
  const addToast = (notif) => {
    const id = Date.now();
    setToasts(prev => [{ ...notif, _id: id }, ...prev].slice(0, 5));
    setTimeout(() => setToasts(prev => prev.filter(t => t._id !== id)), 7000);

    // Desktop notification
    if (Notification.permission === "granted") {
      try {
        new Notification("🏨 " + notif.title, {
          body: notif.message + "\n" + notif.detail,
          icon: "/favicon.ico"
        });
      } catch(e) {}
    }
  };

  const dismissToast = (id) => setToasts(prev => prev.filter(t => t._id !== id));

  const markRead = () => {
    fetch("http://localhost:8000/api/admin-notifications/read/", {
      method: "POST",
      headers: { "Authorization": "Bearer " + token, "Content-Type": "application/json" }
    })
    .then(() => {
      setUnreadCount(0);
      prevCount.current = 0;
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    })
    .catch(() => {});
  };

  const clearAll = () => {
    fetch("http://localhost:8000/api/admin-notifications/clear/", {
      method: "DELETE",
      headers: { "Authorization": "Bearer " + token }
    })
    .then(() => {
      setNotifications([]);
      setUnreadCount(0);
      prevCount.current = 0;
    })
    .catch(() => {});
  };

  // Manual test
  const sendTest = () => {
    fetch("http://localhost:8000/api/admin-notifications/test/", {
      method: "POST",
      headers: { "Authorization": "Bearer " + token, "Content-Type": "application/json" }
    })
    .then(r => r.json())
    .then(d => {
      console.log("[Test notif]", d);
      setTimeout(fetchNow, 500); // fetch after 0.5s
    })
    .catch(e => console.error("[Test notif error]", e));
  };

  const fmtTime = (iso) => {
    try { return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }); }
    catch { return ""; }
  };

  if (!isAdmin || !token) return null;

  return (
    <>
      <style>{`
        /* ── Bell — sits above chatbot (chatbot bottom:28px, bell bottom:96px) ── */
        .an-wrap {
          position: fixed; bottom: 96px; right: 28px;
          z-index: 9500; font-family: 'Jost', sans-serif;
        }
        .an-bell {
          width: 50px; height: 50px; border-radius: 50%;
          background: ${itemBg}; border: 2px solid ${border};
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; font-size: 22px; position: relative;
          box-shadow: 0 2px 16px rgba(0,0,0,0.25); transition: all 0.2s;
        }
        .an-bell:hover { border-color: #b8952a; transform: scale(1.1); }
        .an-bell.has-unread {
          border-color: #b8952a;
          box-shadow: 0 0 0 3px rgba(184,149,42,0.2);
          animation: anRing 1s ease-in-out infinite;
        }
        @keyframes anRing {
          0%,100%{ transform: rotate(0); }
          10%{ transform: rotate(-15deg); }
          20%{ transform: rotate(15deg); }
          30%{ transform: rotate(-10deg); }
          40%{ transform: rotate(10deg); }
          50%,100%{ transform: rotate(0); }
        }
        .an-badge {
          position: absolute; top: -5px; right: -5px;
          background: #ef4444; color: #fff; font-size: 10px; font-weight: 800;
          min-width: 20px; height: 20px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center; padding: 0 4px;
          border: 2px solid ${isDark ? "#111" : "#faf7f2"};
          animation: anBadge 0.4s cubic-bezier(0.34,1.56,0.64,1);
        }
        @keyframes anBadge { from{transform:scale(0)} to{transform:scale(1)} }

        /* ── Panel ── */
        .an-panel {
          position: absolute; bottom: 60px; right: 0;
          width: 330px; max-height: 460px;
          background: ${bg}; border: 1px solid ${border};
          box-shadow: 0 -8px 32px rgba(0,0,0,0.35);
          display: flex; flex-direction: column;
          animation: anSlide 0.25s cubic-bezier(0.34,1.56,0.64,1);
          overflow: hidden;
        }
        @keyframes anSlide {
          from{ opacity:0; transform:translateY(12px) scale(0.97); }
          to{ opacity:1; transform:translateY(0) scale(1); }
        }
        .an-hdr {
          padding: 13px 16px; border-bottom: 2px solid #b8952a;
          display: flex; align-items: center; justify-content: space-between;
          background: ${itemBg}; flex-shrink: 0;
        }
        .an-hdr-left { display: flex; align-items: center; gap: 8px; }
        .an-hdr-title { font-size: 11px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: ${text}; }
        .an-unread-pill { background: #ef4444; color: #fff; font-size: 9px; font-weight: 700; padding: 2px 7px; border-radius: 10px; }
        .an-hdr-btns { display: flex; gap: 5px; }
        .an-hbtn {
          font-size: 9px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase;
          background: none; border: 1px solid ${border}; color: ${muted};
          padding: 4px 9px; cursor: pointer; font-family: 'Jost',sans-serif; transition: all 0.2s;
        }
        .an-hbtn:hover { border-color: #b8952a; color: #b8952a; }
        .an-hbtn.red:hover { border-color: rgba(220,38,38,0.5); color: rgba(220,38,38,0.7); }

        .an-list { overflow-y: auto; flex: 1; }
        .an-list::-webkit-scrollbar { width: 3px; }
        .an-list::-webkit-scrollbar-thumb { background: rgba(184,149,42,0.3); }

        .an-item { padding: 12px 16px; border-bottom: 1px solid rgba(184,149,42,0.08); transition: background 0.15s; }
        .an-item:hover { background: rgba(184,149,42,0.04); }
        .an-item.unread { border-left: 3px solid #b8952a; padding-left: 13px; background: rgba(184,149,42,0.03); }
        .an-item-top { display: flex; justify-content: space-between; margin-bottom: 3px; }
        .an-item-title { font-size: 10px; font-weight: 700; color: #b8952a; letter-spacing: 0.08em; text-transform: uppercase; }
        .an-item-time { font-size: 9px; color: ${muted}; }
        .an-item-msg { font-size: 13px; color: ${text}; font-weight: 600; margin-bottom: 3px; }
        .an-item-detail { font-size: 10px; color: ${muted}; line-height: 1.6; }

        .an-empty { padding: 36px 16px; text-align: center; color: ${muted}; }
        .an-empty-icon { font-size: 32px; margin-bottom: 10px; }
        .an-empty-text { font-size: 12px; line-height: 1.6; letter-spacing: 0.04em; }

        .an-footer { padding: 10px 16px; border-top: 1px solid ${border}; flex-shrink: 0; display: flex; gap: 6px; }
        .an-foot-btn {
          flex: 1; padding: 7px; border: 1px solid ${border}; color: ${muted};
          background: none; font-family: 'Jost',sans-serif; font-size: 9px;
          font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase;
          cursor: pointer; transition: all 0.2s;
        }
        .an-foot-btn:hover { border-color: #b8952a; color: #b8952a; }
        .an-foot-btn.gold { background: #b8952a; border-color: #b8952a; color: #fff; }
        .an-foot-btn.gold:hover { background: #a07d20; }

        /* ── Toasts — below navbar (top: 70px), not blocking theme button ── */
        .an-toasts {
          position: fixed; top: 70px; right: 16px;
          z-index: 99999; width: 300px;
          display: flex; flex-direction: column; gap: 8px;
          pointer-events: none;
        }
        .an-toast {
          background: ${bg}; border: 1px solid #b8952a;
          border-left: 4px solid #b8952a; padding: 13px 15px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.35);
          pointer-events: all; position: relative;
          animation: anToast 0.4s cubic-bezier(0.34,1.56,0.64,1);
        }
        @keyframes anToast { from{opacity:0;transform:translateX(60px)} to{opacity:1;transform:translateX(0)} }
        .an-toast-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; }
        .an-toast-label { font-size: 9px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: #b8952a; }
        .an-toast-x { background:none; border:none; color:${muted}; cursor:pointer; font-size:15px; padding:0; line-height:1; }
        .an-toast-msg { font-size: 13px; color: ${text}; font-weight: 700; margin-bottom: 3px; }
        .an-toast-detail { font-size: 10px; color: ${muted}; line-height: 1.5; }
        .an-toast-bar { height: 3px; background: #b8952a; margin-top: 10px; transform-origin: left; animation: anBar 7s linear forwards; }
        @keyframes anBar { from{transform:scaleX(1)} to{transform:scaleX(0)} }

        @media(max-width:500px) {
          .an-wrap { right: 14px; bottom: 88px; }
          .an-panel { width: calc(100vw - 40px); right: -10px; }
          .an-toasts { width: calc(100vw - 24px); right: 12px; top: 65px; }
        }
      `}</style>

      {/* Toasts */}
      <div className="an-toasts">
        {toasts.map(t => (
          <div key={t._id} className="an-toast">
            <div className="an-toast-top">
              <div className="an-toast-label">🏨 {t.title}</div>
              <button className="an-toast-x" onClick={() => dismissToast(t._id)}>✕</button>
            </div>
            <div className="an-toast-msg">{t.message}</div>
            <div className="an-toast-detail">{t.detail}</div>
            <div className="an-toast-bar"/>
          </div>
        ))}
      </div>

      {/* Bell + Panel */}
      <div className="an-wrap" ref={panelRef}>
        <button
          className={`an-bell ${unreadCount > 0 ? "has-unread" : ""}`}
          onClick={() => {
            const opening = !open;
            setOpen(opening);
            if (opening) {
              if (unreadCount > 0) markRead();
              if (Notification.permission === "default") Notification.requestPermission();
            }
          }}
          title={`Notifications${unreadCount > 0 ? ` (${unreadCount} new)` : ""}`}
        >
          🔔
          {unreadCount > 0 && (
            <span className="an-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
          )}
        </button>

        {open && (
          <div className="an-panel">
            <div className="an-hdr">
              <div className="an-hdr-left">
                <div className="an-hdr-title">🔔 Notifications</div>
                {unreadCount > 0 && <span className="an-unread-pill">{unreadCount} new</span>}
              </div>
              <div className="an-hdr-btns">
                <button className="an-hbtn" onClick={markRead}>✓ Read</button>
                <button className="an-hbtn red" onClick={clearAll}>✕ Clear</button>
              </div>
            </div>

            <div className="an-list">
              {notifications.length === 0 ? (
                <div className="an-empty">
                  <div className="an-empty-icon">🔕</div>
                  <div className="an-empty-text">
                    No notifications yet.<br/>
                    New bookings appear here automatically.
                  </div>
                </div>
              ) : (
                notifications.map((n, i) => (
                  <div key={i} className={`an-item ${!n.read ? "unread" : ""}`}>
                    <div className="an-item-top">
                      <div className="an-item-title">🏨 {n.title}</div>
                      <div className="an-item-time">{fmtTime(n.timestamp)}</div>
                    </div>
                    <div className="an-item-msg">{n.message}</div>
                    <div className="an-item-detail">{n.detail}</div>
                  </div>
                ))
              )}
            </div>

            <div className="an-footer">
              {Notification.permission === "default" && (
                <button className="an-foot-btn gold" onClick={() => Notification.requestPermission()}>
                  🔔 Enable Desktop Popups
                </button>
              )}
              <button className="an-foot-btn" onClick={() => { sendTest(); }}>
                🧪 Test Notification
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}