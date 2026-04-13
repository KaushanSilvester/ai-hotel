import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// ─── Icons ────────────────────────────────────────────────────────────────────
const FilterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
);
const UsersIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const ExpandIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
    <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
  </svg>
);
const StarIcon = ({ filled }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "#f59e0b" : "none"} stroke="#f59e0b" strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const ChatIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const CalIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const SparkleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
  </svg>
);

// ─── Amenity icon map ─────────────────────────────────────────────────────────
const AMENITY_ICONS = {
  "WiFi": "📶", "TV": "📺", "Mini Bar": "🍸", "Balcony": "🌅",
  "Ocean View": "🌊", "Work Desk": "💼", "Air Conditioning": "❄️",
  "Pool": "🏊", "Gym": "🏋️", "Spa": "💆", "Parking": "🅿️",
  "Breakfast": "🍳", "Pet Friendly": "🐾", "Safe": "🔒", "Bathtub": "🛁",
  "Jacuzzi": "♨️", "Sea View": "🌊",
};

// ─── Room type options ────────────────────────────────────────────────────────
const ROOM_TYPES = ["Single", "Double", "Suite", "Deluxe", "Family", "Penthouse"];
const AMENITIES_LIST = ["WiFi", "TV", "Mini Bar", "Balcony", "Ocean View", "Work Desk", "Air Conditioning", "Breakfast", "Jacuzzi"];

// ─── Demo data (fallback when backend is offline) ─────────────────────────────
const DEMO_ROOMS = [
  { id: 1, room_type: "Ocean View Suite", capacity: 2, price: 22000, area: 45, image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80", amenities: ["Ocean View", "WiFi", "Mini Bar", "TV", "Balcony"], rating: 4.8, reviews: 124, ai_recommended: true },
  { id: 2, room_type: "Deluxe Double Room", capacity: 2, price: 18000, area: 35, image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=600&q=80", amenities: ["WiFi", "TV", "Work Desk", "Air Conditioning"], rating: 4.6, reviews: 89, ai_recommended: false },
  { id: 3, room_type: "Superior Single Room", capacity: 1, price: 11000, area: 25, image: "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=600&q=80", amenities: ["WiFi", "TV", "Air Conditioning"], rating: 4.3, reviews: 56, ai_recommended: false },
];

// ─── normalizeRoom ────────────────────────────────────────────────────────────
// Converts backend boolean fields into the amenities array & other UI fields
function normalizeRoom(room) {
  // If amenities array already exists (demo data), keep it
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

  return {
    ...room,
    amenities,
    area:    room.size_sqm     || room.area    || null,
    reviews: room.total_reviews || room.reviews || 0,
    rating:  parseFloat(room.rating) || 0,
    price:   parseFloat(room.price)  || 0,
    // Flatten the 4 image fields into one primary image
    image:   room.image || room.image2 || room.image3 || room.image4 || null,
  };
}

// ─── Main Component ───────────────────────────────────────────────────────────
function Home() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState(DEMO_ROOMS);
  const [favorites, setFavorites] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [sortBy, setSortBy] = useState("price-asc");
  const [bookingStatus, setBookingStatus] = useState({});

  // Filters
  const [checkIn,  setCheckIn]  = useState("2026-02-15");
  const [checkOut, setCheckOut] = useState("2026-02-18");
  const [guests,   setGuests]   = useState(2);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(50000);
  const [selectedTypes,     setSelectedTypes]     = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);

  // ── Fetch from backend, normalize, fall back to demo on error ──
  useEffect(() => {
    axios.get("http://localhost:8000/api/rooms/")
      .then(res => {
        if (res.data?.length) {
          setRooms(res.data.map(normalizeRoom)); // 🔥 normalize here
        }
      })
      .catch(() => {}); // keep demo data on failure
  }, []);

  const clearFilters = () => {
    setGuests(1); setMinPrice(0); setMaxPrice(50000);
    setSelectedTypes([]); setSelectedAmenities([]);
    setCheckIn(""); setCheckOut("");
  };

  const toggleType     = (t) => setSelectedTypes(prev     => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  const toggleAmenity  = (a) => setSelectedAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);
  const toggleFavorite = (id) => setFavorites(prev        => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);

  const filteredRooms = useMemo(() => {
    let result = rooms.filter(room =>
      (maxPrice >= 50000 || room.price <= maxPrice) &&
      room.price >= minPrice &&
      room.capacity >= guests &&
      (selectedTypes.length === 0 || selectedTypes.some(t => room.room_type.toLowerCase().includes(t.toLowerCase()))) &&
      (selectedAmenities.length === 0 || selectedAmenities.every(a => (room.amenities || []).includes(a)))
    );
    if (sortBy === "price-asc")  result = [...result].sort((a, b) => a.price - b.price);
    if (sortBy === "price-desc") result = [...result].sort((a, b) => b.price - a.price);
    if (sortBy === "rating")     result = [...result].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return result;
  }, [rooms, minPrice, maxPrice, guests, selectedTypes, selectedAmenities, sortBy]);

  const handleBooking = async (roomId) => {
    const token = localStorage.getItem("token");
    if (!token)            { setBookingStatus({ [roomId]: "error" }); return; }
    if (!checkIn || !checkOut) { setBookingStatus({ [roomId]: "error" }); return; }
    setBookingStatus({ [roomId]: "loading" });
    try {
      await axios.post("http://localhost:8000/api/book/",
        { room_id: roomId, check_in: checkIn, check_out: checkOut },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBookingStatus({ [roomId]: "success" });
      setTimeout(() => setBookingStatus({}), 3000);
    } catch {
      setBookingStatus({ [roomId]: "error" });
      setTimeout(() => setBookingStatus({}), 3000);
    }
  };

  const renderStars = (rating) =>
    Array.from({ length: 5 }, (_, i) => <StarIcon key={i} filled={i < Math.round(rating)} />);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body { font-family: 'DM Sans', sans-serif; background: #eef2f7; }

        .home-root {
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          background: #eef2f7;
          padding: 20px;
          display: flex;
          gap: 20px;
        }

        /* ── SIDEBAR ── */
        .sidebar {
          width: 270px; flex-shrink: 0;
          background: #fff; border-radius: 16px;
          padding: 22px 20px; height: fit-content;
          box-shadow: 0 2px 16px rgba(0,0,0,0.06);
          position: sticky; top: 20px;
        }
        .sidebar-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 22px; }
        .sidebar-title  { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 700; color: #111827; }
        .clear-btn { background: none; border: none; color: #2563eb; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; }
        .clear-btn:hover { text-decoration: underline; }

        .filter-section { margin-bottom: 20px; }
        .filter-label { font-size: 13px; font-weight: 700; color: #374151; margin-bottom: 10px; display: block; }

        .date-input-wrap { position: relative; display: flex; align-items: center; margin-bottom: 8px; }
        .date-icon { position: absolute; left: 11px; pointer-events: none; display: flex; }
        .filter-date {
          width: 100%; padding: 9px 10px 9px 34px;
          border: 1.5px solid #e5e7eb; border-radius: 10px;
          font-size: 13.5px; font-family: 'DM Sans', sans-serif;
          color: #374151; background: #f9fafb; outline: none;
        }
        .filter-date:focus { border-color: #2563eb; background: #fff; }

        .guests-input-wrap { position: relative; display: flex; align-items: center; }
        .guests-icon { position: absolute; left: 11px; pointer-events: none; display: flex; }
        .filter-number {
          width: 100%; padding: 9px 10px 9px 34px;
          border: 1.5px solid #e5e7eb; border-radius: 10px;
          font-size: 13.5px; font-family: 'DM Sans', sans-serif;
          color: #374151; background: #f9fafb; outline: none;
        }
        .filter-number:focus { border-color: #2563eb; background: #fff; }

        .price-range-row { display: flex; align-items: center; justify-content: space-between; margin-top: 8px; font-size: 13px; color: #6b7280; font-weight: 500; }
        .price-slider { width: 100%; accent-color: #111827; cursor: pointer; display: block; margin: 2px 0; }

        .checkbox-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; cursor: pointer; }
        .custom-checkbox { width: 16px; height: 16px; border: 1.5px solid #d1d5db; border-radius: 4px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: #fff; transition: all 0.15s; }
        .custom-checkbox.checked { background: #2563eb; border-color: #2563eb; }
        .custom-checkbox.checked::after { content: '✓'; color: #fff; font-size: 10px; font-weight: 700; }
        .checkbox-label { font-size: 13.5px; color: #374151; }

        .amenity-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; cursor: pointer; }
        .amenity-icon-sm { font-size: 14px; }
        .divider { height: 1px; background: #f3f4f6; margin: 16px 0; }

        /* ── MAIN ── */
        .main { flex: 1; min-width: 0; }

        .results-header {
          background: #fff; border-radius: 14px; padding: 18px 22px;
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.05);
        }
        .results-title { font-size: 20px; font-weight: 700; color: #111827; margin-bottom: 2px; }
        .results-sub   { font-size: 13px; color: #6b7280; }
        .sort-wrap  { display: flex; align-items: center; gap: 10px; }
        .sort-label { font-size: 13.5px; color: #6b7280; font-weight: 500; }
        .sort-select {
          padding: 8px 12px; border: 1.5px solid #e5e7eb; border-radius: 10px;
          font-size: 13.5px; font-family: 'DM Sans', sans-serif; color: #374151;
          background: #fff; outline: none; cursor: pointer;
        }
        .sort-select:focus { border-color: #2563eb; }

        /* ── ROOM CARD ── */
        .room-card {
          background: #fff; border-radius: 16px; margin-bottom: 16px;
          display: flex; overflow: hidden; position: relative;
          box-shadow: 0 2px 16px rgba(0,0,0,0.06);
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .room-card:hover { box-shadow: 0 8px 30px rgba(0,0,0,0.1); transform: translateY(-2px); }

        .room-img-wrap { position: relative; width: 300px; flex-shrink: 0; }
        .room-img { width: 100%; height: 100%; object-fit: cover; display: block; cursor: pointer; }

        /* placeholder when no image */
        .room-img-placeholder {
          width: 100%; height: 100%; min-height: 200px;
          background: linear-gradient(135deg, #e0e7ef, #c7d2e0);
          display: flex; align-items: center; justify-content: center;
          font-size: 48px; cursor: pointer;
        }

        .ai-badge {
          position: absolute; top: 12px; left: 12px;
          background: linear-gradient(135deg, #2563eb, #7c3aed);
          color: #fff; font-size: 12px; font-weight: 600;
          padding: 5px 10px; border-radius: 20px;
          display: flex; align-items: center; gap: 5px;
        }
        .fav-btn {
          position: absolute; top: 10px; right: 10px;
          background: rgba(255,255,255,0.92); border: none;
          border-radius: 50%; width: 34px; height: 34px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; font-size: 17px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.12); transition: transform 0.15s;
        }
        .fav-btn:hover { transform: scale(1.15); }
        .expand-btn {
          position: absolute; bottom: 10px; right: 10px;
          background: rgba(255,255,255,0.85); border: none;
          border-radius: 8px; width: 30px; height: 30px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }

        /* room number badge */
        .room-number-badge {
          position: absolute; bottom: 10px; left: 10px;
          background: rgba(0,0,0,0.55); color: #fff;
          font-size: 11px; font-weight: 700;
          padding: 3px 9px; border-radius: 20px;
          backdrop-filter: blur(4px);
        }

        .room-body { padding: 20px 22px; flex: 1; display: flex; flex-direction: column; justify-content: space-between; }
        .room-top  { margin-bottom: 10px; }
        .room-meta { display: flex; align-items: center; gap: 18px; font-size: 13px; color: #6b7280; margin-bottom: 8px; flex-wrap: wrap; }
        .room-meta-item { display: flex; align-items: center; gap: 5px; }
        .room-name { font-size: 17px; font-weight: 700; color: #111827; margin-bottom: 4px; }

        /* description preview */
        .room-desc {
          font-size: 13px; color: #6b7280; line-height: 1.55;
          margin-bottom: 10px;
          display: -webkit-box; -webkit-line-clamp: 2;
          -webkit-box-orient: vertical; overflow: hidden;
        }

        .rating-wrap  { display: flex; align-items: center; gap: 5px; margin-bottom: 10px; }
        .rating-num   { font-size: 14px; font-weight: 700; color: #111827; }
        .rating-count { font-size: 13px; color: #2563eb; }

        .amenity-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
        .amenity-tag {
          padding: 4px 10px; border: 1.5px solid #e5e7eb;
          border-radius: 20px; font-size: 12px; color: #374151;
          background: #f9fafb; font-weight: 500;
        }

        /* extra details row */
        .room-extra { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 10px; }
        .room-extra-item {
          font-size: 12px; color: #6b7280; font-weight: 500;
          background: #f3f4f6; padding: 4px 10px; border-radius: 8px;
        }

        .room-footer { display: flex; align-items: flex-end; justify-content: space-between; }
        .price-block .price-from { font-size: 12px; color: #9ca3af; margin-bottom: 1px; }
        .price-block .price-amt  { font-size: 26px; font-weight: 800; color: #111827; }
        .price-block .price-per  { font-size: 13px; color: #6b7280; font-weight: 500; }

        .book-btn {
          padding: 12px 28px; background: #2563eb; color: #fff;
          border: none; border-radius: 10px; font-size: 14px; font-weight: 700;
          font-family: 'DM Sans', sans-serif; cursor: pointer;
          box-shadow: 0 4px 14px rgba(37,99,235,0.28);
          transition: background 0.18s, transform 0.12s, box-shadow 0.18s;
        }
        .book-btn:hover  { background: #1d4ed8; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(37,99,235,0.36); }
        .book-btn:active { transform: translateY(0); }
        .book-btn.success { background: #16a34a; box-shadow: none; }
        .book-btn.error   { background: #dc2626; box-shadow: none; }
        .book-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        /* ── MODAL ── */
        .modal-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.65); backdrop-filter: blur(3px);
          display: flex; justify-content: center; align-items: center;
          z-index: 999; padding: 20px;
        }
        .modal-box { background: #fff; border-radius: 20px; width: 100%; max-width: 620px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
        .modal-img  { width: 100%; height: 280px; object-fit: cover; }
        .modal-body { padding: 24px 28px; }
        .modal-title { font-size: 20px; font-weight: 700; color: #111827; margin-bottom: 6px; }
        .modal-meta  { font-size: 13.5px; color: #6b7280; margin-bottom: 14px; }
        .modal-tags  { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
        .modal-footer { display: flex; align-items: center; justify-content: space-between; }
        .modal-price  { font-size: 24px; font-weight: 800; color: #111827; }
        .modal-close  { background: #f3f4f6; border: none; border-radius: 10px; padding: 10px 22px; font-size: 14px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; color: #374151; }
        .modal-close:hover { background: #e5e7eb; }

        /* ── CHAT FAB ── */
        .chat-fab {
          position: fixed; bottom: 28px; right: 28px;
          width: 52px; height: 52px; border-radius: 50%;
          background: #2563eb; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 20px rgba(37,99,235,0.4);
          transition: transform 0.2s, box-shadow 0.2s; z-index: 100;
        }
        .chat-fab:hover { transform: scale(1.08); box-shadow: 0 8px 28px rgba(37,99,235,0.5); }

        /* ── EMPTY STATE ── */
        .empty-state { text-align: center; padding: 60px 20px; color: #9ca3af; }
        .empty-state h3 { font-size: 16px; font-weight: 600; color: #374151; margin-bottom: 6px; }

        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff;
          border-radius: 50%; display: inline-block;
          animation: spin 0.7s linear infinite; margin-right: 6px; vertical-align: middle;
        }
      `}</style>

      <div className="home-root">

        {/* ── SIDEBAR ── */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <div className="sidebar-title"><FilterIcon /> Filters</div>
            <button className="clear-btn" onClick={clearFilters}>Clear All</button>
          </div>

          {/* Check-in / Check-out */}
          <div className="filter-section">
            <span className="filter-label">Check-in / Check-out</span>
            <div className="date-input-wrap">
              <span className="date-icon"><CalIcon /></span>
              <input className="filter-date" type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} />
            </div>
            <div className="date-input-wrap">
              <span className="date-icon"><CalIcon /></span>
              <input className="filter-date" type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} />
            </div>
          </div>

          <div className="divider" />

          {/* Guests */}
          <div className="filter-section">
            <span className="filter-label">Number of Guests</span>
            <div className="guests-input-wrap">
              <span className="guests-icon"><UsersIcon /></span>
              <input className="filter-number" type="number" min="1" max="10" value={guests} onChange={e => setGuests(Number(e.target.value))} />
            </div>
          </div>

          <div className="divider" />

          {/* Price Range */}
          <div className="filter-section">
            <span className="filter-label">Price Range</span>
            <input className="price-slider" type="range" min="0" max="50000" step="500" value={minPrice} onChange={e => setMinPrice(Number(e.target.value))} />
            <input className="price-slider" type="range" min="0" max="50000" step="500" value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))} />
            <div className="price-range-row">
              <span>Rs. {minPrice.toLocaleString()}</span><span>to</span><span>Rs. {maxPrice.toLocaleString()}</span>
            </div>
          </div>

          <div className="divider" />

          {/* Room Type */}
          <div className="filter-section">
            <span className="filter-label">Room Type</span>
            {ROOM_TYPES.map(t => (
              <div key={t} className="checkbox-row" onClick={() => toggleType(t)}>
                <div className={`custom-checkbox ${selectedTypes.includes(t) ? "checked" : ""}`} />
                <span className="checkbox-label">{t}</span>
              </div>
            ))}
          </div>

          <div className="divider" />

          {/* Amenities */}
          <div className="filter-section">
            <span className="filter-label">Amenities</span>
            {AMENITIES_LIST.map(a => (
              <div key={a} className="amenity-row" onClick={() => toggleAmenity(a)}>
                <div className={`custom-checkbox ${selectedAmenities.includes(a) ? "checked" : ""}`} />
                <span className="amenity-icon-sm">{AMENITY_ICONS[a]}</span>
                <span className="checkbox-label">{a}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="main">

          {/* Results Header */}
          <div className="results-header">
            <div>
              <div className="results-title">Available Rooms</div>
              <div className="results-sub">{filteredRooms.length} {filteredRooms.length === 1 ? "property" : "properties"} found</div>
            </div>
            <div className="sort-wrap">
              <span className="sort-label">Sort by:</span>
              <select className="sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

          {/* Room Cards */}
          {filteredRooms.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
              <h3>No rooms match your filters</h3>
              <p>Try adjusting your price range, guests, or room type.</p>
            </div>
          ) : (
            filteredRooms.map(room => {
              const status = bookingStatus[room.id];
              return (
                <div key={room.id} className="room-card">

                  {/* Image */}
                  <div className="room-img-wrap">
                    {room.image ? (
                      <img className="room-img" src={room.image} alt={room.room_type}
                        onClick={() => navigate(`/room/${room.id}`)} />
                    ) : (
                      <div className="room-img-placeholder" onClick={() => navigate(`/room/${room.id}`)}>🏨</div>
                    )}

                    {room.ai_recommended && (
                      <div className="ai-badge"><SparkleIcon /> AI Pick</div>
                    )}
                    <button className="fav-btn" onClick={() => toggleFavorite(room.id)}>
                      {favorites.includes(room.id) ? "❤️" : "🤍"}
                    </button>
                    <button className="expand-btn" onClick={() => navigate(`/room/${room.id}`)}>
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
                        {room.area    && <span className="room-meta-item"><ExpandIcon /> {room.area} m²</span>}
                        {room.floor   && <span className="room-meta-item">🏢 Floor {room.floor}</span>}
                        {room.bed_type && <span className="room-meta-item">🛏 {room.bed_type}</span>}
                        <span className="rating-wrap" style={{ marginBottom: 0 }}>
                          {renderStars(room.rating || 4.5)}
                          <span className="rating-num">{(room.rating || 4.5).toFixed(1)}</span>
                          <span className="rating-count">({room.reviews || 0})</span>
                        </span>
                      </div>

                      <div className="room-name">{room.room_type}</div>

                      {/* Description preview */}
                      {room.description && (
                        <div className="room-desc">{room.description}</div>
                      )}

                      {/* Extra flags */}
                      <div className="room-extra">
                        {room.breakfast_included && <span className="room-extra-item">🍳 Breakfast incl.</span>}
                        {room.sea_view           && <span className="room-extra-item">🌊 Sea View</span>}
                        {room.pet_friendly       && <span className="room-extra-item">🐾 Pet Friendly</span>}
                        {room.smoking_allowed    && <span className="room-extra-item">🚬 Smoking</span>}
                        {room.jacuzzi            && <span className="room-extra-item">♨️ Jacuzzi</span>}
                      </div>

                      <div className="amenity-tags">
                        {(room.amenities || []).slice(0, 5).map(a => (
                          <span key={a} className="amenity-tag">{AMENITY_ICONS[a] || ""} {a}</span>
                        ))}
                        {(room.amenities || []).length > 5 && (
                          <span className="amenity-tag">+{room.amenities.length - 5} more</span>
                        )}
                      </div>
                    </div>

                    <div className="room-footer">
                      <div className="price-block">
                        <div className="price-from">Starting from</div>
                        <span className="price-amt">Rs. {Number(room.price).toLocaleString()}</span>
                        <span className="price-per"> /night</span>
                      </div>
                      <button
                        className={`book-btn ${status === "success" ? "success" : status === "error" ? "error" : ""}`}
                        onClick={() => handleBooking(room.id)}
                        disabled={status === "loading" || status === "success"}
                      >
                        {status === "loading" && <span className="spinner" />}
                        {status === "success" ? "✓ Booked!" : status === "error" ? "Try again" : "Book Now"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </main>
      </div>

      {/* ── MODAL ── */}
      {selectedRoom && (
        <div className="modal-overlay" onClick={() => setSelectedRoom(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            {selectedRoom.image
              ? <img className="modal-img" src={selectedRoom.image} alt={selectedRoom.room_type} />
              : <div style={{ height: 200, background: "#eef2f7", display:"flex", alignItems:"center", justifyContent:"center", fontSize:48 }}>🏨</div>
            }
            <div className="modal-body">
              <div className="modal-title">{selectedRoom.room_type}</div>
              <div className="modal-meta">
                Max {selectedRoom.capacity} guests
                {selectedRoom.area     && ` · ${selectedRoom.area} m²`}
                {selectedRoom.bed_type && ` · ${selectedRoom.bed_type}`}
                {selectedRoom.floor    && ` · Floor ${selectedRoom.floor}`}
                {selectedRoom.rating   && ` · ⭐ ${selectedRoom.rating} (${selectedRoom.reviews} reviews)`}
              </div>
              {selectedRoom.description && (
                <p style={{ fontSize: 13.5, color: "#4b5563", marginBottom: 14, lineHeight: 1.6 }}>
                  {selectedRoom.description}
                </p>
              )}
              <div className="modal-tags">
                {(selectedRoom.amenities || []).map(a => (
                  <span key={a} className="amenity-tag">{AMENITY_ICONS[a] || ""} {a}</span>
                ))}
              </div>
              <div className="modal-footer">
                <div>
                  <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 2 }}>Starting from</div>
                  <span className="modal-price">Rs. {Number(selectedRoom.price).toLocaleString()}</span>
                  <span style={{ fontSize: 13, color: "#6b7280" }}> /night</span>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button className="modal-close" onClick={() => setSelectedRoom(null)}>Close</button>
                  <button className="book-btn" onClick={() => { handleBooking(selectedRoom.id); setSelectedRoom(null); }}>Book Now</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CHAT FAB ── */}
      <button className="chat-fab" title="Chat with AI">
        <ChatIcon />
      </button>
    </>
  );
}

export default Home;
