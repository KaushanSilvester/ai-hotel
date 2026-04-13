import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const formatCard   = (v) => v.replace(/\D/g,"").slice(0,16).replace(/(.{4})/g,"$1 ").trim();
const formatExpiry = (v) => { const d=v.replace(/\D/g,"").slice(0,4); return d.length>2?d.slice(0,2)+"/"+d.slice(2):d; };
const nightsBetween = (a,b) => { const d=(new Date(b)-new Date(a))/(1000*60*60*24); return d>0?Math.round(d):0; };

const THEMES = {
  dark:  { pageBg:"#0a0a0a", cardBg:"#0d0d0d", inputBg:"#1a1a1a", inputBorder:"rgba(255,255,255,0.1)", textPrimary:"#fff", textSecondary:"rgba(255,255,255,0.55)", textMuted:"rgba(255,255,255,0.3)", border:"rgba(255,255,255,0.08)", divider:"rgba(255,255,255,0.06)", summaryBg:"#111", breakdownBg:"rgba(255,255,255,0.04)", optionBg:"#111", optionSelectedBg:"rgba(184,149,42,0.07)", toggleBg:"rgba(255,255,255,0.06)", toggleBorder:"rgba(255,255,255,0.12)", toggleColor:"rgba(255,255,255,0.7)", successBg:"rgba(22,163,74,0.08)", successBorder:"rgba(22,163,74,0.25)" },
  light: { pageBg:"#f5f0e8", cardBg:"#faf7f2", inputBg:"#f0ebe0", inputBorder:"rgba(26,20,16,0.12)", textPrimary:"#1a1410", textSecondary:"rgba(26,20,16,0.55)", textMuted:"rgba(26,20,16,0.35)", border:"rgba(26,20,16,0.09)", divider:"rgba(26,20,16,0.07)", summaryBg:"#f0ebe0", breakdownBg:"rgba(26,20,16,0.03)", optionBg:"#f0ebe0", optionSelectedBg:"rgba(184,149,42,0.08)", toggleBg:"rgba(26,20,16,0.06)", toggleBorder:"rgba(26,20,16,0.14)", toggleColor:"rgba(26,20,16,0.65)", successBg:"rgba(22,163,74,0.07)", successBorder:"rgba(22,163,74,0.2)" },
};

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const token    = localStorage.getItem("token");
  const { room, checkIn, checkOut, guests } = location.state || {};

  const [theme,setTheme] = useState(()=>localStorage.getItem("lp_theme")||"dark");
  const T = THEMES[theme];
  const toggleTheme = ()=>{ const n=theme==="dark"?"light":"dark"; setTheme(n); localStorage.setItem("lp_theme",n); };

  useEffect(()=>{ if(!room||!checkIn||!checkOut) navigate("/"); if(!token) navigate("/login"); },[]);

  const nights   = nightsBetween(checkIn,checkOut);
  const subtotal = parseFloat(room?.price||0)*nights;
  const tax      = Math.round(subtotal*0.1);
  const total    = subtotal+tax;

  const [payWhen,setPayWhen]   = useState("now");
  const [method,setMethod]     = useState("stripe");
  const [step,setStep]         = useState("select");
  const [apiError,setApiError] = useState("");
  const [card,setCard]         = useState({name:"",number:"",expiry:"",cvv:""});
  const [errors,setErrors]     = useState({});

  const validate=()=>{ const e={}; if(!card.name.trim())e.name="Name required"; if(card.number.replace(/\s/g,"").length<16)e.number="Enter valid 16-digit number"; if(card.expiry.length<5)e.expiry="Enter MM/YY"; if(card.cvv.length<3)e.cvv="Enter 3–4 digit CVV"; setErrors(e); return Object.keys(e).length===0; };

  const submitBooking=async(paymentMethod,paid)=>{
    await axios.post("http://localhost:8000/api/book/",{room_id:room.id,check_in:checkIn,check_out:checkOut,guests,payment_method:paymentMethod,payment_status:paid?"paid":"pay_at_hotel",amount_paid:paid?total:0},{headers:{Authorization:`Bearer ${token}`}});
  };

  const handlePayNow=async()=>{
    if(!validate())return; setApiError(""); setStep("processing");
    try{ await new Promise(r=>setTimeout(r,1500)); await submitBooking(method,true); setStep("done"); }
    catch(err){ const msg=err?.response?.data?.error||err?.response?.data?.detail||"Payment failed. Please try again."; setApiError(msg); setStep("card"); }
  };

  const handlePayAtHotel=async()=>{
    setApiError(""); setStep("processing");
    try{ await submitBooking("pay_at_hotel",false); setStep("hotel_done"); }
    catch(err){ const msg=err?.response?.data?.error||err?.response?.data?.detail||"Booking failed. Please try again."; setApiError(msg); setStep("select"); }
  };

  const handleProceed=()=>{ setApiError(""); if(payWhen==="hotel") handlePayAtHotel(); else setStep("card"); };

  if(!room) return null;

  const inp = { width:"100%", padding:"11px 14px", border:`1px solid ${T.inputBorder}`, background:T.inputBg, color:T.textPrimary, fontSize:13, fontFamily:"'Jost', 'Gill Sans', sans-serif", outline:"none", transition:"border-color 0.2s, background 0.4s", letterSpacing:"0.03em" };

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
        .pay-root{min-height:100vh;background:${T.pageBg};font-family:'Jost', 'Gill Sans', sans-serif;padding:0;transition:background 0.4s;}
        .pay-topbar{background:${T.cardBg};border-bottom:1px solid ${T.border};padding:0 40px;height:60px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:50;transition:background 0.4s,border-color 0.4s;}
        .back-btn{display:flex;align-items:center;gap:8px;background:none;border:1px solid ${T.border};color:${T.textSecondary};padding:7px 16px;font-family:'Jost', 'Gill Sans', sans-serif;font-size:10px;font-weight:500;letter-spacing:0.18em;text-transform:uppercase;cursor:pointer;text-decoration:none;transition:all 0.2s;}
        .back-btn:hover{border-color:#b8952a;color:#b8952a;}
        .topbar-title{font-family:'Bodoni Moda','Didot','Playfair Display',Georgia,serif;font-optical-sizing:auto;font-optical-sizing:auto;font-size:18px;font-weight:400;font-style:italic;color:${T.textPrimary};transition:color 0.4s;}
        .theme-btn{display:flex;align-items:center;gap:7px;background:${T.toggleBg};border:1px solid ${T.toggleBorder};color:${T.toggleColor};padding:6px 12px;border-radius:20px;cursor:pointer;font-family:'Jost', 'Gill Sans', sans-serif;font-size:10px;letter-spacing:0.1em;transition:all 0.3s;}
        .theme-btn:hover{border-color:#b8952a;color:#b8952a;}
        .toggle-pill{width:34px;height:18px;border-radius:9px;background:${theme==="dark"?"#1a1a1a":"#e0d8cc"};border:1px solid ${theme==="dark"?"rgba(255,255,255,0.1)":"rgba(26,20,16,0.15)"};display:flex;align-items:center;padding:2px;transition:background 0.3s;}
        .toggle-knob{width:12px;height:12px;border-radius:50%;background:#b8952a;transform:translateX(${theme==="dark"?"0":"16px"});transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1);}
        .pay-body{max-width:980px;margin:0 auto;padding:36px 28px;display:flex;gap:28px;align-items:flex-start;}
        .pay-left{flex:1;display:flex;flex-direction:column;gap:2px;}
        .pay-card{background:${T.cardBg};border:1px solid ${T.border};padding:28px;transition:background 0.4s,border-color 0.4s;}
        .section-eyebrow{font-size:9px;letter-spacing:0.3em;text-transform:uppercase;color:#b8952a;margin-bottom:10px;display:flex;align-items:center;gap:10px;}
        .section-num{width:20px;height:20px;background:#b8952a;color:#fff;font-size:10px;font-weight:600;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
        .section-heading{font-family:'Bodoni Moda','Didot','Playfair Display',Georgia,serif;font-optical-sizing:auto;font-optical-sizing:auto;font-size:22px;font-weight:400;font-style:italic;color:${T.textPrimary};margin-bottom:20px;transition:color 0.4s;}
        .pay-options{display:flex;gap:3px;}
        .pay-option{flex:1;border:1px solid ${T.border};padding:20px;cursor:pointer;transition:all 0.2s;background:${T.optionBg};position:relative;}
        .pay-option:hover{border-color:rgba(184,149,42,0.4);}
        .pay-option.selected{border-color:#b8952a;background:${T.optionSelectedBg};}
        .po-icon{width:38px;height:38px;border:1px solid ${T.border};display:flex;align-items:center;justify-content:center;margin-bottom:12px;font-size:18px;transition:border-color 0.2s;}
        .pay-option.selected .po-icon{border-color:#b8952a;}
        .po-title{font-size:13px;font-weight:600;color:${T.textPrimary};letter-spacing:0.04em;margin-bottom:4px;transition:color 0.4s;}
        .po-desc{font-size:11px;color:${T.textMuted};line-height:1.6;font-weight:300;transition:color 0.4s;}
        .po-badge{position:absolute;top:12px;right:12px;background:rgba(184,149,42,0.15);color:#b8952a;font-size:9px;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;padding:3px 10px;}
        .po-tick{position:absolute;top:12px;right:12px;background:#b8952a;color:#fff;width:18px;height:18px;display:flex;align-items:center;justify-content:center;font-size:10px;}
        .method-tabs{display:flex;gap:3px;}
        .method-tab{flex:1;border:1px solid ${T.border};padding:16px;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;gap:12px;background:${T.optionBg};}
        .method-tab:hover{border-color:rgba(184,149,42,0.4);}
        .method-tab.active{border-color:#b8952a;background:${T.optionSelectedBg};}
        .method-tab-name{font-size:12px;font-weight:600;color:${T.textPrimary};letter-spacing:0.04em;transition:color 0.4s;}
        .method-tab-sub{font-size:10px;color:${T.textMuted};letter-spacing:0.04em;transition:color 0.4s;}
        .stripe-logo{font-size:15px;font-weight:800;color:#635BFF;font-family:'Jost', 'Gill Sans', sans-serif;letter-spacing:-1px;}
        .payhere-logo{font-size:13px;font-weight:800;color:#FF5733;font-family:'Jost', 'Gill Sans', sans-serif;}
        .card-form{display:flex;flex-direction:column;gap:14px;}
        .form-row{display:flex;gap:12px;}
        .form-group{display:flex;flex-direction:column;gap:6px;flex:1;}
        .form-label{font-size:9px;letter-spacing:0.22em;text-transform:uppercase;color:${T.textMuted};transition:color 0.4s;}
        .card-input-wrap{position:relative;}
        .card-brand{position:absolute;right:12px;top:50%;transform:translateY(-50%);font-size:18px;}
        .form-error-msg{font-size:10px;color:"#dc2626";letter-spacing:0.05em;}
        .secure-note{display:flex;align-items:center;gap:6px;font-size:10px;color:${T.textMuted};letter-spacing:0.08em;transition:color 0.4s;}
        .api-error{border:1px solid rgba(220,38,38,0.25);background:rgba(220,38,38,0.06);padding:12px 16px;font-size:12px;letter-spacing:0.04em;}
        .gold-btn{width:100%;padding:15px;background:#b8952a;color:#fff;border:none;font-family:'Jost', 'Gill Sans', sans-serif;font-size:10px;font-weight:600;letter-spacing:0.25em;text-transform:uppercase;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;transition:background 0.2s,transform 0.12s;margin-top:2px;}
        .gold-btn:hover:not(:disabled){background:#a07d20;transform:translateY(-1px);}
        .gold-btn:disabled{opacity:0.6;cursor:not-allowed;}
        .gold-btn.hotel{background:#1a5c3a;}
        .gold-btn.hotel:hover:not(:disabled){background:#154d30;}
        .processing-screen{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 20px;text-align:center;}
        .processing-ring{width:52px;height:52px;border:2px solid ${T.border};border-top-color:#b8952a;border-radius:50%;animation:spin 0.9s linear infinite;margin-bottom:20px;}
        @keyframes spin{to{transform:rotate(360deg);}}
        .processing-title{font-family:'Bodoni Moda','Didot','Playfair Display',Georgia,serif;font-optical-sizing:auto;font-optical-sizing:auto;font-size:22px;font-weight:400;font-style:italic;color:${T.textPrimary};margin-bottom:8px;transition:color 0.4s;}
        .processing-sub{font-size:11px;color:${T.textMuted};letter-spacing:0.08em;transition:color 0.4s;}
        .success-screen{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 30px;text-align:center;}
        .success-icon{font-size:48px;margin-bottom:20px;animation:popIn 0.4s cubic-bezier(0.34,1.56,0.64,1);}
        @keyframes popIn{from{transform:scale(0);opacity:0;}to{transform:scale(1);opacity:1;}}
        .success-title{font-family:'Bodoni Moda','Didot','Playfair Display',Georgia,serif;font-optical-sizing:auto;font-optical-sizing:auto;font-size:30px;font-weight:400;font-style:italic;color:${T.textPrimary};margin-bottom:8px;transition:color 0.4s;}
        .success-sub{font-size:12px;color:${T.textMuted};margin-bottom:28px;line-height:1.7;letter-spacing:0.04em;transition:color 0.4s;}
        .success-details{background:${T.breakdownBg};border:1px solid ${T.border};padding:20px 24px;margin-bottom:28px;width:100%;text-align:left;}
        .sd-row{display:flex;justify-content:space-between;font-size:12px;color:${T.textMuted};margin-bottom:8px;letter-spacing:0.03em;}
        .sd-row:last-child{margin-bottom:0;}
        .sd-val{font-weight:600;color:${T.textPrimary};transition:color 0.4s;}
        .pay-right{width:300px;flex-shrink:0;}
        .summary-card{background:${T.summaryBg};border:1px solid ${T.border};padding:28px;position:sticky;top:76px;transition:background 0.4s,border-color 0.4s;}
        .summary-eyebrow{font-size:9px;letter-spacing:0.3em;text-transform:uppercase;color:#b8952a;margin-bottom:10px;}
        .summary-title{font-family:'Bodoni Moda','Didot','Playfair Display',Georgia,serif;font-optical-sizing:auto;font-optical-sizing:auto;font-size:22px;font-weight:400;font-style:italic;color:${T.textPrimary};margin-bottom:20px;transition:color 0.4s;}
        .room-preview{display:flex;gap:12px;margin-bottom:20px;padding-bottom:20px;border-bottom:1px solid ${T.divider};}
        .room-preview-img{width:60px;height:60px;object-fit:cover;flex-shrink:0;}
        .room-preview-ph{width:60px;height:60px;background:${T.border};display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0;}
        .room-preview-name{font-size:13px;font-weight:600;color:${T.textPrimary};margin-bottom:4px;letter-spacing:0.02em;transition:color 0.4s;}
        .room-preview-meta{font-size:10px;color:${T.textMuted};line-height:1.8;letter-spacing:0.04em;transition:color 0.4s;}
        .sum-row{display:flex;justify-content:space-between;font-size:12px;color:${T.textMuted};margin-bottom:8px;letter-spacing:0.03em;transition:color 0.4s;}
        .sum-row.total{font-size:14px;font-weight:600;color:${T.textPrimary};margin-bottom:0;padding-top:12px;border-top:1px solid ${T.border};}
        .sum-gold{color:#b8952a;}
        .guarantee{margin-top:18px;border:1px solid rgba(184,149,42,0.2);background:rgba(184,149,42,0.04);padding:14px;font-size:11px;color:${T.textMuted};line-height:1.7;letter-spacing:0.03em;transition:color 0.4s,border-color 0.4s;}
        @media(max-width:768px){.pay-body{flex-direction:column;}.pay-right{width:100%;}.pay-options{flex-direction:column;}.method-tabs{flex-direction:column;}.summary-card{position:static;}}
      `}</style>

      <div className="pay-root">
        {/* Topbar */}
        <div className="pay-topbar">
          <button className="back-btn" onClick={()=>navigate(-1)}>← Back</button>
          <span className="topbar-title">Complete Your Booking</span>
          <button className="theme-btn" onClick={toggleTheme}>
            <span style={{fontSize:13}}>{theme==="dark"?"🌙":"☀️"}</span>
            <div className="toggle-pill"><div className="toggle-knob"/></div>
          </button>
        </div>

        <div className="pay-body">
          <div className="pay-left">

            {/* Processing */}
            {step==="processing"&&(
              <div className="pay-card">
                <div className="processing-screen">
                  <div className="processing-ring"/>
                  <div className="processing-title">Processing your booking…</div>
                  <div className="processing-sub">Please don't close this page</div>
                </div>
              </div>
            )}

            {/* Success paid */}
            {step==="done"&&(
              <div className="pay-card">
                <div className="success-screen">
                  <div className="success-icon">✨</div>
                  <div className="success-title">Payment Confirmed</div>
                  <p className="success-sub">Your reservation is confirmed. A confirmation has been sent to your email.</p>
                  <div className="success-details">
                    {[["Room",room.room_type],["Check-in",checkIn],["Check-out",checkOut],["Guests",guests],["Amount Paid",`Rs. ${total.toLocaleString()}`],["Via",method==="stripe"?"Stripe (Card)":"PayHere"]].map(([l,v])=>(
                      <div key={l} className="sd-row"><span>{l}</span><span className="sd-val">{v}</span></div>
                    ))}
                  </div>
                  <button className="gold-btn" onClick={()=>navigate("/dashboard")}>View My Bookings →</button>
                </div>
              </div>
            )}

            {/* Success hotel */}
            {step==="hotel_done"&&(
              <div className="pay-card">
                <div className="success-screen">
                  <div className="success-icon">🏨</div>
                  <div className="success-title">Reservation Confirmed</div>
                  <p className="success-sub">Your room is reserved. Payment will be collected at check-in. No charges have been made today.</p>
                  <div className="success-details">
                    {[["Room",room.room_type],["Check-in",checkIn],["Check-out",checkOut],["Due at Hotel",`Rs. ${total.toLocaleString()}`]].map(([l,v])=>(
                      <div key={l} className="sd-row"><span>{l}</span><span className="sd-val">{v}</span></div>
                    ))}
                  </div>
                  <button className="gold-btn" onClick={()=>navigate("/dashboard")}>View My Bookings →</button>
                </div>
              </div>
            )}

            {/* Step 1: When to pay */}
            {(step==="select"||step==="card")&&(
              <div className="pay-card">
                <div className="section-eyebrow"><span className="section-num">1</span> When would you like to pay?</div>
                <div className="pay-options">
                  <div className={`pay-option ${payWhen==="now"?"selected":""}`} onClick={()=>setPayWhen("now")}>
                    {payWhen==="now"&&<div className="po-tick">✓</div>}
                    <div className="po-icon">💳</div>
                    <div className="po-title">Pay Now</div>
                    <div className="po-desc">Secure your room instantly. Full payment charged today.</div>
                  </div>
                  <div className={`pay-option ${payWhen==="hotel"?"selected":""}`} onClick={()=>setPayWhen("hotel")}>
                    <div className="po-badge">Free cancellation</div>
                    {payWhen==="hotel"&&<div className="po-tick" style={{top:38}}>✓</div>}
                    <div className="po-icon">🏨</div>
                    <div className="po-title">Pay at Hotel</div>
                    <div className="po-desc">Reserve now, pay on arrival. No charges today.</div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Method */}
            {step==="select"&&payWhen==="now"&&(
              <div className="pay-card">
                <div className="section-eyebrow"><span className="section-num">2</span> Choose payment method</div>
                <div className="method-tabs">
                  <div className={`method-tab ${method==="stripe"?"active":""}`} onClick={()=>setMethod("stripe")}>
                    <span className="stripe-logo">stripe</span>
                    <div><div className="method-tab-name">Credit / Debit Card</div><div className="method-tab-sub">Visa, Mastercard, Amex</div></div>
                  </div>
                  <div className={`method-tab ${method==="payhere"?"active":""}`} onClick={()=>setMethod("payhere")}>
                    <span className="payhere-logo">PayHere</span>
                    <div><div className="method-tab-name">PayHere</div><div className="method-tab-sub">Sri Lanka cards & wallets</div></div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Card form */}
            {step==="card"&&(
              <div className="pay-card">
                <div className="section-eyebrow"><span className="section-num">2</span> {method==="stripe"?"Card Details":"PayHere — Card Details"}</div>
                <div className="card-form">
                  <div className="form-group">
                    <label className="form-label">Cardholder Name</label>
                    <input placeholder="Name on card" value={card.name} onChange={e=>setCard(c=>({...c,name:e.target.value}))} style={{...inp,borderColor:errors.name?"rgba(220,38,38,0.5)":T.inputBorder}} onFocus={e=>e.target.style.borderColor="#b8952a"} onBlur={e=>e.target.style.borderColor=errors.name?"rgba(220,38,38,0.5)":T.inputBorder}/>
                    {errors.name&&<span className="form-error-msg" style={{color:"#dc2626"}}>⚠️ {errors.name}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Card Number</label>
                    <div className="card-input-wrap">
                      <input placeholder="0000 0000 0000 0000" value={card.number} onChange={e=>setCard(c=>({...c,number:formatCard(e.target.value)}))} style={{...inp,paddingRight:48,borderColor:errors.number?"rgba(220,38,38,0.5)":T.inputBorder}} onFocus={e=>e.target.style.borderColor="#b8952a"} onBlur={e=>e.target.style.borderColor=errors.number?"rgba(220,38,38,0.5)":T.inputBorder}/>
                      <span className="card-brand">💳</span>
                    </div>
                    {errors.number&&<span className="form-error-msg" style={{color:"#dc2626"}}>⚠️ {errors.number}</span>}
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Expiry Date</label>
                      <input placeholder="MM/YY" value={card.expiry} onChange={e=>setCard(c=>({...c,expiry:formatExpiry(e.target.value)}))} style={{...inp,borderColor:errors.expiry?"rgba(220,38,38,0.5)":T.inputBorder}} onFocus={e=>e.target.style.borderColor="#b8952a"} onBlur={e=>e.target.style.borderColor=errors.expiry?"rgba(220,38,38,0.5)":T.inputBorder}/>
                      {errors.expiry&&<span className="form-error-msg" style={{color:"#dc2626"}}>⚠️ {errors.expiry}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">CVV</label>
                      <input placeholder="123" type="password" maxLength={4} value={card.cvv} onChange={e=>setCard(c=>({...c,cvv:e.target.value.replace(/\D/g,"")}))} style={{...inp,borderColor:errors.cvv?"rgba(220,38,38,0.5)":T.inputBorder}} onFocus={e=>e.target.style.borderColor="#b8952a"} onBlur={e=>e.target.style.borderColor=errors.cvv?"rgba(220,38,38,0.5)":T.inputBorder}/>
                      {errors.cvv&&<span className="form-error-msg" style={{color:"#dc2626"}}>⚠️ {errors.cvv}</span>}
                    </div>
                  </div>
                  <div className="secure-note">🔒 Your payment is encrypted and secure</div>
                </div>
              </div>
            )}

            {/* API Error */}
            {apiError&&(step==="select"||step==="card")&&(
              <div className="api-error" style={{color:"#dc2626"}}>⚠️ &nbsp;{apiError}</div>
            )}

            {/* Action button */}
            {(step==="select"||step==="card")&&(
              <button className={`gold-btn ${payWhen==="hotel"?"hotel":""}`} onClick={step==="select"?handleProceed:handlePayNow}>
                🔒 &nbsp;
                {payWhen==="hotel" ? `Reserve Room — Pay Rs. ${total.toLocaleString()} at Hotel`
                  : step==="select" ? "Continue to Payment"
                  : `Pay Rs. ${total.toLocaleString()} Now`}
              </button>
            )}
          </div>

          {/* Summary */}
          <div className="pay-right">
            <div className="summary-card">
              <div className="summary-eyebrow">Booking Summary</div>
              <div className="summary-title">Your Reservation</div>
              <div className="room-preview">
                {room.image ? <img className="room-preview-img" src={room.image} alt={room.room_type}/> : <div className="room-preview-ph">🏨</div>}
                <div>
                  <div className="room-preview-name">{room.room_type}</div>
                  <div className="room-preview-meta">
                    <div>📅 {checkIn} → {checkOut}</div>
                    <div>👥 {guests} guest{guests>1?"s":""} · {nights} night{nights>1?"s":""}</div>
                    {room.bed_type&&<div>🛏 {room.bed_type}</div>}
                  </div>
                </div>
              </div>
              <div className="sum-row"><span>Rs. {parseFloat(room.price).toLocaleString()} × {nights} night{nights>1?"s":""}</span><span>Rs. {subtotal.toLocaleString()}</span></div>
              <div className="sum-row"><span>Taxes & fees (10%)</span><span>Rs. {tax.toLocaleString()}</span></div>
              {payWhen==="hotel"&&<div className="sum-row" style={{color:"#b8952a"}}><span>Due today</span><span style={{fontWeight:600}}>Rs. 0</span></div>}
              <div className="sum-row total">
                <span>{payWhen==="hotel"?"Due at hotel":"Total"}</span>
                <span className="sum-gold">Rs. {total.toLocaleString()}</span>
              </div>
              <div className="guarantee">🔒 <strong>Best price guarantee.</strong> Free cancellation with Pay at Hotel. Your data is protected with 256-bit encryption.</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}