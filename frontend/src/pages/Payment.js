import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

// ─── Icons ────────────────────────────────────────────────────────────────────
const LockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const CardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
  </svg>
);
const HotelIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const BackIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);
const CalIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatCard   = (v) => v.replace(/\D/g,"").slice(0,16).replace(/(.{4})/g,"$1 ").trim();
const formatExpiry = (v) => { const d = v.replace(/\D/g,"").slice(0,4); return d.length > 2 ? d.slice(0,2)+"/"+d.slice(2) : d; };
const nightsBetween = (a, b) => { const d = (new Date(b)-new Date(a))/(1000*60*60*24); return d > 0 ? Math.round(d) : 0; };

// ─── Main ─────────────────────────────────────────────────────────────────────
function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const token    = localStorage.getItem("token");

  const { room, checkIn, checkOut, guests } = location.state || {};

  useEffect(() => {
    if (!room || !checkIn || !checkOut) navigate("/");
    if (!token) navigate("/login");
  }, []);

  const nights   = nightsBetween(checkIn, checkOut);
  const subtotal = parseFloat(room?.price || 0) * nights;
  const tax      = Math.round(subtotal * 0.1);
  const total    = subtotal + tax;

  const [payWhen, setPayWhen] = useState("now");
  const [method,  setMethod]  = useState("stripe");
  const [step,    setStep]    = useState("select"); // select | card | processing | done | hotel_done
  const [apiError, setApiError] = useState("");     // 🔥 visible error message

  const [card, setCard]     = useState({ name:"", number:"", expiry:"", cvv:"" });
  const [errors, setErrors] = useState({});

  // ── Validate card form ──────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!card.name.trim())                          e.name   = "Cardholder name is required";
    if (card.number.replace(/\s/g,"").length < 16) e.number = "Enter a valid 16-digit card number";
    if (card.expiry.length < 5)                    e.expiry = "Enter expiry as MM/YY";
    if (card.cvv.length < 3)                       e.cvv    = "Enter 3 or 4 digit CVV";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Call backend ────────────────────────────────────────────────────────────
  const submitBooking = async (paymentMethod, paid) => {
    const response = await axios.post(
      "http://localhost:8000/api/book/",
      {
        room_id:        room.id,
        check_in:       checkIn,
        check_out:      checkOut,
        guests:         guests,
        // send payment fields — backend will store them if migration has run,
        // and ignore them gracefully if it hasn't (they're optional in the view)
        payment_method: paymentMethod,
        payment_status: paid ? "paid" : "pay_at_hotel",
        amount_paid:    paid ? total : 0,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response;
  };

  // ── Pay Now ─────────────────────────────────────────────────────────────────
  const handlePayNow = async () => {
    if (!validate()) return;
    setApiError("");
    setStep("processing");
    try {
      // Simulate brief card processing delay (remove in production with real Stripe)
      await new Promise(r => setTimeout(r, 1500));
      await submitBooking(method, true);
      setStep("done");
    } catch (err) {
      // 🔥 Go back to card step and show the real error
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        "Booking failed. Please check your details and try again.";
      setApiError(msg);
      setStep("card");
    }
  };

  // ── Pay at Hotel ────────────────────────────────────────────────────────────
  const handlePayAtHotel = async () => {
    setApiError("");
    setStep("processing");
    try {
      await submitBooking("pay_at_hotel", false);
      setStep("hotel_done");
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        "Booking failed. Please try again.";
      setApiError(msg);
      setStep("select"); // 🔥 go back to select, not stuck on processing
    }
  };

  // ── Proceed button ──────────────────────────────────────────────────────────
  const handleProceed = () => {
    setApiError("");
    if (payWhen === "hotel") {
      handlePayAtHotel();
    } else {
      setStep("card");
    }
  };

  if (!room) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #eef2f7; }

        .pay-root { min-height: 100vh; background: #eef2f7; font-family: 'DM Sans', sans-serif; padding: 28px 20px; }

        .pay-topbar { max-width: 980px; margin: 0 auto 28px; display: flex; align-items: center; gap: 14px; }
        .back-btn { display: flex; align-items: center; gap: 7px; background: #fff; border: none; border-radius: 10px; padding: 9px 16px; font-size: 14px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; color: #374151; box-shadow: 0 2px 8px rgba(0,0,0,0.07); transition: background 0.15s; }
        .back-btn:hover { background: #f3f4f6; }
        .pay-topbar-title { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: #111827; }

        .pay-layout { max-width: 980px; margin: 0 auto; display: flex; gap: 24px; align-items: flex-start; }
        .pay-left { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 16px; }

        .pay-card { background: #fff; border-radius: 18px; padding: 26px; box-shadow: 0 2px 16px rgba(0,0,0,0.06); }
        .section-title { font-size: 15px; font-weight: 700; color: #111827; margin-bottom: 18px; display: flex; align-items: center; gap: 8px; }
        .section-num { width: 24px; height: 24px; border-radius: 50%; background: #111827; color: #fff; font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

        /* When to pay */
        .pay-when-grid { display: flex; gap: 12px; }
        .pay-when-option { flex: 1; border: 2px solid #e5e7eb; border-radius: 14px; padding: 16px; cursor: pointer; transition: all 0.2s; position: relative; background: #fff; }
        .pay-when-option:hover { border-color: #93c5fd; }
        .pay-when-option.selected { border-color: #2563eb; background: #eff6ff; }
        .pwo-icon { width: 40px; height: 40px; border-radius: 10px; background: #f3f4f6; display: flex; align-items: center; justify-content: center; margin-bottom: 10px; transition: background 0.2s; }
        .pay-when-option.selected .pwo-icon { background: #dbeafe; color: #2563eb; }
        .pwo-title { font-size: 14px; font-weight: 700; color: #111827; margin-bottom: 4px; }
        .pwo-desc  { font-size: 12.5px; color: #6b7280; line-height: 1.5; }
        .pwo-badge { position: absolute; top: 10px; right: 10px; background: #dcfce7; color: #16a34a; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 20px; }
        .selected-tick { position: absolute; top: 10px; right: 10px; width: 20px; height: 20px; border-radius: 50%; background: #2563eb; display: flex; align-items: center; justify-content: center; color: #fff; }

        /* Method tabs */
        .method-tabs { display: flex; gap: 10px; }
        .method-tab { flex: 1; border: 2px solid #e5e7eb; border-radius: 12px; padding: 14px 16px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 10px; background: #fff; }
        .method-tab:hover { border-color: #93c5fd; }
        .method-tab.active { border-color: #2563eb; background: #eff6ff; }
        .method-tab-name { font-size: 14px; font-weight: 700; color: #111827; }
        .method-tab-sub  { font-size: 11.5px; color: #6b7280; }
        .stripe-logo  { font-size: 18px; font-weight: 800; color: #635BFF; font-family: 'DM Sans', sans-serif; letter-spacing: -1px; }
        .payhere-logo { font-size: 15px; font-weight: 800; color: #FF5733; font-family: 'DM Sans', sans-serif; }

        /* Card form */
        .card-form { display: flex; flex-direction: column; gap: 14px; }
        .form-row   { display: flex; gap: 12px; }
        .form-group { display: flex; flex-direction: column; gap: 6px; flex: 1; }
        .form-label { font-size: 12.5px; font-weight: 700; color: #374151; }
        .form-input { padding: 11px 14px; border: 1.5px solid #e5e7eb; border-radius: 10px; font-size: 14px; font-family: 'DM Sans', sans-serif; color: #111827; background: #f9fafb; outline: none; transition: all 0.2s; }
        .form-input:focus { border-color: #2563eb; background: #fff; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
        .form-input.error { border-color: #dc2626; }
        .form-error { font-size: 11.5px; color: #dc2626; }
        .card-input-wrap { position: relative; }
        .card-input-icon { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); font-size: 20px; }
        .secure-badge { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #6b7280; }

        /* 🔥 API error box */
        .api-error-box { background: #fef2f2; border: 1.5px solid #fecaca; border-radius: 12px; padding: 14px 16px; font-size: 13.5px; color: #dc2626; font-weight: 500; display: flex; align-items: flex-start; gap: 8px; }

        /* Proceed button */
        .proceed-btn { width: 100%; padding: 15px; background: #111827; color: #fff; border: none; border-radius: 12px; font-size: 15px; font-weight: 700; font-family: 'DM Sans', sans-serif; cursor: pointer; box-shadow: 0 4px 20px rgba(17,24,39,0.25); transition: background 0.18s, transform 0.12s; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .proceed-btn:hover:not(:disabled) { background: #1f2937; transform: translateY(-1px); }
        .proceed-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .proceed-btn.hotel { background: #059669; box-shadow: 0 4px 20px rgba(5,150,105,0.25); }
        .proceed-btn.hotel:hover:not(:disabled) { background: #047857; }

        /* Summary */
        .pay-right { width: 320px; flex-shrink: 0; }
        .summary-card { background: #fff; border-radius: 18px; padding: 24px; box-shadow: 0 2px 16px rgba(0,0,0,0.06); position: sticky; top: 20px; }
        .summary-title { font-family: 'Playfair Display', serif; font-size: 17px; font-weight: 700; color: #111827; margin-bottom: 16px; }
        .room-preview { display: flex; gap: 12px; margin-bottom: 18px; align-items: center; }
        .room-preview-img { width: 64px; height: 64px; border-radius: 10px; object-fit: cover; flex-shrink: 0; background: #e5e7eb; }
        .room-preview-placeholder { width: 64px; height: 64px; border-radius: 10px; background: #e5e7eb; display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0; }
        .room-preview-name { font-size: 14px; font-weight: 700; color: #111827; margin-bottom: 4px; }
        .room-preview-meta { font-size: 12.5px; color: #6b7280; display: flex; flex-direction: column; gap: 3px; }
        .summary-divider { height: 1px; background: #f3f4f6; margin: 14px 0; }
        .summary-row { display: flex; justify-content: space-between; font-size: 13.5px; color: #6b7280; margin-bottom: 10px; }
        .summary-row.total { font-size: 16px; font-weight: 800; color: #111827; margin-bottom: 0; padding-top: 10px; border-top: 2px solid #111827; }
        .pay-guarantee { margin-top: 16px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 12px 14px; font-size: 12px; color: #15803d; line-height: 1.5; display: flex; gap: 8px; }

        /* Processing */
        .processing-screen { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; text-align: center; }
        .processing-spinner { width: 56px; height: 56px; border: 4px solid #e5e7eb; border-top-color: #2563eb; border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 20px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .processing-title { font-size: 18px; font-weight: 700; color: #111827; margin-bottom: 6px; }
        .processing-sub   { font-size: 14px; color: #6b7280; }

        /* Success */
        .success-screen { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 50px 30px; text-align: center; }
        .success-circle { width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #16a34a, #22c55e); display: flex; align-items: center; justify-content: center; margin-bottom: 20px; box-shadow: 0 8px 30px rgba(22,163,74,0.3); animation: popIn 0.4s cubic-bezier(0.34,1.56,0.64,1); }
        @keyframes popIn { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .success-circle svg { color: #fff; width: 36px; height: 36px; stroke-width: 3; }
        .success-title { font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 700; color: #111827; margin-bottom: 8px; }
        .success-sub   { font-size: 14px; color: #6b7280; margin-bottom: 24px; line-height: 1.6; }
        .success-details { background: #f9fafb; border-radius: 14px; padding: 18px 24px; margin-bottom: 24px; width: 100%; text-align: left; }
        .success-detail-row { display: flex; justify-content: space-between; font-size: 13.5px; margin-bottom: 8px; }
        .success-detail-row:last-child { margin-bottom: 0; }
        .success-detail-label { color: #6b7280; }
        .success-detail-val   { font-weight: 700; color: #111827; }
        .go-dashboard-btn { padding: 13px 32px; background: #111827; color: #fff; border: none; border-radius: 12px; font-size: 15px; font-weight: 700; font-family: 'DM Sans', sans-serif; cursor: pointer; box-shadow: 0 4px 16px rgba(0,0,0,0.2); transition: background 0.15s; }
        .go-dashboard-btn:hover { background: #1f2937; }
        .hotel-circle { width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #059669, #34d399); display: flex; align-items: center; justify-content: center; margin-bottom: 20px; font-size: 36px; animation: popIn 0.4s cubic-bezier(0.34,1.56,0.64,1); }

        @media (max-width: 768px) {
          .pay-layout { flex-direction: column; }
          .pay-right  { width: 100%; }
          .pay-when-grid { flex-direction: column; }
          .summary-card { position: static; }
        }
      `}</style>

      <div className="pay-root">
        <div className="pay-topbar">
          <button className="back-btn" onClick={() => navigate(-1)}><BackIcon /> Back</button>
          <span className="pay-topbar-title">Complete Your Booking</span>
        </div>

        <div className="pay-layout">
          <div className="pay-left">

            {/* ── PROCESSING ── */}
            {step === "processing" && (
              <div className="pay-card">
                <div className="processing-screen">
                  <div className="processing-spinner" />
                  <div className="processing-title">Processing your booking…</div>
                  <div className="processing-sub">Please don't close this page.</div>
                </div>
              </div>
            )}

            {/* ── SUCCESS (paid) ── */}
            {step === "done" && (
              <div className="pay-card">
                <div className="success-screen">
                  <div className="success-circle"><CheckIcon /></div>
                  <div className="success-title">Payment Successful! 🎉</div>
                  <div className="success-sub">Your booking is confirmed. A confirmation has been sent to your email.</div>
                  <div className="success-details">
                    <div className="success-detail-row"><span className="success-detail-label">Room</span><span className="success-detail-val">{room.room_type}</span></div>
                    <div className="success-detail-row"><span className="success-detail-label">Check-in</span><span className="success-detail-val">{checkIn}</span></div>
                    <div className="success-detail-row"><span className="success-detail-label">Check-out</span><span className="success-detail-val">{checkOut}</span></div>
                    <div className="success-detail-row"><span className="success-detail-label">Guests</span><span className="success-detail-val">{guests}</span></div>
                    <div className="success-detail-row"><span className="success-detail-label">Amount Paid</span><span className="success-detail-val" style={{color:"#16a34a"}}>Rs. {total.toLocaleString()}</span></div>
                    <div className="success-detail-row"><span className="success-detail-label">Payment Via</span><span className="success-detail-val">{method === "stripe" ? "Stripe (Card)" : "PayHere"}</span></div>
                  </div>
                  <button className="go-dashboard-btn" onClick={() => navigate("/dashboard")}>View My Bookings</button>
                </div>
              </div>
            )}

            {/* ── SUCCESS (pay at hotel) ── */}
            {step === "hotel_done" && (
              <div className="pay-card">
                <div className="success-screen">
                  <div className="hotel-circle">🏨</div>
                  <div className="success-title">Booking Reserved!</div>
                  <div className="success-sub">Your room is reserved. Payment will be collected at check-in.<br/>No charges have been made.</div>
                  <div className="success-details">
                    <div className="success-detail-row"><span className="success-detail-label">Room</span><span className="success-detail-val">{room.room_type}</span></div>
                    <div className="success-detail-row"><span className="success-detail-label">Check-in</span><span className="success-detail-val">{checkIn}</span></div>
                    <div className="success-detail-row"><span className="success-detail-label">Check-out</span><span className="success-detail-val">{checkOut}</span></div>
                    <div className="success-detail-row"><span className="success-detail-label">Amount Due at Hotel</span><span className="success-detail-val">Rs. {total.toLocaleString()}</span></div>
                  </div>
                  <button className="go-dashboard-btn" onClick={() => navigate("/dashboard")}>View My Bookings</button>
                </div>
              </div>
            )}

            {/* ── STEP 1: WHEN TO PAY ── */}
            {(step === "select" || step === "card") && (
              <div className="pay-card">
                <div className="section-title"><span className="section-num">1</span> When would you like to pay?</div>
                <div className="pay-when-grid">
                  <div className={`pay-when-option ${payWhen === "now" ? "selected" : ""}`} onClick={() => setPayWhen("now")}>
                    {payWhen === "now" && <div className="selected-tick"><CheckIcon /></div>}
                    <div className="pwo-icon"><CardIcon /></div>
                    <div className="pwo-title">Pay Now</div>
                    <div className="pwo-desc">Secure your room instantly. Full payment charged today.</div>
                  </div>
                  <div className={`pay-when-option ${payWhen === "hotel" ? "selected" : ""}`} onClick={() => setPayWhen("hotel")}>
                    <div className="pwo-badge">Free cancellation</div>
                    {payWhen === "hotel" && <div className="selected-tick" style={{top:36}}><CheckIcon /></div>}
                    <div className="pwo-icon"><HotelIcon /></div>
                    <div className="pwo-title">Pay at Hotel</div>
                    <div className="pwo-desc">Reserve now, pay on arrival. No charges today.</div>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 2: METHOD (Pay Now only) ── */}
            {step === "select" && payWhen === "now" && (
              <div className="pay-card">
                <div className="section-title"><span className="section-num">2</span> Choose payment method</div>
                <div className="method-tabs">
                  <div className={`method-tab ${method === "stripe" ? "active" : ""}`} onClick={() => setMethod("stripe")}>
                    <span className="stripe-logo">stripe</span>
                    <div><div className="method-tab-name">Credit / Debit Card</div><div className="method-tab-sub">Visa, Mastercard, Amex</div></div>
                  </div>
                  <div className={`method-tab ${method === "payhere" ? "active" : ""}`} onClick={() => setMethod("payhere")}>
                    <span className="payhere-logo">PayHere</span>
                    <div><div className="method-tab-name">PayHere</div><div className="method-tab-sub">Sri Lanka cards & wallets</div></div>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 3: CARD FORM ── */}
            {step === "card" && (
              <div className="pay-card">
                <div className="section-title">
                  <span className="section-num">2</span>
                  {method === "stripe" ? "Card Details" : "PayHere — Card Details"}
                </div>
                <div className="card-form">
                  <div className="form-group">
                    <label className="form-label">Cardholder Name</label>
                    <input className={`form-input ${errors.name ? "error" : ""}`} placeholder="Name on card"
                      value={card.name} onChange={e => setCard(c => ({...c, name: e.target.value}))} />
                    {errors.name && <span className="form-error">{errors.name}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Card Number</label>
                    <div className="card-input-wrap">
                      <input className={`form-input ${errors.number ? "error" : ""}`} placeholder="0000 0000 0000 0000"
                        value={card.number} onChange={e => setCard(c => ({...c, number: formatCard(e.target.value)}))}
                        style={{paddingRight: 48}} />
                      <span className="card-input-icon">💳</span>
                    </div>
                    {errors.number && <span className="form-error">{errors.number}</span>}
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Expiry Date</label>
                      <input className={`form-input ${errors.expiry ? "error" : ""}`} placeholder="MM/YY"
                        value={card.expiry} onChange={e => setCard(c => ({...c, expiry: formatExpiry(e.target.value)}))} />
                      {errors.expiry && <span className="form-error">{errors.expiry}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">CVV</label>
                      <input className={`form-input ${errors.cvv ? "error" : ""}`} placeholder="123"
                        type="password" maxLength={4}
                        value={card.cvv} onChange={e => setCard(c => ({...c, cvv: e.target.value.replace(/\D/g,"")}))} />
                      {errors.cvv && <span className="form-error">{errors.cvv}</span>}
                    </div>
                  </div>
                  <div className="secure-badge"><LockIcon /> Your payment is encrypted and secure</div>
                </div>
              </div>
            )}

            {/* ── API ERROR ── */}
            {apiError && (step === "select" || step === "card") && (
              <div className="api-error-box">
                ⚠️ &nbsp; {apiError}
              </div>
            )}

            {/* ── ACTION BUTTON ── */}
            {(step === "select" || step === "card") && (
              <button
                className={`proceed-btn ${payWhen === "hotel" ? "hotel" : ""}`}
                onClick={step === "select" ? handleProceed : handlePayNow}
              >
                <LockIcon />
                {payWhen === "hotel"
                  ? `Reserve Room — Pay Rs. ${total.toLocaleString()} at Hotel`
                  : step === "select"
                    ? "Continue to Payment"
                    : `Pay Rs. ${total.toLocaleString()} Now`
                }
              </button>
            )}

          </div>

          {/* ── ORDER SUMMARY ── */}
          <div className="pay-right">
            <div className="summary-card">
              <div className="summary-title">Booking Summary</div>
              <div className="room-preview">
                {room.image
                  ? <img className="room-preview-img" src={room.image} alt={room.room_type} />
                  : <div className="room-preview-placeholder">🏨</div>
                }
                <div>
                  <div className="room-preview-name">{room.room_type}</div>
                  <div className="room-preview-meta">
                    <span><CalIcon /> {checkIn} → {checkOut}</span>
                    <span>👥 {guests} guest{guests > 1 ? "s" : ""} · {nights} night{nights > 1 ? "s" : ""}</span>
                    {room.bed_type && <span>🛏 {room.bed_type}</span>}
                  </div>
                </div>
              </div>
              <div className="summary-divider" />
              <div className="summary-row"><span>Rs. {parseFloat(room.price).toLocaleString()} × {nights} night{nights>1?"s":""}</span><span>Rs. {subtotal.toLocaleString()}</span></div>
              <div className="summary-row"><span>Taxes & fees (10%)</span><span>Rs. {tax.toLocaleString()}</span></div>
              {payWhen === "hotel" && (
                <div className="summary-row" style={{color:"#059669", fontSize:13}}>
                  <span>Due today</span><span style={{fontWeight:700}}>Rs. 0</span>
                </div>
              )}
              <div className="summary-row total">
                <span>{payWhen === "hotel" ? "Due at hotel" : "Total"}</span>
                <span>Rs. {total.toLocaleString()}</span>
              </div>
              <div className="pay-guarantee">
                🔒 &nbsp;
                <span><strong>Best price guarantee.</strong> Free cancellation if you choose Pay at Hotel. Your data is protected with 256-bit encryption.</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

export default Payment;