import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

// ─── Demo data ────────────────────────────────────────────────────────────────
const DEMO_ROOMS = [
  {
    id: 1, room_type: "Ocean View Suite", capacity: 2, price: 22000, area: 45,
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1631049552057-403cdb8f0658?auto=format&fit=crop&w=1200&q=80",
    ],
    amenities: ["Ocean View", "WiFi", "Mini Bar", "TV", "Balcony"],
    rating: 4.8, reviews: 124, ai_recommended: true,
    description: "Wake up to breathtaking panoramic ocean views from this luxurious suite. Featuring a private balcony, king-size bed, and premium amenities, this suite offers the perfect blend of comfort and style. The spacious bathroom includes a soaking tub and rain shower.",
    floor: 8, bed_type: "King Bed",
    reviews_list: [
      { name: "Sarah M.", rating: 5, date: "March 2026", comment: "Absolutely stunning views! The room was immaculate and the staff was incredibly helpful." },
      { name: "James K.", rating: 5, date: "February 2026", comment: "Best hotel stay I've ever had. The ocean view from the balcony is worth every rupee." },
      { name: "Priya R.", rating: 4, date: "January 2026", comment: "Beautiful room, great amenities. Mini bar was a nice touch. Would definitely stay again!" },
    ]
  },
  {
    id: 2, room_type: "Deluxe Double Room", capacity: 2, price: 18000, area: 35,
    image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80",
    ],
    amenities: ["WiFi", "TV", "Work Desk", "Air Conditioning"],
    rating: 4.6, reviews: 89,
    description: "A sophisticated double room designed for both business and leisure travelers. Features a spacious work desk, high-speed WiFi, and a plush double bed ensuring a restful night's sleep.",
    floor: 4, bed_type: "Double Bed",
    reviews_list: [
      { name: "Ahmed S.", rating: 5, date: "March 2026", comment: "Perfect for a business trip. Fast WiFi and comfortable workspace." },
      { name: "Lisa T.",  rating: 4, date: "February 2026", comment: "Clean, comfortable and great value for money." },
    ]
  },
  {
    id: 3, room_type: "Superior Single Room", capacity: 1, price: 11000, area: 25,
    image: "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80",
    ],
    amenities: ["WiFi", "TV", "Air Conditioning"],
    rating: 4.3, reviews: 56,
    description: "A cozy and well-appointed single room, perfect for solo travelers. Everything you need for a comfortable stay at an excellent price.",
    floor: 2, bed_type: "Single Bed",
    reviews_list: [
      { name: "Ravi N.", rating: 4, date: "January 2026", comment: "Great value, clean room. Air conditioning worked perfectly." },
    ]
  },
];

const AMENITY_ICONS = {
  "WiFi": "📶", "TV": "📺", "Mini Bar": "🍸", "Balcony": "🌅",
  "Ocean View": "🌊", "Work Desk": "💼", "Air Conditioning": "❄️",
  "Pool": "🏊", "Gym": "🏋️", "Spa": "💆", "Parking": "🅿️",
  "Breakfast": "🍳", "Pet Friendly": "🐾", "Safe": "🔒",
  "Bathtub": "🛁", "Jacuzzi": "♨️", "Sea View": "🌊",
};

// ─── Icons ────────────────────────────────────────────────────────────────────
const BackIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);
const UsersIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const AreaIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
    <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
  </svg>
);
const BedIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/>
  </svg>
);
const FloorIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/>
  </svg>
);
const StarIcon = ({ filled }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill={filled ? "#f59e0b" : "none"} stroke="#f59e0b" strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const CalIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const ChevronLeft = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);
const ChevronRight = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);
const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const GridIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);
const LockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const ArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);

// ─── Normalize ────────────────────────────────────────────────────────────────
function normalizeRoom(room) {
  const amenities = Array.isArray(room.amenities) && room.amenities.length > 0
    ? room.amenities
    : [
        room.wifi               && "WiFi",
        room.ac                 && "Air Conditioning",
        room.tv                 && "TV",
        room.balcony            && "Balcony",
        room.minibar            && "Mini Bar",
        room.sea_view           && "Ocean View",
        room.breakfast_included && "Breakfast",
        room.jacuzzi            && "Jacuzzi",
        room.safe               && "Safe",
        room.bathtub            && "Bathtub",
        room.pet_friendly       && "Pet Friendly",
      ].filter(Boolean);

  const images = Array.isArray(room.images) && room.images.length > 0
    ? room.images
    : [room.image, room.image2, room.image3, room.image4].filter(Boolean);

  return {
    ...room, amenities, images,
    image:   images[0] || null,
    area:    room.size_sqm      || room.area    || null,
    reviews: room.total_reviews || room.reviews || 0,
    rating:  parseFloat(room.rating) || 0,
    price:   parseFloat(room.price)  || 0,
  };
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────
function Lightbox({ images, startIndex, onClose }) {
  const [current, setCurrent] = useState(startIndex);
  const prev = useCallback(() => setCurrent(i => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setCurrent(i => (i + 1) % images.length), [images.length]);

  useEffect(() => {
    const h = (e) => { if (e.key==="ArrowLeft") prev(); if (e.key==="ArrowRight") next(); if (e.key==="Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [prev, next, onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div className="lb-overlay" onClick={onClose}>
      <button className="lb-close" onClick={onClose}><CloseIcon /></button>
      <div className="lb-counter">{current + 1} / {images.length}</div>
      <div className="lb-main" onClick={e => e.stopPropagation()}>
        {images.length > 1 && <button className="lb-nav lb-nav-prev" onClick={prev}><ChevronLeft /></button>}
        <img className="lb-img" src={images[current]} alt={`Photo ${current + 1}`} />
        {images.length > 1 && <button className="lb-nav lb-nav-next" onClick={next}><ChevronRight /></button>}
      </div>
      {images.length > 1 && (
        <div className="lb-thumbs" onClick={e => e.stopPropagation()}>
          {images.map((img, i) => (
            <div key={i} className={`lb-thumb ${i === current ? "active" : ""}`} onClick={() => setCurrent(i)}>
              <img src={img} alt="" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
function RoomDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [room,          setRoom]          = useState(null);
  const [activeImg,     setActiveImg]     = useState(0);
  const [lightboxOpen,  setLightboxOpen]  = useState(false);
  const [lightboxStart, setLightboxStart] = useState(0);
  const [checkIn,       setCheckIn]       = useState("");
  const [checkOut,      setCheckOut]      = useState("");
  const [guests,        setGuests]        = useState(1);
  const [nights,        setNights]        = useState(0);
  const [formError,     setFormError]     = useState("");

  useEffect(() => {
    axios.get(`http://localhost:8000/api/rooms/${id}/`)
      .then(res => setRoom(normalizeRoom(res.data)))
      .catch(() => {
        const demo = DEMO_ROOMS.find(r => r.id === Number(id));
        setRoom(demo ? normalizeRoom(demo) : null);
      });
  }, [id]);

  useEffect(() => {
    if (checkIn && checkOut) {
      const diff = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24);
      setNights(diff > 0 ? diff : 0);
    } else {
      setNights(0);
    }
  }, [checkIn, checkOut]);

  const openLightbox = (i) => { setLightboxStart(i); setLightboxOpen(true); };

  // 🔥 Go to Payment page instead of booking directly
  const handleProceedToPayment = () => {
    setFormError("");
    if (!localStorage.getItem("token")) { navigate("/login"); return; }
    if (!checkIn || !checkOut)          { setFormError("Please select check-in and check-out dates."); return; }
    if (nights <= 0)                    { setFormError("Check-out must be after check-in."); return; }
    if (guests < 1 || guests > room.capacity) { setFormError(`Guests must be between 1 and ${room.capacity}.`); return; }

    navigate("/payment", { state: { room, checkIn, checkOut, guests } });
  };

  if (!room) return (
    <div style={{ display:"flex", justifyContent:"center", alignItems:"center", height:"100vh", fontFamily:"'DM Sans', sans-serif", color:"#6b7280" }}>
      Loading room details…
    </div>
  );

  const allImages  = room.images?.length > 0 ? room.images : [room.image].filter(Boolean);
  const totalPrice = room.price * nights;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #eef2f7; }
        .rd-root { font-family: 'DM Sans', sans-serif; background: #eef2f7; min-height: 100vh; }

        .rd-topbar { background: #fff; padding: 14px 28px; display: flex; align-items: center; gap: 14px; box-shadow: 0 1px 8px rgba(0,0,0,0.06); position: sticky; top: 0; z-index: 50; }
        .back-btn { display: flex; align-items: center; gap: 7px; background: #f3f4f6; border: none; border-radius: 10px; padding: 8px 14px; font-size: 14px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; color: #374151; transition: background 0.15s; }
        .back-btn:hover { background: #e5e7eb; }
        .rd-topbar-title { font-size: 16px; font-weight: 700; color: #111827; }

        .rd-body { max-width: 1100px; margin: 0 auto; padding: 28px 20px; display: flex; gap: 24px; align-items: flex-start; }
        .rd-left { flex: 1; min-width: 0; }

        .gallery-main { width: 100%; height: 420px; border-radius: 18px; overflow: hidden; position: relative; margin-bottom: 10px; }
        .gallery-main-img { width: 100%; height: 100%; object-fit: cover; cursor: zoom-in; transition: transform 0.4s; display: block; }
        .gallery-main:hover .gallery-main-img { transform: scale(1.03); }
        .view-all-btn { position: absolute; bottom: 14px; right: 14px; background: rgba(255,255,255,0.95); border: none; border-radius: 10px; padding: 9px 16px; font-size: 13px; font-weight: 700; color: #111827; font-family: 'DM Sans', sans-serif; cursor: pointer; display: flex; align-items: center; gap: 7px; box-shadow: 0 2px 12px rgba(0,0,0,0.15); transition: background 0.15s, transform 0.15s; }
        .view-all-btn:hover { background: #fff; transform: translateY(-1px); }
        .img-counter { position: absolute; top: 14px; right: 14px; background: rgba(0,0,0,0.5); color: #fff; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 20px; backdrop-filter: blur(4px); }
        .gallery-arrow { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.4); border: none; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.15s; z-index: 2; }
        .gallery-arrow:hover { background: rgba(0,0,0,0.65); }
        .gallery-arrow-left { left: 12px; } .gallery-arrow-right { right: 12px; }
        .gallery-thumbs { display: flex; gap: 10px; margin-bottom: 6px; }
        .gallery-thumb { width: 80px; height: 60px; border-radius: 10px; overflow: hidden; cursor: pointer; border: 2.5px solid transparent; flex-shrink: 0; transition: border-color 0.15s, opacity 0.15s; }
        .gallery-thumb.active { border-color: #2563eb; }
        .gallery-thumb:not(.active) { opacity: 0.6; }
        .gallery-thumb:hover { opacity: 1; }
        .gallery-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .gallery-thumb-more { width: 80px; height: 60px; border-radius: 10px; flex-shrink: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; cursor: pointer; color: #fff; font-size: 13px; font-weight: 700; transition: background 0.15s; }
        .gallery-thumb-more:hover { background: rgba(0,0,0,0.85); }

        .rd-info { background: #fff; border-radius: 16px; padding: 24px; margin-top: 20px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
        .rd-room-name { font-size: 24px; font-weight: 800; color: #111827; margin-bottom: 10px; }
        .rd-meta-row { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 16px; }
        .rd-meta-item { display: flex; align-items: center; gap: 7px; font-size: 13.5px; color: #6b7280; font-weight: 500; background: #f9fafb; padding: 7px 12px; border-radius: 8px; }
        .rd-rating-row { display: flex; align-items: center; gap: 6px; margin-bottom: 18px; }
        .rd-rating-num { font-size: 16px; font-weight: 700; color: #111827; }
        .rd-rating-count { font-size: 13px; color: #2563eb; }
        .section-title { font-size: 15px; font-weight: 700; color: #111827; margin-bottom: 12px; }
        .rd-desc { font-size: 14.5px; color: #4b5563; line-height: 1.7; margin-bottom: 20px; }
        .amenity-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 10px; margin-bottom: 20px; }
        .amenity-card { display: flex; align-items: center; gap: 9px; background: #f9fafb; border: 1.5px solid #e5e7eb; border-radius: 10px; padding: 10px 12px; font-size: 13.5px; font-weight: 500; color: #374151; }
        .amenity-emoji { font-size: 18px; }
        .divider { height: 1px; background: #f3f4f6; margin: 20px 0; }
        .review-card { background: #f9fafb; border-radius: 12px; padding: 16px; margin-bottom: 12px; border: 1.5px solid #e5e7eb; }
        .review-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
        .reviewer-name { font-size: 14px; font-weight: 700; color: #111827; }
        .review-date { font-size: 12px; color: #9ca3af; }
        .review-stars { display: flex; gap: 2px; margin-bottom: 8px; }
        .review-text { font-size: 13.5px; color: #4b5563; line-height: 1.6; }

        /* ── BOOKING CARD ── */
        .booking-card { width: 320px; flex-shrink: 0; background: #fff; border-radius: 18px; padding: 24px; box-shadow: 0 4px 24px rgba(0,0,0,0.1); position: sticky; top: 80px; }
        .bc-price { font-size: 28px; font-weight: 800; color: #111827; }
        .bc-per   { font-size: 14px; color: #6b7280; font-weight: 500; }
        .bc-rating { display: flex; align-items: center; gap: 5px; margin-top: 4px; margin-bottom: 20px; font-size: 13px; color: #6b7280; }
        .bc-field { margin-bottom: 14px; }
        .bc-label { font-size: 12.5px; font-weight: 700; color: #374151; margin-bottom: 6px; display: block; }
        .bc-input-wrap { position: relative; display: flex; align-items: center; }
        .bc-icon { position: absolute; left: 11px; display: flex; pointer-events: none; }
        .bc-input { width: 100%; padding: 10px 12px 10px 36px; border: 1.5px solid #e5e7eb; border-radius: 10px; font-size: 13.5px; font-family: 'DM Sans', sans-serif; color: #374151; background: #f9fafb; outline: none; transition: border-color 0.2s; }
        .bc-input:focus { border-color: #2563eb; background: #fff; }

        .price-breakdown { background: #f9fafb; border-radius: 12px; padding: 14px; margin: 16px 0; border: 1.5px solid #e5e7eb; }
        .pb-row { display: flex; justify-content: space-between; font-size: 13.5px; color: #6b7280; margin-bottom: 8px; }
        .pb-row:last-child { margin-bottom: 0; border-top: 1px solid #e5e7eb; padding-top: 8px; font-weight: 700; color: #111827; font-size: 14px; }

        /* form error */
        .form-error-msg { background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; padding: 10px 14px; font-size: 13px; color: #dc2626; margin-bottom: 12px; }

        /* payment method preview */
        .payment-methods-row { display: flex; gap: 6px; margin-bottom: 14px; align-items: center; flex-wrap: wrap; }
        .pm-label { font-size: 12px; color: #9ca3af; }
        .pm-badge { padding: 3px 9px; border-radius: 6px; font-size: 11.5px; font-weight: 700; border: 1.5px solid #e5e7eb; color: #374151; background: #f9fafb; }

        /* 🔥 Proceed button */
        .proceed-btn { width: 100%; padding: 14px; background: #111827; color: #fff; border: none; border-radius: 12px; font-size: 15px; font-weight: 700; font-family: 'DM Sans', sans-serif; cursor: pointer; margin-top: 4px; box-shadow: 0 4px 16px rgba(17,24,39,0.25); transition: background 0.18s, transform 0.12s; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .proceed-btn:hover { background: #1f2937; transform: translateY(-1px); }
        .proceed-btn:active { transform: translateY(0); }
        .bc-note { text-align: center; font-size: 12px; color: #9ca3af; margin-top: 10px; }

        /* ── LIGHTBOX ── */
        .lb-overlay { position: fixed; inset: 0; z-index: 9999; background: rgba(0,0,0,0.93); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; animation: lbFadeIn 0.2s ease; }
        @keyframes lbFadeIn { from { opacity: 0; } to { opacity: 1; } }
        .lb-close { position: absolute; top: 18px; right: 18px; background: rgba(255,255,255,0.12); border: none; border-radius: 50%; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.15s; z-index: 2; }
        .lb-close:hover { background: rgba(255,255,255,0.25); }
        .lb-counter { position: absolute; top: 22px; left: 50%; transform: translateX(-50%); color: rgba(255,255,255,0.75); font-size: 13.5px; font-weight: 600; font-family: 'DM Sans', sans-serif; }
        .lb-main { position: relative; display: flex; align-items: center; justify-content: center; width: 100%; max-width: 900px; flex: 1; }
        .lb-img { max-width: 100%; max-height: calc(100vh - 180px); border-radius: 14px; object-fit: contain; box-shadow: 0 20px 60px rgba(0,0,0,0.5); animation: lbSlide 0.2s ease; }
        @keyframes lbSlide { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }
        .lb-nav { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.12); border: none; border-radius: 50%; width: 52px; height: 52px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.15s; z-index: 2; }
        .lb-nav:hover { background: rgba(255,255,255,0.25); }
        .lb-nav-prev { left: -64px; } .lb-nav-next { right: -64px; }
        .lb-thumbs { display: flex; gap: 8px; margin-top: 16px; overflow-x: auto; max-width: 900px; padding-bottom: 4px; }
        .lb-thumbs::-webkit-scrollbar { height: 4px; }
        .lb-thumbs::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.3); border-radius: 4px; }
        .lb-thumb { width: 70px; height: 52px; border-radius: 8px; overflow: hidden; cursor: pointer; flex-shrink: 0; border: 2px solid transparent; opacity: 0.55; transition: opacity 0.15s, border-color 0.15s; }
        .lb-thumb.active { border-color: #fff; opacity: 1; }
        .lb-thumb:hover { opacity: 0.85; }
        .lb-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }

        @media (max-width: 768px) {
          .rd-body { flex-direction: column; }
          .booking-card { width: 100%; position: static; }
          .gallery-main { height: 260px; }
          .lb-nav-prev { left: 4px; } .lb-nav-next { right: 4px; }
        }
      `}</style>

      {lightboxOpen && (
        <Lightbox images={allImages} startIndex={lightboxStart} onClose={() => setLightboxOpen(false)} />
      )}

      <div className="rd-root">
        <div className="rd-topbar">
          <button className="back-btn" onClick={() => navigate(-1)}><BackIcon /> Back</button>
          <span className="rd-topbar-title">{room.room_type}</span>
        </div>

        <div className="rd-body">
          <div className="rd-left">

            {/* Gallery */}
            <div className="gallery-main">
              <img className="gallery-main-img" src={allImages[activeImg]} alt={room.room_type} onClick={() => openLightbox(activeImg)} />
              {allImages.length > 1 && <div className="img-counter">{activeImg + 1} / {allImages.length}</div>}
              {allImages.length > 1 && (
                <>
                  <button className="gallery-arrow gallery-arrow-left" onClick={() => setActiveImg(i => (i - 1 + allImages.length) % allImages.length)}><ChevronLeft /></button>
                  <button className="gallery-arrow gallery-arrow-right" onClick={() => setActiveImg(i => (i + 1) % allImages.length)}><ChevronRight /></button>
                </>
              )}
              {allImages.length > 1 && (
                <button className="view-all-btn" onClick={() => openLightbox(activeImg)}>
                  <GridIcon /> View all {allImages.length} photos
                </button>
              )}
            </div>

            {allImages.length > 1 && (
              <div className="gallery-thumbs">
                {allImages.slice(0, 4).map((img, i) => (
                  <div key={i} className={`gallery-thumb ${activeImg === i ? "active" : ""}`} onClick={() => setActiveImg(i)}>
                    <img src={img} alt="" />
                  </div>
                ))}
                {allImages.length > 4 && (
                  <div className="gallery-thumb-more" onClick={() => openLightbox(4)}>+{allImages.length - 4} more</div>
                )}
              </div>
            )}

            {/* Info */}
            <div className="rd-info">
              <div className="rd-room-name">
                {room.room_type}
                {room.room_number && <span style={{ fontSize: 14, fontWeight: 500, color: "#9ca3af", marginLeft: 10 }}>Room {room.room_number}</span>}
              </div>
              <div className="rd-meta-row">
                <div className="rd-meta-item"><UsersIcon /> Max {room.capacity} guests</div>
                {room.area  && <div className="rd-meta-item"><AreaIcon /> {room.area} m²</div>}
                <div className="rd-meta-item"><BedIcon /> {room.bed_type || "King Bed"}</div>
                {room.floor && <div className="rd-meta-item"><FloorIcon /> Floor {room.floor}</div>}
                {room.sea_view           && <div className="rd-meta-item">🌊 Sea View</div>}
                {room.breakfast_included && <div className="rd-meta-item">🍳 Breakfast incl.</div>}
                {room.pet_friendly       && <div className="rd-meta-item">🐾 Pet Friendly</div>}
              </div>
              <div className="rd-rating-row">
                {Array.from({ length: 5 }, (_, i) => <StarIcon key={i} filled={i < Math.round(room.rating || 4)} />)}
                <span className="rd-rating-num">{(room.rating || 4.5).toFixed(1)}</span>
                <span className="rd-rating-count">({room.reviews || 0} reviews)</span>
              </div>
              <div className="divider" />
              <div className="section-title">About this room</div>
              <p className="rd-desc">{room.description || "A comfortable and well-appointed room with all the amenities you need for a pleasant stay."}</p>
              <div className="section-title">Amenities</div>
              <div className="amenity-grid">
                {(room.amenities || []).map(a => (
                  <div key={a} className="amenity-card">
                    <span className="amenity-emoji">{AMENITY_ICONS[a] || "✔️"}</span>
                    <span>{a}</span>
                  </div>
                ))}
              </div>
              <div className="divider" />
              <div className="section-title">Guest Reviews</div>
              {(room.reviews_list || []).length === 0 && <p style={{ fontSize: 13.5, color: "#9ca3af" }}>No reviews yet for this room.</p>}
              {(room.reviews_list || []).map((rev, i) => (
                <div key={i} className="review-card">
                  <div className="review-header">
                    <span className="reviewer-name">{rev.name}</span>
                    <span className="review-date">{rev.date}</span>
                  </div>
                  <div className="review-stars">{Array.from({ length: 5 }, (_, j) => <StarIcon key={j} filled={j < rev.rating} />)}</div>
                  <p className="review-text">{rev.comment}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── BOOKING CARD ── */}
          <div className="booking-card">
            <div>
              <span className="bc-price">Rs. {Number(room.price).toLocaleString()}</span>
              <span className="bc-per"> /night</span>
            </div>
            <div className="bc-rating">
              <StarIcon filled />
              <strong style={{ color: "#111827" }}>{(room.rating || 4.5).toFixed(1)}</strong>
              · {room.reviews || 0} reviews
            </div>

            <div className="bc-field">
              <label className="bc-label">Check-in</label>
              <div className="bc-input-wrap">
                <span className="bc-icon"><CalIcon /></span>
                <input className="bc-input" type="date" value={checkIn}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={e => { setCheckIn(e.target.value); setFormError(""); }} />
              </div>
            </div>

            <div className="bc-field">
              <label className="bc-label">Check-out</label>
              <div className="bc-input-wrap">
                <span className="bc-icon"><CalIcon /></span>
                <input className="bc-input" type="date" value={checkOut}
                  min={checkIn || new Date().toISOString().split("T")[0]}
                  onChange={e => { setCheckOut(e.target.value); setFormError(""); }} />
              </div>
            </div>

            <div className="bc-field">
              <label className="bc-label">Guests</label>
              <div className="bc-input-wrap">
                <span className="bc-icon"><UsersIcon /></span>
                <input className="bc-input" type="number" min="1" max={room.capacity}
                  value={guests}
                  onChange={e => { setGuests(Number(e.target.value)); setFormError(""); }}
                  style={{ paddingLeft: 36 }} />
              </div>
            </div>

            {nights > 0 && (
              <div className="price-breakdown">
                <div className="pb-row">
                  <span>Rs. {Number(room.price).toLocaleString()} × {nights} night{nights > 1 ? "s" : ""}</span>
                  <span>Rs. {(room.price * nights).toLocaleString()}</span>
                </div>
                <div className="pb-row">
                  <span>Taxes & fees (10%)</span>
                  <span>Rs. {Math.round(totalPrice * 0.1).toLocaleString()}</span>
                </div>
                <div className="pb-row">
                  <span>Total</span>
                  <span>Rs. {Math.round(totalPrice * 1.1).toLocaleString()}</span>
                </div>
              </div>
            )}

            {formError && <div className="form-error-msg">⚠️ {formError}</div>}

            {/* Payment method badges */}
            <div className="payment-methods-row">
              <span className="pm-label">Pay with:</span>
              <span className="pm-badge" style={{ color: "#635BFF", borderColor: "#c7c4ff" }}>stripe</span>
              <span className="pm-badge" style={{ color: "#FF5733", borderColor: "#ffc4b8" }}>PayHere</span>
              <span className="pm-badge">🏨 Hotel</span>
            </div>

            {/* 🔥 THE NEW BUTTON */}
            <button className="proceed-btn" onClick={handleProceedToPayment}>
              <LockIcon />
              Proceed to Payment
              <ArrowRight />
            </button>

            <p className="bc-note">Choose Pay Now or Pay at Hotel on the next page</p>
          </div>

        </div>
      </div>
    </>
  );
}

export default RoomDetail;