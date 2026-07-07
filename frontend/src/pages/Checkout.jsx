import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useCartStore from "../store/cartStore";
import useAuthStore from "../store/authStore";
import { orderAPI } from "../api/index";
import { toast } from "react-toastify";

const CITIES = ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Peshawar", "Quetta", "Sialkot", "Gujranwala"];

const P = {
  check:   "M5 13l4 4L19 7",
  chevR:   "M9 5l7 7-7 7",
  chevL:   "M15 19l-7-7 7-7",
  lock:    "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
  card:    "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
  map:     "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z",
  truck:   "M1 3h15v13H1zm15 5h4l3 3v5h-7V8z",
  sparkle: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",
  tag:     "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z",
  x:       "M6 18L18 6M6 6l12 12",
  phone:   "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
};

const Ic = ({ d, size = 18, sw = 2, c = "currentColor", fill = "none" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

// ─── FIELD COMPONENT ──────────────────────────────────────────────────────────
function Field({ label, id, type = "text", placeholder, value, onChange, error, required, icon, half, select, options }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, gridColumn: half ? "span 1" : "span 2" }}>
      <label htmlFor={id} style={{ fontFamily: "'DM Sans',sans-serif", fontSize: ".73rem", fontWeight: 700, color: error ? "#dc2626" : focused ? "#c9727a" : "#6b4d5a", transition: "color .18s" }}>
        {label}{required && <span style={{ color: "#c9727a", marginLeft: 2 }}>*</span>}
      </label>
      <div style={{ position: "relative" }}>
        {icon && (
          <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", zIndex: 1 }}>
            <Ic d={icon} size={14} c={focused ? "#c9727a" : "#c0a0a8"} sw={2} />
          </span>
        )}
        {select ? (
          <select id={id} value={value} onChange={onChange} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            style={{ width: "100%", padding: `11px 14px 11px ${icon ? "38px" : "14px"}`, border: `1.5px solid ${error ? "#fca5a5" : focused ? "#c9727a" : "#f0d5d8"}`, borderRadius: 13, background: "white", fontFamily: "'DM Sans',sans-serif", fontSize: ".85rem", color: value ? "#1e1018" : "#b09090", outline: "none", cursor: "pointer", appearance: "none", boxShadow: focused ? "0 0 0 3px rgba(201,114,122,.1)" : "none", transition: "border .2s, box-shadow .2s" }}>
            <option value="">{placeholder}</option>
            {options?.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        ) : (
          <input id={id} type={type} placeholder={placeholder} value={value} onChange={onChange}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            style={{ width: "100%", padding: `11px 14px 11px ${icon ? "38px" : "14px"}`, border: `1.5px solid ${error ? "#fca5a5" : focused ? "#c9727a" : "#f0d5d8"}`, borderRadius: 13, background: "white", fontFamily: "'DM Sans',sans-serif", fontSize: ".85rem", color: "#1e1018", outline: "none", boxShadow: focused ? "0 0 0 3px rgba(201,114,122,.1)" : "none", transition: "border .2s, box-shadow .2s" }} />
        )}
      </div>
      {error && <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: ".68rem", color: "#dc2626", fontWeight: 600 }}>{error}</p>}
    </div>
  );
}

// ─── STEP 1: SHIPPING ────────────────────────────────────────────────────────
function ShippingStep({ data, onChange, errors, onNext, user }) {
  useEffect(() => {
    if (user) {
      onChange("name", user.name || "");
      onChange("email", user.email || "");
    }
  }, [user]);

  return (
    <div style={{ animation: "stepIn .35s ease both" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 14px" }}>
        <div style={{ gridColumn: "span 2" }}>
          <Field label="Full Name" id="name" placeholder="Your full name" value={data.name} onChange={e => onChange("name", e.target.value)} error={errors.name} required />
        </div>
        <div style={{ gridColumn: "span 2" }}>
          <Field label="Email Address" id="email" type="email" placeholder="your@email.com" value={data.email} onChange={e => onChange("email", e.target.value)} error={errors.email} required />
        </div>
        <div style={{ gridColumn: "span 2" }}>
          <Field label="Phone Number" id="phone" type="tel" placeholder="+92 300 1234567" value={data.phone} onChange={e => onChange("phone", e.target.value)} error={errors.phone} required icon={P.phone} />
        </div>
        <div style={{ gridColumn: "span 2" }}>
          <Field label="Street Address" id="street" placeholder="House #, Street, Area" value={data.street} onChange={e => onChange("street", e.target.value)} error={errors.street} required icon={P.map} />
        </div>
        <Field label="City" id="city" placeholder="Select city" value={data.city} onChange={e => onChange("city", e.target.value)} error={errors.city} required select options={CITIES} half />
        <Field label="Postal Code" id="postalCode" placeholder="e.g. 54000" value={data.postalCode} onChange={e => onChange("postalCode", e.target.value)} error={errors.postalCode} half />
        <div style={{ gridColumn: "span 2" }}>
          <Field label="Province" id="province" placeholder="e.g. Punjab" value={data.province} onChange={e => onChange("province", e.target.value)} />
        </div>
      </div>

      <button onClick={onNext}
        style={{ marginTop: 24, width: "100%", padding: "16px", borderRadius: 16, border: "none", background: "linear-gradient(135deg,#c9727a,#e8a0a0)", color: "white", fontFamily: "'DM Sans',sans-serif", fontSize: ".9rem", fontWeight: 800, letterSpacing: ".07em", textTransform: "uppercase", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: "0 8px 24px rgba(180,80,80,.28)", transition: "all .28s" }}>
        Continue to Payment
        <Ic d={P.chevR} size={17} sw={2.5} c="white" />
      </button>
    </div>
  );
}

// ─── STEP 2: PAYMENT ─────────────────────────────────────────────────────────
function PaymentStep({ onNext, onBack }) {
  // For FYP we use mock payment — in production integrate Stripe
  return (
    <div style={{ animation: "stepIn .35s ease both" }}>
      <div style={{ padding: "32px 24px", textAlign: "center", background: "#fdf8f8", borderRadius: 18, border: "1.5px dashed #f0d5d8", marginBottom: 24 }}>
        <p style={{ fontSize: "2.5rem", marginBottom: 12 }}>💳</p>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: "1rem", color: "#1e1018", marginBottom: 8 }}>Cash on Delivery</p>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: ".82rem", color: "#9a7080", lineHeight: 1.6 }}>
          Pay when your order arrives at your doorstep. Secure and convenient.
        </p>
      </div>

      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 24 }}>
        {["🔒 SSL Secure", "🛡 Fraud Protection", "✓ Verified Seller"].map(t => (
          <span key={t} style={{ fontFamily: "'DM Sans',sans-serif", fontSize: ".68rem", fontWeight: 700, color: "#9a7080" }}>{t}</span>
        ))}
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={onBack}
          style={{ flex: 1, padding: "16px", borderRadius: 16, border: "1.5px solid #f0d5d8", background: "white", color: "#9a7080", fontFamily: "'DM Sans',sans-serif", fontSize: ".85rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <Ic d={P.chevL} size={16} sw={2.5} c="currentColor" />
          Back
        </button>
        <button onClick={onNext}
          style={{ flex: 3, padding: "16px", borderRadius: 16, border: "none", background: "linear-gradient(135deg,#c9727a,#e8a0a0)", color: "white", fontFamily: "'DM Sans',sans-serif", fontSize: ".9rem", fontWeight: 800, letterSpacing: ".07em", textTransform: "uppercase", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: "0 8px 24px rgba(180,80,80,.28)" }}>
          Review Order
          <Ic d={P.chevR} size={17} sw={2.5} c="white" />
        </button>
      </div>
    </div>
  );
}

// ─── STEP 3: REVIEW & CONFIRM ────────────────────────────────────────────────
function ReviewStep({ shipping, items, subtotal, discount, deliveryFee, total, onBack, onConfirm, confirming }) {
  const [agreed, setAgreed] = useState(false);

  return (
    <div style={{ animation: "stepIn .35s ease both" }}>
      {/* Shipping summary */}
      <div style={{ padding: "16px 18px", background: "white", borderRadius: 18, border: "1.5px solid #f0d5d8", marginBottom: 16 }}>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: ".73rem", fontWeight: 800, color: "#6b4d5a", marginBottom: 10, letterSpacing: ".04em" }}>SHIPPING TO</p>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: ".85rem", fontWeight: 700, color: "#1e1018" }}>{shipping.name}</p>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: ".8rem", color: "#9a7080" }}>{shipping.street}, {shipping.city}</p>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: ".8rem", color: "#9a7080" }}>{shipping.province} {shipping.postalCode}</p>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: ".8rem", color: "#9a7080" }}>{shipping.phone}</p>
      </div>

      {/* Order items */}
      <div style={{ padding: "16px 18px", background: "white", borderRadius: 18, border: "1.5px solid #f0d5d8", marginBottom: 16 }}>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: ".73rem", fontWeight: 800, color: "#6b4d5a", marginBottom: 12, letterSpacing: ".04em" }}>ORDER ITEMS ({items.length})</p>
        {items.map(item => (
          <div key={item.productId} style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
            <img src={item.image || "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=80"} alt={item.name}
              style={{ width: 52, height: 52, borderRadius: 10, objectFit: "cover", border: "1px solid #f0d5d8", flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: ".82rem", fontWeight: 700, color: "#1e1018", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</p>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: ".72rem", color: "#9a7080" }}>Qty: {item.qty}</p>
            </div>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: ".85rem", fontWeight: 700, color: "#c9727a", flexShrink: 0 }}>Rs. {(item.price * item.qty)?.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Price summary */}
      <div style={{ padding: "18px 20px", background: "white", borderRadius: 18, border: "1.5px solid #f0d5d8", marginBottom: 16 }}>
        {[
          { label: "Subtotal", val: `Rs. ${subtotal?.toLocaleString()}` },
          discount > 0 ? { label: "Discount", val: `−Rs. ${discount}`, accent: "#16a34a" } : null,
          { label: "Delivery", val: deliveryFee === 0 ? "FREE" : `Rs. ${deliveryFee}`, accent: deliveryFee === 0 ? "#16a34a" : undefined },
        ].filter(Boolean).map((r, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f0d5d8" }}>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: ".8rem", color: "#9a7080" }}>{r.label}</span>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: ".8rem", fontWeight: 700, color: r.accent || "#1e1018" }}>{r.val}</span>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0 0" }}>
          <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: ".95rem", fontWeight: 800, color: "#1e1018" }}>Total</span>
          <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "1.1rem", fontWeight: 800, color: "#c9727a" }}>Rs. {total?.toLocaleString()}</span>
        </div>
      </div>

      {/* T&C */}
      <div style={{ display: "flex", gap: 12, padding: "14px 16px", borderRadius: 14, background: "#fdf8f8", border: "1.5px solid #f0d5d8", marginBottom: 20, cursor: "pointer" }}
        onClick={() => setAgreed(a => !a)}>
        <div style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, border: `2px solid ${agreed ? "#c9727a" : "#e0c8c8"}`, background: agreed ? "#c9727a" : "white", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .18s" }}>
          {agreed && <Ic d={P.check} size={10} sw={3} c="white" />}
        </div>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: ".78rem", color: "#7a6068", lineHeight: 1.6 }}>
          I agree to the <span style={{ color: "#c9727a", fontWeight: 700 }}>Terms & Conditions</span> and confirm my order details are correct.
        </p>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={onBack}
          style={{ flex: 1, padding: "16px", borderRadius: 16, border: "1.5px solid #f0d5d8", background: "white", color: "#9a7080", fontFamily: "'DM Sans',sans-serif", fontSize: ".85rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <Ic d={P.chevL} size={16} sw={2.5} c="currentColor" />
          Back
        </button>
        <button onClick={() => agreed && onConfirm()} disabled={!agreed || confirming}
          style={{ flex: 3, padding: "16px", borderRadius: 16, border: "none", background: !agreed || confirming ? "linear-gradient(135deg,#d4a0a8,#e8c0c0)" : "linear-gradient(135deg,#c9727a,#e8a0a0)", color: "white", fontFamily: "'DM Sans',sans-serif", fontSize: ".9rem", fontWeight: 800, letterSpacing: ".07em", textTransform: "uppercase", cursor: !agreed || confirming ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: agreed && !confirming ? "0 8px 24px rgba(180,80,80,.28)" : "none" }}>
          {confirming ? (
            <><span style={{ width: 16, height: 16, borderRadius: "50%", border: "2.5px solid rgba(255,255,255,.4)", borderTopColor: "white", animation: "spin .7s linear infinite" }} />Processing…</>
          ) : (
            <><Ic d={P.lock} size={16} sw={2} c="white" />Place Order · Rs. {total?.toLocaleString()}<Ic d={P.chevR} size={16} sw={2.5} c="white" /></>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── SUCCESS SCREEN ───────────────────────────────────────────────────────────
function SuccessScreen({ total, orderId, navigate }) {
  const [confetti, setConfetti] = useState([]);
  useEffect(() => {
    setConfetti(Array.from({ length: 24 }, (_, i) => ({
      id: i, x: Math.random() * 100, delay: Math.random() * 1.2,
      dur: 2 + Math.random() * 2, color: ["#c9727a", "#e8a0a0", "#c8a04a", "#f5e6c8"][Math.floor(Math.random() * 4)],
      size: 4 + Math.random() * 8,
    })));
  }, []);

  return (
    <div style={{ textAlign: "center", padding: "clamp(40px,6vw,64px) 20px", position: "relative", overflow: "hidden", maxWidth: 560, margin: "0 auto" }}>
      {confetti.map(c => (
        <div key={c.id} style={{ position: "absolute", left: `${c.x}%`, top: -20, width: c.size, height: c.size, borderRadius: "50%", background: c.color, opacity: .9, pointerEvents: "none", animation: `confettiFall ${c.dur}s ease-in ${c.delay}s both` }} />
      ))}
      <div style={{ width: 100, height: 100, borderRadius: "50%", background: "linear-gradient(135deg,#c9727a,#e8a0a0)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", boxShadow: "0 12px 40px rgba(180,80,80,.38)", animation: "scaleIn .6s cubic-bezier(.34,1.56,.64,1)" }}>
        <Ic d={P.check} size={38} sw={3} c="white" />
      </div>
      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: ".72rem", fontWeight: 800, letterSpacing: ".18em", textTransform: "uppercase", color: "#c9727a", marginBottom: 8 }}>✦ Order Confirmed</p>
      <h2 style={{ fontFamily: "serif", fontWeight: 700, fontSize: "clamp(1.8rem,4vw,2.4rem)", color: "#1e1018", lineHeight: 1.15, marginBottom: 10 }}>Thank you! ✿</h2>
      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: ".88rem", color: "#9a7080", lineHeight: 1.7, marginBottom: 28, maxWidth: 400, margin: "0 auto 28px" }}>
        Your order has been placed successfully. You'll receive a confirmation email shortly.
      </p>
      <div style={{ background: "white", borderRadius: 22, border: "1.5px solid #f0d5d8", padding: "22px 24px", marginBottom: 28, boxShadow: "0 4px 20px rgba(140,40,60,.07)" }}>
        {[
          { label: "Order ID", val: orderId || "Processing...", accent: "#c9727a" },
          { label: "Total Paid", val: `Rs. ${total?.toLocaleString()}`, accent: "#1e1018" },
          { label: "Est. Delivery", val: "3–5 business days" },
          { label: "Confirmation", val: "Sent to your email" },
        ].map((r, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: i < 3 ? "1px solid #f0d5d8" : "none" }}>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: ".8rem", color: "#9a7080" }}>{r.label}</span>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: ".85rem", fontWeight: 700, color: r.accent || "#1e1018" }}>{r.val}</span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        <button onClick={() => navigate("/customer/dashboard")}
          style={{ padding: "14px 24px", borderRadius: 14, border: "1.5px solid #f0d5d8", background: "white", color: "#9a7080", fontFamily: "'DM Sans',sans-serif", fontSize: ".82rem", fontWeight: 700, cursor: "pointer" }}>
          View My Orders
        </button>
        <button onClick={() => navigate("/products")}
          style={{ padding: "14px 24px", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#c9727a,#e8a0a0)", color: "white", fontFamily: "'DM Sans',sans-serif", fontSize: ".82rem", fontWeight: 700, cursor: "pointer", boxShadow: "0 6px 20px rgba(180,80,80,.28)" }}>
          Continue Shopping
        </button>
      </div>
    </div>
  );
}

// ─── MAIN CHECKOUT PAGE ───────────────────────────────────────────────────────
export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { items, discount, fetchCart, clearCart } = useCartStore();

  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [confirming, setConfirming] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [orderTotal, setOrderTotal] = useState(0);

  const [shipping, setShipping] = useState({
    name: "", email: "", phone: "",
    street: "", city: "", province: "", postalCode: "",
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    fetchCart();
  }, [user, navigate, fetchCart]);

  // Redirect if cart empty
  useEffect(() => {
    if (items.length === 0 && step === 1) {
      // Give time for cart to load first
      const t = setTimeout(() => {
        if (items.length === 0 && step === 1) navigate("/cart");
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [items, step, navigate]);

  const updateShipping = (key, val) => setShipping(s => ({ ...s, [key]: val }));

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const deliveryFee = subtotal >= 2000 ? 0 : 150;
  const total = subtotal - (discount || 0) + deliveryFee;

  const validateStep1 = () => {
    const e = {};
    if (!shipping.name)       e.name     = "Full name is required";
    if (!shipping.email)      e.email    = "Email is required";
    if (!shipping.phone)      e.phone    = "Phone number is required";
    if (!shipping.street)     e.street   = "Street address is required";
    if (!shipping.city)       e.city     = "City is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext1 = () => {
    if (validateStep1()) { setErrors({}); setStep(2); window.scrollTo({ top: 0, behavior: "smooth" }); }
  };

  const handleNext2 = () => {
    setStep(3); window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    setStep(s => s - 1); setErrors({}); window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      const res = await orderAPI.placeOrder({
        shippingAddress: {
          street: shipping.street,
          city: shipping.city,
          province: shipping.province,
          postalCode: shipping.postalCode,
        },
        paymentIntentId: null, // Cash on delivery
      });
      const order = res.data.data;
      setOrderId(order._id);
      setOrderTotal(order.total);
      await clearCart();
      setStep("done");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to place order. Please try again.");
      setConfirming(false);
    }
  };

  const STEPS = [
    { num: 1, label: "Shipping", icon: P.truck },
    { num: 2, label: "Payment", icon: P.card },
    { num: 3, label: "Review", icon: P.sparkle },
  ];

  const stepDone = step === "done";

  return (
    <div style={{ minHeight: "100vh", background: "#faf7f4", fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes stepIn       { from{opacity:0;transform:translateX(22px)} to{opacity:1;transform:none} }
        @keyframes scaleIn      { from{opacity:0;transform:scale(.7)} to{opacity:1;transform:scale(1)} }
        @keyframes spin         { to{transform:rotate(360deg)} }
        @keyframes confettiFall { 0%{transform:translateY(0) rotate(0deg);opacity:1} 100%{transform:translateY(110vh) rotate(720deg);opacity:0} }
        ::-webkit-scrollbar { width:4px; } ::-webkit-scrollbar-thumb { background:#e8a0a0; border-radius:4px; }
        input, select, button { font-family:inherit; }
      `}</style>

      

      {/* STEP INDICATOR */}
      {!stepDone && (
        <div style={{ background: "white", borderBottom: "1px solid #f0d5d8", padding: "16px clamp(16px,5vw,48px)" }}>
          <div style={{ maxWidth: 480, margin: "0 auto", display: "flex", alignItems: "center", gap: 0 }}>
            {STEPS.map((s, i) => {
              const done = (typeof step === "number" && step > s.num);
              const active = step === s.num;
              return (
                <div key={s.num} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : "none" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{ width: 34, height: 34, borderRadius: "50%", background: done ? "#c9727a" : active ? "linear-gradient(135deg,#c9727a,#e8a0a0)" : "white", border: `2px solid ${done || active ? "#c9727a" : "#f0d5d8"}`, display: "flex", alignItems: "center", justifyContent: "center", transition: "all .3s", boxShadow: active ? "0 4px 14px rgba(180,80,80,.3)" : "none" }}>
                      {done ? <Ic d={P.check} size={14} sw={3} c="white" /> : <Ic d={s.icon} size={14} sw={2} c={active ? "white" : "#c0a0a8"} />}
                    </div>
                    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: ".65rem", fontWeight: active ? 800 : 600, color: active ? "#c9727a" : done ? "#8a6060" : "#b0a0a0", letterSpacing: ".04em" }}>{s.label}</p>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div style={{ flex: 1, height: 2, background: done ? "#c9727a" : "#f0d5d8", margin: "0 8px", marginBottom: 20, transition: "background .4s" }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "clamp(24px,4vw,40px) clamp(16px,5vw,32px)", display: stepDone ? "block" : "grid", gridTemplateColumns: "1fr 360px", gap: 28, alignItems: "start" }}>

        {/* LEFT: FORM */}
        <div>
          {!stepDone && (
            <div style={{ background: "white", borderRadius: 24, border: "1.5px solid #f0d5d8", boxShadow: "0 4px 32px rgba(140,60,60,.07)", padding: "clamp(20px,4vw,36px)" }}>
              <h2 style={{ fontFamily: "serif", fontSize: "1.3rem", fontWeight: 700, color: "#1e1018", marginBottom: 24 }}>
                {step === 1 ? "Shipping Address" : step === 2 ? "Payment Method" : "Review Your Order"}
              </h2>
              {step === 1 && <ShippingStep data={shipping} onChange={updateShipping} errors={errors} onNext={handleNext1} user={user} />}
              {step === 2 && <PaymentStep onNext={handleNext2} onBack={handleBack} />}
              {step === 3 && (
                <ReviewStep
                  shipping={shipping}
                  items={items}
                  subtotal={subtotal}
                  discount={discount || 0}
                  deliveryFee={deliveryFee}
                  total={total}
                  onBack={handleBack}
                  onConfirm={handleConfirm}
                  confirming={confirming}
                />
              )}
            </div>
          )}
          {stepDone && <SuccessScreen total={orderTotal} orderId={orderId} navigate={navigate} />}
        </div>

        {/* RIGHT: ORDER SUMMARY SIDEBAR */}
        {!stepDone && (
          <div style={{ position: "sticky", top: 100 }}>
            <div style={{ background: "white", borderRadius: 24, border: "1.5px solid #f0d5d8", boxShadow: "0 4px 32px rgba(140,60,60,.07)", padding: 24 }}>
              <h3 style={{ fontFamily: "serif", fontSize: "1.1rem", fontWeight: 700, color: "#1e1018", marginBottom: 16 }}>Order Summary</h3>
              <div style={{ maxHeight: 240, overflowY: "auto", marginBottom: 16 }}>
                {items.map(item => (
                  <div key={item.productId} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
                    <img src={item.image || "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=60"} alt={item.name}
                      style={{ width: 44, height: 44, borderRadius: 10, objectFit: "cover", border: "1px solid #f0d5d8", flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: ".78rem", fontWeight: 700, color: "#1e1018", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</p>
                      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: ".68rem", color: "#9a7080" }}>×{item.qty}</p>
                    </div>
                    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: ".8rem", fontWeight: 700, color: "#c9727a", flexShrink: 0 }}>Rs. {(item.price * item.qty)?.toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: "1px solid #f0d5d8", paddingTop: 14 }}>
                {[
                  { label: "Subtotal", val: `Rs. ${subtotal?.toLocaleString()}` },
                  discount > 0 ? { label: "Discount", val: `−Rs. ${discount}`, accent: "#16a34a" } : null,
                  { label: "Delivery", val: deliveryFee === 0 ? "FREE" : `Rs. ${deliveryFee}`, accent: deliveryFee === 0 ? "#16a34a" : undefined },
                ].filter(Boolean).map((r, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: ".78rem", color: "#9a7080" }}>{r.label}</span>
                    <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: ".78rem", fontWeight: 700, color: r.accent || "#1e1018" }}>{r.val}</span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1.5px solid #f0d5d8", paddingTop: 12, marginTop: 4 }}>
                  <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: ".9rem", fontWeight: 800, color: "#1e1018" }}>Total</span>
                  <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "1.05rem", fontWeight: 800, color: "#c9727a" }}>Rs. {total?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
