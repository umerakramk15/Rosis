import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import useCartStore from "../store/cartStore";
import useWishlistStore from "../store/wishlistStore";
import { orderAPI, userAPI, wishlistAPI } from "../api/index";
import { toast } from "react-toastify";

/* ══════════════════════════════════════════════════
   DESIGN TOKENS
══════════════════════════════════════════════════ */
const T = {
  rose: "#c9727a",
  roseLt: "#e8a0a0",
  roseXs: "#fde8e8",
  roseDk: "#8b3a4a",
  ink: "#1e1018",
  plum: "#2d1a22",
  cream: "#faf7f4",
  creamSm: "#fdf8f5",
  gold: "#c8a04a",
  muted: "#9a7080",
  border: "#f0d5d8",
  white: "#ffffff",
};

const STATUS_STYLE = {
  pending: {
    bg: "#fdf4ff",
    color: "#7e22ce",
    dot: "#c084fc",
    label: "Pending",
  },
  confirmed: {
    bg: "#eff6ff",
    color: "#1d4ed8",
    dot: "#60a5fa",
    label: "Confirmed",
  },
  processing: {
    bg: "#fdf4ff",
    color: "#7e22ce",
    dot: "#c084fc",
    label: "Processing",
  },
  shipped: {
    bg: "#fff7ed",
    color: "#c2410c",
    dot: "#fb923c",
    label: "In Transit",
  },
  delivered: {
    bg: "#f0fdf4",
    color: "#15803d",
    dot: "#4ade80",
    label: "Delivered",
  },
  cancelled: {
    bg: "#fef2f2",
    color: "#b91c1c",
    dot: "#f87171",
    label: "Cancelled",
  },
};

/* ══════════════════════════════════════════════════
   ICONS
══════════════════════════════════════════════════ */
const Ic = ({ d, s = 18, sw = 2, c = "currentColor", fill = "none" }) => (
  <svg
    width={s}
    height={s}
    viewBox="0 0 24 24"
    fill={fill}
    stroke={c}
    strokeWidth={sw}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={d} />
  </svg>
);

const IC = {
  home: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
  orders:
    "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
  heart:
    "M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z",
  profile:
    "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z",
  map: "M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z",
  logout:
    "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1",
  check: "M5 13l4 4L19 7",
  edit: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
  plus: "M12 4v16m8-8H4",
  trash:
    "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
  eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 100 6 3 3 0 000-6z",
  eyeOff:
    "M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22",
  chevR: "M9 5l7 7-7 7",
  lock: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
  truck: "M1 3h15v13H1zm15 5h4l3 3v5h-7V8z",
  cart: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  x: "M18 6L6 18M6 6l12 12",
  menu: "M4 6h16M4 12h16M4 18h16",
  phone:
    "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
  mail: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  package:
    "M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z",
};

/* ══════════════════════════════════════════════════
   REUSABLE UI
══════════════════════════════════════════════════ */
const Btn = ({ children, variant = "primary", onClick, disabled, small }) => {
  const [hov, setHov] = useState(false);
  const base = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    padding: small ? "8px 16px" : "12px 22px",
    borderRadius: 14,
    border: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "'DM Sans',sans-serif",
    fontWeight: 800,
    fontSize: small ? ".72rem" : ".82rem",
    letterSpacing: ".05em",
    transition: "all .22s cubic-bezier(.34,1.3,.64,1)",
  };
  const variants = {
    primary: {
      background: disabled
        ? "#e0c0c4"
        : hov
          ? "linear-gradient(135deg,#b5646c,#d890a0)"
          : "linear-gradient(135deg,#c9727a,#e8a0a0)",
      color: "white",
      boxShadow: disabled
        ? "none"
        : hov
          ? "0 10px 28px rgba(180,80,80,.38)"
          : "0 5px 18px rgba(180,80,80,.24)",
      transform: hov && !disabled ? "translateY(-2px)" : "none",
    },
    ghost: {
      background: hov ? T.roseXs : "white",
      color: hov ? T.rose : T.muted,
      border: `1.5px solid ${hov ? T.rose : T.border}`,
    },
    danger: {
      background: hov ? "#fef2f2" : "white",
      color: hov ? "#b91c1c" : "#ef4444",
      border: `1.5px solid ${hov ? "#fca5a5" : T.border}`,
    },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ ...base, ...variants[variant] }}
    >
      {children}
    </button>
  );
};

const Spinner = () => (
  <div
    style={{
      width: 14,
      height: 14,
      borderRadius: "50%",
      border: "2px solid rgba(255,255,255,.3)",
      borderTopColor: "white",
      animation: "spin .7s linear infinite",
    }}
  />
);

const Field = ({
  label,
  id,
  type = "text",
  placeholder,
  value,
  onChange,
  icon,
  half,
  hint,
  required,
}) => {
  const [focused, setFocused] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const isPw = type === "password";
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 5,
        gridColumn: half ? "span 1" : "span 2",
      }}
    >
      <label
        htmlFor={id}
        style={{
          fontFamily: "'DM Sans',sans-serif",
          fontSize: ".7rem",
          fontWeight: 800,
          color: focused ? T.rose : T.muted,
          letterSpacing: ".04em",
          transition: "color .18s",
        }}
      >
        {label}
        {required && <span style={{ color: T.rose, marginLeft: 2 }}>*</span>}
      </label>
      <div style={{ position: "relative" }}>
        {icon && (
          <span
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
              zIndex: 1,
            }}
          >
            <Ic d={icon} s={14} c={focused ? T.rose : "#c0a0a8"} sw={2} />
          </span>
        )}
        <input
          id={id}
          type={isPw && showPw ? "text" : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%",
            padding: `10px ${isPw ? "40px" : "14px"} 10px ${icon ? "36px" : "13px"}`,
            border: `1.5px solid ${focused ? T.rose : T.border}`,
            borderRadius: 12,
            background: "white",
            fontFamily: "'DM Sans',sans-serif",
            fontSize: ".83rem",
            color: T.ink,
            outline: "none",
            boxShadow: focused ? `0 0 0 3px rgba(201,114,122,.1)` : "none",
            transition: "border .2s,box-shadow .2s",
          }}
        />
        {isPw && (
          <button
            type="button"
            onClick={() => setShowPw((s) => !s)}
            style={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 2,
            }}
          >
            <Ic d={showPw ? IC.eyeOff : IC.eye} s={14} c={T.muted} sw={2} />
          </button>
        )}
      </div>
      {hint && (
        <span
          style={{
            fontFamily: "'DM Sans',sans-serif",
            fontSize: ".65rem",
            color: T.muted,
          }}
        >
          {hint}
        </span>
      )}
    </div>
  );
};

const Skeleton = ({ h = 60, r = 12 }) => (
  <div
    style={{
      height: h,
      borderRadius: r,
      background: `linear-gradient(90deg,${T.roseXs} 25%,#fdf0f0 50%,${T.roseXs} 75%)`,
      backgroundSize: "200% 100%",
      animation: "shimmer 1.5s infinite",
    }}
  />
);

const PageHeader = ({ title, sub, icon }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 14,
      marginBottom: 26,
      paddingBottom: 18,
      borderBottom: `1.5px solid ${T.border}`,
    }}
  >
    <div
      style={{
        width: 44,
        height: 44,
        borderRadius: 14,
        background: `linear-gradient(135deg,${T.rose},${T.roseLt})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 14px rgba(180,80,80,.2)",
        flexShrink: 0,
      }}
    >
      <Ic d={icon} s={19} c="white" sw={2} />
    </div>
    <div>
      <h2
        style={{
          fontFamily: "'Cormorant Garamond',serif",
          fontWeight: 700,
          fontSize: "clamp(1.35rem,2.5vw,1.7rem)",
          color: T.ink,
        }}
      >
        {title}
      </h2>
      {sub && (
        <p
          style={{
            fontFamily: "'DM Sans',sans-serif",
            fontSize: ".75rem",
            color: T.muted,
            marginTop: 2,
          }}
        >
          {sub}
        </p>
      )}
    </div>
  </div>
);

const Card = ({ title, icon, children }) => (
  <div
    style={{
      background: T.white,
      border: `1.5px solid ${T.border}`,
      borderRadius: 24,
      overflow: "hidden",
    }}
  >
    <div
      style={{
        padding: "16px 22px",
        borderBottom: `1.5px solid ${T.border}`,
        background: `linear-gradient(90deg,${T.creamSm},white)`,
        display: "flex",
        alignItems: "center",
        gap: 9,
      }}
    >
      <Ic d={icon} s={16} c={T.rose} sw={2} />{" "}
      <h3
        style={{
          fontFamily: "'Cormorant Garamond',serif",
          fontWeight: 700,
          fontSize: "1.05rem",
          color: T.ink,
        }}
      >
        {title}
      </h3>
    </div>
    <div style={{ padding: "22px" }}>{children}</div>
  </div>
);

/* ══════════════════════════════════════════════════
   PAGE: OVERVIEW
══════════════════════════════════════════════════ */
function PageOverview({ user, orders, wishlistItems, navigate }) {
  const recentOrders = orders.slice(0, 3);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Welcome banner */}
      <div
        style={{
          borderRadius: 24,
          padding: "28px 32px",
          background: `linear-gradient(135deg,#fde8e8 0%,#fdf0e8 50%,#fde8f4 100%)`,
          border: `1.5px solid ${T.border}`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -30,
            right: -30,
            width: 160,
            height: 160,
            borderRadius: "50%",
            background: "rgba(201,114,122,.08)",
          }}
        />
        <p
          style={{
            fontFamily: "'DM Sans',sans-serif",
            fontSize: ".72rem",
            fontWeight: 800,
            color: T.rose,
            letterSpacing: ".14em",
            textTransform: "uppercase",
            marginBottom: 6,
          }}
        >
          Welcome back ✦
        </p>
        <h2
          style={{
            fontFamily: "'Cormorant Garamond',serif",
            fontWeight: 700,
            fontSize: "clamp(1.5rem,3vw,2.1rem)",
            color: T.plum,
            marginBottom: 6,
          }}
        >
          Hello, {user?.name?.split(" ")[0]}! 🌸
        </h2>
        <p
          style={{
            fontFamily: "'DM Sans',sans-serif",
            fontSize: ".82rem",
            color: T.muted,
          }}
        >
          You have {orders.length} order{orders.length !== 1 ? "s" : ""} ·{" "}
          {wishlistItems.length} item{wishlistItems.length !== 1 ? "s" : ""} in
          wishlist
        </p>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
          gap: 16,
        }}
      >
        {[
          {
            label: "Total Orders",
            val: orders.length,
            icon: IC.orders,
            color: T.rose,
          },
          {
            label: "Delivered",
            val: orders.filter((o) => o.orderStatus === "delivered").length,
            icon: IC.check,
            color: "#16a34a",
          },
          {
            label: "In Transit",
            val: orders.filter((o) => o.orderStatus === "shipped").length,
            icon: IC.truck,
            color: "#c2410c",
          },
          {
            label: "Wishlist",
            val: wishlistItems.length,
            icon: IC.heart,
            color: "#db2777",
          },
        ].map((s, i) => (
          <div
            key={i}
            style={{
              background: T.white,
              border: `1.5px solid ${T.border}`,
              borderRadius: 20,
              padding: "18px 20px",
              animation: `fadeUp .35s ${i * 0.07}s ease both`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: `${s.color}18`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ic d={s.icon} s={16} c={s.color} sw={2} />
              </div>
            </div>
            <p
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontWeight: 700,
                fontSize: "1.8rem",
                color: T.ink,
                lineHeight: 1,
              }}
            >
              {s.val}
            </p>
            <p
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontSize: ".72rem",
                color: T.muted,
                marginTop: 4,
              }}
            >
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <Card title="Recent Orders" icon={IC.orders}>
        {recentOrders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <p
              style={{
                fontFamily: "'DM Sans',sans-serif",
                color: T.muted,
                fontSize: ".85rem",
              }}
            >
              No orders yet. Start shopping!
            </p>
            <Btn
              onClick={() => navigate("/products")}
              style={{ marginTop: 16 }}
            >
              Browse Products
            </Btn>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {recentOrders.map((order) => {
              const st =
                STATUS_STYLE[order.orderStatus] || STATUS_STYLE.pending;
              return (
                <div
                  key={order._id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "14px 16px",
                    background: T.creamSm,
                    borderRadius: 16,
                    border: `1px solid ${T.border}`,
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: `linear-gradient(135deg,${T.rose},${T.roseLt})`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Ic d={IC.package} s={18} c="white" sw={2} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontFamily: "'DM Sans',sans-serif",
                        fontWeight: 700,
                        fontSize: ".82rem",
                        color: T.ink,
                      }}
                    >
                      #{order._id.slice(-8).toUpperCase()}
                    </p>
                    <p
                      style={{
                        fontFamily: "'DM Sans',sans-serif",
                        fontSize: ".72rem",
                        color: T.muted,
                      }}
                    >
                      {order.items?.length} item
                      {order.items?.length !== 1 ? "s" : ""} ·{" "}
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        padding: "3px 10px",
                        borderRadius: 999,
                        background: st.bg,
                        fontFamily: "'DM Sans',sans-serif",
                        fontSize: ".65rem",
                        fontWeight: 800,
                        color: st.color,
                      }}
                    >
                      <span
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: "50%",
                          background: st.dot,
                        }}
                      />
                      {st.label}
                    </span>
                    <p
                      style={{
                        fontFamily: "'DM Sans',sans-serif",
                        fontWeight: 800,
                        fontSize: ".82rem",
                        color: T.rose,
                        marginTop: 4,
                      }}
                    >
                      Rs. {order.total?.toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   PAGE: ORDERS
══════════════════════════════════════════════════ */
function PageOrders({ orders, loading, onCancel }) {
  const [filter, setFilter] = useState("all");
  const filtered =
    filter === "all" ? orders : orders.filter((o) => o.orderStatus === filter);

  return (
    <div>
      <PageHeader
        title="My Orders"
        sub={`${orders.length} total orders`}
        icon={IC.orders}
      />

      {/* Filter tabs */}
      <div
        style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}
      >
        {[
          "all",
          "pending",
          "confirmed",
          "shipped",
          "delivered",
          "cancelled",
        ].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              padding: "7px 16px",
              borderRadius: 999,
              border: `1.5px solid ${filter === s ? T.rose : T.border}`,
              background: filter === s ? T.rose : "white",
              color: filter === s ? "white" : T.muted,
              fontFamily: "'DM Sans',sans-serif",
              fontSize: ".72rem",
              fontWeight: 700,
              cursor: "pointer",
              textTransform: "capitalize",
              transition: "all .2s",
            }}
          >
            {s === "all" ? "All Orders" : s}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} h={80} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 0" }}>
          <p
            style={{
              fontFamily: "'DM Sans',sans-serif",
              color: T.muted,
              fontSize: ".9rem",
            }}
          >
            No orders found.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {filtered.map((order, i) => {
            const st = STATUS_STYLE[order.orderStatus] || STATUS_STYLE.pending;
            const canCancel = ["pending", "confirmed"].includes(
              order.orderStatus,
            );
            return (
              <div
                key={order._id}
                style={{
                  background: T.white,
                  border: `1.5px solid ${T.border}`,
                  borderRadius: 22,
                  overflow: "hidden",
                  animation: `fadeUp .35s ${i * 0.06}s ease both`,
                }}
              >
                <div
                  style={{
                    padding: "14px 20px",
                    borderBottom: `1px solid ${T.border}`,
                    background: `linear-gradient(90deg,${T.creamSm},white)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 10,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 10,
                        background: `linear-gradient(135deg,${T.rose},${T.roseLt})`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Ic d={IC.package} s={16} c="white" sw={2} />
                    </div>
                    <div>
                      <p
                        style={{
                          fontFamily: "'DM Sans',sans-serif",
                          fontWeight: 800,
                          fontSize: ".82rem",
                          color: T.ink,
                        }}
                      >
                        #{order._id.slice(-8).toUpperCase()}
                      </p>
                      <p
                        style={{
                          fontFamily: "'DM Sans',sans-serif",
                          fontSize: ".7rem",
                          color: T.muted,
                        }}
                      >
                        {new Date(order.createdAt).toLocaleDateString("en-PK", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        padding: "4px 12px",
                        borderRadius: 999,
                        background: st.bg,
                        fontFamily: "'DM Sans',sans-serif",
                        fontSize: ".65rem",
                        fontWeight: 800,
                        color: st.color,
                      }}
                    >
                      <span
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: "50%",
                          background: st.dot,
                        }}
                      />
                      {st.label}
                    </span>
                    <p
                      style={{
                        fontFamily: "'DM Sans',sans-serif",
                        fontWeight: 800,
                        fontSize: ".9rem",
                        color: T.rose,
                      }}
                    >
                      Rs. {order.total?.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div style={{ padding: "14px 20px" }}>
                  {order.items?.slice(0, 2).map((item) => (
                    <div
                      key={item.productId}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 8,
                      }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 8,
                          background: T.roseXs,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Ic d={IC.package} s={14} c={T.rose} sw={2} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            fontFamily: "'DM Sans',sans-serif",
                            fontSize: ".78rem",
                            fontWeight: 700,
                            color: T.ink,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {item.name}
                        </p>
                        <p
                          style={{
                            fontFamily: "'DM Sans',sans-serif",
                            fontSize: ".68rem",
                            color: T.muted,
                          }}
                        >
                          Qty: {item.qty} · Rs. {item.price?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {order.items?.length > 2 && (
                    <p
                      style={{
                        fontFamily: "'DM Sans',sans-serif",
                        fontSize: ".7rem",
                        color: T.muted,
                        marginTop: 4,
                      }}
                    >
                      +{order.items.length - 2} more items
                    </p>
                  )}

                  {canCancel && (
                    <div
                      style={{
                        marginTop: 12,
                        display: "flex",
                        justifyContent: "flex-end",
                      }}
                    >
                      <Btn
                        variant="danger"
                        small
                        onClick={() => onCancel(order._id)}
                      >
                        <Ic d={IC.x} s={13} c="currentColor" sw={2.5} /> Cancel
                        Order
                      </Btn>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   PAGE: WISHLIST
══════════════════════════════════════════════════ */
function PageWishlist({ items, loading, onMoveToCart, onRemove }) {
  return (
    <div>
      <PageHeader
        title="My Wishlist"
        sub={`${items.length} saved items`}
        icon={IC.heart}
      />
      {loading ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))",
            gap: 16,
          }}
        >
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} h={280} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 0" }}>
          <p
            style={{
              fontFamily: "'DM Sans',sans-serif",
              color: T.muted,
              fontSize: ".9rem",
              marginBottom: 16,
            }}
          >
            Your wishlist is empty.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))",
            gap: 16,
          }}
        >
          {items.map((product, i) => (
            <div
              key={product._id}
              style={{
                background: T.white,
                border: `1.5px solid ${T.border}`,
                borderRadius: 22,
                overflow: "hidden",
                animation: `fadeUp .35s ${i * 0.06}s ease both`,
              }}
            >
              <div
                style={{
                  position: "relative",
                  height: 220,
                  background: T.roseXs,
                }}
              >
                <img
                  src={
                    product.images?.[0]?.url ||
                    "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=300"
                  }
                  alt={product.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <button
                  onClick={() => onRemove(product._id)}
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    background: "white",
                    border: `1px solid ${T.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <Ic d={IC.x} s={12} c="#ef4444" sw={2.5} />
                </button>
              </div>
              <div style={{ padding: "14px 16px" }}>
                <p
                  style={{
                    fontFamily: "'DM Sans',sans-serif",
                    fontSize: ".7rem",
                    color: T.muted,
                    textTransform: "capitalize",
                    marginBottom: 4,
                  }}
                >
                  {product.category}
                </p>
                <p
                  style={{
                    fontFamily: "'Cormorant Garamond',serif",
                    fontWeight: 700,
                    fontSize: ".95rem",
                    color: T.ink,
                    marginBottom: 8,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {product.name}
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <p
                    style={{
                      fontFamily: "'DM Sans',sans-serif",
                      fontWeight: 800,
                      fontSize: ".9rem",
                      color: T.rose,
                    }}
                  >
                    Rs. {product.price?.toLocaleString()}
                  </p>
                  <button
                    onClick={() => onMoveToCart(product._id)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 10,
                      border: "none",
                      background: `linear-gradient(135deg,${T.rose},${T.roseLt})`,
                      color: "white",
                      fontFamily: "'DM Sans',sans-serif",
                      fontSize: ".68rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <Ic d={IC.cart} s={12} c="white" sw={2} /> Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   PAGE: PROFILE
══════════════════════════════════════════════════ */
function PageProfile({ user, onUpdate }) {
  const [form, setForm] = useState({ name: "", phone: "" });
  const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    if (user) setForm({ name: user.name || "", phone: user.phone || "" });
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await userAPI.updateProfile(form);
      toast.success("Profile updated!");
      onUpdate();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePwSave = async () => {
    if (pwForm.newPw !== pwForm.confirm) {
      toast.error("Passwords don't match");
      return;
    }
    setSavingPw(true);
    try {
      const { authAPI } = await import("../api/authAPI");
      await authAPI.changePassword({
        currentPassword: pwForm.current,
        newPassword: pwForm.newPw,
      });
      toast.success("Password updated!");
      setPwForm({ current: "", newPw: "", confirm: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update password");
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <PageHeader
        title="My Profile"
        sub="Manage your personal information"
        icon={IC.profile}
      />

      {/* Avatar */}
      <Card title="Profile Photo" icon={IC.profile}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: `linear-gradient(135deg,${T.rose},${T.roseLt})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 16px rgba(180,80,80,.25)",
              flexShrink: 0,
            }}
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <span
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontWeight: 700,
                  fontSize: "1.6rem",
                  color: "white",
                }}
              >
                {user?.name?.charAt(0)?.toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <p
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontWeight: 800,
                fontSize: ".9rem",
                color: T.ink,
              }}
            >
              {user?.name}
            </p>
            <p
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontSize: ".78rem",
                color: T.muted,
              }}
            >
              {user?.email}
            </p>
            <p
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontSize: ".7rem",
                color: T.rose,
                marginTop: 4,
                fontWeight: 700,
                textTransform: "capitalize",
              }}
            >
              ✦ {user?.role}
            </p>
          </div>
        </div>
      </Card>

      {/* Profile form */}
      <Card title="Personal Information" icon={IC.edit}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "14px 14px",
          }}
        >
          <Field
            label="Full Name"
            id="name"
            placeholder="Your full name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
          <div style={{ gridColumn: "span 2" }}>
            <label
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontSize: ".7rem",
                fontWeight: 800,
                color: T.muted,
                letterSpacing: ".04em",
              }}
            >
              Email Address
            </label>
            <div
              style={{
                marginTop: 5,
                padding: "10px 14px",
                border: `1.5px solid ${T.border}`,
                borderRadius: 12,
                background: "#f8f8f8",
                fontFamily: "'DM Sans',sans-serif",
                fontSize: ".83rem",
                color: T.muted,
              }}
            >
              {user?.email}
            </div>
            <p
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontSize: ".65rem",
                color: T.muted,
                marginTop: 4,
              }}
            >
              Email cannot be changed
            </p>
          </div>
          <div style={{ gridColumn: "span 2" }}>
            <Field
              label="Phone Number"
              id="phone"
              type="tel"
              icon={IC.phone}
              placeholder="+92 300 1234567"
              value={form.phone}
              onChange={(e) =>
                setForm((f) => ({ ...f, phone: e.target.value }))
              }
            />
          </div>
        </div>
        <div
          style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}
        >
          <Btn onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Spinner /> Saving…
              </>
            ) : (
              <>
                <Ic d={IC.check} s={15} c="white" sw={2.5} /> Save Changes
              </>
            )}
          </Btn>
        </div>
      </Card>

      {/* Change password */}
      <Card title="Change Password" icon={IC.shield}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field
            label="Current Password"
            id="cp"
            type="password"
            placeholder="••••••••"
            value={pwForm.current}
            onChange={(e) =>
              setPwForm((f) => ({ ...f, current: e.target.value }))
            }
          />
          <Field
            label="New Password"
            id="np"
            type="password"
            placeholder="Min. 8 characters"
            value={pwForm.newPw}
            onChange={(e) =>
              setPwForm((f) => ({ ...f, newPw: e.target.value }))
            }
            hint="Use uppercase, lowercase, numbers and symbols"
          />
          <Field
            label="Confirm New Password"
            id="cf"
            type="password"
            placeholder="Repeat new password"
            value={pwForm.confirm}
            onChange={(e) =>
              setPwForm((f) => ({ ...f, confirm: e.target.value }))
            }
          />
        </div>
        {pwForm.newPw.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <div style={{ display: "flex", gap: 4, marginBottom: 5 }}>
              {[1, 2, 3, 4].map((n) => {
                const str = Math.min(4, Math.floor(pwForm.newPw.length / 3));
                return (
                  <div
                    key={n}
                    style={{
                      flex: 1,
                      height: 4,
                      borderRadius: 999,
                      background:
                        n <= str
                          ? str < 2
                            ? "#ef4444"
                            : str < 3
                              ? "#f59e0b"
                              : str < 4
                                ? "#22c55e"
                                : "#10b981"
                          : T.border,
                      transition: "background .3s",
                    }}
                  />
                );
              })}
            </div>
            <p
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontSize: ".65rem",
                color: T.muted,
              }}
            >
              Strength:{" "}
              {pwForm.newPw.length < 6
                ? "Weak"
                : pwForm.newPw.length < 10
                  ? "Fair"
                  : pwForm.newPw.length < 14
                    ? "Good"
                    : "Strong"}
            </p>
          </div>
        )}
        <div
          style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}
        >
          <Btn
            onClick={handlePwSave}
            disabled={
              savingPw || !pwForm.current || !pwForm.newPw || !pwForm.confirm
            }
          >
            {savingPw ? (
              <>
                <Spinner /> Updating…
              </>
            ) : (
              <>
                <Ic d={IC.lock} s={15} c="white" sw={2} /> Update Password
              </>
            )}
          </Btn>
        </div>
      </Card>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   PAGE: ADDRESS BOOK
══════════════════════════════════════════════════ */
function PageAddressBook() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState("list");
  const [form, setForm] = useState({
    street: "",
    city: "",
    province: "",
    postalCode: "",
    label: "home",
    isDefault: false,
  });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    userAPI
      .getAddresses()
      .then((res) => {
        setAddresses(res.data.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const upd = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.street || !form.city) {
      toast.error("Street and city are required");
      return;
    }
    try {
      if (editId) {
        await userAPI.updateAddress(editId, form);
        toast.success("Address updated!");
      } else {
        await userAPI.addAddress(form);
        toast.success("Address added!");
      }
      const res = await userAPI.getAddresses();
      setAddresses(res.data.data || []);
      setMode("list");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save address");
    }
  };

  const handleDelete = async (id) => {
    try {
      await userAPI.deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a._id !== id));
      toast.success("Address removed");
    } catch (err) {
      toast.error("Failed to delete address");
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await userAPI.setDefaultAddress(id);
      const res = await userAPI.getAddresses();
      setAddresses(res.data.data || []);
      toast.success("Default address updated");
    } catch (err) {
      toast.error("Failed to set default");
    }
  };

  if (mode !== "list") {
    return (
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 24,
          }}
        >
          <button
            onClick={() => setMode("list")}
            style={{
              background: T.white,
              border: `1.5px solid ${T.border}`,
              borderRadius: 12,
              width: 38,
              height: 38,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <Ic
              d={IC.chevR}
              s={16}
              c={T.muted}
              sw={2}
              style={{ transform: "rotate(180deg)" }}
            />
          </button>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontWeight: 700,
              fontSize: "1.45rem",
              color: T.ink,
            }}
          >
            {editId ? "Edit Address" : "Add New Address"}
          </h2>
        </div>
        <div
          style={{
            background: T.white,
            border: `1.5px solid ${T.border}`,
            borderRadius: 24,
            padding: "28px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "14px 14px",
            }}
          >
            <div style={{ gridColumn: "span 2" }}>
              <Field
                label="Street Address"
                id="st"
                placeholder="House #, Street, Area"
                value={form.street}
                onChange={(e) => upd("street", e.target.value)}
                icon={IC.map}
                required
              />
            </div>
            <Field
              label="City"
              id="ci"
              placeholder="Lahore"
              value={form.city}
              onChange={(e) => upd("city", e.target.value)}
              required
              half
            />
            <Field
              label="Postal Code"
              id="pc"
              placeholder="54000"
              value={form.postalCode}
              onChange={(e) => upd("postalCode", e.target.value)}
              half
            />
            <div style={{ gridColumn: "span 2" }}>
              <Field
                label="Province"
                id="pv"
                placeholder="Punjab"
                value={form.province}
                onChange={(e) => upd("province", e.target.value)}
              />
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginTop: 18,
              padding: "13px 16px",
              background: T.creamSm,
              borderRadius: 14,
              border: `1.5px solid ${T.border}`,
              cursor: "pointer",
            }}
            onClick={() => upd("isDefault", !form.isDefault)}
          >
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: 6,
                border: `2px solid ${form.isDefault ? T.rose : T.border}`,
                background: form.isDefault ? T.rose : T.white,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all .18s",
                flexShrink: 0,
              }}
            >
              {form.isDefault && <Ic d={IC.check} s={10} sw={3} c="white" />}
            </div>
            <p
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontSize: ".82rem",
                fontWeight: 700,
                color: T.ink,
              }}
            >
              Set as default address
            </p>
          </div>
          <div
            style={{
              marginTop: 22,
              display: "flex",
              gap: 12,
              justifyContent: "flex-end",
            }}
          >
            <Btn variant="ghost" onClick={() => setMode("list")}>
              Cancel
            </Btn>
            <Btn onClick={handleSave}>
              <Ic d={IC.check} s={15} c="white" sw={2.5} />
              {editId ? "Save Changes" : "Add Address"}
            </Btn>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Address Book"
        sub={`${addresses.length} saved addresses`}
        icon={IC.map}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 18,
        }}
      >
        <Btn
          onClick={() => {
            setForm({
              street: "",
              city: "",
              province: "",
              postalCode: "",
              label: "home",
              isDefault: false,
            });
            setEditId(null);
            setMode("add");
          }}
        >
          <Ic d={IC.plus} s={15} c="white" sw={2.5} /> Add New Address
        </Btn>
      </div>
      {loading ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
            gap: 16,
          }}
        >
          {[1, 2].map((i) => (
            <Skeleton key={i} h={180} />
          ))}
        </div>
      ) : addresses.length === 0 ? (
        <p
          style={{
            fontFamily: "'DM Sans',sans-serif",
            color: T.muted,
            textAlign: "center",
            padding: "32px 0",
          }}
        >
          No addresses saved yet.
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
            gap: 16,
          }}
        >
          {addresses.map((addr, i) => (
            <div
              key={addr._id}
              style={{
                background: T.white,
                border: `2px solid ${addr.isDefault ? T.rose : T.border}`,
                borderRadius: 22,
                padding: "20px",
                position: "relative",
                animation: `fadeUp .35s ${i * 0.06}s ease both`,
                boxShadow: addr.isDefault
                  ? "0 4px 20px rgba(180,80,80,.1)"
                  : "none",
              }}
            >
              {addr.isDefault && (
                <span
                  style={{
                    position: "absolute",
                    top: 14,
                    right: 14,
                    background: `linear-gradient(135deg,${T.rose},${T.roseLt})`,
                    color: "white",
                    fontSize: ".6rem",
                    fontWeight: 900,
                    padding: "2px 10px",
                    borderRadius: 999,
                    fontFamily: "'DM Sans',sans-serif",
                  }}
                >
                  DEFAULT
                </span>
              )}
              <p
                style={{
                  fontFamily: "'DM Sans',sans-serif",
                  fontWeight: 800,
                  fontSize: ".9rem",
                  color: T.ink,
                  marginBottom: 6,
                }}
              >
                {addr.street}
              </p>
              <p
                style={{
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: ".78rem",
                  color: T.muted,
                  lineHeight: 1.7,
                }}
              >
                {addr.city}
                {addr.province ? `, ${addr.province}` : ""}
                <br />
                {addr.postalCode}
              </p>
              <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                {!addr.isDefault && (
                  <Btn
                    small
                    variant="ghost"
                    onClick={() => handleSetDefault(addr._id)}
                  >
                    Set Default
                  </Btn>
                )}
                <Btn
                  small
                  variant="ghost"
                  onClick={() => {
                    setForm({
                      street: addr.street || "",
                      city: addr.city || "",
                      province: addr.province || "",
                      postalCode: addr.postalCode || "",
                      isDefault: addr.isDefault || false,
                    });
                    setEditId(addr._id);
                    setMode("edit");
                  }}
                >
                  <Ic d={IC.edit} s={12} c="currentColor" sw={2} /> Edit
                </Btn>
                <Btn
                  small
                  variant="danger"
                  onClick={() => handleDelete(addr._id)}
                >
                  <Ic d={IC.trash} s={12} c="currentColor" sw={2} /> Delete
                </Btn>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   MAIN DASHBOARD
══════════════════════════════════════════════════ */
const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: IC.home },
  { id: "orders", label: "My Orders", icon: IC.orders },
  { id: "wishlist", label: "Wishlist", icon: IC.heart },
  { id: "profile", label: "Profile", icon: IC.profile },
  { id: "addresses", label: "Address Book", icon: IC.map },
];

export default function CustomerDashboard() {
  const [active, setActive] = useState("overview");
  const [mobileOpen, setMobOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(true);

  const routerNavigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { addToCart } = useCartStore();

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      routerNavigate("/login");
      return;
    }
    if (user.role === "merchant") {
      routerNavigate("/merchant/dashboard");
      return;
    }

    // Fetch orders
    orderAPI
      .getMyOrders({ limit: 50 })
      .then((res) => {
        setOrders(res.data.data.orders || []);
      })
      .catch(console.error)
      .finally(() => setOrdersLoading(false));

    // Fetch wishlist
    wishlistAPI
      .getWishlist()
      .then((res) => {
        setWishlistItems(res.data.data.wishlist || []);
      })
      .catch(console.error)
      .finally(() => setWishlistLoading(false));
  }, [user, routerNavigate]);

  const navigate = (page) => {
    setActive(page);
    setMobOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLogout = async () => {
    await logout();
    routerNavigate("/login");
  };

  const handleCancelOrder = async (orderId) => {
    try {
      await orderAPI.cancelOrder(orderId);
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId ? { ...o, orderStatus: "cancelled" } : o,
        ),
      );
      toast.success("Order cancelled successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel order");
    }
  };

  const handleMoveToCart = async (productId) => {
    const result = await addToCart(productId, 1);
    if (result.success) {
      setWishlistItems((prev) => prev.filter((p) => p._id !== productId));
      toast.success("Moved to cart!");
    } else {
      toast.error(result.message);
    }
  };

  const handleRemoveWishlist = async (productId) => {
    try {
      await wishlistAPI.toggleWishlist(productId);
      setWishlistItems((prev) => prev.filter((p) => p._id !== productId));
      toast.success("Removed from wishlist");
    } catch {
      toast.error("Failed to remove");
    }
  };

  const handleProfileUpdate = async () => {
    // Refresh user data from server
  };

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: T.cream,
        fontFamily: "'DM Sans',sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:none} }
        @keyframes scaleIn { from{opacity:0;transform:scale(.88)} to{opacity:1;transform:scale(1)} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        ::-webkit-scrollbar { width:4px; height:4px; }
        ::-webkit-scrollbar-thumb { background:#e8a0a0; border-radius:4px; }
        input,select,button { font-family:inherit; }
        img { display:block; }
        @keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
      `}</style>

      {/* TOPBAR */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 200,
          background: "rgba(255,255,255,.92)",
          backdropFilter: "blur(14px)",
          borderBottom: `1.5px solid ${T.border}`,
          height: 60,
          padding: "0 clamp(14px,4vw,28px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 2px 16px rgba(140,40,60,.07)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => setMobOpen((o) => !o)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              padding: 4,
            }}
          >
            <Ic d={IC.menu} s={20} c={T.muted} sw={2} />
          </button>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: `linear-gradient(135deg,${T.rose},${T.roseLt})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 15,
              color: "white",
            }}
          >
            ✿
          </div>
          <span
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontWeight: 700,
              fontSize: "1.25rem",
              color: T.roseDk,
            }}
          >
            Rosée
          </span>
        </div>
        <p
          style={{
            fontFamily: "'DM Sans',sans-serif",
            fontSize: ".75rem",
            fontWeight: 800,
            color: T.muted,
            letterSpacing: ".1em",
            textTransform: "uppercase",
          }} className="hidden sm:block"
        >
          {NAV_ITEMS.find((n) => n.id === active)?.label}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => routerNavigate("/products")}
            style={{
              background: "none",
              border: `1.5px solid ${T.border}`,
              borderRadius: 10,
              padding: "6px 12px",
              cursor: "pointer",
              fontFamily: "'DM Sans',sans-serif",
              fontSize: ".72rem",
              fontWeight: 700,
              color: T.muted,
            }}
          >
            Shop
          </button>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: `linear-gradient(135deg,${T.rose},${T.roseLt})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(180,80,80,.2)",
            }}
          >
            <span
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontWeight: 700,
                fontSize: ".85rem",
                color: "white",
              }}
            >
              {initials}
            </span>
          </div>
        </div>
      </header>

      <div style={{ display: "flex", minHeight: "calc(100vh - 60px)" }}>
        {/* SIDEBAR */}
        {mobileOpen && (
          <>
            {/* Overlay */}
            <div
              onClick={() => setMobOpen(false)}
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 1000,
                background: "rgba(0,0,0,0.35)",
                backdropFilter: "blur(2px)",
                animation: "fadeIn 0.25s ease",
              }}
            />
            {/* Sidebar */}
            <aside
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: 280,
                height: "100vh",
                zIndex: 1100,
                background: T.white,
                borderRight: `1.5px solid ${T.border}`,
                padding: "24px 0 32px",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
                transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                boxShadow: "2px 0 24px rgba(0,0,0,0.08)",
              }}
            >
              {/* Close button inside sidebar */}
              <button
                onClick={() => setMobOpen(false)}
                style={{
                  position: "absolute",
                  top: 14,
                  right: 14,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 4,
                  zIndex: 2,
                }}
              >
                <Ic d={IC.x} s={20} c={T.muted} sw={2} />
              </button>
              <div
                style={{
                  padding: "0 18px 20px",
                  borderBottom: `1.5px solid ${T.border}`,
                  marginBottom: 14,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: "50%",
                      background: `linear-gradient(135deg,${T.rose},${T.roseLt})`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      boxShadow: "0 3px 10px rgba(180,80,80,.22)",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Cormorant Garamond',serif",
                        fontWeight: 700,
                        fontSize: "1rem",
                        color: "white",
                      }}
                    >
                      {initials}
                    </span>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p
                      style={{
                        fontFamily: "'DM Sans',sans-serif",
                        fontWeight: 800,
                        fontSize: ".82rem",
                        color: T.ink,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {user?.name}
                    </p>
                    <p
                      style={{
                        fontFamily: "'DM Sans',sans-serif",
                        fontSize: ".65rem",
                        color: T.muted,
                      }}
                    >
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>

              <nav style={{ flex: 1, padding: "0 12px" }}>
                {NAV_ITEMS.map((item) => {
                  const isAct = active === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => navigate(item.id)}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: 11,
                        padding: "11px 14px",
                        marginBottom: 4,
                        borderRadius: 14,
                        border: "none",
                        background: isAct
                          ? `linear-gradient(135deg,${T.roseXs},#fff0f5)`
                          : "transparent",
                        cursor: "pointer",
                        transition: "all .2s",
                        textAlign: "left",
                        boxShadow: isAct
                          ? `inset 3px 0 0 ${T.rose}, 0 2px 12px rgba(201,114,122,.09)`
                          : "none",
                      }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 10,
                          background: isAct
                            ? `linear-gradient(135deg,${T.rose},${T.roseLt})`
                            : "transparent",
                          border: isAct ? "none" : `1.5px solid ${T.border}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          transition: "all .2s",
                        }}
                      >
                        <Ic
                          d={item.icon}
                          s={15}
                          c={isAct ? "white" : T.muted}
                          sw={isAct ? 2 : 1.8}
                        />
                      </div>
                      <span
                        style={{
                          fontFamily: "'DM Sans',sans-serif",
                          fontWeight: isAct ? 800 : 500,
                          fontSize: ".82rem",
                          color: isAct ? T.roseDk : T.muted,
                          transition: "color .2s",
                        }}
                      >
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </nav>

              <div style={{ padding: "0 12px" }}>
                <button
                  onClick={handleLogout}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 11,
                    padding: "11px 14px",
                    borderRadius: 14,
                    border: `1.5px solid ${T.border}`,
                    background: "white",
                    cursor: "pointer",
                    transition: "all .2s",
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 10,
                      border: `1.5px solid ${T.border}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Ic d={IC.logout} s={15} c={T.muted} sw={1.8} />
                  </div>
                  <span
                    style={{
                      fontFamily: "'DM Sans',sans-serif",
                      fontWeight: 500,
                      fontSize: ".82rem",
                      color: T.muted,
                    }}
                  >
                    Logout
                  </span>
                </button>
              </div>
            </aside>
          </>
        )}

        {/* MAIN CONTENT */}
        <main style={{ flex: 1, padding: "clamp(20px,3vw,36px)", minWidth: 0 }}>
          {active === "overview" && (
            <PageOverview
              user={user}
              orders={orders}
              wishlistItems={wishlistItems}
              navigate={routerNavigate}
            />
          )}
          {active === "orders" && (
            <PageOrders
              orders={orders}
              loading={ordersLoading}
              onCancel={handleCancelOrder}
            />
          )}
          {active === "wishlist" && (
            <PageWishlist
              items={wishlistItems}
              loading={wishlistLoading}
              onMoveToCart={handleMoveToCart}
              onRemove={handleRemoveWishlist}
            />
          )}
          {active === "profile" && (
            <PageProfile user={user} onUpdate={handleProfileUpdate} />
          )}
          {active === "addresses" && <PageAddressBook />}
        </main>
      </div>
    </div>
  );
}
