import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// ─── Icons ─────────────────────────────────────────────────────────────────────
const CalIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const UsersIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
  </svg>
);
const RoomIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const PriceIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);
const NoteIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);

// ─── Helpers ───────────────────────────────────────────────────────────────────
function nightsBetween(checkIn, checkOut) {
  const diff = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24);
  return diff > 0 ? diff : 0;
}

function statusLabel(checkIn, checkOut) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const inDate  = new Date(checkIn);
  const outDate = new Date(checkOut);
  if (today < inDate)  return { label: "Upcoming",   color: "#2563eb", bg: "#eff6ff" };
  if (today > outDate) return { label: "Completed",  color: "#16a34a", bg: "#f0fdf4" };
  return                      { label: "Active",     color: "#d97706", bg: "#fffbeb" };
}

// ─── Component ────────────────────────────────────────────────────────────────
function Dashboard() {
  const navigate   = useNavigate();
  const [bookings, setBookings]  = useState([]);
  const [loading,  setLoading]   = useState(true);
  const [cancelling, setCancelling] = useState(null);
  const username = localStorage.getItem("username");
  const token    = localStorage.getItem("token");

  const fetchBookings = () => {
    setLoading(true);
    axios.get("http://localhost:8000/api/my-bookings/", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setBookings(res.data))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { if (token) fetchBookings(); }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    setCancelling(id);
    try {
      await axios.delete(`http://localhost:8000/api/cancel/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBookings();
    } catch {
      alert("Cancel failed. Please try again.");
    } finally {
      setCancelling(null);
    }
  };

  // Summary stats
  const upcoming  = bookings.filter(b => new Date(b.check_in)  > new Date());
  const completed = bookings.filter(b => new Date(b.check_out) < new Date());
  const totalSpent = bookings.reduce((sum, b) => {
    const nights = nightsBetween(b.check_in, b.check_out);
    return sum + (parseFloat(b.price_per_night || 0) * nights);
  }, 0);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #eef2f7; }

        .dash-root {
          font-family: 'DM Sans', sans-serif;
          background: #eef2f7;
          min-height: 100vh;
          padding: 28px 20px;
          max-width: 1000px;
          margin: 0 auto;
        }

        /* ── HEADER ── */
        .dash-header { margin-bottom: 28px; }
        .dash-welcome { font-size: 26px; font-weight: 800; color: #111827; margin-bottom: 4px; }
        .dash-sub { font-size: 14px; color: #6b7280; }

        /* ── STATS ROW ── */
        .stats-row { display: flex; gap: 16px; margin-bottom: 28px; flex-wrap: wrap; }
        .stat-card {
          flex: 1; min-width: 150px;
          background: #fff; border-radius: 14px; padding: 18px 20px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
        }
        .stat-label { font-size: 12.5px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px; }
        .stat-value { font-size: 28px; font-weight: 800; color: #111827; }
        .stat-sub   { font-size: 12px; color: #6b7280; margin-top: 2px; }

        /* ── SECTION TITLE ── */
        .section-title { font-size: 16px; font-weight: 700; color: #111827; margin-bottom: 16px; }

        /* ── BOOKING CARD ── */
        .booking-card {
          background: #fff; border-radius: 16px; padding: 20px 22px;
          margin-bottom: 14px; box-shadow: 0 2px 12px rgba(0,0,0,0.06);
          border-left: 4px solid #2563eb;
          transition: box-shadow 0.2s;
        }
        .booking-card:hover { box-shadow: 0 6px 24px rgba(0,0,0,0.1); }
        .booking-card.completed { border-left-color: #9ca3af; }
        .booking-card.active    { border-left-color: #d97706; }

        .bc-top {
          display: flex; align-items: flex-start; justify-content: space-between;
          margin-bottom: 14px; gap: 12px;
        }
        .bc-room-name { font-size: 17px; font-weight: 700; color: #111827; margin-bottom: 3px; }
        .bc-room-num  { font-size: 12.5px; color: #6b7280; }

        .status-pill {
          padding: 4px 12px; border-radius: 20px;
          font-size: 12px; font-weight: 700;
          white-space: nowrap; flex-shrink: 0;
        }

        .bc-details {
          display: flex; flex-wrap: wrap; gap: 12px;
          margin-bottom: 14px;
        }
        .bc-detail-item {
          display: flex; align-items: center; gap: 6px;
          font-size: 13px; color: #4b5563; font-weight: 500;
          background: #f9fafb; padding: 6px 12px;
          border-radius: 8px; border: 1px solid #e5e7eb;
        }

        .bc-special {
          display: flex; align-items: flex-start; gap: 6px;
          font-size: 13px; color: #6b7280;
          background: #f9fafb; border-radius: 8px; padding: 8px 12px;
          margin-bottom: 14px; border: 1px solid #e5e7eb;
        }

        .bc-footer {
          display: flex; align-items: center; justify-content: space-between;
          padding-top: 12px; border-top: 1px solid #f3f4f6;
        }
        .bc-total { font-size: 18px; font-weight: 800; color: #111827; }
        .bc-total-label { font-size: 12px; color: #9ca3af; margin-bottom: 2px; }

        .btn-cancel {
          padding: 9px 20px;
          background: #fff; border: 1.5px solid #fca5a5;
          color: #dc2626; border-radius: 10px;
          font-size: 13.5px; font-weight: 700;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer; transition: all 0.15s;
        }
        .btn-cancel:hover:not(:disabled) { background: #fef2f2; border-color: #f87171; }
        .btn-cancel:disabled { opacity: 0.5; cursor: not-allowed; }

        .btn-view {
          padding: 9px 20px;
          background: #eff6ff; border: 1.5px solid #bfdbfe;
          color: #2563eb; border-radius: 10px;
          font-size: 13.5px; font-weight: 700;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer; transition: all 0.15s;
        }
        .btn-view:hover { background: #dbeafe; }

        /* ── EMPTY ── */
        .empty-state {
          text-align: center; padding: 60px 20px; background: #fff;
          border-radius: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.06);
        }
        .empty-state h3 { font-size: 18px; font-weight: 700; color: #111827; margin-bottom: 8px; }
        .empty-state p  { font-size: 14px; color: #6b7280; margin-bottom: 20px; }
        .btn-browse {
          display: inline-block; padding: 12px 28px;
          background: #2563eb; color: #fff; border: none;
          border-radius: 10px; font-size: 14px; font-weight: 700;
          font-family: 'DM Sans', sans-serif; cursor: pointer;
          box-shadow: 0 4px 14px rgba(37,99,235,0.3); transition: background 0.15s;
        }
        .btn-browse:hover { background: #1d4ed8; }

        /* ── LOADING ── */
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        .skeleton {
          background: #e5e7eb; border-radius: 12px; height: 120px;
          margin-bottom: 14px; animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(220,38,38,0.3); border-top-color: #dc2626;
          border-radius: 50%; display: inline-block;
          animation: spin 0.7s linear infinite; margin-right: 6px; vertical-align: middle;
        }
      `}</style>

      <div className="dash-root">

        {/* Header */}
        <div className="dash-header">
          <div className="dash-welcome">👋 Welcome back, {username}!</div>
          <div className="dash-sub">Here's an overview of all your reservations.</div>
        </div>

        {/* Stats */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-label">Total Bookings</div>
            <div className="stat-value">{bookings.length}</div>
            <div className="stat-sub">all time</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Upcoming</div>
            <div className="stat-value">{upcoming.length}</div>
            <div className="stat-sub">reservations</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Completed</div>
            <div className="stat-value">{completed.length}</div>
            <div className="stat-sub">stays</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Spent</div>
            <div className="stat-value" style={{ fontSize: 20 }}>Rs. {Math.round(totalSpent).toLocaleString()}</div>
            <div className="stat-sub">across all bookings</div>
          </div>
        </div>

        {/* Bookings */}
        <div className="section-title">My Bookings</div>

        {loading ? (
          <>
            <div className="skeleton" />
            <div className="skeleton" />
          </>
        ) : bookings.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: 48, marginBottom: 14 }}>🏨</div>
            <h3>No bookings yet</h3>
            <p>Browse our rooms and book your perfect stay!</p>
            <button className="btn-browse" onClick={() => navigate("/")}>Browse Rooms</button>
          </div>
        ) : (
          bookings.map(b => {
            const nights = nightsBetween(b.check_in, b.check_out);
            const total  = parseFloat(b.price_per_night || 0) * nights;
            const status = statusLabel(b.check_in, b.check_out);
            const isUpcoming = status.label === "Upcoming";

            return (
              <div key={b.id} className={`booking-card ${status.label.toLowerCase()}`}>

                {/* Top row */}
                <div className="bc-top">
                  <div>
                    <div className="bc-room-name">{b.room_type || b.room}</div>
                    {b.room_number && <div className="bc-room-num">Room {b.room_number}</div>}
                  </div>
                  <span className="status-pill" style={{ color: status.color, background: status.bg }}>
                    {status.label}
                  </span>
                </div>

                {/* Details */}
                <div className="bc-details">
                  <div className="bc-detail-item">
                    <CalIcon /> Check-in: <strong>{b.check_in}</strong>
                  </div>
                  <div className="bc-detail-item">
                    <CalIcon /> Check-out: <strong>{b.check_out}</strong>
                  </div>
                  <div className="bc-detail-item">
                    <CalIcon /> {nights} night{nights !== 1 ? "s" : ""}
                  </div>
                  {b.guests && (
                    <div className="bc-detail-item">
                      <UsersIcon /> {b.guests} guest{b.guests !== 1 ? "s" : ""}
                    </div>
                  )}
                  {b.price_per_night && (
                    <div className="bc-detail-item">
                      <PriceIcon /> Rs. {parseFloat(b.price_per_night).toLocaleString()} /night
                    </div>
                  )}
                </div>

                {/* Special requests */}
                {b.special_requests && (
                  <div className="bc-special">
                    <NoteIcon style={{ marginTop: 1, flexShrink: 0 }} />
                    <span><strong>Special requests:</strong> {b.special_requests}</span>
                  </div>
                )}

                {/* Footer */}
                <div className="bc-footer">
                  <div>
                    <div className="bc-total-label">Total (incl. 10% tax)</div>
                    <div className="bc-total">
                      Rs. {total ? Math.round(total * 1.1).toLocaleString() : "—"}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button className="btn-view" onClick={() => navigate(`/room/${b.room_id}`)}>
                      View Room
                    </button>
                    {isUpcoming && (
                      <button
                        className="btn-cancel"
                        onClick={() => handleCancel(b.id)}
                        disabled={cancelling === b.id}
                      >
                        {cancelling === b.id && <span className="spinner" />}
                        {cancelling === b.id ? "Cancelling…" : "Cancel"}
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })
        )}

      </div>
    </>
  );
}

export default Dashboard;