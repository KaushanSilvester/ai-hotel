import { useState, useRef, useEffect } from "react";

// ─── Hotel system prompt ──────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are Silvester, the AI concierge for HotelAI — a luxury 5-star hotel in Sri Lanka. You are warm, elegant, and knowledgeable. You speak in a refined but friendly tone, like a seasoned concierge at a grand hotel.

You help guests with:
- Room information (types, pricing, amenities, availability)
- Booking guidance (how to reserve, check-in/out, cancellation)
- Hotel facilities (restaurant, spa, pool, gym)
- Local area tips (things to do in Sri Lanka, nearby attractions)
- General hotel policies (payment, pets, smoking)

Hotel details you know:
- Name: HotelAI Luxury Resort, Nuwara Eliya, Sri Lanka
- Rating: 5 stars, established 2024
- Rooms: 48 luxury rooms across 6 types
  • Superior Single Room: Rs. 11,000/night, 1 guest, 25m²
  • Deluxe Double Room: Rs. 18,000/night, 2 guests, 35m²
  • Ocean View Suite: Rs. 22,000/night, 2 guests, 45m², sea view
  • Family Room: Rs. 25,000/night, up to 4 guests
  • Penthouse Suite: Rs. 45,000/night, 2 guests, panoramic views
- Amenities: WiFi, AC, TV, pool, spa, gym, restaurant (breakfast 7–10:30, lunch 12–14:30, dinner 19–22:30)
- Contact: +94 52 222 2881 | WhatsApp: +94 77 123 4567 | reservations@hotelai.lk
- Check-in: 2:00 PM | Check-out: 12:00 PM
- Payment: Stripe (card), PayHere, or Pay at Hotel
- Cancellation: Free cancellation with Pay at Hotel option
- Taxes: 10% added to all room rates

Keep responses concise (2-4 sentences usually). Use occasional elegant formatting. Never make up specific booking details. If someone wants to book, guide them to the Rooms page. Always sign off suggestions warmly.`;

// ─── Quick suggestion chips ───────────────────────────────────────────────────
const SUGGESTIONS = [
  "What rooms are available?",
  "What's your best suite?",
  "How do I make a booking?",
  "What amenities do you offer?",
  "Tell me about the restaurant",
  "What's your cancellation policy?",
];

// ─── Theme tokens ─────────────────────────────────────────────────────────────
const THEMES = {
  dark: {
    chatBg: "#0d0d0d", headerBg: "#111", inputBg: "#1a1a1a",
    inputBorder: "rgba(255,255,255,0.1)", msgUserBg: "#b8952a",
    msgAiBg: "#1a1a1a", msgAiBorder: "rgba(255,255,255,0.08)",
    textPrimary: "#fff", textSecondary: "rgba(255,255,255,0.6)",
    textMuted: "rgba(255,255,255,0.3)", border: "rgba(255,255,255,0.08)",
    fabBg: "#b8952a", fabShadow: "rgba(184,149,42,0.4)",
    chipBg: "rgba(255,255,255,0.05)", chipBorder: "rgba(255,255,255,0.1)",
    chipColor: "rgba(255,255,255,0.65)", scrollbarThumb: "rgba(255,255,255,0.1)",
    overlayBg: "rgba(0,0,0,0.5)",
  },
  light: {
    chatBg: "#faf7f2", headerBg: "#f5f0e8", inputBg: "#f0ebe0",
    inputBorder: "rgba(26,20,16,0.12)", msgUserBg: "#b8952a",
    msgAiBg: "#fff", msgAiBorder: "rgba(26,20,16,0.09)",
    textPrimary: "#1a1410", textSecondary: "rgba(26,20,16,0.6)",
    textMuted: "rgba(26,20,16,0.35)", border: "rgba(26,20,16,0.09)",
    fabBg: "#b8952a", fabShadow: "rgba(184,149,42,0.35)",
    chipBg: "rgba(26,20,16,0.04)", chipBorder: "rgba(26,20,16,0.1)",
    chipColor: "rgba(26,20,16,0.6)", scrollbarThumb: "rgba(26,20,16,0.12)",
    overlayBg: "rgba(0,0,0,0.3)",
  },
};

// ─── Typing indicator ─────────────────────────────────────────────────────────
function TypingDots({ color }) {
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center", padding: "4px 2px" }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 6, height: 6, borderRadius: "50%", background: color,
          animation: `typingBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
    </div>
  );
}

// ─── Message bubble ───────────────────────────────────────────────────────────
function MessageBubble({ msg, T }) {
  const isUser = msg.role === "user";
  return (
    <div style={{
      display: "flex", justifyContent: isUser ? "flex-end" : "flex-start",
      marginBottom: 12, animation: "msgSlideIn 0.25s ease",
    }}>
      {/* AI avatar */}
      {!isUser && (
        <div style={{
          width: 28, height: 28, borderRadius: "50%", background: "#b8952a",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, flexShrink: 0, marginRight: 8, marginTop: 2,
        }}>✦</div>
      )}

      <div style={{
        maxWidth: "78%",
        background: isUser ? T.msgUserBg : T.msgAiBg,
        border: isUser ? "none" : `1px solid ${T.msgAiBorder}`,
        padding: "11px 15px",
        color: isUser ? "#fff" : T.textPrimary,
        fontSize: 13, lineHeight: 1.65, fontFamily: "'Jost', sans-serif",
        fontWeight: 400, letterSpacing: "0.02em",
        boxShadow: isUser ? "0 2px 12px rgba(184,149,42,0.25)" : "none",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      }}>
        {msg.content}
        <div style={{
          fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase",
          color: isUser ? "rgba(255,255,255,0.55)" : T.textMuted,
          marginTop: 5, textAlign: isUser ? "right" : "left",
        }}>
          {isUser ? "You" : "Silvester · AI Concierge"} · {msg.time}
        </div>
      </div>
    </div>
  );
}

// ─── Main Chatbot Component ───────────────────────────────────────────────────
export default function HotelChatbot() {
  const theme = localStorage.getItem("lp_theme") || "dark";
  const T = THEMES[theme];

  const STORAGE_KEY = "hotelai_chat_history";
  const MAX_STORED  = 50; // max messages to keep in storage

  // 🔥 Load chat history from localStorage on first render
  const loadHistory = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [{
      role: "assistant",
      content: "Good day! I'm Silvester, your personal AI concierge at HotelAI. ✦\n\nHow may I assist you today? I can help with room inquiries, bookings, amenities, or anything about your stay.",
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    }];
  };

  const [open,       setOpen]       = useState(false);
  const [messages,   setMessages]   = useState(loadHistory);
  const [input,      setInput]      = useState("");
  const [loading,    setLoading]    = useState(false);
  const [unread,     setUnread]     = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // 🔥 Save chat history to localStorage whenever messages change
  useEffect(() => {
    try {
      const toSave = messages.slice(-MAX_STORED); // keep last 50 messages
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch {}
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setUnread(0);
    }
  }, [open]);

  const getTime = () => new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  const sendMessage = async (text) => {
    const content = text || input.trim();
    if (!content || loading) return;
    setInput("");

    const userMsg = { role: "user", content, time: getTime() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      // Build messages for API (exclude time field)
      const apiMessages = updatedMessages.map(m => ({
        role: m.role,
        content: m.content,
      }));

      // 🔥 Call Django backend — keeps API key secure on server
      const response = await fetch("http://localhost:8000/api/chat/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Server error");
      const reply = data.reply || "I apologise, I'm having a moment. Please try again shortly.";

      setMessages(prev => [...prev, {
        role: "assistant",
        content: reply,
        time: getTime(),
      }]);

      // Show unread badge if chat is closed
      if (!open) setUnread(u => u + 1);

    } catch (err) {
      // Log real error to console so we can debug
      console.error("Chatbot error:", err);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `⚠️ Error: ${err.message || "Could not connect to server"}. Make sure Django is running at http://localhost:8000`,
        time: getTime(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const clearChat = () => {
    const welcome = [{
      role: "assistant",
      content: "Chat cleared. How may I assist you?",
      time: getTime(),
    }];
    setMessages(welcome);
    // 🔥 Clear from localStorage too
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;1,6..96,400&family=Jost:wght@300;400;500;600&display=swap');

        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30%            { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes msgSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes chatOpen {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
        @keyframes fabPulse {
          0%, 100% { box-shadow: 0 4px 20px ${T.fabShadow}; }
          50%       { box-shadow: 0 4px 32px rgba(184,149,42,0.65); }
        }
        @keyframes badgePop {
          from { transform: scale(0); }
          to   { transform: scale(1); }
        }

        .chat-fab {
          position: fixed; bottom: 28px; right: 28px; z-index: 998;
          width: 56px; height: 56px;
          background: ${T.fabBg}; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; transition: transform 0.2s;
          box-shadow: 0 4px 20px ${T.fabShadow};
          animation: fabPulse 3s ease-in-out infinite;
        }
        .chat-fab:hover { transform: scale(1.08); }

        .chat-badge {
          position: absolute; top: -4px; right: -4px;
          width: 18px; height: 18px; background: #ef4444; border-radius: 50%;
          font-size: 10px; font-weight: 700; color: #fff;
          display: flex; align-items: center; justify-content: center;
          animation: badgePop 0.3s cubic-bezier(0.34,1.56,0.64,1);
          font-family: 'Jost', sans-serif;
        }

        .chat-window {
          position: fixed; bottom: 96px; right: 28px; z-index: 999;
          width: 360px; height: 540px;
          background: ${T.chatBg};
          border: 1px solid rgba(184,149,42,0.25);
          display: flex; flex-direction: column;
          box-shadow: 0 20px 60px rgba(0,0,0,0.4);
          animation: chatOpen 0.3s cubic-bezier(0.34,1.56,0.64,1);
          font-family: 'Jost', sans-serif;
        }

        .chat-header {
          background: ${T.headerBg};
          border-bottom: 1px solid rgba(184,149,42,0.2);
          padding: 14px 18px;
          display: flex; align-items: center; gap: 12px;
          flex-shrink: 0;
        }
        .chat-header-avatar {
          width: 36px; height: 36px; background: #b8952a;
          border-radius: 50%; display: flex; align-items: center;
          justify-content: center; font-size: 16px; flex-shrink: 0;
        }
        .chat-header-name {
          font-family: 'Bodoni Moda', Georgia, serif;
          font-size: 15px; font-weight: 400; font-style: italic;
          color: ${T.textPrimary}; font-optical-sizing: auto;
        }
        .chat-header-status {
          font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase;
          color: #b8952a; display: flex; align-items: center; gap: 5px;
        }
        .status-dot {
          width: 6px; height: 6px; border-radius: 50%; background: #4ade80;
          animation: typingBounce 2s ease-in-out infinite;
        }
        .chat-header-actions { display: flex; gap: 6px; margin-left: auto; }
        .chat-header-btn {
          background: none; border: none; cursor: pointer;
          color: ${T.textMuted}; font-size: 16px; padding: 3px 6px;
          transition: color 0.2s; line-height: 1;
          font-family: 'Jost', sans-serif;
        }
        .chat-header-btn:hover { color: #b8952a; }

        .chat-messages {
          flex: 1; overflow-y: auto; padding: 16px;
          scroll-behavior: smooth;
        }
        .chat-messages::-webkit-scrollbar { width: 3px; }
        .chat-messages::-webkit-scrollbar-thumb { background: ${T.scrollbarThumb}; border-radius: 2px; }

        .chat-suggestions {
          padding: 0 14px 10px;
          display: flex; gap: 6px; flex-wrap: wrap; flex-shrink: 0;
        }
        .suggestion-chip {
          padding: 5px 12px; font-size: 10px; font-weight: 500;
          letter-spacing: 0.06em; cursor: pointer;
          background: ${T.chipBg}; border: 1px solid ${T.chipBorder};
          color: ${T.chipColor};
          transition: all 0.2s; white-space: nowrap;
          font-family: 'Jost', sans-serif;
        }
        .suggestion-chip:hover { border-color: #b8952a; color: #b8952a; background: rgba(184,149,42,0.06); }

        .chat-input-area {
          border-top: 1px solid ${T.border};
          padding: 12px 14px; display: flex; gap: 8px;
          align-items: flex-end; flex-shrink: 0;
          background: ${T.chatBg};
        }
        .chat-input {
          flex: 1; background: ${T.inputBg}; border: 1px solid ${T.inputBorder};
          color: ${T.textPrimary}; font-family: 'Jost', sans-serif;
          font-size: 13px; padding: 10px 13px; outline: none; resize: none;
          max-height: 90px; min-height: 40px; line-height: 1.5;
          transition: border-color 0.2s;
          letter-spacing: 0.02em;
        }
        .chat-input::placeholder { color: ${T.textMuted}; }
        .chat-input:focus { border-color: rgba(184,149,42,0.5); }

        .chat-send-btn {
          width: 40px; height: 40px; background: #b8952a; border: none;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          font-size: 16px; transition: background 0.2s, transform 0.1s;
          flex-shrink: 0;
        }
        .chat-send-btn:hover:not(:disabled)  { background: #a07d20; transform: scale(1.05); }
        .chat-send-btn:active:not(:disabled) { transform: scale(0.97); }
        .chat-send-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .chat-gold-bar {
          height: 2px;
          background: linear-gradient(to right, #b8952a, rgba(184,149,42,0.3), transparent);
          flex-shrink: 0;
        }
        .chat-session-bar {
          background: rgba(184,149,42,0.08);
          border-bottom: 1px solid rgba(184,149,42,0.15);
          padding: 5px 16px;
          font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase;
          color: #b8952a; display: flex; align-items: center; gap: 6px;
          flex-shrink: 0;
        }
        .session-dot { width: 5px; height: 5px; border-radius: 50%; background: #b8952a; }

        .typing-wrap {
          display: flex; align-items: flex-start; gap: 8px;
          margin-bottom: 12px;
        }
        .typing-avatar {
          width: 28px; height: 28px; border-radius: 50%; background: #b8952a;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; flex-shrink: 0; margin-top: 2px;
        }
        .typing-bubble {
          background: ${T.msgAiBg}; border: 1px solid ${T.msgAiBorder};
          padding: 11px 15px;
        }

        @media (max-width: 480px) {
          .chat-window { width: calc(100vw - 24px); right: 12px; bottom: 84px; height: 480px; }
          .chat-fab    { right: 16px; bottom: 16px; }
        }
      `}</style>

      {/* ── FAB Button ── */}
      <button className="chat-fab" onClick={() => setOpen(o => !o)} title="Chat with Silvester">
        {open ? "✕" : "✦"}
        {!open && unread > 0 && (
          <span className="chat-badge">{unread}</span>
        )}
      </button>

      {/* ── Chat Window ── */}
      {open && (
        <div className="chat-window">

          {/* Gold accent bar */}
          <div className="chat-gold-bar"/>

          {/* 🔥 Session indicator — shows when history is loaded */}
          {messages.length > 1 && (
            <div className="chat-session-bar">
              <span className="session-dot"/>
              {messages.length > 1 ? `Session continued · ${messages.length - 1} message${messages.length > 2 ? "s" : ""}` : "New conversation"}
            </div>
          )}

          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-avatar">✦</div>
            <div>
              <div className="chat-header-name">Silvester</div>
              <div className="chat-header-status">
                <span className="status-dot"/>
                AI Concierge · HotelAI
              </div>
            </div>
            <div className="chat-header-actions">
              <button className="chat-header-btn" onClick={clearChat} title="Clear chat">↺</button>
              <button className="chat-header-btn" onClick={() => setOpen(false)} title="Close">✕</button>
            </div>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.map((msg, i) => (
              <MessageBubble key={i} msg={msg} T={T} />
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="typing-wrap">
                <div className="typing-avatar">✦</div>
                <div className="typing-bubble">
                  <TypingDots color="#b8952a"/>
                </div>
              </div>
            )}

            <div ref={messagesEndRef}/>
          </div>

          {/* Suggestion chips — only show if just the welcome message */}
          {messages.length === 1 && (
            <div className="chat-suggestions">
              {SUGGESTIONS.map(s => (
                <button key={s} className="suggestion-chip" onClick={() => sendMessage(s)}>
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input area */}
          <div className="chat-input-area">
            <textarea
              ref={inputRef}
              className="chat-input"
              placeholder="Ask Silvester anything…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={loading}
            />
            <button
              className="chat-send-btn"
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
            >
              {loading ? (
                <div style={{ width:14, height:14, border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"typingBounce 0.7s linear infinite" }}/>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              )}
            </button>
          </div>

        </div>
      )}
    </>
  );
}