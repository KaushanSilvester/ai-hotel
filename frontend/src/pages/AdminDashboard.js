import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// ─── Theme ────────────────────────────────────────────────────────────────────
const THEMES = {
  dark:  { pageBg:"#0a0a0a", sidebarBg:"#0d0d0d", cardBg:"#111", inputBg:"#1a1a1a", border:"rgba(255,255,255,0.08)", divider:"rgba(255,255,255,0.06)", textPrimary:"#fff", textSecondary:"rgba(255,255,255,0.55)", textMuted:"rgba(255,255,255,0.3)", tableBg:"#0d0d0d", tableHover:"rgba(255,255,255,0.03)", inputBorder:"rgba(255,255,255,0.1)", toggleBg:"rgba(255,255,255,0.06)", toggleBorder:"rgba(255,255,255,0.12)" },
  light: { pageBg:"#f5f0e8", sidebarBg:"#faf7f2", cardBg:"#fff", inputBg:"#f0ebe0", border:"rgba(26,20,16,0.09)", divider:"rgba(26,20,16,0.07)", textPrimary:"#1a1410", textSecondary:"rgba(26,20,16,0.55)", textMuted:"rgba(26,20,16,0.35)", tableBg:"#faf7f2", tableHover:"rgba(26,20,16,0.03)", inputBorder:"rgba(26,20,16,0.12)", toggleBg:"rgba(26,20,16,0.06)", toggleBorder:"rgba(26,20,16,0.14)" },
};

const API = (path) => `http://localhost:8000/api/admin-panel${path}`;
const useAuth = () => ({ token: localStorage.getItem("token"), headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icon = ({ d, size=16 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>);
const Icons = {
  dash:     "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
  rooms:    "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10",
  bookings: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  users:    "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M12 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  reviews:  "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  logout:   "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
  plus:     "M12 5v14M5 12h14",
  edit:     "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  trash:    "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
  search:   "M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0",
  eye:      "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
};

// ─── Reusable components ──────────────────────────────────────────────────────
function Badge({ label, color, bg }) {
  return <span style={{padding:"2px 10px",fontSize:"9px",fontWeight:600,letterSpacing:"0.15em",textTransform:"uppercase",color,background:bg}}>{label}</span>;
}

function Btn({ children, onClick, variant="gold", disabled=false, small=false }) {
  const styles = {
    gold:    { background:"#b8952a", color:"#fff", border:"none" },
    ghost:   { background:"transparent", color:"rgba(184,149,42,0.8)", border:"1px solid rgba(184,149,42,0.3)" },
    danger:  { background:"transparent", color:"rgba(220,38,38,0.75)", border:"1px solid rgba(220,38,38,0.25)" },
    muted:   { background:"transparent", color:"rgba(255,255,255,0.4)", border:"1px solid rgba(255,255,255,0.1)" },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{
      ...styles[variant],
      padding: small ? "5px 12px" : "9px 20px",
      fontFamily:"'Jost',sans-serif", fontSize: small ? "9px" : "10px",
      fontWeight:600, letterSpacing:"0.15em", textTransform:"uppercase",
      cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1,
      transition:"all 0.2s", display:"inline-flex", alignItems:"center", gap:6,
    }}>
      {children}
    </button>
  );
}

function StatCard({ label, value, sub, gold=false, T }) {
  return (
    <div style={{background:T.cardBg,border:`1px solid ${T.border}`,padding:"22px 20px",transition:"border-color 0.2s",cursor:"default"}}
      onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(184,149,42,0.4)"}
      onMouseLeave={e=>e.currentTarget.style.borderColor=T.border}>
      <div style={{fontSize:"9px",letterSpacing:"0.2em",textTransform:"uppercase",color:T.textMuted,marginBottom:10}}>{label}</div>
      <div style={{fontFamily:"'Bodoni Moda',Georgia,serif",fontSize:gold?24:32,fontWeight:400,color:gold?"#b8952a":T.textPrimary,lineHeight:1,marginBottom:4,fontOpticalSizing:"auto"}}>{value}</div>
      {sub&&<div style={{fontSize:"10px",color:T.textMuted,letterSpacing:"0.08em"}}>{sub}</div>}
    </div>
  );
}

function SectionHeader({ label, title, action, T }) {
  return (
    <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:16}}>
      <div>
        <div style={{fontSize:"9px",letterSpacing:"0.3em",textTransform:"uppercase",color:"#b8952a",marginBottom:6}}>{label}</div>
        <div style={{fontFamily:"'Bodoni Moda',Georgia,serif",fontSize:22,fontWeight:400,fontStyle:"italic",color:T.textPrimary,fontOpticalSizing:"auto"}}>{title}</div>
      </div>
      {action}
    </div>
  );
}

function Table({ cols, rows, T }) {
  return (
    <div style={{overflowX:"auto"}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
        <thead>
          <tr>
            {cols.map(c=>(
              <th key={c} style={{padding:"10px 14px",textAlign:"left",fontSize:"9px",letterSpacing:"0.18em",textTransform:"uppercase",color:T.textMuted,borderBottom:`1px solid ${T.border}`,fontWeight:600,whiteSpace:"nowrap"}}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row,i)=>(
            <tr key={i} style={{borderBottom:`1px solid ${T.divider}`,transition:"background 0.15s"}}
              onMouseEnter={e=>e.currentTarget.style.background=T.tableHover}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              {row.map((cell,j)=>(
                <td key={j} style={{padding:"12px 14px",color:T.textSecondary,verticalAlign:"middle",whiteSpace:j===0?"nowrap":"normal"}}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length===0&&(
        <div style={{textAlign:"center",padding:"40px",color:T.textMuted,fontSize:12,letterSpacing:"0.08em"}}>No records found</div>
      )}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children, T }) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20}}>
      <div style={{background:T.cardBg,border:`1px solid ${T.border}`,padding:32,width:"100%",maxWidth:520,maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24}}>
          <div style={{fontFamily:"'Bodoni Moda',Georgia,serif",fontSize:20,fontWeight:400,fontStyle:"italic",color:T.textPrimary,fontOpticalSizing:"auto"}}>{title}</div>
          <button onClick={onClose} style={{background:"none",border:"none",color:T.textMuted,fontSize:20,cursor:"pointer",lineHeight:1}}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Main AdminDashboard ──────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();
  const { headers } = useAuth();

  const [theme,setTheme]   = useState(()=>localStorage.getItem("lp_theme")||"dark");
  const T = THEMES[theme];
  const toggleTheme = ()=>{ const n=theme==="dark"?"light":"dark"; setTheme(n); localStorage.setItem("lp_theme",n); };

  const [tab,setTab]           = useState("overview");
  const [stats,setStats]       = useState(null);
  const [bookings,setBookings] = useState([]);
  const [rooms,setRooms]       = useState([]);
  const [users,setUsers]       = useState([]);
  const [reviews,setReviews]   = useState([]);
  const [search,setSearch]     = useState("");
  const [loading,setLoading]   = useState(false);

  // Room form modal
  const [roomModal,setRoomModal]   = useState(false);
  const [editRoom,setEditRoom]     = useState(null);
  const [roomForm,setRoomForm]     = useState({ room_number:"",room_type:"double",price:"",capacity:2,available:true,floor:"",bed_type:"King Bed",wifi:false,ac:false,tv:false,balcony:false,minibar:false,sea_view:false,breakfast_included:false,jacuzzi:false });

  const fetchStats    = useCallback(()=>{ axios.get(API("/stats/"),{headers}).then(r=>setStats(r.data)).catch(()=>{}); },[]);
  const fetchBookings = useCallback(()=>{ setLoading(true); axios.get(API("/reservations/"),{headers,params:{search}}).then(r=>setBookings(r.data)).catch(()=>setBookings([])).finally(()=>setLoading(false)); },[search]);
  const fetchRooms    = useCallback(()=>{ axios.get(API("/rooms/"),{headers}).then(r=>setRooms(r.data)).catch(()=>{}); },[]);
  const fetchUsers    = useCallback(()=>{ axios.get(API("/users/"),{headers}).then(r=>setUsers(r.data)).catch(()=>{}); },[]);
  const fetchReviews  = useCallback(()=>{ axios.get(API("/reviews/"),{headers}).then(r=>setReviews(r.data)).catch(()=>{}); },[]);

  useEffect(()=>{ fetchStats(); },[]);
  useEffect(()=>{ if(tab==="bookings") fetchBookings(); },[tab,search]);
  useEffect(()=>{ if(tab==="rooms")    fetchRooms();    },[tab]);
  useEffect(()=>{ if(tab==="users")    fetchUsers();    },[tab]);
  useEffect(()=>{ if(tab==="reviews")  fetchReviews();  },[tab]);

  const paymentColor = (s) => s==="paid" ? {label:"Paid",color:"#4ade80",bg:"rgba(74,222,128,0.1)"} : s==="pay_at_hotel" ? {label:"Pay at Hotel",color:"#b8952a",bg:"rgba(184,149,42,0.1)"} : {label:s,color:T.textMuted,bg:T.border};

  const cancelBooking = async (id) => {
    if(!window.confirm("Delete this reservation?")) return;
    await axios.delete(API(`/reservations/${id}/delete/`),{headers});
    fetchBookings(); fetchStats();
  };

  const deleteRoom = async (id) => {
    if(!window.confirm("Delete this room?")) return;
    await axios.delete(API(`/rooms/${id}/delete/`),{headers});
    fetchRooms(); fetchStats();
  };

  const toggleUser = async (id) => {
    await axios.patch(API(`/users/${id}/toggle/`),{},{headers});
    fetchUsers();
  };

  const deleteReview = async (id) => {
    if(!window.confirm("Delete this review?")) return;
    await axios.delete(API(`/reviews/${id}/delete/`),{headers});
    fetchReviews();
  };

  const openRoomModal = (room=null) => {
    setEditRoom(room);
    setRoomForm(room ? { room_number:room.room_number||"", room_type:room.room_type, price:room.price, capacity:room.capacity, available:room.available, floor:room.floor||"", bed_type:room.bed_type||"King Bed", wifi:room.wifi, ac:room.ac, tv:room.tv, balcony:room.balcony, minibar:room.minibar, sea_view:room.sea_view, breakfast_included:room.breakfast_included, jacuzzi:room.jacuzzi } : { room_number:"",room_type:"double",price:"",capacity:2,available:true,floor:"",bed_type:"King Bed",wifi:false,ac:false,tv:false,balcony:false,minibar:false,sea_view:false,breakfast_included:false,jacuzzi:false });
    setRoomModal(true);
  };

  const saveRoom = async () => {
    try {
      if (editRoom) {
        await axios.patch(API(`/rooms/${editRoom.id}/update/`), roomForm, {headers});
      } else {
        await axios.post(API("/rooms/create/"), roomForm, {headers});
      }
      setRoomModal(false); fetchRooms(); fetchStats();
    } catch(e) { alert(e?.response?.data?.error||"Error saving room."); }
  };

  const handleLogout = () => { localStorage.removeItem("token"); localStorage.removeItem("username"); navigate("/login"); };

  // ── Sidebar nav ────────────────────────────────────────────────────────────
  const NAV = [
    { id:"overview", label:"Overview",     icon:Icons.dash },
    { id:"bookings", label:"Bookings",     icon:Icons.bookings },
    { id:"rooms",    label:"Rooms",        icon:Icons.rooms },
    { id:"users",    label:"Guests",       icon:Icons.users },
    { id:"reviews",  label:"Reviews",      icon:Icons.reviews },
  ];

  const inp = { width:"100%", padding:"9px 12px", border:`1px solid ${T.inputBorder}`, background:T.inputBg, color:T.textPrimary, fontSize:12, fontFamily:"'Jost',sans-serif", outline:"none", transition:"border-color 0.2s", letterSpacing:"0.03em" };
  const chk = { marginRight:6, accentColor:"#b8952a" };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;1,6..96,400&family=Jost:wght@300;400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'Jost',sans-serif;background:${T.pageBg};transition:background 0.4s;}
        .adm-root{display:flex;height:100vh;overflow:hidden;background:${T.pageBg};font-family:'Jost',sans-serif;transition:background 0.4s;}
        .adm-sidebar{width:220px;flex-shrink:0;background:${T.sidebarBg};border-right:1px solid ${T.border};display:flex;flex-direction:column;transition:background 0.4s,border-color 0.4s;}
        .adm-sidebar-logo{padding:24px 22px;border-bottom:1px solid ${T.divider};font-family:'Bodoni Moda',Georgia,serif;font-size:17px;font-weight:400;letter-spacing:0.15em;text-transform:uppercase;color:${T.textPrimary};font-optical-sizing:auto;}
        .adm-sidebar-logo span{display:block;font-family:'Jost',sans-serif;font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:#b8952a;margin-top:3px;}
        .adm-nav{flex:1;padding:16px 0;overflow-y:auto;}
        .adm-nav-item{display:flex;align-items:center;gap:10px;padding:11px 22px;font-size:11px;font-weight:500;letter-spacing:0.08em;color:${T.textMuted};cursor:pointer;transition:all 0.15s;border-left:2px solid transparent;}
        .adm-nav-item:hover{color:${T.textPrimary};background:rgba(184,149,42,0.04);}
        .adm-nav-item.active{color:#b8952a;border-left-color:#b8952a;background:rgba(184,149,42,0.06);}
        .adm-sidebar-bottom{padding:16px 22px;border-top:1px solid ${T.divider};}
        .adm-main{flex:1;display:flex;flex-direction:column;overflow:hidden;}
        .adm-topbar{background:${T.cardBg};border-bottom:1px solid ${T.border};padding:0 28px;height:56px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;transition:background 0.4s,border-color 0.4s;}
        .adm-topbar-title{font-size:12px;font-weight:500;letter-spacing:0.12em;text-transform:uppercase;color:${T.textMuted};}
        .adm-content{flex:1;overflow-y:auto;padding:28px;}
        .theme-btn{display:flex;align-items:center;gap:6px;background:${T.toggleBg};border:1px solid ${T.toggleBorder};color:${T.textMuted};padding:5px 12px;border-radius:20px;cursor:pointer;font-family:'Jost',sans-serif;font-size:10px;letter-spacing:0.1em;transition:all 0.2s;}
        .theme-btn:hover{border-color:#b8952a;color:#b8952a;}
        .toggle-pill{width:30px;height:16px;border-radius:8px;background:${theme==="dark"?"#1a1a1a":"#e0d8cc"};border:1px solid ${theme==="dark"?"rgba(255,255,255,0.1)":"rgba(26,20,16,0.15)"};display:flex;align-items:center;padding:2px;transition:background 0.3s;}
        .toggle-knob{width:10px;height:10px;border-radius:50%;background:#b8952a;transform:translateX(${theme==="dark"?"0":"14px"});transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1);}
        .stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:2px;margin-bottom:24px;}
        .gold-line{height:1px;background:linear-gradient(to right,transparent,#b8952a,transparent);margin-bottom:2px;}
        .search-wrap{position:relative;display:inline-flex;align-items:center;}
        .search-icon{position:absolute;left:10px;color:${T.textMuted};}
        input[type=search]::-webkit-search-cancel-button{display:none;}
        @media(max-width:900px){.adm-sidebar{display:none;}.stats-grid{grid-template-columns:1fr 1fr;}}
      `}</style>

      <div className="adm-root">

        {/* ── SIDEBAR ── */}
        <aside className="adm-sidebar">
          <div className="adm-sidebar-logo">
            🏨 HotelAI
            <span>Admin Panel</span>
          </div>
          <nav className="adm-nav">
            {NAV.map(n=>(
              <div key={n.id} className={`adm-nav-item ${tab===n.id?"active":""}`} onClick={()=>setTab(n.id)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {n.icon.split("M").filter(Boolean).map((d,i)=><path key={i} d={`M${d}`}/>)}
                </svg>
                {n.label}
              </div>
            ))}
          </nav>
          <div className="adm-sidebar-bottom">
            <div className="adm-nav-item" onClick={handleLogout} style={{color:"rgba(220,38,38,0.6)"}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Sign Out
            </div>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <div className="adm-main">
          <div className="adm-topbar">
            <span className="adm-topbar-title">
              {tab==="overview"?"Dashboard Overview":tab==="bookings"?"Reservation Management":tab==="rooms"?"Room Management":tab==="users"?"Guest Management":"Review Management"}
            </span>
            <div style={{display:"flex",gap:10,alignItems:"center"}}>
              <button className="theme-btn" onClick={toggleTheme}>
                <span>{theme==="dark"?"🌙":"☀️"}</span>
                <div className="toggle-pill"><div className="toggle-knob"/></div>
              </button>
              <Btn variant="ghost" small onClick={()=>navigate("/rooms")}>← Back to Site</Btn>
            </div>
          </div>

          <div className="adm-content">

            {/* ── OVERVIEW ── */}
            {tab==="overview"&&(
              <>
                <SectionHeader label="Dashboard" title="Overview" T={T}/>
                <div className="stats-grid">
                  <StatCard label="Total Reservations" value={stats?.total_reservations??'—'} sub="all time" T={T}/>
                  <StatCard label="Monthly Revenue"    value={stats ? `Rs. ${Math.round(stats.monthly_revenue).toLocaleString()}` : '—'} gold sub="this month" T={T}/>
                  <StatCard label="Occupancy Rate"     value={stats ? `${stats.occupancy_rate}%` : '—'} sub="currently occupied" T={T}/>
                  <StatCard label="Total Guests"       value={stats?.total_users??'—'} sub="registered users" T={T}/>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:2,marginBottom:24}}>
                  <StatCard label="Check-ins Today"  value={stats?.checkins_today??'—'}  T={T}/>
                  <StatCard label="Check-outs Today" value={stats?.checkouts_today??'—'} T={T}/>
                  <StatCard label="Available Rooms"  value={stats ? `${stats.available_rooms}/${stats.total_rooms}` : '—'} T={T}/>
                  <StatCard label="Avg Rating"       value={stats ? `${parseFloat(stats.avg_rating).toFixed(1)}★` : '—'} gold T={T}/>
                </div>

                {/* Revenue chart */}
                <div className="gold-line"/>
                <div style={{background:T.cardBg,border:`1px solid ${T.border}`,padding:24,marginTop:2}}>
                  <div style={{fontSize:"9px",letterSpacing:"0.25em",textTransform:"uppercase",color:"#b8952a",marginBottom:16}}>Revenue — Last 7 Days</div>
                  {stats?.revenue_chart&&(()=>{
                    const max = Math.max(...stats.revenue_chart.map(d=>d.revenue), 1);
                    return (
                      <div style={{display:"flex",gap:4,alignItems:"flex-end",height:100}}>
                        {stats.revenue_chart.map((d,i)=>(
                          <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
                            <div style={{width:"100%",background:"rgba(184,149,42,0.12)",display:"flex",alignItems:"flex-end",height:80,border:`1px solid ${T.border}`}}>
                              <div style={{width:"100%",background:"#b8952a",height:`${d.revenue/max*100}%`,transition:"height 0.5s",opacity:0.85}}/>
                            </div>
                            <div style={{fontSize:"8px",color:T.textMuted,letterSpacing:"0.05em"}}>{d.date.slice(5)}</div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </>
            )}

            {/* ── BOOKINGS ── */}
            {tab==="bookings"&&(
              <>
                <SectionHeader label="Management" title="All Reservations" T={T}
                  action={
                    <div className="search-wrap">
                      <span className="search-icon"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
                      <input type="search" placeholder="Search guest or room…" value={search} onChange={e=>setSearch(e.target.value)} style={{...inp,paddingLeft:32,width:220}}/>
                    </div>
                  }
                />
                <div className="gold-line"/>
                <div style={{background:T.tableBg,border:`1px solid ${T.border}`,marginTop:2}}>
                  <Table T={T}
                    cols={["#","Guest","Room","Check-in","Check-out","Nights","Guests","Payment","Status","Actions"]}
                    rows={bookings.map(b=>{
                      const nights = Math.round((new Date(b.check_out)-new Date(b.check_in))/(1000*60*60*24));
                      const ps     = paymentColor(b.payment_status);
                      return [
                        <span style={{color:T.textMuted,fontSize:11}}>#{b.id}</span>,
                        <div><div style={{fontWeight:600,color:T.textPrimary,fontSize:12}}>{b.username}</div><div style={{fontSize:10,color:T.textMuted}}>{b.email}</div></div>,
                        <div><div style={{fontWeight:500,color:T.textPrimary,fontSize:12}}>{b.room_type}</div>{b.room_number&&<div style={{fontSize:10,color:T.textMuted}}>Room {b.room_number}</div>}</div>,
                        b.check_in,
                        b.check_out,
                        nights,
                        b.guests,
                        <span style={{fontSize:10,color:T.textMuted,textTransform:"capitalize"}}>{b.payment_method?.replace("_"," ")}</span>,
                        <Badge label={ps.label} color={ps.color} bg={ps.bg}/>,
                        <div style={{display:"flex",gap:6}}>
                          {b.payment_status!=="paid"&&(
                            <Btn small variant="ghost" onClick={async()=>{ await axios.patch(API(`/reservations/${b.id}/update/`),{payment_status:"paid"},{headers}); fetchBookings(); }}>✓ Mark Paid</Btn>
                          )}
                          <Btn small variant="danger" onClick={()=>cancelBooking(b.id)}>Delete</Btn>
                        </div>
                      ];
                    })}
                  />
                </div>
              </>
            )}

            {/* ── ROOMS ── */}
            {tab==="rooms"&&(
              <>
                <SectionHeader label="Management" title="Rooms & Suites" T={T}
                  action={<Btn onClick={()=>openRoomModal()}>+ Add Room</Btn>}
                />
                <div className="gold-line"/>
                <div style={{background:T.tableBg,border:`1px solid ${T.border}`,marginTop:2}}>
                  <Table T={T}
                    cols={["Room","Type","Floor","Capacity","Price/Night","Rating","Availability","Actions"]}
                    rows={rooms.map(r=>[
                      <div><div style={{fontWeight:600,color:T.textPrimary}}>Room {r.room_number||r.id}</div><div style={{fontSize:10,color:T.textMuted}}>{r.bed_type}</div></div>,
                      <span style={{textTransform:"capitalize",fontSize:11}}>{r.room_type}</span>,
                      r.floor||"—",
                      r.capacity,
                      `Rs. ${parseFloat(r.price).toLocaleString()}`,
                      <span style={{color:"#b8952a"}}>★ {parseFloat(r.rating).toFixed(1)}</span>,
                      <Badge label={r.available?"Available":"Unavailable"} color={r.available?"#4ade80":"rgba(220,38,38,0.7)"} bg={r.available?"rgba(74,222,128,0.1)":"rgba(220,38,38,0.08)"}/>,
                      <div style={{display:"flex",gap:6}}>
                        <Btn small variant="ghost" onClick={()=>openRoomModal(r)}>Edit</Btn>
                        <Btn small variant="danger" onClick={()=>deleteRoom(r.id)}>Delete</Btn>
                      </div>
                    ])}
                  />
                </div>
              </>
            )}

            {/* ── USERS ── */}
            {tab==="users"&&(
              <>
                <SectionHeader label="Management" title="Registered Guests" T={T}/>
                <div className="gold-line"/>
                <div style={{background:T.tableBg,border:`1px solid ${T.border}`,marginTop:2}}>
                  <Table T={T}
                    cols={["Guest","Email","Joined","Bookings","Total Spent","Status","Actions"]}
                    rows={users.map(u=>[
                      <span style={{fontWeight:600,color:T.textPrimary,fontSize:12}}>{u.username}</span>,
                      <span style={{color:T.textMuted,fontSize:11}}>{u.email||"—"}</span>,
                      <span style={{fontSize:11}}>{new Date(u.date_joined).toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric"})}</span>,
                      u.booking_count,
                      <span style={{color:"#b8952a"}}>Rs. {Math.round(u.total_spent).toLocaleString()}</span>,
                      <Badge label={u.is_active?"Active":"Inactive"} color={u.is_active?"#4ade80":"rgba(220,38,38,0.6)"} bg={u.is_active?"rgba(74,222,128,0.1)":"rgba(220,38,38,0.07)"}/>,
                      <Btn small variant={u.is_active?"danger":"ghost"} onClick={()=>toggleUser(u.id)}>{u.is_active?"Deactivate":"Activate"}</Btn>
                    ])}
                  />
                </div>
              </>
            )}

            {/* ── REVIEWS ── */}
            {tab==="reviews"&&(
              <>
                <SectionHeader label="Management" title="Guest Reviews" T={T}/>
                <div className="gold-line"/>
                <div style={{background:T.tableBg,border:`1px solid ${T.border}`,marginTop:2}}>
                  <Table T={T}
                    cols={["Guest","Room","Rating","Title","Comment","Date","Actions"]}
                    rows={reviews.map(r=>[
                      <span style={{fontWeight:600,color:T.textPrimary,fontSize:12}}>{r.username}</span>,
                      <span style={{fontSize:11,textTransform:"capitalize"}}>{r.room_type}</span>,
                      <span style={{color:"#b8952a",fontWeight:600}}>{r.rating}★</span>,
                      <span style={{fontSize:11}}>{r.title||"—"}</span>,
                      <span style={{fontSize:11,color:T.textMuted,maxWidth:220,display:"block",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.comment}</span>,
                      <span style={{fontSize:11}}>{new Date(r.created_at).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</span>,
                      <Btn small variant="danger" onClick={()=>deleteReview(r.id)}>Delete</Btn>
                    ])}
                  />
                </div>
              </>
            )}

          </div>
        </div>
      </div>

      {/* ── ROOM MODAL ── */}
      {roomModal&&(
        <Modal title={editRoom?"Edit Room":"Add New Room"} onClose={()=>setRoomModal(false)} T={T}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            {[["Room Number","room_number","text"],["Price/Night","price","number"],["Capacity","capacity","number"],["Floor","floor","number"]].map(([label,key,type])=>(
              <div key={key}>
                <div style={{fontSize:"9px",letterSpacing:"0.18em",textTransform:"uppercase",color:T.textMuted,marginBottom:6}}>{label}</div>
                <input type={type} value={roomForm[key]} onChange={e=>setRoomForm(f=>({...f,[key]:e.target.value}))} style={inp} onFocus={e=>e.target.style.borderColor="#b8952a"} onBlur={e=>e.target.style.borderColor=T.inputBorder}/>
              </div>
            ))}
            <div>
              <div style={{fontSize:"9px",letterSpacing:"0.18em",textTransform:"uppercase",color:T.textMuted,marginBottom:6}}>Room Type</div>
              <select value={roomForm.room_type} onChange={e=>setRoomForm(f=>({...f,room_type:e.target.value}))} style={{...inp,cursor:"pointer"}}>
                {["single","double","suite","deluxe","family","penthouse"].map(t=><option key={t} value={t} style={{background:T.cardBg}}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <div style={{fontSize:"9px",letterSpacing:"0.18em",textTransform:"uppercase",color:T.textMuted,marginBottom:6}}>Bed Type</div>
              <select value={roomForm.bed_type} onChange={e=>setRoomForm(f=>({...f,bed_type:e.target.value}))} style={{...inp,cursor:"pointer"}}>
                {["Single Bed","Double Bed","Queen Bed","King Bed","Twin Beds"].map(t=><option key={t} value={t} style={{background:T.cardBg}}>{t}</option>)}
              </select>
            </div>
          </div>
          <div style={{marginTop:16}}>
            <div style={{fontSize:"9px",letterSpacing:"0.18em",textTransform:"uppercase",color:T.textMuted,marginBottom:10}}>Amenities & Flags</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
              {[["wifi","WiFi"],["ac","AC"],["tv","TV"],["balcony","Balcony"],["minibar","Minibar"],["sea_view","Sea View"],["breakfast_included","Breakfast"],["jacuzzi","Jacuzzi"],["available","Available"]].map(([key,label])=>(
                <label key={key} style={{display:"flex",alignItems:"center",gap:7,fontSize:12,color:T.textSecondary,cursor:"pointer"}}>
                  <input type="checkbox" checked={roomForm[key]||false} onChange={e=>setRoomForm(f=>({...f,[key]:e.target.checked}))} style={chk}/>
                  {label}
                </label>
              ))}
            </div>
          </div>
          <div style={{display:"flex",gap:10,marginTop:24,justifyContent:"flex-end"}}>
            <Btn variant="muted" onClick={()=>setRoomModal(false)}>Cancel</Btn>
            <Btn onClick={saveRoom}>{editRoom?"Save Changes":"Create Room"}</Btn>
          </div>
        </Modal>
      )}
    </>
  );
}