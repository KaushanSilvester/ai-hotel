import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

// ─── Demo data ────────────────────────────────────────────────────────────────
const DEMO_ROOMS = [
  { id:1, room_type:"Ocean View Suite", capacity:2, price:22000, area:45,
    image:"https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
    images:["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1631049552057-403cdb8f0658?auto=format&fit=crop&w=1200&q=80"],
    amenities:["Ocean View","WiFi","Mini Bar","TV","Balcony"], rating:4.8, reviews:124,
    description:"Wake up to breathtaking panoramic ocean views from this luxurious suite. Featuring a private balcony, king-size bed, and premium amenities, this suite offers the perfect blend of comfort and style. The spacious bathroom includes a soaking tub and rain shower.",
    floor:8, bed_type:"King Bed" },
  { id:2, room_type:"Deluxe Double Room", capacity:2, price:18000, area:35,
    image:"https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80",
    images:["https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80"],
    amenities:["WiFi","TV","Work Desk","Air Conditioning"], rating:4.6, reviews:89,
    description:"A sophisticated double room designed for both business and leisure travelers. Features a spacious work desk, high-speed WiFi, and a plush double bed.", floor:4, bed_type:"Double Bed" },
  { id:3, room_type:"Superior Single Room", capacity:1, price:11000, area:25,
    image:"https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=1200&q=80",
    images:["https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80"],
    amenities:["WiFi","TV","Air Conditioning"], rating:4.3, reviews:56,
    description:"A cozy and well-appointed single room, perfect for solo travelers.", floor:2, bed_type:"Single Bed" },
];

const AMENITY_ICONS = { "WiFi":"📶","TV":"📺","Mini Bar":"🍸","Balcony":"🌅","Ocean View":"🌊","Work Desk":"💼","Air Conditioning":"❄️","Pool":"🏊","Gym":"🏋️","Spa":"💆","Parking":"🅿️","Breakfast":"🍳","Pet Friendly":"🐾","Safe":"🔒","Bathtub":"🛁","Jacuzzi":"♨️","Sea View":"🌊" };

// ─── Icons ────────────────────────────────────────────────────────────────────
const BackIcon      = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>);
const UsersIcon     = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>);
const AreaIcon      = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>);
const BedIcon       = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>);
const FloorIcon     = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/></svg>);
const StarIcon      = ({filled}) => (<svg width="14" height="14" viewBox="0 0 24 24" fill={filled?"#b8952a":"none"} stroke="#b8952a" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>);
const CalIcon       = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>);
const ChevronLeft   = () => (<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>);
const ChevronRight  = () => (<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>);
const CloseIcon     = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>);
const GridIcon      = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>);
const LockIcon      = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>);
const ArrowRightIcon= () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>);

// ─── Theme tokens ─────────────────────────────────────────────────────────────
const THEMES = {
  dark: {
    pageBg:"#0a0a0a", topbarBg:"rgba(10,10,10,0.95)", infoBg:"#0d0d0d",
    cardBg:"#111", inputBg:"#1a1a1a", inputBorder:"rgba(255,255,255,0.1)",
    textPrimary:"#fff", textSecondary:"rgba(255,255,255,0.55)", textMuted:"rgba(255,255,255,0.3)",
    border:"rgba(255,255,255,0.08)", divider:"rgba(255,255,255,0.06)",
    metaBg:"rgba(255,255,255,0.05)", metaBorder:"rgba(255,255,255,0.08)",
    amenityBg:"rgba(255,255,255,0.04)", amenityBorder:"rgba(255,255,255,0.08)", amenityColor:"rgba(255,255,255,0.65)",
    reviewBg:"#111", reviewBorder:"rgba(255,255,255,0.07)",
    breakdownBg:"rgba(255,255,255,0.04)", breakdownBorder:"rgba(255,255,255,0.08)",
    successBg:"rgba(22,163,74,0.1)", successBorder:"rgba(22,163,74,0.3)",
    toggleBg:"rgba(255,255,255,0.06)", toggleBorder:"rgba(255,255,255,0.12)", toggleColor:"rgba(255,255,255,0.7)",
  },
  light: {
    pageBg:"#f5f0e8", topbarBg:"rgba(245,240,232,0.97)", infoBg:"#faf7f2",
    cardBg:"#fff", inputBg:"#f0ebe0", inputBorder:"rgba(26,20,16,0.12)",
    textPrimary:"#1a1410", textSecondary:"rgba(26,20,16,0.55)", textMuted:"rgba(26,20,16,0.35)",
    border:"rgba(26,20,16,0.08)", divider:"rgba(26,20,16,0.07)",
    metaBg:"rgba(26,20,16,0.04)", metaBorder:"rgba(26,20,16,0.08)",
    amenityBg:"rgba(26,20,16,0.03)", amenityBorder:"rgba(26,20,16,0.09)", amenityColor:"rgba(26,20,16,0.6)",
    reviewBg:"#f5f0e8", reviewBorder:"rgba(26,20,16,0.08)",
    breakdownBg:"rgba(26,20,16,0.03)", breakdownBorder:"rgba(26,20,16,0.09)",
    successBg:"rgba(22,163,74,0.07)", successBorder:"rgba(22,163,74,0.25)",
    toggleBg:"rgba(26,20,16,0.06)", toggleBorder:"rgba(26,20,16,0.14)", toggleColor:"rgba(26,20,16,0.65)",
  },
};

// ─── Normalize room ───────────────────────────────────────────────────────────
function normalizeRoom(room) {
  const amenities = Array.isArray(room.amenities)&&room.amenities.length>0 ? room.amenities
    : [room.wifi&&"WiFi",room.ac&&"Air Conditioning",room.tv&&"TV",room.balcony&&"Balcony",room.minibar&&"Mini Bar",room.sea_view&&"Ocean View",room.breakfast_included&&"Breakfast",room.jacuzzi&&"Jacuzzi",room.safe&&"Safe",room.bathtub&&"Bathtub",room.pet_friendly&&"Pet Friendly"].filter(Boolean);
  const images = Array.isArray(room.images)&&room.images.length>0 ? room.images : [room.image,room.image2,room.image3,room.image4].filter(Boolean);
  return { ...room, amenities, images, image:images[0]||null, area:room.size_sqm||room.area||null, reviews:room.total_reviews||room.reviews||0, rating:parseFloat(room.rating)||0, price:parseFloat(room.price)||0 };
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────
function Lightbox({ images, startIndex, onClose }) {
  const [current, setCurrent] = useState(startIndex);
  const prev = useCallback(() => setCurrent(i=>(i-1+images.length)%images.length), [images.length]);
  const next = useCallback(() => setCurrent(i=>(i+1)%images.length), [images.length]);
  useEffect(() => {
    const h = (e) => { if(e.key==="ArrowLeft")prev(); if(e.key==="ArrowRight")next(); if(e.key==="Escape")onClose(); };
    window.addEventListener("keydown",h); return ()=>window.removeEventListener("keydown",h);
  },[prev,next,onClose]);
  useEffect(() => { document.body.style.overflow="hidden"; return()=>{document.body.style.overflow=""}; },[]);
  return (
    <div className="lb-overlay" onClick={onClose}>
      <button className="lb-close" onClick={onClose}><CloseIcon/></button>
      <div className="lb-counter">{current+1} / {images.length}</div>
      <div className="lb-main" onClick={e=>e.stopPropagation()}>
        {images.length>1&&<button className="lb-nav lb-nav-prev" onClick={prev}><ChevronLeft/></button>}
        <img className="lb-img" src={images[current]} alt={`Photo ${current+1}`}/>
        {images.length>1&&<button className="lb-nav lb-nav-next" onClick={next}><ChevronRight/></button>}
      </div>
      {images.length>1&&(
        <div className="lb-thumbs" onClick={e=>e.stopPropagation()}>
          {images.map((img,i)=>(
            <div key={i} className={`lb-thumb ${i===current?"active":""}`} onClick={()=>setCurrent(i)}>
              <img src={img} alt=""/>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── StarPicker ───────────────────────────────────────────────────────────────
function StarPicker({value, onChange, readonly=false}) {
  const [hovered,setHovered]=useState(0);
  return (
    <div style={{display:"flex",gap:3}}>
      {[1,2,3,4,5].map(i=>(
        <span key={i}
          style={{fontSize:readonly?13:24,cursor:readonly?"default":"pointer",color:i<=(hovered||value)?"#b8952a":"rgba(184,149,42,0.25)",transition:"color 0.1s"}}
          onClick={()=>!readonly&&onChange(i)}
          onMouseEnter={()=>!readonly&&setHovered(i)}
          onMouseLeave={()=>!readonly&&setHovered(0)}
        >★</span>
      ))}
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({name}) {
  const colors=["#b8952a","#7c5c1e","#6b4e1a","#8a6e2a","#a07d20"];
  const color=colors[name.charCodeAt(0)%colors.length];
  return (<div style={{width:34,height:34,borderRadius:"50%",background:color,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Jost', 'Gill Sans', sans-serif",fontSize:13,fontWeight:600,flexShrink:0}}>{name[0].toUpperCase()}</div>);
}

// ─── ReviewSection ────────────────────────────────────────────────────────────
function ReviewSection({ roomId, T }) {
  const token=localStorage.getItem("token");
  const [reviews,setReviews]=useState([]);
  const [canData,setCanData]=useState({can_review:false,already_reviewed:false,has_booking:false});
  const [loading,setLoading]=useState(true);
  const [showForm,setShowForm]=useState(false);
  const [submitting,setSubmitting]=useState(false);
  const [deleting,setDeleting]=useState(null);
  const [form,setForm]=useState({rating:0,title:"",comment:""});
  const [formError,setFormError]=useState("");
  const [submitOk,setSubmitOk]=useState(false);
  const auth=token?{headers:{Authorization:`Bearer ${token}`}}:{};

  const fetchAll=async()=>{
    try {
      const [r1,r2]=await Promise.all([
        axios.get(`http://localhost:8000/api/rooms/${roomId}/reviews/`,auth),
        token?axios.get(`http://localhost:8000/api/rooms/${roomId}/reviews/can/`,auth):Promise.resolve(null)
      ]);
      setReviews(r1.data); if(r2)setCanData(r2.data);
    } catch{setReviews([]);}
    finally{setLoading(false);}
  };
  useEffect(()=>{fetchAll();},[roomId]);

  const handleSubmit=async()=>{
    setFormError("");
    if(!form.rating){setFormError("Please select a star rating.");return;}
    if(!form.comment.trim()){setFormError("Please write a comment.");return;}
    setSubmitting(true);
    try {
      await axios.post(`http://localhost:8000/api/rooms/${roomId}/reviews/create/`,{rating:form.rating,title:form.title,comment:form.comment},auth);
      setSubmitOk(true); setShowForm(false); setForm({rating:0,title:"",comment:""});
      fetchAll();
    } catch(err){setFormError(err?.response?.data?.error||"Failed to submit.");}
    finally{setSubmitting(false);}
  };

  const handleDelete=async(id)=>{
    if(!window.confirm("Delete your review?"))return;
    setDeleting(id);
    try{await axios.delete(`http://localhost:8000/api/reviews/${id}/delete/`,auth);setSubmitOk(false);fetchAll();}
    catch{}finally{setDeleting(null);}
  };

  const avg = reviews.length ? (reviews.reduce((s,r)=>s+r.rating,0)/reviews.length).toFixed(1) : null;
  const breakdown = [5,4,3,2,1].map(star=>({star,count:reviews.filter(r=>r.rating===star).length,pct:reviews.length?Math.round(reviews.filter(r=>r.rating===star).length/reviews.length*100):0}));

  const inp = { width:"100%", padding:"10px 14px", border:`1px solid ${T.inputBorder}`, background:T.inputBg, color:T.textPrimary, fontSize:13, fontFamily:"'Jost', 'Gill Sans', sans-serif", outline:"none", boxSizing:"border-box", transition:"border-color 0.2s" };

  return (
    <div>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
        <div>
          <div style={{fontSize:"9px",letterSpacing:"0.25em",textTransform:"uppercase",color:"#b8952a",marginBottom:6}}>Guest Experiences</div>
          <div style={{fontFamily:"'Bodoni Moda',Georgia,serif",fontSize:22,fontWeight:300,fontStyle:"italic",color:T.textPrimary}}>
            Reviews {reviews.length>0&&<span style={{fontSize:14,fontStyle:"normal",color:T.textMuted}}>({reviews.length})</span>}
          </div>
        </div>
        {token&&canData.can_review&&!showForm&&(
          <button onClick={()=>setShowForm(true)} style={{padding:"10px 22px",background:"#b8952a",color:"#fff",border:"none",fontFamily:"'Jost', 'Gill Sans', sans-serif",fontSize:"10px",fontWeight:600,letterSpacing:"0.18em",textTransform:"uppercase",cursor:"pointer",transition:"background 0.2s"}}>
            ✍️ Write Review
          </button>
        )}
      </div>

      {submitOk&&(<div style={{background:T.successBg,border:`1px solid ${T.successBorder}`,padding:"12px 16px",fontSize:12.5,color:"#16a34a",marginBottom:16,letterSpacing:"0.04em"}}>✅ Your review was submitted — thank you!</div>)}

      {/* Rating summary */}
      {reviews.length>0&&(
        <div style={{border:`1px solid ${T.border}`,padding:"20px 24px",marginBottom:20,display:"flex",gap:28,flexWrap:"wrap",background:T.amenityBg}}>
          <div style={{textAlign:"center",minWidth:80}}>
            <div style={{fontFamily:"'Bodoni Moda',Georgia,serif",fontSize:52,fontWeight:300,color:"#b8952a",lineHeight:1}}>{avg}</div>
            <div style={{display:"flex",justifyContent:"center",margin:"6px 0"}}><StarPicker value={Math.round(avg)} readonly/></div>
            <div style={{fontSize:10,letterSpacing:"0.15em",textTransform:"uppercase",color:T.textMuted}}>{reviews.length} review{reviews.length!==1?"s":""}</div>
          </div>
          <div style={{flex:1,minWidth:180}}>
            {breakdown.map(({star,count,pct})=>(
              <div key={star} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                <span style={{fontSize:11,color:T.textMuted,width:12,textAlign:"right"}}>{star}</span>
                <span style={{fontSize:12,color:"#b8952a"}}>★</span>
                <div style={{flex:1,height:2,background:T.border,overflow:"hidden"}}>
                  <div style={{width:`${pct}%`,height:"100%",background:"#b8952a",transition:"width 0.4s"}}/>
                </div>
                <span style={{fontSize:11,color:T.textMuted,width:18}}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Write form */}
      {showForm&&(
        <div style={{border:`1px solid ${T.border}`,padding:"24px",marginBottom:20,background:T.infoBg}}>
          <div style={{fontFamily:"'Bodoni Moda',Georgia,serif",fontSize:20,fontWeight:300,fontStyle:"italic",color:T.textPrimary,marginBottom:20}}>Share Your Experience</div>
          <div style={{marginBottom:14}}>
            <div style={{fontSize:"9px",letterSpacing:"0.2em",textTransform:"uppercase",color:T.textMuted,marginBottom:8}}>Your Rating *</div>
            <StarPicker value={form.rating} onChange={v=>setForm(f=>({...f,rating:v}))}/>
            {form.rating>0&&<div style={{fontSize:11,color:"#b8952a",marginTop:6,letterSpacing:"0.1em"}}>{["","Terrible","Poor","Average","Good","Excellent"][form.rating]}</div>}
          </div>
          <div style={{marginBottom:12}}>
            <div style={{fontSize:"9px",letterSpacing:"0.2em",textTransform:"uppercase",color:T.textMuted,marginBottom:7}}>Title <span style={{opacity:0.5}}>(optional)</span></div>
            <input value={form.title} maxLength={120} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="e.g. An unforgettable stay" style={inp} onFocus={e=>e.target.style.borderColor="#b8952a"} onBlur={e=>e.target.style.borderColor=T.inputBorder}/>
          </div>
          <div style={{marginBottom:16}}>
            <div style={{fontSize:"9px",letterSpacing:"0.2em",textTransform:"uppercase",color:T.textMuted,marginBottom:7}}>Comment *</div>
            <textarea value={form.comment} rows={4} onChange={e=>setForm(f=>({...f,comment:e.target.value}))} placeholder="Share your experience with this room..." style={{...inp,resize:"vertical"}} onFocus={e=>e.target.style.borderColor="#b8952a"} onBlur={e=>e.target.style.borderColor=T.inputBorder}/>
          </div>
          {formError&&<div style={{border:`1px solid rgba(220,38,38,0.3)`,background:"rgba(220,38,38,0.06)",padding:"10px 14px",fontSize:12,color:"#dc2626",marginBottom:14,letterSpacing:"0.03em"}}>⚠️ {formError}</div>}
          <div style={{display:"flex",gap:10}}>
            <button onClick={handleSubmit} disabled={submitting} style={{padding:"11px 28px",background:"#b8952a",color:"#fff",border:"none",fontFamily:"'Jost', 'Gill Sans', sans-serif",fontSize:"10px",fontWeight:600,letterSpacing:"0.18em",textTransform:"uppercase",cursor:"pointer",opacity:submitting?0.7:1}}>
              {submitting?"Submitting…":"Submit Review"}
            </button>
            <button onClick={()=>{setShowForm(false);setFormError("");setForm({rating:0,title:"",comment:""});}} style={{padding:"11px 22px",background:"transparent",color:T.textMuted,border:`1px solid ${T.border}`,fontFamily:"'Jost', 'Gill Sans', sans-serif",fontSize:"10px",fontWeight:500,letterSpacing:"0.15em",textTransform:"uppercase",cursor:"pointer"}}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {token&&!canData.has_booking&&!loading&&(
        <div style={{border:`1px solid ${T.border}`,padding:"12px 16px",fontSize:12,color:T.textMuted,marginBottom:16,letterSpacing:"0.04em"}}>
          🔒 Only guests who have booked this room may leave a review.
        </div>
      )}
      {!token&&(
        <div style={{border:`1px solid rgba(184,149,42,0.2)`,background:"rgba(184,149,42,0.04)",padding:"12px 16px",fontSize:12,color:"#b8952a",marginBottom:16,letterSpacing:"0.04em"}}>
          <a href="/login" style={{color:"#b8952a",fontWeight:600,textDecoration:"none"}}>Sign in</a> to leave a review after your stay.
        </div>
      )}

      {/* Review list */}
      {loading ? (
        <div style={{color:T.textMuted,fontSize:12,letterSpacing:"0.1em",padding:"20px 0"}}>Loading reviews…</div>
      ) : reviews.length===0 ? (
        <div style={{textAlign:"center",padding:"40px 20px",border:`1px dashed ${T.border}`}}>
          <div style={{fontFamily:"'Bodoni Moda',Georgia,serif",fontSize:20,fontWeight:300,fontStyle:"italic",color:T.textMuted,marginBottom:6}}>No reviews yet</div>
          <div style={{fontSize:11,letterSpacing:"0.1em",textTransform:"uppercase",color:T.textMuted}}>Be the first to share your experience</div>
        </div>
      ) : (
        reviews.map(rev=>(
          <div key={rev.id} style={{border:`1px solid ${rev.is_mine?"rgba(184,149,42,0.3)":T.reviewBorder}`,background:rev.is_mine?"rgba(184,149,42,0.04)":T.reviewBg,padding:"18px 20px",marginBottom:2}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <Avatar name={rev.username}/>
                <div>
                  <div style={{fontSize:13,fontWeight:600,color:T.textPrimary,letterSpacing:"0.03em"}}>
                    {rev.username}
                    {rev.is_mine&&<span style={{marginLeft:8,fontSize:9,fontWeight:600,background:"#b8952a",color:"#fff",padding:"2px 8px",letterSpacing:"0.15em",textTransform:"uppercase"}}>You</span>}
                  </div>
                  <div style={{fontSize:10,color:T.textMuted,letterSpacing:"0.05em",marginTop:2}}>
                    {new Date(rev.created_at).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})}
                  </div>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <StarPicker value={rev.rating} readonly/>
                {rev.is_mine&&(
                  <button onClick={()=>handleDelete(rev.id)} disabled={deleting===rev.id} style={{background:"none",border:"none",cursor:"pointer",color:"rgba(220,38,38,0.7)",fontSize:11,fontWeight:500,fontFamily:"'Jost', 'Gill Sans', sans-serif",letterSpacing:"0.08em",opacity:deleting===rev.id?0.5:1}}>
                    {deleting===rev.id?"Deleting…":"Delete"}
                  </button>
                )}
              </div>
            </div>
            {rev.title&&<div style={{fontSize:14,fontFamily:"'Bodoni Moda',Georgia,serif",fontStyle:"italic",color:T.textPrimary,marginBottom:6}}>{rev.title}</div>}
            <p style={{fontSize:13,color:T.textSecondary,lineHeight:1.7,margin:0,fontWeight:300}}>{rev.comment}</p>
          </div>
        ))
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
function RoomDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // 🔥 Theme — synced with LandingPage + Home
  const [theme, setTheme] = useState(() => localStorage.getItem("lp_theme") || "dark");
  const T = THEMES[theme];
  const toggleTheme = () => {
    const next = theme==="dark"?"light":"dark";
    setTheme(next);
    localStorage.setItem("lp_theme", next);
  };

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
      .then(res=>setRoom(normalizeRoom(res.data)))
      .catch(()=>{ const d=DEMO_ROOMS.find(r=>r.id===Number(id)); setRoom(d?normalizeRoom(d):null); });
  },[id]);

  useEffect(() => {
    if(checkIn&&checkOut){ const diff=(new Date(checkOut)-new Date(checkIn))/(1000*60*60*24); setNights(diff>0?diff:0); }
    else setNights(0);
  },[checkIn,checkOut]);

  const openLightbox=(i)=>{ setLightboxStart(i); setLightboxOpen(true); };

  const handleProceedToPayment=()=>{
    setFormError("");
    if(!localStorage.getItem("token")){ navigate("/login"); return; }
    if(!checkIn||!checkOut){ setFormError("Please select check-in and check-out dates."); return; }
    if(nights<=0){ setFormError("Check-out must be after check-in."); return; }
    if(guests<1||guests>room.capacity){ setFormError(`Guests must be between 1 and ${room.capacity}.`); return; }
    navigate("/payment",{state:{room,checkIn,checkOut,guests}});
  };

  if(!room) return (
    <div style={{display:"flex",justifyContent:"center",alignItems:"center",height:"100vh",fontFamily:"'Jost', 'Gill Sans', sans-serif",color:"rgba(184,149,42,0.6)",background:"#0a0a0a",letterSpacing:"0.15em",fontSize:12,textTransform:"uppercase"}}>
      Loading…
    </div>
  );

  const allImages  = room.images?.length>0 ? room.images : [room.image].filter(Boolean);
  const totalPrice = room.price * nights;
  const inputStyle = { width:"100%", padding:"10px 12px 10px 34px", border:`1px solid ${T.inputBorder}`, background:T.inputBg, color:T.textPrimary, fontSize:12.5, fontFamily:"'Jost', 'Gill Sans', sans-serif", outline:"none", transition:"border-color 0.2s, background 0.4s" };

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
        .rd-root{font-family:'Jost', 'Gill Sans', sans-serif;background:${T.pageBg};min-height:100vh;transition:background 0.4s;}

        /* ── TOPBAR ── */
        .rd-topbar{background:${T.topbarBg};padding:0 32px;display:flex;align-items:center;justify-content:space-between;height:60px;position:sticky;top:0;z-index:50;border-bottom:1px solid ${T.border};backdrop-filter:blur(12px);transition:background 0.4s,border-color 0.4s;}
        .back-btn{display:flex;align-items:center;gap:8px;background:none;border:1px solid ${T.border};color:${T.textSecondary};padding:7px 16px;font-family:'Jost', 'Gill Sans', sans-serif;font-size:10px;font-weight:500;letter-spacing:0.18em;text-transform:uppercase;cursor:pointer;transition:all 0.2s;}
        .back-btn:hover{border-color:#b8952a;color:#b8952a;}
        .rd-topbar-title{font-family:'Bodoni Moda','Didot','Playfair Display',Georgia,serif;font-optical-sizing:auto;font-optical-sizing:auto;font-size:18px;font-weight:400;font-style:italic;color:${T.textPrimary};letter-spacing:0.02em;transition:color 0.4s;}
        .theme-toggle-btn{display:flex;align-items:center;gap:7px;background:${T.toggleBg};border:1px solid ${T.toggleBorder};color:${T.toggleColor};padding:7px 14px;border-radius:20px;cursor:pointer;font-family:'Jost', 'Gill Sans', sans-serif;font-size:10px;font-weight:500;letter-spacing:0.1em;transition:all 0.3s;}
        .theme-toggle-btn:hover{border-color:#b8952a;color:#b8952a;}
        .toggle-pill-sm{width:34px;height:18px;border-radius:9px;background:${theme==="dark"?"#1a1a1a":"#e0d8cc"};border:1px solid ${theme==="dark"?"rgba(255,255,255,0.12)":"rgba(26,20,16,0.18)"};display:flex;align-items:center;padding:2px;transition:background 0.3s;}
        .toggle-knob-sm{width:12px;height:12px;border-radius:50%;background:#b8952a;transform:translateX(${theme==="dark"?"0":"16px"});transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1);font-size:8px;display:flex;align-items:center;justify-content:center;}

        /* ── BODY ── */
        .rd-body{max-width:1160px;margin:0 auto;padding:32px 28px;display:flex;gap:28px;align-items:flex-start;}
        .rd-left{flex:1;min-width:0;}

        /* ── GALLERY ── */
        .gallery-main{width:100%;height:460px;position:relative;margin-bottom:3px;overflow:hidden;}
        .gallery-main-img{width:100%;height:100%;object-fit:cover;cursor:zoom-in;transition:transform 0.5s ease;display:block;}
        .gallery-main:hover .gallery-main-img{transform:scale(1.02);}

        .view-all-btn{position:absolute;bottom:16px;right:16px;background:rgba(0,0,0,0.6);border:1px solid rgba(184,149,42,0.5);color:#b8952a;padding:8px 16px;font-family:'Jost', 'Gill Sans', sans-serif;font-size:10px;font-weight:500;letter-spacing:0.18em;text-transform:uppercase;cursor:pointer;display:flex;align-items:center;gap:7px;backdrop-filter:blur(4px);transition:all 0.2s;}
        .view-all-btn:hover{background:rgba(184,149,42,0.2);border-color:#b8952a;}

        .img-counter{position:absolute;top:16px;right:16px;background:rgba(0,0,0,0.55);color:rgba(255,255,255,0.8);font-size:11px;font-weight:500;padding:4px 12px;letter-spacing:0.12em;backdrop-filter:blur(4px);}

        .gallery-arrow{position:absolute;top:50%;transform:translateY(-50%);background:rgba(0,0,0,0.45);border:none;width:42px;height:42px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background 0.15s;z-index:2;backdrop-filter:blur(4px);}
        .gallery-arrow:hover{background:rgba(184,149,42,0.4);}
        .gallery-arrow-left{left:14px;}.gallery-arrow-right{right:14px;}

        .gallery-thumbs{display:flex;gap:3px;margin-bottom:20px;}
        .gallery-thumb{width:80px;height:56px;overflow:hidden;cursor:pointer;border:2px solid transparent;flex-shrink:0;transition:border-color 0.15s,opacity 0.15s;}
        .gallery-thumb.active{border-color:#b8952a;}
        .gallery-thumb:not(.active){opacity:0.5;}
        .gallery-thumb:hover{opacity:0.85;}
        .gallery-thumb img{width:100%;height:100%;object-fit:cover;display:block;}
        .gallery-thumb-more{width:80px;height:56px;flex-shrink:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;cursor:pointer;color:#b8952a;font-size:11px;font-weight:600;letter-spacing:0.08em;transition:background 0.15s;}
        .gallery-thumb-more:hover{background:rgba(184,149,42,0.3);}

        /* ── INFO ── */
        .rd-info{background:${T.infoBg};border:1px solid ${T.border};padding:32px;transition:background 0.4s,border-color 0.4s;}

        .rd-room-label{font-size:9px;letter-spacing:0.3em;text-transform:uppercase;color:#b8952a;margin-bottom:8px;}
        .rd-room-name{font-family:'Bodoni Moda','Didot','Playfair Display',Georgia,serif;font-optical-sizing:auto;font-optical-sizing:auto;font-size:clamp(26px,3vw,38px);font-weight:400;color:${T.textPrimary};margin-bottom:4px;transition:color 0.4s;}
        .rd-room-sub{font-size:11px;color:${T.textMuted};letter-spacing:0.12em;margin-bottom:24px;transition:color 0.4s;}

        .rd-meta-row{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:20px;}
        .rd-meta-item{display:flex;align-items:center;gap:6px;font-size:11px;color:${T.textSecondary};font-weight:400;background:${T.metaBg};border:1px solid ${T.metaBorder};padding:6px 14px;letter-spacing:0.06em;transition:background 0.4s,border-color 0.4s,color 0.4s;}

        .rd-rating-row{display:flex;align-items:center;gap:8px;margin-bottom:24px;}
        .rd-rating-num{font-family:'Bodoni Moda','Didot','Playfair Display',Georgia,serif;font-optical-sizing:auto;font-optical-sizing:auto;font-size:22px;font-weight:400;color:#b8952a;}
        .rd-rating-count{font-size:11px;color:${T.textMuted};letter-spacing:0.06em;transition:color 0.4s;}

        .gold-divider{height:1px;background:linear-gradient(to right,transparent,rgba(184,149,42,0.4),transparent);margin:24px 0;}

        .section-eyebrow{font-size:9px;letter-spacing:0.3em;text-transform:uppercase;color:#b8952a;margin-bottom:10px;}
        .section-heading{font-family:'Bodoni Moda','Didot','Playfair Display',Georgia,serif;font-optical-sizing:auto;font-optical-sizing:auto;font-size:20px;font-weight:400;font-style:italic;color:${T.textPrimary};margin-bottom:14px;transition:color 0.4s;}
        .rd-desc{font-size:13px;font-weight:300;line-height:1.85;color:${T.textSecondary};margin-bottom:24px;transition:color 0.4s;}

        .amenity-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:2px;margin-bottom:24px;}
        .amenity-card{display:flex;align-items:center;gap:10px;background:${T.amenityBg};border:1px solid ${T.amenityBorder};padding:12px 14px;font-size:12px;color:${T.amenityColor};letter-spacing:0.04em;transition:border-color 0.2s,color 0.2s,background 0.4s;}
        .amenity-card:hover{border-color:#b8952a;color:#b8952a;}
        .amenity-emoji{font-size:16px;}

        .review-card-outer{background:${T.reviewBg};border:1px solid ${T.reviewBorder};padding:18px 20px;margin-bottom:2px;transition:background 0.4s,border-color 0.4s;}
        .reviewer-name{font-size:13px;font-weight:600;color:${T.textPrimary};letter-spacing:0.03em;transition:color 0.4s;}
        .review-date{font-size:10px;color:${T.textMuted};letter-spacing:0.05em;transition:color 0.4s;}
        .review-text{font-size:13px;color:${T.textSecondary};line-height:1.7;font-weight:300;margin:0;transition:color 0.4s;}

        /* ── BOOKING CARD ── */
        .booking-card{width:300px;flex-shrink:0;background:${T.cardBg};border:1px solid ${T.border};padding:28px;position:sticky;top:76px;transition:background 0.4s,border-color 0.4s;}

        .bc-price-label{font-size:9px;letter-spacing:0.25em;text-transform:uppercase;color:#b8952a;margin-bottom:6px;}
        .bc-price{font-family:'Bodoni Moda','Didot','Playfair Display',Georgia,serif;font-optical-sizing:auto;font-optical-sizing:auto;font-size:36px;font-weight:400;color:${T.textPrimary};transition:color 0.4s;}
        .bc-per{font-size:11px;color:${T.textMuted};font-weight:400;transition:color 0.4s;}
        .bc-rating{display:flex;align-items:center;gap:6px;margin-top:6px;margin-bottom:24px;padding-bottom:20px;border-bottom:1px solid ${T.divider};}
        .bc-rating-num{font-size:13px;font-weight:600;color:#b8952a;}
        .bc-rating-count{font-size:11px;color:${T.textMuted};transition:color 0.4s;}

        .bc-field{margin-bottom:14px;}
        .bc-label{font-size:9px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:${T.textMuted};margin-bottom:6px;display:block;transition:color 0.4s;}
        .bc-input-wrap{position:relative;display:flex;align-items:center;}
        .bc-icon{position:absolute;left:11px;display:flex;pointer-events:none;color:${T.textMuted};}

        .price-breakdown{background:${T.breakdownBg};border:1px solid ${T.breakdownBorder};padding:14px 16px;margin:16px 0;transition:background 0.4s,border-color 0.4s;}
        .pb-row{display:flex;justify-content:space-between;font-size:12px;color:${T.textMuted};margin-bottom:8px;letter-spacing:0.03em;transition:color 0.4s;}
        .pb-row.total{margin-bottom:0;padding-top:10px;border-top:1px solid ${T.border};font-size:13px;font-weight:600;color:${T.textPrimary};}
        .pb-gold{color:#b8952a;}

        .form-error-msg{border:1px solid rgba(220,38,38,0.3);background:rgba(220,38,38,0.06);padding:10px 14px;font-size:12px;color:"#dc2626";margin-bottom:12px;letter-spacing:0.03em;}

        .payment-methods-row{display:flex;gap:6px;margin-bottom:16px;align-items:center;flex-wrap:wrap;}
        .pm-label{font-size:9px;letter-spacing:0.15em;text-transform:uppercase;color:${T.textMuted};}
        .pm-badge{padding:3px 10px;border:1px solid ${T.border};font-size:10px;font-weight:600;color:${T.textMuted};}

        .proceed-btn{width:100%;padding:14px;background:#b8952a;color:#fff;border:none;font-family:'Jost', 'Gill Sans', sans-serif;font-size:10px;font-weight:600;letter-spacing:0.22em;text-transform:uppercase;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;transition:background 0.2s,transform 0.12s;margin-top:4px;}
        .proceed-btn:hover{background:#a07d20;transform:translateY(-1px);}
        .proceed-btn:active{transform:translateY(0);}
        .bc-note{text-align:center;font-size:10px;color:${T.textMuted};margin-top:10px;letter-spacing:0.08em;transition:color 0.4s;}

        .success-box{background:${T.successBg};border:1px solid ${T.successBorder};padding:20px;text-align:center;margin-top:12px;}
        .success-box h4{font-family:'Bodoni Moda','Didot','Playfair Display',Georgia,serif;font-optical-sizing:auto;font-optical-sizing:auto;font-size:20px;font-weight:400;font-style:italic;color:#16a34a;margin-bottom:8px;}
        .success-box p{font-size:12px;color:${T.textMuted};line-height:1.6;letter-spacing:0.03em;transition:color 0.4s;}

        /* ── LIGHTBOX ── */
        .lb-overlay{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.95);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;animation:lbFadeIn 0.2s ease;}
        @keyframes lbFadeIn{from{opacity:0;}to{opacity:1;}}
        .lb-close{position:absolute;top:20px;right:20px;background:rgba(255,255,255,0.08);border:1px solid rgba(184,149,42,0.3);width:42px;height:42px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.15s;z-index:2;}
        .lb-close:hover{background:rgba(184,149,42,0.2);border-color:#b8952a;}
        .lb-counter{position:absolute;top:26px;left:50%;transform:translateX(-50%);color:rgba(255,255,255,0.5);font-size:11px;font-weight:500;letter-spacing:0.2em;font-family:'Jost', 'Gill Sans', sans-serif;}
        .lb-main{position:relative;display:flex;align-items:center;justify-content:center;width:100%;max-width:960px;flex:1;}
        .lb-img{max-width:100%;max-height:calc(100vh - 180px);object-fit:contain;box-shadow:0 20px 60px rgba(0,0,0,0.5);animation:lbSlide 0.2s ease;}
        @keyframes lbSlide{from{opacity:0;transform:scale(0.97);}to{opacity:1;transform:scale(1);}}
        .lb-nav{position:absolute;top:50%;transform:translateY(-50%);background:rgba(255,255,255,0.06);border:1px solid rgba(184,149,42,0.25);width:48px;height:48px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.15s;z-index:2;}
        .lb-nav:hover{background:rgba(184,149,42,0.2);border-color:#b8952a;}
        .lb-nav-prev{left:-64px;}.lb-nav-next{right:-64px;}
        .lb-thumbs{display:flex;gap:4px;margin-top:16px;overflow-x:auto;max-width:960px;padding-bottom:4px;}
        .lb-thumbs::-webkit-scrollbar{height:2px;}
        .lb-thumbs::-webkit-scrollbar-thumb{background:rgba(184,149,42,0.4);}
        .lb-thumb{width:68px;height:48px;overflow:hidden;cursor:pointer;flex-shrink:0;border:1px solid transparent;opacity:0.4;transition:opacity 0.15s,border-color 0.15s;}
        .lb-thumb.active{border-color:#b8952a;opacity:1;}
        .lb-thumb:hover{opacity:0.8;}
        .lb-thumb img{width:100%;height:100%;object-fit:cover;display:block;}

        @media(max-width:768px){
          .rd-body{flex-direction:column;}
          .booking-card{width:100%;position:static;}
          .gallery-main{height:280px;}
          .lb-nav-prev{left:4px;}.lb-nav-next{right:4px;}
          .amenity-grid{grid-template-columns:repeat(2,1fr);}
        }
      `}</style>

      {lightboxOpen&&(<Lightbox images={allImages} startIndex={lightboxStart} onClose={()=>setLightboxOpen(false)}/>)}

      <div className="rd-root">

        {/* ── TOPBAR ── */}
        <div className="rd-topbar">
          <button className="back-btn" onClick={()=>navigate(-1)}>
            <BackIcon/> Back
          </button>
          <span className="rd-topbar-title">{room.room_type}</span>
          {/* Theme toggle */}
          <button className="theme-toggle-btn" onClick={toggleTheme}>
            <span style={{fontSize:14}}>{theme==="dark"?"🌙":"☀️"}</span>
            <div className="toggle-pill-sm"><div className="toggle-knob-sm">{theme==="dark"?"🌙":"☀️"}</div></div>
            <span>{theme==="dark"?"Light":"Dark"}</span>
          </button>
        </div>

        <div className="rd-body">
          {/* ── LEFT ── */}
          <div className="rd-left">

            {/* Gallery */}
            <div className="gallery-main">
              <img className="gallery-main-img" src={allImages[activeImg]} alt={room.room_type} onClick={()=>openLightbox(activeImg)}/>
              {allImages.length>1&&<div className="img-counter">{activeImg+1} / {allImages.length}</div>}
              {allImages.length>1&&(
                <>
                  <button className="gallery-arrow gallery-arrow-left" onClick={()=>setActiveImg(i=>(i-1+allImages.length)%allImages.length)}><ChevronLeft/></button>
                  <button className="gallery-arrow gallery-arrow-right" onClick={()=>setActiveImg(i=>(i+1)%allImages.length)}><ChevronRight/></button>
                </>
              )}
              {allImages.length>1&&(
                <button className="view-all-btn" onClick={()=>openLightbox(activeImg)}>
                  <GridIcon/> View all {allImages.length} photos
                </button>
              )}
            </div>

            {allImages.length>1&&(
              <div className="gallery-thumbs">
                {allImages.slice(0,4).map((img,i)=>(
                  <div key={i} className={`gallery-thumb ${activeImg===i?"active":""}`} onClick={()=>setActiveImg(i)}>
                    <img src={img} alt=""/>
                  </div>
                ))}
                {allImages.length>4&&(
                  <div className="gallery-thumb-more" onClick={()=>openLightbox(4)}>+{allImages.length-4} more</div>
                )}
              </div>
            )}

            {/* Info */}
            <div className="rd-info">
              <div className="rd-room-label">Accommodation</div>
              <div className="rd-room-name">
                {room.room_type}
                {room.room_number&&<span style={{fontSize:14,fontStyle:"normal",fontWeight:300,color:T.textMuted,marginLeft:12}}>· Room {room.room_number}</span>}
              </div>
              {room.bed_type&&<div className="rd-room-sub">{room.bed_type}{room.floor?` · Floor ${room.floor}`:""}</div>}

              <div className="rd-meta-row">
                <div className="rd-meta-item"><UsersIcon/> Max {room.capacity} guests</div>
                {room.area&&<div className="rd-meta-item"><AreaIcon/> {room.area} m²</div>}
                <div className="rd-meta-item"><BedIcon/> {room.bed_type||"King Bed"}</div>
                {room.floor&&<div className="rd-meta-item"><FloorIcon/> Floor {room.floor}</div>}
                {room.sea_view&&<div className="rd-meta-item">🌊 Sea View</div>}
                {room.breakfast_included&&<div className="rd-meta-item">🍳 Breakfast incl.</div>}
                {room.pet_friendly&&<div className="rd-meta-item">🐾 Pet Friendly</div>}
              </div>

              <div className="rd-rating-row">
                {Array.from({length:5},(_,i)=><StarIcon key={i} filled={i<Math.round(room.rating||4)}/>)}
                <span className="rd-rating-num">{(room.rating||4.5).toFixed(1)}</span>
                <span className="rd-rating-count">({room.reviews||0} reviews)</span>
              </div>

              <div className="gold-divider"/>

              <div className="section-eyebrow">About this room</div>
              <p className="rd-desc">{room.description||"A comfortable and well-appointed room with all the amenities you need for a pleasant stay."}</p>

              <div className="section-eyebrow">Amenities & Services</div>
              <div className="amenity-grid">
                {(room.amenities||[]).map(a=>(
                  <div key={a} className="amenity-card">
                    <span className="amenity-emoji">{AMENITY_ICONS[a]||"✔️"}</span>
                    <span>{a}</span>
                  </div>
                ))}
              </div>

              <div className="gold-divider"/>

              {/* Reviews */}
              <ReviewSection roomId={room.id} T={T}/>
            </div>
          </div>

          {/* ── BOOKING CARD ── */}
          <div className="booking-card">
            <div className="bc-price-label">Starting from</div>
            <span className="bc-price">Rs. {Number(room.price).toLocaleString()}</span>
            <span className="bc-per"> / night</span>

            <div className="bc-rating">
              {Array.from({length:5},(_,i)=><StarIcon key={i} filled={i<Math.round(room.rating||4)}/>)}
              <span className="bc-rating-num">{(room.rating||4.5).toFixed(1)}</span>
              <span className="bc-rating-count">· {room.reviews||0} reviews</span>
            </div>

            <div className="bc-field">
              <label className="bc-label">Check-in</label>
              <div className="bc-input-wrap">
                <span className="bc-icon"><CalIcon/></span>
                <input type="date" value={checkIn} min={new Date().toISOString().split("T")[0]}
                  onChange={e=>{setCheckIn(e.target.value);setFormError("");}} style={inputStyle}
                  onFocus={e=>e.target.style.borderColor="#b8952a"} onBlur={e=>e.target.style.borderColor=T.inputBorder}/>
              </div>
            </div>

            <div className="bc-field">
              <label className="bc-label">Check-out</label>
              <div className="bc-input-wrap">
                <span className="bc-icon"><CalIcon/></span>
                <input type="date" value={checkOut} min={checkIn||new Date().toISOString().split("T")[0]}
                  onChange={e=>{setCheckOut(e.target.value);setFormError("");}} style={inputStyle}
                  onFocus={e=>e.target.style.borderColor="#b8952a"} onBlur={e=>e.target.style.borderColor=T.inputBorder}/>
              </div>
            </div>

            <div className="bc-field">
              <label className="bc-label">Guests</label>
              <div className="bc-input-wrap">
                <span className="bc-icon"><UsersIcon/></span>
                <input type="number" min="1" max={room.capacity} value={guests}
                  onChange={e=>{setGuests(Number(e.target.value));setFormError("");}} style={{...inputStyle,paddingLeft:34}}
                  onFocus={e=>e.target.style.borderColor="#b8952a"} onBlur={e=>e.target.style.borderColor=T.inputBorder}/>
              </div>
            </div>

            {nights>0&&(
              <div className="price-breakdown">
                <div className="pb-row">
                  <span>Rs. {Number(room.price).toLocaleString()} × {nights} night{nights>1?"s":""}</span>
                  <span>Rs. {(room.price*nights).toLocaleString()}</span>
                </div>
                <div className="pb-row">
                  <span>Taxes & fees (10%)</span>
                  <span>Rs. {Math.round(totalPrice*0.1).toLocaleString()}</span>
                </div>
                <div className="pb-row total">
                  <span>Total</span>
                  <span className="pb-gold">Rs. {Math.round(totalPrice*1.1).toLocaleString()}</span>
                </div>
              </div>
            )}

            {formError&&(
              <div className="form-error-msg" style={{color:"#dc2626"}}>⚠️ {formError}</div>
            )}

            <div className="payment-methods-row">
              <span className="pm-label">Pay with</span>
              <span className="pm-badge" style={{color:"#635BFF",borderColor:"rgba(99,91,255,0.3)"}}>stripe</span>
              <span className="pm-badge" style={{color:"#FF5733",borderColor:"rgba(255,87,51,0.3)"}}>PayHere</span>
              <span className="pm-badge">🏨 Hotel</span>
            </div>

            <button className="proceed-btn" onClick={handleProceedToPayment}>
              <LockIcon/> Proceed to Payment <ArrowRightIcon/>
            </button>

            <p className="bc-note">Choose Pay Now or Pay at Hotel on the next step</p>
          </div>

        </div>
      </div>
    </>
  );
}

export default RoomDetail;