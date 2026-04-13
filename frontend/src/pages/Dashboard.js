import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function nightsBetween(a,b){ const d=(new Date(b)-new Date(a))/(1000*60*60*24); return d>0?Math.round(d):0; }
function statusOf(checkIn,checkOut){
  const today=new Date(); today.setHours(0,0,0,0);
  const inDate=new Date(checkIn), outDate=new Date(checkOut);
  if(today<inDate)  return {label:"Upcoming",  color:"#b8952a",  bg:"rgba(184,149,42,0.1)"};
  if(today>outDate) return {label:"Completed", color:"rgba(255,255,255,0.35)", bg:"rgba(255,255,255,0.05)"};
  return                   {label:"Active",    color:"#4ade80",  bg:"rgba(74,222,128,0.1)"};
}

const THEMES = {
  dark:  { pageBg:"#0a0a0a", cardBg:"#0d0d0d", statBg:"#111", inputBg:"#1a1a1a", border:"rgba(255,255,255,0.08)", divider:"rgba(255,255,255,0.06)", textPrimary:"#fff", textSecondary:"rgba(255,255,255,0.55)", textMuted:"rgba(255,255,255,0.3)", skeletonBg:"rgba(255,255,255,0.05)", emptyBg:"#0d0d0d", toggleBg:"rgba(255,255,255,0.06)", toggleBorder:"rgba(255,255,255,0.12)", toggleColor:"rgba(255,255,255,0.7)", navBg:"rgba(10,10,10,0.95)" },
  light: { pageBg:"#f5f0e8", cardBg:"#faf7f2", statBg:"#f0ebe0", inputBg:"#f0ebe0", border:"rgba(26,20,16,0.09)", divider:"rgba(26,20,16,0.07)", textPrimary:"#1a1410", textSecondary:"rgba(26,20,16,0.55)", textMuted:"rgba(26,20,16,0.35)", skeletonBg:"rgba(26,20,16,0.05)", emptyBg:"#faf7f2", toggleBg:"rgba(26,20,16,0.06)", toggleBorder:"rgba(26,20,16,0.14)", toggleColor:"rgba(26,20,16,0.65)", navBg:"rgba(245,240,232,0.97)" },
};

export default function Dashboard() {
  const navigate   = useNavigate();
  const token      = localStorage.getItem("token");
  const username   = localStorage.getItem("username");

  const [theme,setTheme] = useState(()=>localStorage.getItem("lp_theme")||"dark");
  const T = THEMES[theme];
  const toggleTheme=()=>{ const n=theme==="dark"?"light":"dark"; setTheme(n); localStorage.setItem("lp_theme",n); };

  const [bookings,setBookings]     = useState([]);
  const [loading,setLoading]       = useState(true);
  const [cancelling,setCancelling] = useState(null);

  const fetchBookings=()=>{
    setLoading(true);
    axios.get("http://localhost:8000/api/my-bookings/",{headers:{Authorization:`Bearer ${token}`}})
      .then(res=>setBookings(res.data)).catch(()=>setBookings([])).finally(()=>setLoading(false));
  };
  useEffect(()=>{ if(token) fetchBookings(); },[]);

  const handleCancel=async(id)=>{
    if(!window.confirm("Cancel this reservation?"))return;
    setCancelling(id);
    try{ await axios.delete(`http://localhost:8000/api/cancel/${id}/`,{headers:{Authorization:`Bearer ${token}`}}); fetchBookings(); }
    catch{}finally{setCancelling(null);}
  };

  const upcoming  = bookings.filter(b=>new Date(b.check_in)>new Date());
  const completed = bookings.filter(b=>new Date(b.check_out)<new Date());
  const totalSpent = bookings.reduce((s,b)=>{ const n=nightsBetween(b.check_in,b.check_out); return s+(parseFloat(b.price_per_night||0)*n); },0);

  const stats = [
    {label:"Total Bookings", value:bookings.length, sub:"all time"},
    {label:"Upcoming",       value:upcoming.length,  sub:"reservations"},
    {label:"Completed",      value:completed.length, sub:"stays"},
    {label:"Total Spent",    value:`Rs. ${Math.round(totalSpent).toLocaleString()}`, sub:"across all stays", gold:true},
  ];

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
        .dash-root{font-family:'Jost', 'Gill Sans', sans-serif;background:${T.pageBg};min-height:100vh;transition:background 0.4s;}
        .dash-topbar{background:${T.navBg};border-bottom:1px solid ${T.border};padding:0 40px;height:60px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:50;backdrop-filter:blur(12px);transition:background 0.4s,border-color 0.4s;}
        .dash-logo{font-family:'Bodoni Moda','Didot','Playfair Display',Georgia,serif;font-optical-sizing:auto;font-optical-sizing:auto;font-size:18px;font-weight:400;letter-spacing:0.2em;text-transform:uppercase;color:${T.textPrimary};text-decoration:none;transition:color 0.4s;}
        .theme-btn{display:flex;align-items:center;gap:7px;background:${T.toggleBg};border:1px solid ${T.toggleBorder};color:${T.toggleColor};padding:6px 12px;border-radius:20px;cursor:pointer;font-family:'Jost', 'Gill Sans', sans-serif;font-size:10px;letter-spacing:0.1em;transition:all 0.3s;}
        .theme-btn:hover{border-color:#b8952a;color:#b8952a;}
        .toggle-pill{width:34px;height:18px;border-radius:9px;background:${theme==="dark"?"#1a1a1a":"#e0d8cc"};border:1px solid ${theme==="dark"?"rgba(255,255,255,0.1)":"rgba(26,20,16,0.15)"};display:flex;align-items:center;padding:2px;transition:background 0.3s;}
        .toggle-knob{width:12px;height:12px;border-radius:50%;background:#b8952a;transform:translateX(${theme==="dark"?"0":"16px"});transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1);}
        .dash-body{max-width:1000px;margin:0 auto;padding:36px 28px;}
        .dash-header{margin-bottom:32px;}
        .dash-eyebrow{font-size:9px;letter-spacing:0.3em;text-transform:uppercase;color:#b8952a;margin-bottom:8px;}
        .dash-title{font-family:'Bodoni Moda','Didot','Playfair Display',Georgia,serif;font-optical-sizing:auto;font-optical-sizing:auto;font-size:clamp(28px,4vw,40px);font-weight:400;color:${T.textPrimary};margin-bottom:4px;transition:color 0.4s;}
        .dash-sub{font-size:11px;color:${T.textMuted};letter-spacing:0.08em;transition:color 0.4s;}
        .stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:2px;margin-bottom:32px;}
        .stat-card{background:${T.statBg};border:1px solid ${T.border};padding:22px 20px;transition:background 0.4s,border-color 0.4s;}
        .stat-card:hover{border-color:rgba(184,149,42,0.3);}
        .stat-label{font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:${T.textMuted};margin-bottom:10px;transition:color 0.4s;}
        .stat-value{font-family:'Bodoni Moda','Didot','Playfair Display',Georgia,serif;font-optical-sizing:auto;font-optical-sizing:auto;font-size:36px;font-weight:400;color:${T.textPrimary};line-height:1;margin-bottom:4px;transition:color 0.4s;}
        .stat-value.gold{color:#b8952a;font-size:26px;}
        .stat-sub{font-size:10px;color:${T.textMuted};letter-spacing:0.08em;transition:color 0.4s;}
        .section-eyebrow{font-size:9px;letter-spacing:0.3em;text-transform:uppercase;color:#b8952a;margin-bottom:10px;}
        .section-heading{font-family:'Bodoni Moda','Didot','Playfair Display',Georgia,serif;font-optical-sizing:auto;font-optical-sizing:auto;font-size:24px;font-weight:400;font-style:italic;color:${T.textPrimary};margin-bottom:20px;transition:color 0.4s;}
        .gold-line{height:1px;background:linear-gradient(to right,transparent,#b8952a,transparent);margin-bottom:2px;}
        .booking-card{background:${T.cardBg};border:1px solid ${T.border};border-left:3px solid #b8952a;padding:22px 24px;margin-bottom:2px;transition:background 0.4s,border-color 0.4s;}
        .booking-card:hover{border-color:rgba(184,149,42,0.4);}
        .booking-card.completed{border-left-color:${T.textMuted};}
        .booking-card.active{border-left-color:#4ade80;}
        .bc-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:14px;gap:12px;}
        .bc-room-name{font-family:'Bodoni Moda','Didot','Playfair Display',Georgia,serif;font-optical-sizing:auto;font-optical-sizing:auto;font-size:20px;font-weight:400;font-style:italic;color:${T.textPrimary};margin-bottom:2px;transition:color 0.4s;}
        .bc-room-num{font-size:10px;letter-spacing:0.12em;color:${T.textMuted};transition:color 0.4s;}
        .status-pill{padding:3px 12px;font-size:9px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;white-space:nowrap;flex-shrink:0;}
        .bc-details{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px;}
        .bc-detail{display:flex;align-items:center;gap:6px;font-size:11px;color:${T.textSecondary};background:rgba(184,149,42,0.06);border:1px solid rgba(184,149,42,0.15);padding:5px 12px;letter-spacing:0.04em;transition:color 0.4s;}
        .bc-special{font-size:11px;color:${T.textMuted};background:${T.statBg};border:1px solid ${T.border};padding:9px 14px;margin-bottom:14px;letter-spacing:0.03em;font-style:italic;transition:all 0.4s;}
        .bc-footer{display:flex;align-items:center;justify-content:space-between;padding-top:14px;border-top:1px solid ${T.divider};}
        .bc-total-label{font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:${T.textMuted};margin-bottom:4px;transition:color 0.4s;}
        .bc-total{font-family:'Bodoni Moda','Didot','Playfair Display',Georgia,serif;font-optical-sizing:auto;font-optical-sizing:auto;font-size:24px;font-weight:400;color:#b8952a;}
        .btn-cancel{padding:9px 20px;background:transparent;border:1px solid rgba(220,38,38,0.3);color:rgba(220,38,38,0.7);font-family:'Jost', 'Gill Sans', sans-serif;font-size:9px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;cursor:pointer;transition:all 0.2s;}
        .btn-cancel:hover:not(:disabled){border-color:rgba(220,38,38,0.6);color:"#dc2626";}
        .btn-cancel:disabled{opacity:0.4;cursor:not-allowed;}
        .btn-view{padding:9px 20px;background:transparent;border:1px solid ${T.border};color:${T.textMuted};font-family:'Jost', 'Gill Sans', sans-serif;font-size:9px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;cursor:pointer;transition:all 0.2s;}
        .btn-view:hover{border-color:#b8952a;color:#b8952a;}
        .empty-state{text-align:center;padding:80px 20px;background:${T.emptyBg};border:1px solid ${T.border};transition:background 0.4s;}
        .empty-icon{font-size:36px;margin-bottom:16px;opacity:0.35;}
        .empty-title{font-family:'Bodoni Moda','Didot','Playfair Display',Georgia,serif;font-optical-sizing:auto;font-optical-sizing:auto;font-size:24px;font-weight:400;font-style:italic;color:${T.textPrimary};margin-bottom:8px;transition:color 0.4s;}
        .empty-sub{font-size:11px;color:${T.textMuted};letter-spacing:0.08em;margin-bottom:24px;transition:color 0.4s;}
        .browse-btn{display:inline-block;padding:13px 32px;background:#b8952a;color:#fff;border:none;font-family:'Jost', 'Gill Sans', sans-serif;font-size:10px;font-weight:600;letter-spacing:0.22em;text-transform:uppercase;cursor:pointer;transition:background 0.2s;text-decoration:none;}
        .browse-btn:hover{background:#a07d20;}
        @keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.4;}}
        .skeleton{background:${T.skeletonBg};height:100px;margin-bottom:2px;animation:pulse 1.5s ease-in-out infinite;}
        @media(max-width:768px){.stats-grid{grid-template-columns:1fr 1fr;}.dash-topbar{padding:0 20px;}.dash-body{padding:24px 16px;}}
      `}</style>

      <div className="dash-root">
        {/* Topbar */}
        <div className="dash-topbar">
          <a href="/" className="dash-logo">🏨 HotelAI</a>
          <button className="theme-btn" onClick={toggleTheme}>
            <span style={{fontSize:13}}>{theme==="dark"?"🌙":"☀️"}</span>
            <div className="toggle-pill"><div className="toggle-knob"/></div>
          </button>
        </div>

        <div className="dash-body">
          {/* Header */}
          <div className="dash-header">
            <div className="dash-eyebrow">Member Portal</div>
            <div className="dash-title">Welcome back, {username}</div>
            <div className="dash-sub">Your reservations and stay history</div>
          </div>

          {/* Stats */}
          <div className="stats-grid">
            {stats.map(s=>(
              <div key={s.label} className="stat-card">
                <div className="stat-label">{s.label}</div>
                <div className={`stat-value ${s.gold?"gold":""}`}>{s.value}</div>
                <div className="stat-sub">{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Bookings */}
          <div className="section-eyebrow">Reservations</div>
          <div className="section-heading">My Bookings</div>
          <div className="gold-line"/>

          {loading ? (
            <><div className="skeleton"/><div className="skeleton"/></>
          ) : bookings.length===0 ? (
            <div className="empty-state">
              <div className="empty-icon">🏨</div>
              <div className="empty-title">No reservations yet</div>
              <div className="empty-sub">Explore our rooms and book your perfect stay</div>
              <a href="/rooms" className="browse-btn">Browse Rooms →</a>
            </div>
          ) : (
            bookings.map(b=>{
              const nights  = nightsBetween(b.check_in, b.check_out);
              const total   = parseFloat(b.price_per_night||0)*nights;
              const status  = statusOf(b.check_in, b.check_out);
              const isUpcoming = status.label==="Upcoming";
              return (
                <div key={b.id} className={`booking-card ${status.label.toLowerCase()}`}>
                  <div className="bc-top">
                    <div>
                      <div className="bc-room-name">{b.room_type||b.room}</div>
                      {b.room_number&&<div className="bc-room-num">Room {b.room_number}</div>}
                    </div>
                    <span className="status-pill" style={{color:status.color,background:status.bg}}>{status.label}</span>
                  </div>

                  <div className="bc-details">
                    <div className="bc-detail">📅 {b.check_in} → {b.check_out}</div>
                    <div className="bc-detail">🌙 {nights} night{nights!==1?"s":""}</div>
                    {b.guests&&<div className="bc-detail">👥 {b.guests} guest{b.guests!==1?"s":""}</div>}
                    {b.price_per_night&&<div className="bc-detail">Rs. {parseFloat(b.price_per_night).toLocaleString()} /night</div>}
                    {b.payment_status&&(
                      <div className="bc-detail" style={{color:b.payment_status==="paid"?"#4ade80":"#b8952a"}}>
                        {b.payment_status==="paid"?"✓ Paid":"🏨 Pay at Hotel"}
                      </div>
                    )}
                  </div>

                  {b.special_requests&&(
                    <div className="bc-special">💬 {b.special_requests}</div>
                  )}

                  <div className="bc-footer">
                    <div>
                      <div className="bc-total-label">{b.payment_status==="pay_at_hotel"?"Due at hotel":"Total paid"}</div>
                      <div className="bc-total">Rs. {total ? Math.round(total*1.1).toLocaleString() : "—"}</div>
                    </div>
                    <div style={{display:"flex",gap:8}}>
                      <button className="btn-view" onClick={()=>navigate(`/room/${b.room_id}`)}>View Room</button>
                      {isUpcoming&&(
                        <button className="btn-cancel" onClick={()=>handleCancel(b.id)} disabled={cancelling===b.id}>
                          {cancelling===b.id?"Cancelling…":"Cancel"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}