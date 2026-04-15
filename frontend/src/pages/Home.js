import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// ─── Icons ────────────────────────────────────────────────────────────────────
const FilterIcon  = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>);
const UsersIcon   = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>);
const ExpandIcon  = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>);
const StarIcon    = ({filled}) => (<svg width="13" height="13" viewBox="0 0 24 24" fill={filled?"#b8952a":"none"} stroke="#b8952a" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>);
const CalIcon     = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>);
const SparkleIcon = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>);

// ─── Amenity icons ────────────────────────────────────────────────────────────
const AMENITY_ICONS = {
  "WiFi":"📶","TV":"📺","Mini Bar":"🍸","Balcony":"🌅","Ocean View":"🌊",
  "Work Desk":"💼","Air Conditioning":"❄️","Pool":"🏊","Gym":"🏋️","Spa":"💆",
  "Parking":"🅿️","Breakfast":"🍳","Pet Friendly":"🐾","Safe":"🔒","Bathtub":"🛁","Jacuzzi":"♨️","Sea View":"🌊",
};

const ROOM_TYPES     = ["Single","Double","Suite","Deluxe","Family","Penthouse"];
const AMENITIES_LIST = ["WiFi","TV","Mini Bar","Balcony","Ocean View","Work Desk","Air Conditioning","Breakfast","Jacuzzi"];

const DEMO_ROOMS = [
  { id:1, room_type:"Ocean View Suite",    capacity:2, price:22000, area:45, image:"https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80", amenities:["Ocean View","WiFi","Mini Bar","TV","Balcony"], rating:4.8, reviews:124, ai_recommended:true },
  { id:2, room_type:"Deluxe Double Room",  capacity:2, price:18000, area:35, image:"https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=600&q=80", amenities:["WiFi","TV","Work Desk","Air Conditioning"], rating:4.6, reviews:89,  ai_recommended:false },
  { id:3, room_type:"Superior Single Room",capacity:1, price:11000, area:25, image:"https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=600&q=80", amenities:["WiFi","TV","Air Conditioning"], rating:4.3, reviews:56, ai_recommended:false },
];

function normalizeRoom(room) {
  if (Array.isArray(room.amenities) && room.amenities.length > 0) return room;
  const amenities = [];
  if (room.wifi)               amenities.push("WiFi");
  if (room.ac)                 amenities.push("Air Conditioning");
  if (room.tv)                 amenities.push("TV");
  if (room.balcony)            amenities.push("Balcony");
  if (room.minibar)            amenities.push("Mini Bar");
  if (room.sea_view)           amenities.push("Ocean View");
  if (room.breakfast_included) amenities.push("Breakfast");
  if (room.jacuzzi)            amenities.push("Jacuzzi");
  if (room.safe)               amenities.push("Safe");
  if (room.bathtub)            amenities.push("Bathtub");
  if (room.pet_friendly)       amenities.push("Pet Friendly");
  return { ...room, amenities, area:room.size_sqm||room.area||null, reviews:room.total_reviews||room.reviews||0, rating:parseFloat(room.rating)||0, price:parseFloat(room.price)||0, image:room.image||room.image2||room.image3||room.image4||null };
}

// ─── Theme tokens (mirrors LandingPage) ──────────────────────────────────────
const THEMES = {
  dark: {
    pageBg:"#0a0a0a", sidebarBg:"#0d0d0d", cardBg:"#0d0d0d", headerBg:"#111",
    inputBg:"#1a1a1a", inputBorder:"rgba(255,255,255,0.1)",
    textPrimary:"#fff", textSecondary:"rgba(255,255,255,0.6)", textMuted:"rgba(255,255,255,0.35)",
    border:"rgba(255,255,255,0.08)", divider:"rgba(255,255,255,0.06)",
    checkboxBorder:"rgba(255,255,255,0.2)", checkboxBg:"transparent",
    tagBg:"rgba(255,255,255,0.06)", tagBorder:"rgba(255,255,255,0.1)", tagColor:"rgba(255,255,255,0.7)",
    extraBg:"rgba(184,149,42,0.1)", extraColor:"#b8952a",
    priceBg:"transparent", priceColor:"#fff",
    placeholderBg:"linear-gradient(135deg,#1a1a1a,#111)",
    emptyBg:"#0d0d0d", emptyBorder:"rgba(255,255,255,0.06)",
    sortBg:"#1a1a1a", icon:"🌙", label:"Light",
    toggleBg:"rgba(255,255,255,0.08)", toggleBorder:"rgba(255,255,255,0.15)", toggleColor:"rgba(255,255,255,0.8)",
  },
  light: {
    pageBg:"#f5f0e8", sidebarBg:"#faf7f2", cardBg:"#fff", headerBg:"#faf7f2",
    inputBg:"#f0ebe0", inputBorder:"rgba(26,20,16,0.12)",
    textPrimary:"#1a1410", textSecondary:"rgba(26,20,16,0.55)", textMuted:"rgba(26,20,16,0.35)",
    border:"rgba(26,20,16,0.08)", divider:"rgba(26,20,16,0.06)",
    checkboxBorder:"rgba(26,20,16,0.25)", checkboxBg:"#fff",
    tagBg:"rgba(26,20,16,0.04)", tagBorder:"rgba(26,20,16,0.1)", tagColor:"rgba(26,20,16,0.6)",
    extraBg:"rgba(184,149,42,0.1)", extraColor:"#8a6e1e",
    priceBg:"transparent", priceColor:"#1a1410",
    placeholderBg:"linear-gradient(135deg,#e8e0d0,#d8cfc0)",
    emptyBg:"#faf7f2", emptyBorder:"rgba(26,20,16,0.08)",
    sortBg:"#f0ebe0", icon:"☀️", label:"Dark",
    toggleBg:"rgba(26,20,16,0.07)", toggleBorder:"rgba(26,20,16,0.15)", toggleColor:"rgba(26,20,16,0.7)",
  },
};

function Home() {
  const navigate = useNavigate();

  // 🔥 Sync theme with LandingPage via localStorage
  const [theme, setTheme] = useState(() => localStorage.getItem("lp_theme") || "dark");
  const T = THEMES[theme];
  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("lp_theme", next);
  };

  const [rooms,         setRooms]         = useState(DEMO_ROOMS);
  const [favorites,     setFavorites]     = useState([]);
  const [sortBy,        setSortBy]        = useState("price-asc");
  const [bookingStatus, setBookingStatus] = useState({});

  // 🔥 AI Recommendation state
  const [aiQuery,       setAiQuery]       = useState("");
  const [aiLoading,     setAiLoading]     = useState(false);
  const [aiResults,     setAiResults]     = useState(null);
  const [aiMessage,     setAiMessage]     = useState("");

  // 🔥 Personalised history-based recommendations
  const [historyRecs,     setHistoryRecs]     = useState(null);
  const [historyLoading,  setHistoryLoading]  = useState(false);
  const [showHistoryRecs, setShowHistoryRecs] = useState(true);
  const [checkIn,       setCheckIn]       = useState("2026-02-15");
  const [checkOut,      setCheckOut]      = useState("2026-02-18");
  const [guests,        setGuests]        = useState(2);
  const [minPrice,      setMinPrice]      = useState(0);
  const [maxPrice,      setMaxPrice]      = useState(50000);
  const [selectedTypes,     setSelectedTypes]     = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8000/api/rooms/")
      .then(res => { if (res.data?.length) setRooms(res.data.map(normalizeRoom)); })
      .catch(() => {});
  }, []);

  // 🔥 Fetch personalised recommendations if user is logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setHistoryLoading(true);
    axios.get("http://localhost:8000/api/recommendations/", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setHistoryRecs(res.data))
      .catch(() => setHistoryRecs(null))
      .finally(() => setHistoryLoading(false));
  }, []);

  const clearFilters = () => {
    setGuests(1); setMinPrice(0); setMaxPrice(50000);
    setSelectedTypes([]); setSelectedAmenities([]);
    setCheckIn(""); setCheckOut("");
  };

  // 🔥 AI Room Recommendation Engine
  const getAiRecommendations = () => {
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    setAiResults(null);

    const query = aiQuery.toLowerCase();

    // Score each room based on query keywords
    const scored = rooms.map(room => {
      let score = 0;
      const amenities = (room.amenities || []).map(a => a.toLowerCase());
      const type      = (room.room_type || "").toLowerCase();
      const desc      = (room.description || "").toLowerCase();

      // Budget keywords → prefer lower price
      if (/budget|cheap|afford|low.?price|economical|value/.test(query)) {
        const maxP = Math.max(...rooms.map(r => parseFloat(r.price)));
        score += (1 - parseFloat(room.price) / maxP) * 30;
      }
      // Luxury keywords → prefer higher price
      if (/luxury|premium|best|top|finest|special|suite|vip|lavish/.test(query)) {
        const maxP = Math.max(...rooms.map(r => parseFloat(r.price)));
        score += (parseFloat(room.price) / maxP) * 30;
      }
      // Guest count
      const guestMatch = query.match(/(\d+)\s*(people|persons?|guests?|adults?)/);
      if (guestMatch) {
        const needed = parseInt(guestMatch[1]);
        if (room.capacity >= needed) score += 25;
        else score -= 20;
      }
      // Solo / single
      if (/solo|alone|single|myself|just me|1 person/.test(query)) {
        if (room.capacity === 1) score += 25;
        else if (room.capacity === 2) score += 10;
      }
      // Couple / romantic
      if (/couple|romantic|honeymoon|anniversary|partner|spouse|wife|husband|two of us/.test(query)) {
        if (room.capacity === 2) score += 25;
        if (amenities.includes("balcony") || amenities.includes("sea view") || amenities.includes("ocean view")) score += 15;
        if (/suite/.test(type)) score += 10;
      }
      // Family
      if (/family|kids|children|family room|4 people/.test(query)) {
        if (room.capacity >= 3) score += 30;
        if (/family/.test(type)) score += 10;
      }
      // View keywords
      if (/sea view|ocean view|view|scenery|scenic/.test(query)) {
        if (amenities.includes("sea view") || amenities.includes("ocean view") || room.sea_view) score += 25;
      }
      // Specific amenities
      if (/jacuzzi|hot tub/.test(query))   { if (amenities.includes("jacuzzi") || room.jacuzzi)   score += 20; }
      if (/balcony|terrace/.test(query))   { if (amenities.includes("balcony") || room.balcony)   score += 20; }
      if (/breakfast/.test(query))         { if (amenities.includes("breakfast") || room.breakfast_included) score += 20; }
      if (/minibar|mini.?bar/.test(query)) { if (amenities.includes("mini bar") || room.minibar)  score += 15; }
      if (/bathtub|bath/.test(query))      { if (amenities.includes("bathtub") || room.bathtub)   score += 15; }
      if (/pet|dog|cat/.test(query))       { if (room.pet_friendly) score += 25; }
      // Room type mentions
      if (query.includes("suite"))        { if (/suite/.test(type)) score += 20; }
      if (query.includes("single"))       { if (/single/.test(type)) score += 20; }
      if (query.includes("double"))       { if (/double/.test(type)) score += 20; }
      if (query.includes("deluxe"))       { if (/deluxe/.test(type)) score += 20; }
      if (query.includes("penthouse"))    { if (/penthouse/.test(type)) score += 25; }
      // Rating preference
      if (/best.*review|highly rated|top rated|popular/.test(query)) {
        score += (parseFloat(room.rating) || 0) * 5;
      }
      // Business / work
      if (/business|work|desk|meeting|conference/.test(query)) {
        if (amenities.includes("work desk") || amenities.includes("wifi")) score += 15;
      }
      // Always add base score for available rooms
      if (room.available !== false) score += 5;

      return { ...room, aiScore: score };
    });

    // Sort by score and take top matches
    const top = scored
      .filter(r => r.aiScore > 0)
      .sort((a, b) => b.aiScore - a.aiScore)
      .slice(0, 3);

    // Generate a natural message
    let message = "";
    if (top.length === 0) {
      message = "I could not find a strong match for that query. Try describing what you are looking for differently, or browse all rooms below.";
    } else if (/budget|cheap|afford/.test(query)) {
      message = "Here are our most affordable options that match your needs:";
    } else if (/luxury|best|suite|premium/.test(query)) {
      message = "Here are our finest rooms for your stay:";
    } else if (/couple|romantic|honeymoon/.test(query)) {
      message = "Perfect choices for a romantic stay:";
    } else if (/family|kids/.test(query)) {
      message = "Great options for your family:";
    } else {
      message = "Based on your preferences, here are my top recommendations:";
    }

    setTimeout(() => {
      setAiResults(top);
      setAiMessage(message);
      setAiLoading(false);
    }, 800); // small delay for "thinking" feel
  };

  const toggleType     = (t) => setSelectedTypes(p     => p.includes(t) ? p.filter(x=>x!==t) : [...p,t]);
  const toggleAmenity  = (a) => setSelectedAmenities(p => p.includes(a) ? p.filter(x=>x!==a) : [...p,a]);
  const toggleFavorite = (id) => setFavorites(p        => p.includes(id) ? p.filter(f=>f!==id) : [...p,id]);

  const filteredRooms = useMemo(() => {
    let r = rooms.filter(room =>
      (maxPrice >= 50000 || room.price <= maxPrice) &&
      room.price >= minPrice && room.capacity >= guests &&
      (selectedTypes.length === 0 || selectedTypes.some(t => room.room_type.toLowerCase().includes(t.toLowerCase()))) &&
      (selectedAmenities.length === 0 || selectedAmenities.every(a => (room.amenities||[]).includes(a)))
    );
    if (sortBy==="price-asc")  r = [...r].sort((a,b)=>a.price-b.price);
    if (sortBy==="price-desc") r = [...r].sort((a,b)=>b.price-a.price);
    if (sortBy==="rating")     r = [...r].sort((a,b)=>(b.rating||0)-(a.rating||0));
    return r;
  }, [rooms,minPrice,maxPrice,guests,selectedTypes,selectedAmenities,sortBy]);

  const handleBooking = (roomId) => {
    const token = localStorage.getItem("token");
    const room  = rooms.find(r => r.id === roomId);
    if (!token) { navigate("/login"); return; }
    if (!checkIn || !checkOut) {
      setBookingStatus(p => ({...p,[roomId]:"no_dates"}));
      setTimeout(() => setBookingStatus(p => { const n={...p}; delete n[roomId]; return n; }), 3000);
      return;
    }
    const nights = (new Date(checkOut)-new Date(checkIn))/(1000*60*60*24);
    if (nights <= 0) {
      setBookingStatus(p => ({...p,[roomId]:"bad_dates"}));
      setTimeout(() => setBookingStatus(p => { const n={...p}; delete n[roomId]; return n; }), 3000);
      return;
    }
    navigate("/payment", { state:{ room, checkIn, checkOut, guests } });
  };

  const renderStars = (rating) =>
    Array.from({length:5},(_,i) => <StarIcon key={i} filled={i < Math.round(rating)} />);

  // ── Input style helper ────────────────────────────────────────────────────
  const inputStyle = {
    width:"100%", padding:"9px 10px 9px 34px",
    border:`1.5px solid ${T.inputBorder}`, borderRadius:8,
    fontSize:13, fontFamily:"'Jost', 'Gill Sans', sans-serif",
    color:T.textPrimary, background:T.inputBg, outline:"none",
    transition:"border-color 0.2s, background 0.2s",
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
        body { font-family: 'Jost', 'Gill Sans', sans-serif; background: ${T.pageBg}; transition: background 0.4s; }

        .home-root {
          font-family: 'Jost', 'Gill Sans', sans-serif;
          min-height: 100vh; background: ${T.pageBg};
          padding: 24px 28px; display: flex; gap: 24px;
          transition: background 0.4s;
        }

        /* ── PAGE HEADER ── */
        .home-header {
          grid-column: 1/-1;
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 28px;
        }
        .home-header-left {}
        .home-page-label {
          font-size: 10px; letter-spacing: 0.3em; text-transform: uppercase;
          color: #b8952a; margin-bottom: 6px;
        }
        .home-page-title {
          font-family: 'Bodoni Moda', 'Didot', 'Playfair Display', Georgia, serif; font-optical-sizing: auto;
          font-size: 32px; font-weight: 400; font-style: italic;
          color: ${T.textPrimary}; transition: color 0.4s;
        }

        /* theme toggle */
        .home-theme-btn {
          display: flex; align-items: center; gap: 7px;
          background: ${T.toggleBg}; border: 1.5px solid ${T.toggleBorder};
          color: ${T.toggleColor}; padding: 8px 16px;
          border-radius: 24px; cursor: pointer;
          font-family: 'Jost', 'Gill Sans', sans-serif;
          font-size: 11px; font-weight: 500; letter-spacing: 0.1em;
          transition: all 0.3s;
        }
        .home-theme-btn:hover { border-color: #b8952a; color: #b8952a; }

        /* toggle pill */
        .toggle-pill {
          width: 38px; height: 20px; border-radius: 10px;
          background: ${theme==="dark" ? "#1a1a1a" : "#e0d8cc"};
          border: 1.5px solid ${theme==="dark" ? "rgba(255,255,255,0.15)" : "rgba(26,20,16,0.2)"};
          position: relative; cursor: pointer; transition: background 0.3s;
          display: flex; align-items: center; padding: 2px;
        }
        .toggle-knob {
          width: 14px; height: 14px; border-radius: 50%;
          background: #b8952a;
          transform: translateX(${theme==="dark"?"0":"18px"});
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
          font-size: 9px; display: flex; align-items: center; justify-content: center;
        }

        /* ── SIDEBAR ── */
        .sidebar {
          width: 260px; flex-shrink: 0;
          background: ${T.sidebarBg};
          border: 1px solid ${T.border};
          border-radius: 2px; padding: 28px 22px;
          height: fit-content; position: sticky; top: 24px;
          transition: background 0.4s, border-color 0.4s;
        }
        .sidebar-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 28px; padding-bottom: 18px;
          border-bottom: 1px solid ${T.divider};
        }
        .sidebar-title {
          display: flex; align-items: center; gap: 8px;
          font-size: 10px; font-weight: 600; letter-spacing: 0.2em;
          text-transform: uppercase; color: #b8952a;
        }
        .clear-btn {
          background: none; border: none; color: ${T.textMuted};
          font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase;
          cursor: pointer; font-family: 'Jost', 'Gill Sans', sans-serif;
          transition: color 0.2s;
        }
        .clear-btn:hover { color: #b8952a; }

        .filter-section { margin-bottom: 22px; }
        .filter-label {
          font-size: 9px; font-weight: 600; letter-spacing: 0.2em;
          text-transform: uppercase; color: ${T.textMuted};
          margin-bottom: 10px; display: block; transition: color 0.4s;
        }
        .divider { height: 1px; background: ${T.divider}; margin: 18px 0; transition: background 0.4s; }

        /* date / number inputs */
        .input-wrap { position: relative; display: flex; align-items: center; margin-bottom: 8px; }
        .input-icon { position: absolute; left: 11px; pointer-events: none; color: ${T.textMuted}; display: flex; }

        /* price slider */
        .price-range-row {
          display: flex; align-items: center; justify-content: space-between;
          margin-top: 10px; font-size: 11px; color: ${T.textSecondary};
          font-weight: 500; transition: color 0.4s;
        }
        .price-range-row span:nth-child(2) { color: #b8952a; }
        input[type=range] { width: 100%; accent-color: #b8952a; cursor: pointer; display: block; margin: 3px 0; }

        /* checkboxes */
        .checkbox-row { display: flex; align-items: center; gap: 10px; margin-bottom: 9px; cursor: pointer; }
        .custom-checkbox {
          width: 15px; height: 15px;
          border: 1.5px solid ${T.checkboxBorder};
          border-radius: 3px; display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; background: ${T.checkboxBg}; transition: all 0.15s;
        }
        .custom-checkbox.checked { background: #b8952a; border-color: #b8952a; }
        .custom-checkbox.checked::after { content: '✓'; color: #fff; font-size: 9px; font-weight: 700; }
        .checkbox-label { font-size: 12px; color: ${T.textSecondary}; letter-spacing: 0.03em; transition: color 0.4s; }
        .amenity-row { display: flex; align-items: center; gap: 8px; margin-bottom: 9px; cursor: pointer; }
        .amenity-icon-sm { font-size: 13px; }

        /* ── MAIN ── */
        .main { flex: 1; min-width: 0; }

        /* Results header */
        .results-header {
          background: ${T.headerBg};
          border: 1px solid ${T.border};
          padding: 18px 24px;
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 20px;
          transition: background 0.4s, border-color 0.4s;
        }
        .results-label { font-size: 9px; letter-spacing: 0.25em; text-transform: uppercase; color: #b8952a; margin-bottom: 5px; }
        .results-title {
          font-family: 'Bodoni Moda', 'Didot', 'Playfair Display', Georgia, serif; font-optical-sizing: auto;
          font-size: 22px; font-weight: 400; font-style: italic;
          color: ${T.textPrimary}; transition: color 0.4s;
        }
        .results-sub { font-size: 11px; color: ${T.textMuted}; letter-spacing: 0.05em; margin-top: 2px; transition: color 0.4s; }
        .sort-wrap { display: flex; align-items: center; gap: 10px; }
        .sort-label { font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: ${T.textMuted}; }
        .sort-select {
          padding: 8px 14px; border: 1px solid ${T.border}; background: ${T.sortBg};
          font-family: 'Jost', 'Gill Sans', sans-serif; font-size: 11px; color: ${T.textPrimary};
          outline: none; cursor: pointer; transition: all 0.2s; letter-spacing: 0.05em;
        }
        .sort-select:focus { border-color: #b8952a; }

        /* ── ROOM CARD ── */
        .room-card {
          background: ${T.cardBg};
          border: 1px solid ${T.border};
          margin-bottom: 2px; display: flex; overflow: hidden; position: relative;
          transition: border-color 0.3s, background 0.4s;
        }
        .room-card:hover { border-color: rgba(184,149,42,0.4); }
        .room-card:hover .room-img { transform: scale(1.04); }

        .room-img-wrap { position: relative; width: 280px; flex-shrink: 0; overflow: hidden; }
        .room-img { width: 100%; height: 100%; object-fit: cover; display: block; cursor: pointer; transition: transform 0.6s ease; }
        .room-img-placeholder {
          width: 100%; height: 100%; min-height: 220px;
          background: ${T.placeholderBg};
          display: flex; align-items: center; justify-content: center;
          font-size: 48px; cursor: pointer;
        }

        /* AI badge */
        .ai-badge {
          position: absolute; top: 12px; left: 12px;
          background: #b8952a; color: #fff;
          font-size: 10px; font-weight: 600; letter-spacing: 0.1em;
          padding: 5px 12px; display: flex; align-items: center; gap: 5px;
          text-transform: uppercase;
        }
        .fav-btn {
          position: absolute; top: 10px; right: 10px;
          background: rgba(0,0,0,0.4); border: none;
          border-radius: 50%; width: 32px; height: 32px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; font-size: 15px;
          backdrop-filter: blur(4px); transition: transform 0.15s;
        }
        .fav-btn:hover { transform: scale(1.15); }
        .expand-btn {
          position: absolute; bottom: 10px; right: 10px;
          background: rgba(0,0,0,0.4); border: none;
          border-radius: 4px; width: 28px; height: 28px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; backdrop-filter: blur(4px); color: #fff;
        }
        .room-number-badge {
          position: absolute; bottom: 10px; left: 10px;
          background: rgba(184,149,42,0.85); color: #fff;
          font-size: 10px; font-weight: 600; letter-spacing: 0.1em;
          padding: 3px 10px; text-transform: uppercase;
        }

        .room-body { padding: 24px 28px; flex: 1; display: flex; flex-direction: column; justify-content: space-between; }
        .room-top  { margin-bottom: 12px; }

        .room-meta {
          display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
          margin-bottom: 10px;
        }
        .room-meta-item {
          display: flex; align-items: center; gap: 5px;
          font-size: 11px; color: ${T.textMuted}; letter-spacing: 0.04em;
          transition: color 0.4s;
        }
        .rating-wrap { display: flex; align-items: center; gap: 4px; }
        .rating-num  { font-size: 12px; font-weight: 600; color: #b8952a; }
        .rating-count { font-size: 11px; color: ${T.textMuted}; transition: color 0.4s; }

        .room-name {
          font-family: 'Bodoni Moda', 'Didot', 'Playfair Display', Georgia, serif; font-optical-sizing: auto;
          font-size: 22px; font-weight: 400; font-style: italic;
          color: ${T.textPrimary}; margin-bottom: 8px;
          transition: color 0.4s;
        }
        .room-desc {
          font-size: 12px; color: ${T.textSecondary}; line-height: 1.7;
          margin-bottom: 12px;
          display: -webkit-box; -webkit-line-clamp: 2;
          -webkit-box-orient: vertical; overflow: hidden;
          font-weight: 300; transition: color 0.4s;
        }

        /* Extra flags */
        .room-extra { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
        .room-extra-item {
          font-size: 10px; font-weight: 500; letter-spacing: 0.08em;
          background: ${T.extraBg}; color: ${T.extraColor};
          padding: 3px 10px; text-transform: uppercase;
          transition: background 0.4s, color 0.4s;
        }

        /* Amenity tags */
        .amenity-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px; }
        .amenity-tag {
          padding: 4px 12px;
          border: 1px solid ${T.tagBorder};
          font-size: 11px; color: ${T.tagColor};
          background: ${T.tagBg}; letter-spacing: 0.04em;
          transition: border-color 0.2s, color 0.2s, background 0.4s;
        }
        .amenity-tag:hover { border-color: #b8952a; color: #b8952a; }

        .room-footer { display: flex; align-items: flex-end; justify-content: space-between; padding-top: 16px; border-top: 1px solid ${T.divider}; }
        .price-from { font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; color: ${T.textMuted}; margin-bottom: 3px; transition: color 0.4s; }
        .price-amt  { font-family: 'Bodoni Moda', 'Didot', 'Playfair Display', Georgia, serif; font-optical-sizing: auto; font-size: 30px; font-weight: 400; color: ${T.textPrimary}; transition: color 0.4s; }
        .price-per  { font-size: 11px; color: ${T.textMuted}; font-weight: 400; transition: color 0.4s; }

        /* Book button */
        .book-btn {
          padding: 12px 28px; background: #b8952a; color: #fff;
          border: none; font-family: 'Jost', 'Gill Sans', sans-serif;
          font-size: 10px; font-weight: 600; letter-spacing: 0.2em;
          text-transform: uppercase; cursor: pointer;
          transition: background 0.2s, transform 0.12s;
        }
        .book-btn:hover  { background: #a07d20; transform: translateY(-1px); }
        .book-btn:active { transform: translateY(0); }
        .book-btn.error  { background: #7a1a1a; letter-spacing: 0.08em; font-size: 10px; }

        /* ── EMPTY STATE ── */
        .empty-state {
          text-align: center; padding: 80px 20px;
          background: ${T.emptyBg}; border: 1px solid ${T.emptyBorder};
          transition: background 0.4s;
        }
        .empty-icon { font-size: 36px; margin-bottom: 16px; opacity: 0.4; }
        .empty-title {
          font-family: 'Bodoni Moda', 'Didot', 'Playfair Display', Georgia, serif; font-optical-sizing: auto;
          font-size: 24px; font-weight: 400; font-style: italic;
          color: ${T.textPrimary}; margin-bottom: 8px;
        }
        .empty-sub { font-size: 12px; color: ${T.textMuted}; letter-spacing: 0.05em; }

        /* gold line */
        .gold-line { height: 1px; background: linear-gradient(to right, transparent, #b8952a, transparent); margin-bottom: 2px; }

        /* ── HISTORY RECOMMENDATIONS PANEL ── */
        .hist-panel {
          background: ${T.cardBg};
          border: 1px solid rgba(184,149,42,0.35);
          border-left: 3px solid #b8952a;
          padding: 22px 24px; margin-bottom: 2px;
          transition: background 0.4s;
        }
        .hist-panel-top {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 16px;
        }
        .hist-panel-left { display: flex; align-items: center; gap: 12px; }
        .hist-badge {
          background: #b8952a; color: #fff;
          font-size: 9px; font-weight: 700; letter-spacing: 0.18em;
          text-transform: uppercase; padding: 4px 10px;
        }
        .hist-title {
          font-family: 'Bodoni Moda', Georgia, serif;
          font-size: 16px; font-weight: 400; font-style: italic;
          color: ${T.textPrimary}; font-optical-sizing: auto;
        }
        .hist-sub { font-size: 11px; color: ${T.textMuted}; letter-spacing: 0.04em; margin-top: 2px; }
        .hist-dismiss {
          background: none; border: none; color: ${T.textMuted};
          cursor: pointer; font-size: 11px; letter-spacing: 0.1em; font-family: 'Jost',sans-serif;
          transition: color 0.2s;
        }
        .hist-dismiss:hover { color: #b8952a; }
        .hist-grid { display: flex; gap: 8px; flex-wrap: wrap; }
        .hist-card {
          flex: 1; min-width: 160px; max-width: 240px;
          border: 1px solid ${T.border};
          cursor: pointer; transition: border-color 0.2s, transform 0.2s;
          background: ${T.inputBg};
          position: relative; overflow: hidden;
        }
        .hist-card:hover { border-color: #b8952a; transform: translateY(-2px); }
        .hist-card img { width: 100%; height: 100px; object-fit: cover; display: block; }
        .hist-card-ph { width:100%; height:100px; display:flex; align-items:center; justify-content:center; font-size:28px; background:${T.border}; }
        .hist-card-body { padding: 10px 12px; }
        .hist-card-name {
          font-family: 'Bodoni Moda', Georgia, serif;
          font-size: 13px; font-weight: 400; font-style: italic;
          color: ${T.textPrimary}; margin-bottom: 2px; font-optical-sizing: auto;
        }
        .hist-card-price { font-size: 11px; color: #b8952a; font-weight: 600; margin-bottom: 4px; }
        .hist-card-reason {
          font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase;
          color: ${T.textMuted}; line-height: 1.4;
        }
        .hist-book-btn {
          width: 100%; padding: 8px; background: #b8952a; color: #fff; border: none;
          font-family: 'Jost', sans-serif; font-size: 9px; font-weight: 600;
          letter-spacing: 0.15em; text-transform: uppercase; cursor: pointer;
          transition: background 0.2s; margin-top: 6px;
        }
        .hist-book-btn:hover { background: #a07d20; }
        .hist-skeleton {
          height: 160px; background: ${T.inputBg};
          border: 1px solid ${T.border};
          animation: histPulse 1.4s ease-in-out infinite; flex: 1; min-width: 160px;
        }
        @keyframes histPulse { 0%,100%{opacity:1;} 50%{opacity:0.4;} }
        .hist-pref-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 14px; }
        .hist-pref-tag {
          font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase;
          padding: 3px 10px; border: 1px solid rgba(184,149,42,0.3);
          color: #b8952a; background: rgba(184,149,42,0.06);
        }

        /* ── AI RECOMMENDATION PANEL ── */
        .ai-panel {
          background: ${T.cardBg};
          border: 1px solid rgba(184,149,42,0.3);
          padding: 22px 24px; margin-bottom: 2px;
          transition: background 0.4s;
        }
        .ai-panel-top {
          display: flex; align-items: center; gap: 10px; margin-bottom: 14px;
        }
        .ai-panel-icon {
          width: 32px; height: 32px; background: #b8952a;
          display: flex; align-items: center; justify-content: center;
          font-size: 15px; flex-shrink: 0;
        }
        .ai-panel-label {
          font-size: 9px; letter-spacing: 0.3em; text-transform: uppercase; color: #b8952a;
        }
        .ai-panel-title {
          font-family: 'Bodoni Moda', Georgia, serif;
          font-size: 15px; font-weight: 400; font-style: italic;
          color: ${T.textPrimary}; font-optical-sizing: auto;
        }
        .ai-input-row { display: flex; gap: 8px; }
        .ai-input {
          flex: 1; padding: 11px 14px;
          border: 1px solid ${T.inputBorder}; background: ${T.inputBg};
          color: ${T.textPrimary}; font-family: 'Jost', sans-serif;
          font-size: 13px; outline: none; letter-spacing: 0.03em;
          transition: border-color 0.2s, background 0.4s;
        }
        .ai-input:focus { border-color: #b8952a; }
        .ai-input::placeholder { color: ${T.textMuted}; }
        .ai-search-btn {
          padding: 11px 22px; background: #b8952a; color: #fff; border: none;
          font-family: 'Jost', sans-serif; font-size: 10px; font-weight: 600;
          letter-spacing: 0.18em; text-transform: uppercase; cursor: pointer;
          transition: background 0.2s; white-space: nowrap; display: flex;
          align-items: center; gap: 7px;
        }
        .ai-search-btn:hover:not(:disabled) { background: #a07d20; }
        .ai-search-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .ai-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
        .ai-chip {
          padding: 4px 12px; font-size: 10px; font-weight: 500; letter-spacing: 0.08em;
          border: 1px solid ${T.border}; color: ${T.textMuted}; cursor: pointer;
          background: ${T.inputBg}; transition: all 0.2s;
        }
        .ai-chip:hover { border-color: #b8952a; color: #b8952a; }
        .ai-results-msg {
          font-size: 12px; color: #b8952a; margin: 14px 0 10px;
          letter-spacing: 0.04em; display: flex; align-items: center; gap: 8px;
        }
        .ai-results-grid { display: flex; gap: 8px; flex-wrap: wrap; }
        .ai-room-card {
          flex: 1; min-width: 180px; max-width: 280px;
          border: 1px solid rgba(184,149,42,0.25); overflow: hidden;
          cursor: pointer; transition: border-color 0.2s;
          background: ${T.cardBg};
        }
        .ai-room-card:hover { border-color: #b8952a; }
        .ai-room-card img { width: 100%; height: 110px; object-fit: cover; display: block; }
        .ai-room-card-body { padding: 10px 12px; }
        .ai-room-name {
          font-family: 'Bodoni Moda', Georgia, serif;
          font-size: 13px; font-weight: 400; font-style: italic;
          color: ${T.textPrimary}; margin-bottom: 3px; font-optical-sizing: auto;
        }
        .ai-room-price { font-size: 11px; color: #b8952a; font-weight: 600; margin-bottom: 6px; }
        .ai-room-match {
          font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase;
          color: ${T.textMuted};
        }
        .ai-match-bar { height: 2px; background: ${T.border}; margin-top: 4px; }
        .ai-match-fill { height: 100%; background: #b8952a; }
        @keyframes aiPulse { 0%,100%{opacity:1;} 50%{opacity:0.4;} }
        .ai-thinking { animation: aiPulse 1.2s ease-in-out infinite; font-size: 12px; color: #b8952a; letter-spacing: 0.1em; }

        @media (max-width: 768px) {
          .home-root { flex-direction: column; padding: 16px; }
          .sidebar { width: 100%; position: static; }
          .room-img-wrap { width: 100%; height: 220px; }
          .room-card { flex-direction: column; }
        }
      `}</style>

      <div className="home-root">

        {/* ── SIDEBAR ── */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <div className="sidebar-title"><FilterIcon /> Filters</div>
            <button className="clear-btn" onClick={clearFilters}>Clear All</button>
          </div>

          {/* Theme toggle in sidebar */}
          <div style={{ marginBottom:22 }}>
            <div className="filter-label">Appearance</div>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontSize:10, letterSpacing:"0.12em", color: theme==="dark"?"#b8952a":T.textMuted }}>DARK</span>
              <div className="toggle-pill" onClick={toggleTheme}>
                <div className="toggle-knob">{theme==="dark"?"🌙":"☀️"}</div>
              </div>
              <span style={{ fontSize:10, letterSpacing:"0.12em", color: theme==="light"?"#b8952a":T.textMuted }}>LIGHT</span>
            </div>
          </div>

          <div className="divider" />

          {/* Check-in / out */}
          <div className="filter-section">
            <span className="filter-label">Check-in / Check-out</span>
            <div className="input-wrap">
              <span className="input-icon"><CalIcon /></span>
              <input type="date" value={checkIn} onChange={e=>setCheckIn(e.target.value)} style={inputStyle}/>
            </div>
            <div className="input-wrap">
              <span className="input-icon"><CalIcon /></span>
              <input type="date" value={checkOut} onChange={e=>setCheckOut(e.target.value)} style={inputStyle}/>
            </div>
          </div>

          <div className="divider" />

          {/* Guests */}
          <div className="filter-section">
            <span className="filter-label">Guests</span>
            <div className="input-wrap">
              <span className="input-icon"><UsersIcon /></span>
              <input type="number" min="1" max="10" value={guests} onChange={e=>setGuests(Number(e.target.value))} style={inputStyle}/>
            </div>
          </div>

          <div className="divider" />

          {/* Price */}
          <div className="filter-section">
            <span className="filter-label">Price Range</span>
            <input type="range" min="0" max="50000" step="500" value={minPrice} onChange={e=>setMinPrice(Number(e.target.value))}/>
            <input type="range" min="0" max="50000" step="500" value={maxPrice} onChange={e=>setMaxPrice(Number(e.target.value))}/>
            <div className="price-range-row">
              <span>Rs. {minPrice.toLocaleString()}</span>
              <span>—</span>
              <span>Rs. {maxPrice.toLocaleString()}</span>
            </div>
          </div>

          <div className="divider" />

          {/* Room type */}
          <div className="filter-section">
            <span className="filter-label">Room Type</span>
            {ROOM_TYPES.map(t => (
              <div key={t} className="checkbox-row" onClick={()=>toggleType(t)}>
                <div className={`custom-checkbox ${selectedTypes.includes(t)?"checked":""}`}/>
                <span className="checkbox-label">{t}</span>
              </div>
            ))}
          </div>

          <div className="divider" />

          {/* Amenities */}
          <div className="filter-section">
            <span className="filter-label">Amenities</span>
            {AMENITIES_LIST.map(a => (
              <div key={a} className="amenity-row" onClick={()=>toggleAmenity(a)}>
                <div className={`custom-checkbox ${selectedAmenities.includes(a)?"checked":""}`}/>
                <span className="amenity-icon-sm">{AMENITY_ICONS[a]}</span>
                <span className="checkbox-label">{a}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main className="main">

          {/* Results header */}
          <div className="results-header">
            <div style={{ display:"flex", alignItems:"center", gap:16 }}>
              {/* 🔥 Back to Landing Page */}
              <button onClick={() => navigate("/")} style={{
                display:"flex", alignItems:"center", gap:7,
                background:"none", border:`1px solid ${T.border}`,
                color:T.textMuted, padding:"8px 16px",
                fontFamily:"'Jost',sans-serif", fontSize:"10px",
                fontWeight:500, letterSpacing:"0.18em", textTransform:"uppercase",
                cursor:"pointer", transition:"all 0.2s", flexShrink:0,
              }}
                onMouseEnter={e=>{ e.currentTarget.style.borderColor="#b8952a"; e.currentTarget.style.color="#b8952a"; }}
                onMouseLeave={e=>{ e.currentTarget.style.borderColor=T.border; e.currentTarget.style.color=T.textMuted; }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
                </svg>
                Home
              </button>
              <div>
                <div className="results-label">Accommodation</div>
                <div className="results-title">Available Rooms & Suites</div>
                <div className="results-sub">
                  {filteredRooms.length} {filteredRooms.length===1?"property":"properties"} found
                </div>
              </div>
            </div>
            <div className="sort-wrap">
              <span className="sort-label">Sort by</span>
              <select className="sort-select" value={sortBy} onChange={e=>setSortBy(e.target.value)}>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

          {/* 🔥 Personalised History Recommendations (logged-in users) */}
          {localStorage.getItem("token") && showHistoryRecs && (
            <div className="hist-panel">
              <div className="hist-panel-top">
                <div className="hist-panel-left">
                  <div className="hist-badge">✦ For You</div>
                  <div>
                    {historyLoading ? (
                      <div className="hist-title">Finding your perfect rooms…</div>
                    ) : historyRecs ? (
                      <>
                        <div className="hist-title">{historyRecs.message}</div>
                        <div className="hist-sub">
                          {historyRecs.has_history
                            ? `Based on your ${historyRecs.booking_count} booking${historyRecs.booking_count > 1 ? "s" : ""} with us`
                            : "Popular rooms our guests love"}
                        </div>
                      </>
                    ) : null}
                  </div>
                </div>
                <button className="hist-dismiss" onClick={() => setShowHistoryRecs(false)}>Dismiss ✕</button>
              </div>

              {/* Preference tags */}
              {historyRecs?.has_history && historyRecs?.preferences && (
                <div className="hist-pref-tags">
                  {historyRecs.preferences.preferred_amenities?.slice(0,4).map(a => (
                    <span key={a} className="hist-pref-tag">{a.replace(/_/g," ")}</span>
                  ))}
                  {historyRecs.preferences.avg_price && (
                    <span className="hist-pref-tag">~Rs. {Number(historyRecs.preferences.avg_price).toLocaleString()}/night</span>
                  )}
                  {historyRecs.preferences.avg_capacity && (
                    <span className="hist-pref-tag">{historyRecs.preferences.avg_capacity} guest{historyRecs.preferences.avg_capacity > 1 ? "s" : ""}</span>
                  )}
                </div>
              )}

              {/* Loading skeletons */}
              {historyLoading && (
                <div className="hist-grid">
                  {[1,2,3].map(i => <div key={i} className="hist-skeleton"/>)}
                </div>
              )}

              {/* Recommendation cards */}
              {!historyLoading && historyRecs?.rooms?.length > 0 && (
                <div className="hist-grid">
                  {historyRecs.rooms.map(room => {
                    const reason = historyRecs.reasons?.[room.id] || "Recommended for you";
                    return (
                      <div key={room.id} className="hist-card">
                        {room.image
                          ? <img src={room.image} alt={room.room_type}/>
                          : <div className="hist-card-ph">🏨</div>
                        }
                        <div className="hist-card-body">
                          <div className="hist-card-name">{room.room_type}</div>
                          <div className="hist-card-price">Rs. {Number(room.price).toLocaleString()} / night</div>
                          <div className="hist-card-reason">{reason}</div>
                          <button className="hist-book-btn" onClick={() => navigate(`/room/${room.id}`)}>
                            View Room →
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 🔥 AI Recommendation Panel */}
          <div className="ai-panel">
            <div className="ai-panel-top">
              <div className="ai-panel-icon">✦</div>
              <div>
                <div className="ai-panel-label">AI Concierge</div>
                <div className="ai-panel-title">Find your perfect room</div>
              </div>
            </div>

            <div className="ai-input-row">
              <input
                className="ai-input"
                placeholder='e.g. "A romantic room with sea view for 2 people" or "Budget room for solo traveller"'
                value={aiQuery}
                onChange={e => setAiQuery(e.target.value)}
                onKeyDown={e => e.key === "Enter" && getAiRecommendations()}
              />
              <button className="ai-search-btn" onClick={getAiRecommendations} disabled={aiLoading || !aiQuery.trim()}>
                {aiLoading ? (
                  <span className="ai-thinking">Thinking…</span>
                ) : (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    Find Rooms
                  </>
                )}
              </button>
            </div>

            {/* Quick suggestion chips */}
            {!aiResults && !aiLoading && (
              <div className="ai-chips">
                {["Romantic room for 2", "Budget single room", "Family room for 4", "Luxury suite with view", "Room with jacuzzi", "Best rated room"].map(chip => (
                  <button key={chip} className="ai-chip" onClick={() => { setAiQuery(chip); setTimeout(getAiRecommendations, 50); }}>
                    {chip}
                  </button>
                ))}
              </div>
            )}

            {/* AI Results */}
            {aiResults !== null && (
              <>
                <div className="ai-results-msg">
                  <span>✦</span>
                  <span>{aiMessage}</span>
                  {aiResults.length > 0 && (
                    <button onClick={() => { setAiResults(null); setAiQuery(""); }}
                      style={{ marginLeft:"auto", background:"none", border:"none", color:T.textMuted, fontSize:11, cursor:"pointer", letterSpacing:"0.08em" }}>
                      Clear ✕
                    </button>
                  )}
                </div>

                {aiResults.length > 0 && (
                  <div className="ai-results-grid">
                    {aiResults.map((room, idx) => {
                      const maxScore = Math.max(...aiResults.map(r => r.aiScore));
                      const pct      = maxScore > 0 ? Math.round((room.aiScore / maxScore) * 100) : 0;
                      return (
                        <div key={room.id} className="ai-room-card" onClick={() => navigate(`/room/${room.id}`)}>
                          {room.image
                            ? <img src={room.image} alt={room.room_type}/>
                            : <div style={{height:110,background:T.inputBg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28}}>🏨</div>
                          }
                          <div className="ai-room-card-body">
                            {idx === 0 && <div style={{fontSize:"8px",letterSpacing:"0.18em",textTransform:"uppercase",color:"#b8952a",marginBottom:3}}>★ Top Pick</div>}
                            <div className="ai-room-name">{room.room_type}</div>
                            <div className="ai-room-price">Rs. {Number(room.price).toLocaleString()} / night</div>
                            <div className="ai-room-match">
                              Match: {pct}%
                              <div className="ai-match-bar"><div className="ai-match-fill" style={{width:`${pct}%`}}/></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="gold-line" />

          {/* Cards */}
          {filteredRooms.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <div className="empty-title">No rooms match your filters</div>
              <div className="empty-sub">Try adjusting your price range, guests, or room type</div>
            </div>
          ) : (
            filteredRooms.map(room => {
              const status = bookingStatus[room.id];
              return (
                <div key={room.id} className="room-card">

                  {/* Image */}
                  <div className="room-img-wrap">
                    {room.image
                      ? <img className="room-img" src={room.image} alt={room.room_type} onClick={()=>navigate(`/room/${room.id}`)}/>
                      : <div className="room-img-placeholder" onClick={()=>navigate(`/room/${room.id}`)}>🏨</div>
                    }
                    {room.ai_recommended && (
                      <div className="ai-badge"><SparkleIcon /> AI Recommended</div>
                    )}
                    <button className="fav-btn" onClick={()=>toggleFavorite(room.id)}>
                      {favorites.includes(room.id) ? "❤️" : "🤍"}
                    </button>
                    <button className="expand-btn" onClick={()=>navigate(`/room/${room.id}`)}>
                      <ExpandIcon />
                    </button>
                    {room.room_number && (
                      <div className="room-number-badge">Room {room.room_number}</div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="room-body">
                    <div className="room-top">
                      <div className="room-meta">
                        <span className="room-meta-item"><UsersIcon /> Max {room.capacity} guests</span>
                        {room.area     && <span className="room-meta-item"><ExpandIcon /> {room.area} m²</span>}
                        {room.floor    && <span className="room-meta-item">🏢 Floor {room.floor}</span>}
                        {room.bed_type && <span className="room-meta-item">🛏 {room.bed_type}</span>}
                        <span className="rating-wrap">
                          {renderStars(room.rating||4.5)}
                          <span className="rating-num">{(room.rating||4.5).toFixed(1)}</span>
                          <span className="rating-count">({room.reviews||0})</span>
                        </span>
                      </div>

                      <div className="room-name">{room.room_type}</div>

                      {room.description && (
                        <div className="room-desc">{room.description}</div>
                      )}

                      <div className="room-extra">
                        {room.breakfast_included && <span className="room-extra-item">🍳 Breakfast incl.</span>}
                        {room.sea_view           && <span className="room-extra-item">🌊 Sea View</span>}
                        {room.pet_friendly       && <span className="room-extra-item">🐾 Pet Friendly</span>}
                        {room.jacuzzi            && <span className="room-extra-item">♨️ Jacuzzi</span>}
                      </div>

                      <div className="amenity-tags">
                        {(room.amenities||[]).slice(0,5).map(a=>(
                          <span key={a} className="amenity-tag">{AMENITY_ICONS[a]||""} {a}</span>
                        ))}
                        {(room.amenities||[]).length > 5 && (
                          <span className="amenity-tag">+{room.amenities.length-5} more</span>
                        )}
                      </div>
                    </div>

                    <div className="room-footer">
                      <div>
                        <div className="price-from">Starting from</div>
                        <span className="price-amt">Rs. {Number(room.price).toLocaleString()}</span>
                        <span className="price-per"> /night</span>
                      </div>
                      <button
                        className={`book-btn ${status==="no_dates"||status==="bad_dates"?"error":""}`}
                        onClick={()=>handleBooking(room.id)}
                      >
                        {status==="no_dates"  ? "⚠️ Select Dates First" :
                         status==="bad_dates" ? "⚠️ Fix Your Dates" :
                         "Reserve Room →"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </main>
      </div>
    </>
  );
}

export default Home;