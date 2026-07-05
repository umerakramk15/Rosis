import { useState, useEffect, useRef } from "react";

// ─── TEAM DATA ────────────────────────────────────────────────────────────────
const TEAM = [
  {
    name: "Yusra",
    role: "MERN Stack Developer",
    avatar: "Y",
    gradient: ["#f9c5c5", "#e8a0a0"],
    accent: "#c9727a",
    bio: "Crafting pixel-perfect interfaces and immersive user experiences that feel as beautiful as they function. Yusra brings Rosée's visual identity to life.",
    skills: ["UI/UX Design", "React.js", "Tailwind CSS", "Design Systems"],
    icon: "✦",
    pattern: "code",
  },
  {
    name: "Muhammad Umer",
    role: "Full Stack Developer",
    avatar: "MU",
    gradient: ["#c4d4e8", "#8aaac8"],
    accent: "#5a82a8",
    bio: "Architecting the robust infrastructure that powers Rosée's seamless shopping experience. Umer ensures every transaction is fast, secure, and reliable.",
    skills: ["Node.js", "APIs", "Databases", "Cloud Infrastructure"],
    icon: "⬡",
    pattern: "code",
  },
  {
    name: "Uzair Ahmed",
    role: "AI Models Developer",
    avatar: "UA",
    gradient: ["#c8d8b8", "#8ab87a"],
    accent: "#5a9848",
    bio: "Engineering the intelligent systems behind Rosée's AI-powered search and personalisation engine. Uzair makes the shopping experience feel like magic.",
    skills: ["Machine Learning", "NLP", "Visual Search", "Recommendations"],
    icon: "◈",
    pattern: "ai",
  },
  {
    name: "Syed Bilal Hussain",
    role: "Figma Designer",
    avatar: "SB",
    gradient: ["#e8d4c8", "#c8a080"],
    accent: "#a07040",
    bio: "Bridging the gap between frontend elegance and backend power. Bilal ensures Rosée's entire ecosystem works in perfect harmony from end to end.",
    skills: ["Figma", "System Design", "UI/UX", "Design"],
    icon: "❋",
    pattern: "design",
  },
];

const STATS = [
  { value: "2026",  label: "Founded",         icon: "✿" },
  { value: "4",     label: "Team Members",     icon: "♡" },
  { value: "18K+",  label: "Happy Customers",  icon: "★" },
  { value: "100%",  label: "Passion Driven",   icon: "✦" },
];

const VALUES = [
  { title: "Curated with Care",      desc: "Every piece in our collection is hand-selected by our team to meet our standards of quality, style, and sustainability.",                  icon: "✿", color: "#c9727a" },
  { title: "Sustainably Sourced",    desc: "We partner exclusively with ethical manufacturers and use eco-conscious materials, because fashion should never cost the planet.",           icon: "🌿", color: "#5a9848" },
  { title: "AI-Powered Discovery",   desc: "Our intelligent search and recommendation engine learns your style preferences to surface pieces you'll genuinely love.",                  icon: "◈", color: "#5a82a8" },
  { title: "Community First",        desc: "Rosée is more than a shop — it's a circle of women who celebrate individuality, confidence, and the joy of dressing beautifully.",        icon: "♡", color: "#c9727a" },
];

const CONTACT_OPTIONS = [
  { icon: "✉", label: "Email Us",      value: "hello@rosee.shop",     sub: "Response within 24 hours" },
  { icon: "📱", label: "WhatsApp",     value: "+92 300 000 0000",      sub: "Mon–Fri, 9am–6pm PKT"    },
  { icon: "📍", label: "Studio",       value: "Karachi, Pakistan",     sub: "By appointment only"      },
  { icon: "✿", label: "Instagram",    value: "@rosee.shop",           sub: "DM for style advice"      },
];

// ─── ICONS ────────────────────────────────────────────────────────────────────
const SendIcon = () => (
  <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);
const CheckIcon = () => (
  <svg style={{ width: 18, height: 18 }} fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);
const ChevronDown = ({ open }) => (
  <svg style={{ width: 16, height: 16, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.3s" }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

// ─── SCROLL REVEAL HOOK ───────────────────────────────────────────────────────
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

// ─── TEAM CARD ────────────────────────────────────────────────────────────────
function TeamCard({ member, index }) {
  const [ref, visible] = useReveal();
  const [flipped, setFlipped] = useState(false);

  // Decorative SVG patterns per role
  const PatternBg = ({ type }) => {
    const patterns = {
      design: (
        <svg className="absolute inset-0 w-full h-full opacity-8" viewBox="0 0 200 200" fill="none">
          {[0,1,2,3].map(i => <circle key={i} cx={50+i*35} cy={60+i*20} r={20+i*10} stroke="white" strokeWidth="1" strokeDasharray="4 4" opacity={0.3-i*0.06}/>)}
          {[0,1,2].map(i => <path key={i} d={`M${30+i*50} 150 Q${80+i*30} 100 ${130+i*20} 160`} stroke="white" strokeWidth="1" opacity={0.25}/>)}
        </svg>
      ),
      code: (
        <svg className="absolute inset-0 w-full h-full opacity-8" viewBox="0 0 200 200" fill="none">
          {["</div>","const","=>","{...}","async"].map((t, i) => (
            <text key={i} x={10+i*15} y={40+i*35} fontSize="10" fill="white" opacity={0.2} fontFamily="monospace">{t}</text>
          ))}
          {[0,1,2,3].map(i => <rect key={i} x={10+i*40} y={120+i*10} width={30} height={4} rx="2" fill="white" opacity={0.15}/>)}
        </svg>
      ),
      ai: (
        <svg className="absolute inset-0 w-full h-full opacity-8" viewBox="0 0 200 200" fill="none">
          {[[100,50],[50,130],[150,130],[75,90],[125,90],[60,60],[140,60]].map(([cx,cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="4" fill="white" opacity={0.3}/>
          ))}
          {[[100,50,50,130],[100,50,150,130],[50,130,75,90],[50,130,150,130],[150,130,125,90],[75,90,125,90],[60,60,100,50],[140,60,100,50]].map(([x1,y1,x2,y2], i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="white" strokeWidth="1" opacity={0.2}/>
          ))}
        </svg>
      ),
      stack: (
        <svg className="absolute inset-0 w-full h-full opacity-8" viewBox="0 0 200 200" fill="none">
          {[0,1,2,3].map(i => <rect key={i} x={30} y={40+i*35} width={140} height={25} rx="6" stroke="white" strokeWidth="1" opacity={0.2-i*0.03}/>)}
          {[0,1,2].map(i => <line key={i} x1={100} y1={65+i*35} x2={100} y2={75+i*35} stroke="white" strokeWidth="1" opacity={0.25}/>)}
        </svg>
      ),
    };
    return patterns[type] || null;
  };

  return (
    <div
      ref={ref}
      className="team-card-wrap"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.65s ease ${index * 0.12}s, transform 0.65s ease ${index * 0.12}s`,
      }}
    >
      <div
        className="team-card"
        onMouseEnter={() => setFlipped(true)}
        onMouseLeave={() => setFlipped(false)}
        style={{ "--accent": member.accent }}
      >
        {/* Front */}
        <div className="team-card-face team-card-front">
          {/* Header gradient */}
          <div className="team-card-header" style={{ background: `linear-gradient(135deg, ${member.gradient[0]}, ${member.gradient[1]})` }}>
            <PatternBg type={member.pattern} />
            {/* Avatar */}
            <div className="team-avatar" style={{ border: `3px solid ${member.accent}20`, boxShadow: `0 0 0 5px white, 0 8px 24px ${member.accent}30` }}>
              <span style={{ fontFamily: "Playfair Display, serif", fontWeight: 700, fontSize: "1.1rem", color: member.accent }}>
                {member.avatar}
              </span>
            </div>
            {/* Role icon */}
            <span className="team-icon" style={{ color: member.accent }}>{member.icon}</span>
          </div>
          {/* Body */}
          <div className="team-body">
            <h3 className="display-font font-bold text-lg mb-0.5" style={{ color: "#2d1a1a" }}>{member.name}</h3>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: member.accent, fontFamily: "Jost, sans-serif", letterSpacing: "0.12em" }}>
              {member.role}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {member.skills.map(s => (
                <span key={s} className="text-xs px-2.5 py-1 rounded-full"
                  style={{ background: `${member.accent}12`, color: member.accent, fontFamily: "Jost, sans-serif", border: `1px solid ${member.accent}25` }}>
                  {s}
                </span>
              ))}
            </div>
            <p className="mt-3 text-xs" style={{ color: "#b0a0a0", fontFamily: "Jost, sans-serif", fontStyle: "italic" }}>Hover to learn more →</p>
          </div>
        </div>
        {/* Back */}
        <div className="team-card-face team-card-back" style={{ background: `linear-gradient(155deg, ${member.gradient[0]}40, ${member.gradient[1]}25)` }}>
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <span className="text-3xl mb-4">{member.icon}</span>
            <h3 className="display-font font-bold text-lg mb-1" style={{ color: "#2d1a1a" }}>{member.name}</h3>
            <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: member.accent, fontFamily: "Jost, sans-serif" }}>{member.role}</p>
            <p className="text-sm leading-relaxed" style={{ color: "#5a3d3d", fontFamily: "Jost, sans-serif", fontWeight: 300 }}>{member.bio}</p>
            {/* Social links */}
            <div className="flex gap-3 mt-5">
              {["in", "gh", "tw"].map(s => (
                <button key={s} className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all hover:scale-110"
                  style={{ background: `${member.accent}15`, color: member.accent, border: `1.5px solid ${member.accent}30`, fontFamily: "Jost, sans-serif" }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CONTACT FORM ─────────────────────────────────────────────────────────────
function ContactForm() {
  const [fields, setFields] = useState({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState({});
  const [focused, setFocused] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [ref, visible] = useReveal();

  const set = (k) => (e) => setFields(f => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!fields.name.trim())                         e.name    = "Name is required";
    if (!fields.email)                               e.email   = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(fields.email))    e.email   = "Enter a valid email";
    if (!fields.subject)                             e.subject = "Please select a subject";
    if (!fields.message.trim())                      e.message = "Message cannot be empty";
    else if (fields.message.length < 20)             e.message = "Please write at least 20 characters";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setSent(true); }, 2000);
  };

  const inputStyle = (k) => ({
    border: `1.5px solid ${errors[k] ? "#ef4444" : focused === k ? "#c9727a" : "#ecdada"}`,
    boxShadow: focused === k ? "0 0 0 3px rgba(201,114,122,0.1)" : "none",
    background: errors[k] ? "rgba(239,68,68,0.02)" : "white",
    fontFamily: "Jost, sans-serif",
    fontSize: "0.9rem",
    color: "#2d1a1a",
    outline: "none",
    borderRadius: "14px",
    padding: "13px 16px",
    width: "100%",
    transition: "border-color 0.2s, box-shadow 0.2s",
  });

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
          style={{ background: "linear-gradient(135deg,#c9727a,#e8a0a0)", animation: "popIn 0.6s cubic-bezier(0.34,1.56,0.64,1) both" }}>
          <span style={{ color: "white" }}><CheckIcon /></span>
        </div>
        <h3 className="display-font font-bold text-2xl mb-2" style={{ color: "#2d1a1a" }}>Message Received!</h3>
        <p className="text-sm mb-1 max-w-xs" style={{ color: "#8a6060", fontFamily: "Jost, sans-serif", fontWeight: 300 }}>
          Thank you, <strong style={{ color: "#c9727a" }}>{fields.name.split(" ")[0]}</strong>! We'll get back to you within 24 hours.
        </p>
        <p className="text-xs mt-4" style={{ color: "#b0a0a0", fontFamily: "Jost, sans-serif" }}>A confirmation has been sent to <strong>{fields.email}</strong></p>
        <button onClick={() => { setSent(false); setFields({ name:"", email:"", subject:"", message:"" }); }}
          className="mt-8 px-8 py-3 rounded-2xl text-sm font-semibold transition-all hover:opacity-80"
          style={{ background: "white", border: "1.5px solid #f0d0d0", color: "#c9727a", fontFamily: "Jost, sans-serif" }}>
          Send another message
        </button>
      </div>
    );
  }

  return (
    <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(28px)", transition: "all 0.65s ease" }}>
      <form onSubmit={handleSubmit} noValidate>
        {/* Name + Email row */}
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          {[
            { k: "name",  label: "Your Name",      type: "text",  placeholder: "Full name"            },
            { k: "email", label: "Email Address",   type: "email", placeholder: "hello@yourname.com"   },
          ].map(({ k, label, type, placeholder }) => (
            <div key={k}>
              <label className="contact-label">{label} <span style={{ color: "#c9727a" }}>*</span></label>
              <input type={type} value={fields[k]} onChange={set(k)} placeholder={placeholder}
                onFocus={() => setFocused(k)} onBlur={() => setFocused("")}
                style={inputStyle(k)} />
              {errors[k] && <p className="contact-error">{errors[k]}</p>}
            </div>
          ))}
        </div>

        {/* Subject */}
        <div className="mb-4">
          <label className="contact-label">Subject <span style={{ color: "#c9727a" }}>*</span></label>
          <div className="relative">
            <select value={fields.subject} onChange={set("subject")}
              onFocus={() => setFocused("subject")} onBlur={() => setFocused("")}
              style={{ ...inputStyle("subject"), appearance: "none", paddingRight: 40, cursor: "pointer" }}>
              <option value="">Choose a topic…</option>
              {["Order & Shipping", "Returns & Refunds", "Product Enquiry", "Partnership", "Press & Media", "Technical Support", "General Question"].map(o => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
            <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#c9727a" }}>
              <ChevronDown open={focused === "subject"} />
            </span>
          </div>
          {errors.subject && <p className="contact-error">{errors.subject}</p>}
        </div>

        {/* Message */}
        <div className="mb-6">
          <label className="contact-label">
            Message <span style={{ color: "#c9727a" }}>*</span>
            <span className="ml-auto text-xs font-normal" style={{ color: "#b0a0a0" }}>{fields.message.length}/500</span>
          </label>
          <textarea value={fields.message} onChange={set("message")} placeholder="Tell us how we can help you…"
            rows={5} maxLength={500}
            onFocus={() => setFocused("message")} onBlur={() => setFocused("")}
            style={{ ...inputStyle("message"), resize: "vertical", minHeight: 130, lineHeight: 1.7 }} />
          {errors.message && <p className="contact-error">{errors.message}</p>}
        </div>

        <button type="submit" disabled={loading}
          className="w-full py-4 rounded-2xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all"
          style={{
            background: "linear-gradient(135deg,#c9727a,#e8a0a0)",
            color: "white",
            fontFamily: "Jost, sans-serif",
            letterSpacing: "0.1em",
            boxShadow: "0 8px 24px rgba(180,80,80,0.3)",
            opacity: loading ? 0.7 : 1,
            cursor: loading ? "not-allowed" : "pointer",
            transform: loading ? "none" : undefined,
          }}>
          {loading ? (
            <><span className="spinner" />Sending your message…</>
          ) : (
            <><SendIcon />Send Message</>
          )}
        </button>
      </form>
    </div>
  );
}

// ─── FAQ ACCORDION ────────────────────────────────────────────────────────────
const FAQS = [
  { q: "What makes Rosée different from other fashion stores?", a: "Rosée is built by a passionate team of developers and designers who live and breathe fashion technology. Our AI-powered discovery engine, curated editorial collections, and commitment to sustainability set us apart from generic fast-fashion platforms." },
  { q: "How does your AI search work?", a: "Our AI Models team has built a proprietary visual search and natural language understanding system. You can describe what you're looking for in plain English, upload a photo for visual search, or let our recommendation engine learn your style over time." },
  { q: "Where are your products sourced from?", a: "Every brand in our marketplace is vetted for ethical manufacturing practices, quality materials, and fair labour standards. We partner primarily with European and South Asian ateliers who share our values." },
  { q: "Do you offer student or member discounts?", a: "Yes! Join the Rosée Circle (free account) to unlock exclusive member pricing, early access to new arrivals, and seasonal sale events. Students receive an additional 15% discount with valid ID verification." },
];

function FaqItem({ faq, index }) {
  const [open, setOpen] = useState(false);
  const [ref, visible] = useReveal();
  return (
    <div ref={ref} className="faq-item"
      style={{ opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(16px)", transition: `all 0.5s ease ${index * 0.1}s` }}>
      <button onClick={() => setOpen(o => !o)} className="faq-btn">
        <span className="text-sm font-semibold text-left" style={{ color: "#2d1a1a", fontFamily: "Jost, sans-serif" }}>{faq.q}</span>
        <span className="faq-chevron" style={{ transform: open ? "rotate(180deg)" : "none" }}>
          <svg style={{ width: 16, height: 16, color: "#c9727a" }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      <div className="faq-body" style={{ maxHeight: open ? "300px" : "0" }}>
        <p className="text-sm leading-relaxed pb-4 px-5" style={{ color: "#7a5555", fontFamily: "Jost, sans-serif", fontWeight: 300 }}>{faq.a}</p>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function AboutContactPage() {
  const [heroRef, heroVisible] = useReveal();
  const [statsRef, statsVisible] = useReveal();

  return (
    <div style={{ background: "#fdf8f5", fontFamily: "Jost, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Jost:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        .display-font { font-family: 'Playfair Display', serif; }

        /* ── TEAM CARDS 3D FLIP ── */
        .team-card-wrap { perspective: 1000px; }
        .team-card {
          position: relative; width: 100%; height: 340px;
          transform-style: preserve-3d;
          transition: transform 0.65s cubic-bezier(0.4,0,0.2,1);
          cursor: pointer;
        }
        .team-card:hover { transform: rotateY(180deg); }
        .team-card-face {
          position: absolute; inset: 0;
          backface-visibility: hidden;
          border-radius: 24px;
          overflow: hidden;
          border: 1.5px solid #f5e0e0;
          box-shadow: 0 4px 24px rgba(180,80,80,0.08);
        }
        .team-card-back { transform: rotateY(180deg); display: flex; flex-direction: column; }
        .team-card-header {
          position: relative; height: 140px;
          display: flex; align-items: flex-end;
          justify-content: space-between;
          padding: 16px;
          overflow: hidden;
        }
        .team-avatar {
          width: 68px; height: 68px;
          border-radius: 50%;
          background: white;
          display: flex; align-items: center; justify-content: center;
          position: relative; z-index: 1;
          translate: 0 28px;
          flex-shrink: 0;
        }
        .team-icon {
          font-size: 2rem;
          opacity: 0.18;
          position: absolute;
          top: 16px; right: 16px;
          pointer-events: none;
        }
        .team-body { padding: 40px 20px 20px; background: white; flex: 1; }

        /* ── CONTACT FORM ── */
        .contact-label {
          display: flex; align-items: center; justify-content: space-between;
          font-size: 0.8rem; font-weight: 600;
          letter-spacing: 0.04em; color: #5a3d3d;
          margin-bottom: 0.45rem;
          font-family: 'Jost', sans-serif;
        }
        .contact-error {
          font-size: 0.74rem; color: #ef4444;
          font-family: 'Jost', sans-serif; margin-top: 0.3rem;
        }

        /* ── FAQ ── */
        .faq-item {
          border-radius: 16px;
          overflow: hidden;
          background: white;
          border: 1.5px solid #f5e0e0;
          margin-bottom: 10px;
        }
        .faq-btn {
          width: 100%; display: flex; align-items: center; justify-content: space-between;
          gap: 12px; padding: 16px 20px;
          background: none; border: none; cursor: pointer;
          text-align: left;
        }
        .faq-chevron { flex-shrink: 0; transition: transform 0.3s ease; }
        .faq-body { max-height: 0; overflow: hidden; transition: max-height 0.4s ease; }

        /* ── SPINNER ── */
        .spinner {
          width: 16px; height: 16px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: white;
          animation: spin 0.7s linear infinite;
          flex-shrink: 0;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── POP-IN ── */
        @keyframes popIn { from { transform: scale(0); opacity:0; } to { transform: scale(1); opacity:1; } }

        /* ── SECTION DIVIDER ── */
        .ornament { display: flex; align-items: center; gap: 12px; margin: 0 auto; }
        .ornament-line { height: 1px; width: 60px; background: linear-gradient(90deg, transparent, #e8a0a0); }
        .ornament-line.right { background: linear-gradient(90deg, #e8a0a0, transparent); }

        /* ── HERO SHAPES ── */
        .hero-blob {
          position: absolute; border-radius: 50%;
          filter: blur(60px); pointer-events: none;
        }

        /* ── STAT COUNTER ── */
        .stat-card {
          text-align: center; padding: 28px 20px; border-radius: 24px; background: white;
          border: 1.5px solid #f5e0e0;
          box-shadow: 0 4px 20px rgba(180,80,80,0.06);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .stat-card:hover { transform: translateY(-4px); box-shadow: 0 12px 36px rgba(180,80,80,0.12); }

        /* ── VALUE CARDS ── */
        .value-card {
          padding: 28px; border-radius: 24px; background: white;
          border: 1.5px solid #f5e0e0;
          transition: all 0.35s cubic-bezier(0.34,1.3,0.64,1);
        }
        .value-card:hover { transform: translateY(-6px); box-shadow: 0 16px 48px rgba(180,80,80,0.1); }

        /* ── CONTACT OPTIONS ── */
        .contact-opt {
          display: flex; align-items: center; gap: 14px;
          padding: 18px 20px; border-radius: 18px; background: white;
          border: 1.5px solid #f5e0e0;
          transition: all 0.25s ease; cursor: pointer;
        }
        .contact-opt:hover { border-color: #e8a0a0; box-shadow: 0 6px 20px rgba(180,80,80,0.1); transform: translateX(4px); }

        /* ── REVEAL ANIMATION ── */
        .reveal { transition: opacity 0.65s ease, transform 0.65s ease; }

        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #fdf8f5; }
        ::-webkit-scrollbar-thumb { background: #e8a0a0; border-radius: 3px; }
      `}</style>

      {/* ══ HERO ══════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{ background: "linear-gradient(135deg,#fde8e8 0%,#fff5f0 45%,#fde8f4 100%)", paddingTop: "80px", paddingBottom: "80px" }}>
        {/* Blobs */}
        <div className="hero-blob" style={{ width: 500, height: 500, background: "rgba(249,197,197,0.25)", top: "-120px", right: "-100px" }} />
        <div className="hero-blob" style={{ width: 300, height: 300, background: "rgba(212,228,240,0.2)", bottom: "-60px", left: "-80px" }} />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={heroRef} className="text-center"
            style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? "none" : "translateY(28px)", transition: "all 0.7s ease" }}>
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{ background: "rgba(201,114,122,0.1)", border: "1px solid rgba(201,114,122,0.2)" }}>
              <span style={{ color: "#c9727a", fontSize: 12 }}>✿</span>
              <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#c9727a", fontFamily: "Jost, sans-serif", letterSpacing: "0.18em" }}>
                Our Story
              </span>
            </div>

            <h1 className="display-font font-bold mb-5"
              style={{ fontSize: "clamp(2.4rem,6vw,4rem)", color: "#2d1a1a", lineHeight: 1.1 }}>
              Built with <em style={{ color: "#c9727a" }}>Passion</em>,<br />
              Designed for <em style={{ color: "#c9727a" }}>You</em>
            </h1>

            <p className="max-w-2xl mx-auto text-base leading-relaxed"
              style={{ color: "#7a5555", fontFamily: "Jost, sans-serif", fontWeight: 300, fontSize: "1.08rem" }}>
              Rosée was born from a simple belief — that every woman deserves a fashion destination that feels as personal and beautiful as the pieces it sells. We're a small, dedicated team of four who poured our hearts into building something extraordinary.
            </p>

            {/* Scroll indicator */}
            <div className="flex flex-col items-center mt-10 gap-2" style={{ animation: "bounce 2s infinite" }}>
              <div className="w-px h-10" style={{ background: "linear-gradient(to bottom,#c9727a,transparent)" }} />
              <span className="text-xs" style={{ color: "#c9727a", fontFamily: "Jost, sans-serif", letterSpacing: "0.15em" }}>SCROLL</span>
            </div>
          </div>
        </div>

        <style>{`@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(8px)} }`}</style>
      </section>

      {/* ══ STATS ═════════════════════════════════════════════════════════════ */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div ref={statsRef} className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4"
          style={{ opacity: statsVisible ? 1 : 0, transform: statsVisible ? "none" : "translateY(24px)", transition: "all 0.65s ease" }}>
          {STATS.map((s, i) => (
            <div key={s.label} className="stat-card"
              style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="text-2xl mb-2" style={{ color: "#e8a0a0" }}>{s.icon}</div>
              <p className="display-font font-bold text-3xl mb-1" style={{ color: "#2d1a1a" }}>{s.value}</p>
              <p className="text-xs uppercase tracking-wider" style={{ color: "#a07070", fontFamily: "Jost, sans-serif", letterSpacing: "0.12em" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ PROJECT DESCRIPTION ═══════════════════════════════════════════════ */}
      <section className="py-16 px-4 sm:px-6 lg:px-8" style={{ background: "white" }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Text */}
            <div>
              <div className="ornament mb-6">
                <div className="ornament-line" />
                <span style={{ color: "#e8a0a0", fontSize: 18 }}>❀</span>
                <div className="ornament-line right" />
              </div>
              <span className="text-xs font-semibold tracking-widest uppercase block mb-3 text-center lg:text-left" style={{ color: "#c9727a", fontFamily: "Jost, sans-serif", letterSpacing: "0.2em" }}>
                The Project
              </span>
              <h2 className="display-font font-bold mb-5 text-center lg:text-left" style={{ fontSize: "clamp(1.8rem,3.5vw,2.6rem)", color: "#2d1a1a", lineHeight: 1.2 }}>
                Redefining Feminine<br />Fashion Commerce
              </h2>
              <div className="space-y-4 text-sm leading-relaxed" style={{ color: "#7a5555", fontFamily: "Jost, sans-serif", fontWeight: 300, lineHeight: 1.85 }}>
                <p>
                  Rosée is a full-stack e-commerce experience purpose-built for the modern woman who values both style and substance. From the handcrafted UI to the AI-powered search engine, every feature was designed to make fashion discovery feel intuitive, joyful, and personal.
                </p>
                <p>
                  Our platform integrates a <strong style={{ color: "#c9727a", fontWeight: 600 }}>natural language AI search</strong> that understands context and intent, a <strong style={{ color: "#c9727a", fontWeight: 600 }}>visual search engine</strong> that matches images to products, and a curated editorial approach to product presentation that sets Rosée apart from conventional e-commerce.
                </p>
                <p>
                  Built over months of collaboration between our frontend designer, backend architect, AI specialist, and full-stack integrator, Rosée represents the convergence of beautiful design and intelligent technology.
                </p>
              </div>
              {/* Tech stack chips */}
              <div className="flex flex-wrap gap-2 mt-6">
                {["React.js","Node.js","Tailwind CSS","AI/ML","REST APIs","PostgreSQL","AWS"].map(tech => (
                  <span key={tech} className="text-xs px-3 py-1.5 rounded-full"
                    style={{ background: "#fdf0f0", color: "#8b3a4a", fontFamily: "Jost, sans-serif", border: "1px solid #f5d8d8", fontWeight: 500 }}>
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Visual collage */}
            <div className="relative" style={{ height: 420 }}>
              <div className="absolute rounded-3xl overflow-hidden" style={{ width: "60%", height: "75%", top: 0, right: 0, boxShadow: "0 20px 60px rgba(180,80,80,0.15)", border: "3px solid white" }}>
                <img src="https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&q=80" alt="" className="w-full h-full object-cover" />
              </div>
              <div className="absolute rounded-3xl overflow-hidden" style={{ width: "52%", height: "60%", bottom: 0, left: 0, boxShadow: "0 20px 60px rgba(180,80,80,0.12)", border: "3px solid white" }}>
                <img src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=500&q=80" alt="" className="w-full h-full object-cover" />
              </div>
              {/* Floating badge */}
              <div className="absolute bg-white rounded-2xl p-3 shadow-xl flex items-center gap-2"
                style={{ bottom: "32%", right: "2%", border: "1.5px solid #f5d0d0", zIndex: 10 }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg,#c9727a,#e8a0a0)" }}>
                  <span style={{ color: "white", fontSize: 14 }}>◈</span>
                </div>
                <div>
                  <p className="text-xs font-bold" style={{ color: "#2d1a1a", fontFamily: "Jost, sans-serif" }}>AI Powered</p>
                  <p className="text-xs" style={{ color: "#a07070", fontFamily: "Jost, sans-serif" }}>Smart search</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ VALUES ════════════════════════════════════════════════════════════ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ background: "linear-gradient(180deg,#fdf8f5,#fef0f0)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#c9727a", fontFamily: "Jost, sans-serif", letterSpacing: "0.2em" }}>What We Stand For</span>
            <h2 className="display-font font-bold mt-2" style={{ fontSize: "clamp(1.8rem,3.5vw,2.6rem)", color: "#2d1a1a" }}>Our Core Values</h2>
            <div className="ornament mt-4 mb-0">
              <div className="ornament-line" />
              <span style={{ color: "#e8a0a0", fontSize: 18 }}>✦</span>
              <div className="ornament-line right" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map((v, i) => {
              const [ref, visible] = useReveal();
              return (
                <div key={v.title} ref={ref} className="value-card"
                  style={{ opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(24px)", transition: `all 0.6s ease ${i * 0.1}s` }}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl mb-4"
                    style={{ background: `${v.color}15`, border: `1.5px solid ${v.color}25` }}>
                    {v.icon}
                  </div>
                  <h3 className="display-font font-semibold mb-2" style={{ color: "#2d1a1a", fontSize: "1rem" }}>{v.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#7a5555", fontFamily: "Jost, sans-serif", fontWeight: 300 }}>{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ TEAM ══════════════════════════════════════════════════════════════ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ background: "white" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#c9727a", fontFamily: "Jost, sans-serif", letterSpacing: "0.2em" }}>The People Behind Rosée</span>
            <h2 className="display-font font-bold mt-2" style={{ fontSize: "clamp(1.8rem,3.5vw,2.6rem)", color: "#2d1a1a" }}>Meet the Team</h2>
            <p className="mt-3 max-w-xl mx-auto text-sm" style={{ color: "#8a6060", fontFamily: "Jost, sans-serif", fontWeight: 300 }}>
              Four individuals. One shared vision. Hover over each card to discover the person behind the role.
            </p>
            <div className="ornament mt-5">
              <div className="ornament-line" />
              <span style={{ color: "#e8a0a0", fontSize: 18 }}>✿</span>
              <div className="ornament-line right" />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TEAM.map((member, i) => <TeamCard key={member.name} member={member} index={i} />)}
          </div>

          {/* Team group quote */}
          <div className="mt-14 rounded-3xl p-8 text-center"
            style={{ background: "linear-gradient(135deg,#fde8e8,#fdf0f8)", border: "1.5px solid #f5d0d0" }}>
            <p className="display-font font-bold text-xl italic mb-3" style={{ color: "#2d1a1a" }}>
              "We didn't just build a store — we built an experience."
            </p>
            <p className="text-sm" style={{ color: "#8a6060", fontFamily: "Jost, sans-serif" }}>— The Rosée Team, 2026</p>
          </div>
        </div>
      </section>

      {/* ══ CONTACT ═══════════════════════════════════════════════════════════ */}
      <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8" style={{ background: "#fdf8f5" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#c9727a", fontFamily: "Jost, sans-serif", letterSpacing: "0.2em" }}>Get in Touch</span>
            <h2 className="display-font font-bold mt-2" style={{ fontSize: "clamp(1.8rem,3.5vw,2.6rem)", color: "#2d1a1a" }}>We'd Love to Hear<br /><em style={{ color: "#c9727a" }}>From You</em></h2>
            <div className="ornament mt-5">
              <div className="ornament-line" />
              <span style={{ color: "#e8a0a0", fontSize: 18 }}>❀</span>
              <div className="ornament-line right" />
            </div>
          </div>

          <div className="grid lg:grid-cols-5 gap-12">
            {/* Left — contact info */}
            <div className="lg:col-span-2 space-y-4">
              <p className="text-sm leading-relaxed mb-6" style={{ color: "#7a5555", fontFamily: "Jost, sans-serif", fontWeight: 300 }}>
                Whether you have a question about an order, a partnership opportunity, or you simply want to say hello — our team is always happy to hear from you. We aim to respond within 24 hours.
              </p>

              {CONTACT_OPTIONS.map((opt, i) => {
                const [ref, visible] = useReveal();
                return (
                  <div key={opt.label} ref={ref} className="contact-opt"
                    style={{ opacity: visible ? 1 : 0, transform: visible ? "none" : "translateX(-16px)", transition: `all 0.55s ease ${i * 0.1}s` }}>
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                      style={{ background: "linear-gradient(135deg,#fde8e8,#fdf0f8)", border: "1.5px solid #f5d0d0" }}>
                      {opt.icon}
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: "#a07070", fontFamily: "Jost, sans-serif", letterSpacing: "0.1em" }}>{opt.label}</p>
                      <p className="text-sm font-semibold" style={{ color: "#2d1a1a", fontFamily: "Jost, sans-serif" }}>{opt.value}</p>
                      <p className="text-xs" style={{ color: "#b0a0a0", fontFamily: "Jost, sans-serif" }}>{opt.sub}</p>
                    </div>
                  </div>
                );
              })}

              {/* Map placeholder */}
              <div className="rounded-2xl overflow-hidden mt-4" style={{ height: 160, background: "linear-gradient(135deg,#f5eded,#fde8f4)", border: "1.5px solid #f5d0d0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div className="text-center">
                  <div className="text-3xl mb-2">📍</div>
                  <p className="text-sm font-semibold" style={{ color: "#2d1a1a", fontFamily: "Jost, sans-serif" }}>Karachi, Pakistan</p>
                  <p className="text-xs" style={{ color: "#a07070", fontFamily: "Jost, sans-serif" }}>Studio visits by appointment</p>
                </div>
              </div>
            </div>

            {/* Right — form */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-3xl p-8" style={{ border: "1.5px solid #f5e0e0", boxShadow: "0 8px 40px rgba(180,80,80,0.08)" }}>
                <h3 className="display-font font-bold text-xl mb-6" style={{ color: "#2d1a1a" }}>Send us a message ✿</h3>
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FAQ ═══════════════════════════════════════════════════════════════ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ background: "white" }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#c9727a", fontFamily: "Jost, sans-serif", letterSpacing: "0.2em" }}>Questions</span>
            <h2 className="display-font font-bold mt-2" style={{ fontSize: "clamp(1.6rem,3vw,2.2rem)", color: "#2d1a1a" }}>Frequently Asked</h2>
          </div>
          {FAQS.map((faq, i) => <FaqItem key={i} faq={faq} index={i} />)}
        </div>
      </section>

      {/* ══ FOOTER CTA ════════════════════════════════════════════════════════ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 text-center"
        style={{ background: "linear-gradient(135deg,#fde0e0 0%,#fce8f4 50%,#fde0d0 100%)" }}>
        <div className="max-w-2xl mx-auto">
          <span className="text-4xl block mb-5">✿</span>
          <h2 className="display-font font-bold mb-3" style={{ fontSize: "clamp(1.8rem,3.5vw,2.4rem)", color: "#2d1a1a" }}>
            Ready to join the<br /><em style={{ color: "#c9727a" }}>Rosée Circle?</em>
          </h2>
          <p className="text-sm mb-8" style={{ color: "#7a5555", fontFamily: "Jost, sans-serif", fontWeight: 300 }}>
            Discover our curated collection and experience fashion in a whole new way.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button className="px-8 py-4 rounded-full font-bold text-sm uppercase tracking-wider text-white transition-all hover:shadow-xl hover:opacity-90"
              style={{ background: "linear-gradient(135deg,#c9727a,#e8a0a0)", fontFamily: "Jost, sans-serif", letterSpacing: "0.1em", boxShadow: "0 8px 24px rgba(180,80,80,0.3)" }}>
              Shop Now ✿
            </button>
            <button className="px-8 py-4 rounded-full font-bold text-sm uppercase tracking-wider transition-all hover:opacity-80"
              style={{ background: "white", color: "#c9727a", fontFamily: "Jost, sans-serif", letterSpacing: "0.1em", border: "1.5px solid #e8a0a0" }}>
              Create Account
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}