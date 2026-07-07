import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useCartStore from "../store/cartStore";
import useAuthStore from "../store/authStore";
import { toast } from "react-toastify";

/* ═══════════════════════════════════════════════════════════════
   ICONS
═══════════════════════════════════════════════════════════════ */
const Ico = ({ d, size = 18, sw = 2, color = "currentColor", fill = "none" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const P = {
  trash:   "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
  heart:   "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
  tag:     "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z",
  check:   "M5 13l4 4L19 7",
  x:       "M6 18L18 6M6 6l12 12",
  chevR:   "M9 5l7 7-7 7",
  cart:    "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z",
  lock:    "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
  truck:   "M1 3h15v13H1zM16 8h4l3 3v5h-7V8z",
  plus:    "M12 4v16m8-8H4",
  minus:   "M20 12H4",
  shop:    "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z",
};

/* ═══════════════════════════════════════════════════════════════
   CART ITEM COMPONENT
═══════════════════════════════════════════════════════════════ */
function CartItem({ item, onQty, onRemove, index }) {
  const [removing, setRemoving] = useState(false);
  const [updating, setUpdating] = useState(false);

  const handleRemove = () => {
    setRemoving(true);
    setTimeout(() => onRemove(item.productId), 420);
  };

  const handleQty = async (newQty) => {
    if (newQty < 1) return;
    setUpdating(true);
    await onQty(item.productId, newQty);
    setUpdating(false);
  };

  return (
    <div
      style={{
        animationDelay: `${index * 0.08}s`,
        opacity: removing ? 0 : 1,
        transform: removing ? "translateX(32px) scale(0.97)" : "none",
        transition: "opacity 0.4s ease, transform 0.4s ease",
      }}
      className="cart-item-row"
    >
      {/* Product image */}
      <div className="cart-img-wrap">
        <img
          src={item.image || "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=300"}
          alt={item.name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          className="cart-img"
        />
      </div>

      {/* Product details */}
      <div className="cart-item-body">
        <div className="cart-item-top">
          <div>
            <h3 className="item-name">{item.name}</h3>
            <div className="item-meta-row">
              <span className="item-meta-chip" style={{ textTransform: "capitalize" }}>Category: {item.category || "Product"}</span>
            </div>
          </div>
          <div className="item-price-block">
            <p className="item-unit-price">Rs. {item.price?.toLocaleString()}</p>
            {item.qty > 1 && (
              <p className="item-total-price">Rs. {(item.price * item.qty)?.toLocaleString()}</p>
            )}
          </div>
        </div>

        {/* Qty stepper + actions */}
        <div className="cart-item-bottom">
          <div className="qty-stepper">
            <button
              className="qty-btn"
              onClick={() => handleQty(item.qty - 1)}
              disabled={item.qty <= 1 || updating}
            >
              <Ico d={P.minus} size={12} sw={2.5} />
            </button>
            <span className="qty-val">{updating ? "..." : item.qty}</span>
            <button
              className="qty-btn"
              onClick={() => handleQty(item.qty + 1)}
              disabled={updating}
            >
              <Ico d={P.plus} size={12} sw={2.5} />
            </button>
          </div>

          <div className="item-actions">
            <button className="item-action-btn remove" onClick={handleRemove}>
              <Ico d={P.trash} size={13} sw={2} color="#c0a0a0" />
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PROMO CODE INPUT
═══════════════════════════════════════════════════════════════ */
function PromoInput({ onApply, appliedPromo, discount }) {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (appliedPromo) {
      setStatus("success");
      setMessage(`Code "${appliedPromo}" applied! You save Rs. ${discount}`);
      setCode(appliedPromo);
    }
  }, [appliedPromo, discount]);

  const handleApply = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setStatus(null);
    const result = await onApply(code.trim());
    if (result.success) {
      setStatus("success");
      setMessage(result.message);
    } else {
      setStatus("error");
      setMessage(result.message || "Invalid promo code. Try SAVE10, WELCOME20 or FYP50");
    }
    setLoading(false);
  };

  const handleRemovePromo = async () => {
    setCode("");
    setStatus(null);
    setMessage("");
    inputRef.current?.focus();
  };

  return (
    <div className="promo-wrap">
      <div className="promo-label-row">
        <Ico d={P.tag} size={14} color="#c9727a" sw={2} />
        <span className="promo-label">Promo Code</span>
        {status === "success" && <span className="promo-badge-success">Applied ✓</span>}
      </div>

      <div className={`promo-input-row ${status === "success" ? "success" : ""} ${status === "error" ? "error" : ""}`}>
        <input
          ref={inputRef}
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === "Enter" && handleApply()}
          placeholder="Enter code (SAVE10, WELCOME20, FYP50)"
          disabled={status === "success"}
          className="promo-input"
        />
        {status === "success" ? (
          <button className="promo-remove-btn" onClick={handleRemovePromo}>
            <Ico d={P.x} size={14} sw={2.5} color="#c9727a" />
          </button>
        ) : (
          <button className="promo-apply-btn" onClick={handleApply} disabled={loading || !code.trim()}>
            {loading ? "..." : "Apply"}
          </button>
        )}
      </div>

      {message && (
        <p className={`promo-msg ${status}`}>{message}</p>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ORDER SUMMARY CARD
═══════════════════════════════════════════════════════════════ */
function OrderSummary({ items, discount, onPromoApply, appliedPromo, onCheckout }) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const DELIVERY_THRESHOLD = 2000;
  const deliveryFee = subtotal >= DELIVERY_THRESHOLD ? 0 : 150;
  const total = subtotal - (discount || 0) + deliveryFee;
  const itemCount = items.reduce((sum, item) => sum + item.qty, 0);
  const freeShipLeft = DELIVERY_THRESHOLD - subtotal;
  const freeShipPct = Math.min(100, (subtotal / DELIVERY_THRESHOLD) * 100);

  const [flash, setFlash] = useState(false);
  const [prevTotal, setPrevTotal] = useState(total);
  useEffect(() => {
    if (total !== prevTotal) {
      setFlash(true);
      setPrevTotal(total);
      const t = setTimeout(() => setFlash(false), 700);
      return () => clearTimeout(t);
    }
  }, [total]);

  return (
    <div className="summary-card">
      <div className="summary-header">
        <h2 className="summary-title">Order Summary</h2>
        <span className="summary-item-count">{itemCount} item{itemCount !== 1 ? "s" : ""}</span>
      </div>

      {/* Free shipping progress */}
      {deliveryFee > 0 && freeShipLeft > 0 && (
        <div className="free-ship-banner">
          <div className="free-ship-text">
            <Ico d={P.truck} size={13} color="#c9727a" sw={1.5} />
            <span>Add <strong>Rs. {freeShipLeft.toFixed(0)}</strong> more for <strong>free shipping</strong></span>
          </div>
          <div className="free-ship-bar-bg">
            <div className="free-ship-bar-fill" style={{ width: `${freeShipPct}%` }} />
          </div>
        </div>
      )}
      {deliveryFee === 0 && (
        <div className="free-ship-banner success">
          <Ico d={P.check} size={13} color="#16a34a" sw={2.5} />
          <span style={{ color: "#16a34a" }}>You've unlocked <strong>free shipping!</strong></span>
        </div>
      )}

      {/* Promo code */}
      <PromoInput onApply={onPromoApply} appliedPromo={appliedPromo} discount={discount} />

      {/* Line items */}
      <div className="summary-rows">
        <div className="summary-row">
          <span className="summary-row-label">Subtotal</span>
          <span className="summary-row-val">Rs. {subtotal.toLocaleString()}</span>
        </div>
        {discount > 0 && (
          <div className="summary-row discount">
            <span className="summary-row-label">Promo discount</span>
            <span className="summary-row-val discount-val">−Rs. {discount}</span>
          </div>
        )}
        <div className="summary-row">
          <span className="summary-row-label">
            Delivery {deliveryFee === 0 && <span className="free-tag">FREE</span>}
          </span>
          <span className={`summary-row-val ${deliveryFee === 0 ? "free-val" : ""}`}>
            {deliveryFee === 0 ? "—" : `Rs. ${deliveryFee}`}
          </span>
        </div>
        <div className="summary-divider" />
        <div className="summary-row total-row">
          <span className="summary-total-label">Total</span>
          <span className={`summary-total-val ${flash ? "flash" : ""}`}>
            Rs. {total.toLocaleString()}
          </span>
        </div>
        {discount > 0 && (
          <p className="summary-savings">🎉 You're saving Rs. {discount} on this order!</p>
        )}
      </div>

      {/* Checkout button */}
      <button className="checkout-btn" onClick={onCheckout}>
        <Ico d={P.lock} size={16} sw={2} color="white" />
        Proceed to Checkout
        <Ico d={P.chevR} size={16} sw={2.5} color="white" />
      </button>

      {/* Payment icons */}
      <div className="payment-row">
        <span className="payment-label">We accept</span>
        <div className="payment-icons">
          {["VISA", "MC", "AMEX", "PAYPAL"].map(p => (
            <span key={p} className="payment-chip">{p}</span>
          ))}
        </div>
      </div>

      <p className="trust-line">
        <Ico d={P.lock} size={11} sw={2} color="#a07070" />
        SSL secured · 256-bit encryption
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   EMPTY CART
═══════════════════════════════════════════════════════════════ */
function EmptyCart({ onShop }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Ico d={P.cart} size={40} color="#e8a0a0" sw={1.5} />
      </div>
      <h2 className="empty-title">Your bag is empty</h2>
      <p className="empty-sub">Looks like you haven't added anything yet. Browse our products and find something you love.</p>
      <button className="empty-cta" onClick={onShop}>
        Continue Shopping
        <Ico d={P.chevR} size={15} sw={2.5} color="white" />
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN CART PAGE
═══════════════════════════════════════════════════════════════ */
export default function CartPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    items, discount, fetchCart,
    updateItem, removeItem, applyPromo,
  } = useCartStore();

  const [appliedPromo, setAppliedPromo] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch cart on mount
  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    fetchCart().finally(() => setLoading(false));
  }, [user, navigate, fetchCart]);

  const handleQty = async (productId, qty) => {
    await updateItem(productId, qty);
  };

  const handleRemove = async (productId) => {
    await removeItem(productId);
    toast.success("Item removed from cart");
  };

  const handlePromoApply = async (code) => {
    const result = await applyPromo(code);
    if (result.success) {
      setAppliedPromo(code);
      return { success: true, message: result.message };
    }
    return { success: false, message: result.message };
  };

  const handleCheckout = () => {
    if (items.length === 0) { toast.error("Your cart is empty"); return; }
    navigate("/checkout");
  };

  if (loading) {
    return (
      <div className="page-root" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <style>{`.skeleton { background: linear-gradient(90deg, #f0e0e0 25%, #fde8e8 50%, #f0e0e0 75%); background-size: 200% 100%; animation: s 1.5s infinite; } @keyframes s { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
        <p style={{ color: "#c9727a", fontFamily: "Jost, sans-serif", fontSize: "1rem" }}>Loading your cart...</p>
      </div>
    );
  }

  return (
    <div className="page-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700&family=Nunito:wght@300;400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        :root {
          --rose: #c9727a; --rose-lt: #e8a0a0; --rose-xs: #fde8e8;
          --rose-deep: #8b3a4a; --plum: #2d1a1a; --muted: #9a7070;
          --border: #f0d8d8; --cream: #fdf8f5; --card: #ffffff;
        }
        .page-root { min-height: 100vh; background: linear-gradient(160deg, #fdf8f5 0%, #fef0f0 40%, #fdf4f8 100%); font-family: 'Nunito', sans-serif; }
        .page-inner { max-width: 1180px; margin: 0 auto; padding: clamp(24px,4vw,40px) clamp(16px,5vw,32px); display: grid; grid-template-columns: 1fr 380px; gap: 28px; align-items: start; }
        @media (max-width: 900px) { .page-inner { grid-template-columns: 1fr; } }
        .page-heading { margin-bottom: 24px; }
        .page-eyebrow { font-size: .68rem; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; color: var(--rose); margin-bottom: 5px; }
        .page-title { font-family: 'Playfair Display', serif; font-size: clamp(1.6rem,3vw,2.2rem); color: var(--plum); font-weight: 700; }
        .page-subtitle { font-size: .85rem; color: var(--muted); margin-top: 4px; }
        .cart-panel { background: var(--card); border-radius: 24px; border: 1.5px solid var(--border); box-shadow: 0 4px 32px rgba(140,60,60,.07); overflow: hidden; }
        .cart-panel-header { padding: 20px 24px 16px; border-bottom: 1.5px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
        .cart-panel-title { font-family: 'Playfair Display', serif; font-size: 1.1rem; font-weight: 600; color: var(--plum); }
        .clear-all-btn { font-size: .75rem; font-weight: 700; color: var(--muted); background: none; border: none; cursor: pointer; padding: 6px 12px; border-radius: 8px; transition: all .2s; }
        .clear-all-btn:hover { background: #fde8e8; color: var(--rose); }
        .cart-items-list { padding: 0 24px; }
        .cart-item-row { display: flex; gap: 16px; padding: 20px 0; border-bottom: 1px solid #fae8e8; }
        .cart-item-row:last-child { border-bottom: none; }
        .cart-img-wrap { width: 96px; height: 96px; border-radius: 16px; overflow: hidden; flex-shrink: 0; background: #fdf5f5; border: 1px solid var(--border); }
        .cart-img { width: 100%; height: 100%; object-fit: cover; }
        .cart-item-body { flex: 1; display: flex; flex-direction: column; justify-content: space-between; min-width: 0; }
        .cart-item-top { display: flex; justify-content: space-between; gap: 12px; }
        .item-name { font-family: 'Playfair Display', serif; font-size: .95rem; font-weight: 600; color: var(--plum); margin-bottom: 4px; }
        .item-meta-row { display: flex; gap: 6px; flex-wrap: wrap; }
        .item-meta-chip { font-size: .68rem; padding: 2px 10px; border-radius: 20px; background: #fdf0f0; color: #8b3a4a; border: 1px solid var(--border); font-weight: 600; font-family: 'Nunito', sans-serif; }
        .item-price-block { text-align: right; flex-shrink: 0; }
        .item-unit-price { font-weight: 800; color: var(--rose); font-size: 1rem; white-space: nowrap; }
        .item-total-price { font-size: .75rem; color: var(--muted); margin-top: 2px; }
        .cart-item-bottom { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; margin-top: 8px; }
        .qty-stepper { display: flex; align-items: center; gap: 0; border: 1.5px solid var(--border); border-radius: 12px; overflow: hidden; background: white; }
        .qty-btn { width: 30px; height: 30px; border: none; background: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--rose); transition: background .15s; }
        .qty-btn:hover:not(:disabled) { background: #fde8e8; }
        .qty-btn:disabled { opacity: .4; cursor: not-allowed; }
        .qty-val { width: 36px; text-align: center; font-size: .85rem; font-weight: 700; color: var(--plum); border-left: 1px solid var(--border); border-right: 1px solid var(--border); height: 30px; line-height: 30px; }
        .item-actions { display: flex; align-items: center; gap: 8px; }
        .item-action-btn { display: flex; align-items: center; gap: 4px; font-size: .72rem; font-weight: 600; background: none; border: none; cursor: pointer; color: var(--muted); transition: color .2s; padding: 4px 6px; border-radius: 6px; font-family: 'Nunito', sans-serif; }
        .item-action-btn:hover { color: var(--rose); background: #fde8e8; }
        .item-action-btn.remove:hover { color: #ef4444; background: #fef2f2; }
        .action-divider { width: 1px; height: 14px; background: var(--border); }
        .summary-col { position: sticky; top: 24px; }
        .summary-card { background: var(--card); border-radius: 24px; border: 1.5px solid var(--border); box-shadow: 0 4px 32px rgba(140,60,60,.08); padding: 24px; }
        .summary-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
        .summary-title { font-family: 'Playfair Display', serif; font-size: 1.2rem; font-weight: 700; color: var(--plum); }
        .summary-item-count { font-size: .75rem; font-weight: 700; color: var(--muted); background: #fdf0f0; padding: 4px 10px; border-radius: 20px; }
        .free-ship-banner { background: #fdf0f0; border-radius: 12px; padding: 10px 14px; margin-bottom: 16px; display: flex; flex-direction: column; gap: 8px; border: 1px solid var(--border); font-size: .78rem; color: #6b4040; font-weight: 500; }
        .free-ship-banner.success { background: #f0fdf4; border-color: #bbf7d0; flex-direction: row; align-items: center; gap: 8px; }
        .free-ship-text { display: flex; align-items: center; gap: 6px; }
        .free-ship-bar-bg { height: 5px; background: #f5e0e0; border-radius: 999px; overflow: hidden; }
        .free-ship-bar-fill { height: 100%; background: linear-gradient(90deg, var(--rose), var(--rose-lt)); border-radius: 999px; transition: width .6s ease; }
        .promo-wrap { margin-bottom: 20px; padding: 16px; background: #fdf8f8; border-radius: 16px; border: 1.5px dashed var(--border); }
        .promo-label-row { display: flex; align-items: center; gap: 6px; margin-bottom: 10px; }
        .promo-label { font-size: .78rem; font-weight: 700; color: var(--rose); text-transform: uppercase; letter-spacing: .06em; font-family: 'Nunito', sans-serif; }
        .promo-badge-success { font-size: .65rem; font-weight: 700; background: #dcfce7; color: #16a34a; padding: 2px 8px; border-radius: 20px; margin-left: auto; }
        .promo-input-row { display: flex; gap: 8px; border: 1.5px solid var(--border); border-radius: 12px; overflow: hidden; background: white; transition: border-color .2s; }
        .promo-input-row.success { border-color: #86efac; }
        .promo-input-row.error { border-color: #fca5a5; }
        .promo-input { flex: 1; border: none; outline: none; padding: 10px 14px; font-size: .82rem; color: var(--plum); background: transparent; font-family: 'Nunito', sans-serif; font-weight: 600; }
        .promo-apply-btn { padding: 0 16px; background: linear-gradient(135deg, var(--rose), var(--rose-lt)); color: white; border: none; font-size: .75rem; font-weight: 800; letter-spacing: .08em; cursor: pointer; transition: opacity .2s; font-family: 'Nunito', sans-serif; text-transform: uppercase; }
        .promo-apply-btn:disabled { opacity: .5; cursor: not-allowed; }
        .promo-remove-btn { padding: 0 12px; background: #fde8e8; border: none; cursor: pointer; display: flex; align-items: center; }
        .promo-msg { font-size: .72rem; margin-top: 7px; padding: 6px 10px; border-radius: 8px; font-weight: 600; font-family: 'Nunito', sans-serif; }
        .promo-msg.success { background: #f0fdf4; color: #16a34a; }
        .promo-msg.error { background: #fef2f2; color: #ef4444; }
        .summary-rows { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }
        .summary-row { display: flex; justify-content: space-between; align-items: center; font-size: .85rem; font-family: 'Nunito', sans-serif; }
        .summary-row-label { color: var(--muted); font-weight: 500; display: flex; align-items: center; gap: 6px; }
        .summary-row-val { font-weight: 700; color: var(--plum); }
        .summary-row.discount .summary-row-label { color: #22c55e; }
        .discount-val { color: #22c55e !important; }
        .free-tag { font-size: .6rem; font-weight: 800; background: #dcfce7; color: #16a34a; padding: 1px 6px; border-radius: 20px; text-transform: uppercase; letter-spacing: .06em; }
        .free-val { color: #22c55e !important; }
        .summary-divider { height: 1px; background: var(--border); margin: 4px 0; }
        .total-row { margin-top: 2px; }
        .summary-total-label { font-family: 'Playfair Display', serif; font-size: 1rem; font-weight: 700; color: var(--plum); }
        .summary-total-val { font-size: 1.3rem; font-weight: 800; color: var(--rose); transition: transform .15s; }
        .summary-total-val.flash { animation: flashBounce .5s ease; }
        @keyframes flashBounce { 0%,100% { transform: scale(1); } 40% { transform: scale(1.08); } }
        .summary-savings { font-size: .75rem; color: #16a34a; text-align: right; font-weight: 600; margin-top: 4px; font-family: 'Nunito', sans-serif; }
        .checkout-btn { width: 100%; padding: 16px; border-radius: 16px; border: none; background: linear-gradient(135deg, var(--rose) 0%, var(--rose-lt) 100%); color: white; font-size: .85rem; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 16px; transition: all .25s; box-shadow: 0 6px 20px rgba(201,114,122,.3); font-family: 'Nunito', sans-serif; }
        .checkout-btn:hover { background: linear-gradient(135deg, #b05e66, #d48888); transform: translateY(-1px); box-shadow: 0 10px 28px rgba(201,114,122,.4); }
        .payment-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
        .payment-label { font-size: .68rem; color: var(--muted); font-weight: 600; font-family: 'Nunito', sans-serif; }
        .payment-icons { display: flex; gap: 5px; }
        .payment-chip { font-size: .6rem; font-weight: 800; padding: 3px 7px; border-radius: 6px; background: #f5f0f0; color: #6b4040; letter-spacing: .05em; font-family: 'Nunito', sans-serif; }
        .trust-line { font-size: .68rem; color: #b09090; display: flex; align-items: center; gap: 5px; font-family: 'Nunito', sans-serif; }
        .empty-state { text-align: center; padding: 80px 40px; }
        .empty-icon { width: 88px; height: 88px; border-radius: 28px; background: #fde8e8; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; }
        .empty-title { font-family: 'Playfair Display', serif; font-size: 1.6rem; font-weight: 700; color: var(--plum); margin-bottom: 12px; }
        .empty-sub { font-size: .9rem; color: var(--muted); max-width: 340px; margin: 0 auto 28px; line-height: 1.65; font-weight: 400; font-family: 'Nunito', sans-serif; }
        .empty-cta { padding: 14px 32px; border-radius: 14px; border: none; background: linear-gradient(135deg, var(--rose), var(--rose-lt)); color: white; font-size: .8rem; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: all .25s; box-shadow: 0 6px 20px rgba(201,114,122,.3); font-family: 'Nunito', sans-serif; }
        .empty-cta:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(201,114,122,.4); }
        ::-webkit-scrollbar { width: 5px; height: 5px; } ::-webkit-scrollbar-track { background: #fdf8f5; } ::-webkit-scrollbar-thumb { background: #e8a0a0; border-radius: 3px; }
      `}</style>

      <div className="page-inner">
        {/* ── LEFT COLUMN: CART ITEMS ── */}
        <div>
          <div className="page-heading">
            <p className="page-eyebrow">Your Bag</p>
            <h1 className="page-title">Shopping Cart</h1>
            {items.length > 0 && (
              <p className="page-subtitle">{items.length} item{items.length !== 1 ? "s" : ""} in your cart</p>
            )}
          </div>

          {items.length === 0 ? (
            <EmptyCart onShop={() => navigate("/products")} />
          ) : (
            <div className="cart-panel">
              <div className="cart-panel-header">
                <h2 className="cart-panel-title">Cart Items</h2>
                <button className="clear-all-btn" onClick={async () => {
                  const { clearCart } = useCartStore.getState();
                  await clearCart();
                  toast.success("Cart cleared");
                }}>
                  Clear all
                </button>
              </div>
              <div className="cart-items-list">
                {items.map((item, i) => (
                  <CartItem
                    key={item.productId}
                    item={item}
                    index={i}
                    onQty={handleQty}
                    onRemove={handleRemove}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Continue shopping link */}
          {items.length > 0 && (
            <button
              onClick={() => navigate("/products")}
              style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 6, color: "#c9727a", background: "none", border: "none", cursor: "pointer", fontFamily: "Nunito, sans-serif", fontWeight: 700, fontSize: "0.85rem" }}>
              ← Continue Shopping
            </button>
          )}
        </div>

        {/* ── RIGHT COLUMN: ORDER SUMMARY ── */}
        {items.length > 0 && (
          <div className="summary-col">
            <OrderSummary
              items={items}
              discount={discount}
              appliedPromo={appliedPromo}
              onPromoApply={handlePromoApply}
              onCheckout={handleCheckout}
            />
          </div>
        )}
      </div>
    </div>
  );
}
