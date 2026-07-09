import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { orderAPI, merchantAPI } from "../api/index";
import { toast } from "react-toastify";

/* ════════════════════════════════════════════════════════════════
   CONSTANTS
════════════════════════════════════════════════════════════════ */
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const STATUS_MAP = {
  delivered: {
    label: "Delivered",
    bg: "#dcfce7",
    color: "#16a34a",
    dot: "#16a34a",
  },
  shipped: {
    label: "Shipped",
    bg: "#dbeafe",
    color: "#1d4ed8",
    dot: "#3b82f6",
  },
  processing: {
    label: "Processing",
    bg: "#fef9c3",
    color: "#a16207",
    dot: "#eab308",
  },
  pending: {
    label: "Pending",
    bg: "#fef9c3",
    color: "#a16207",
    dot: "#eab308",
  },
  cancelled: {
    label: "Cancelled",
    bg: "#fee2e2",
    color: "#dc2626",
    dot: "#ef4444",
  },
  confirmed: {
    label: "Confirmed",
    bg: "#dbeafe",
    color: "#1d4ed8",
    dot: "#3b82f6",
  },
};

const ALERT_STYLE = {
  opportunity: {
    bg: "#fdf5f5",
    border: "#f5c8cc",
    iconBg: "#fee2e2",
    dot: "#c9727a",
  },
  warning: {
    bg: "#fffbeb",
    border: "#fde68a",
    iconBg: "#fef3c7",
    dot: "#d97706",
  },
  insight: {
    bg: "#f5f0fd",
    border: "#d4c0f0",
    iconBg: "#ede9fe",
    dot: "#7c3aed",
  },
};

const NAV = [
  {
    id: "dashboard",
    icon: "⬡",
    label: "Dashboard",
    path: "/merchant/dashboard",
  },
  { id: "orders", icon: "📦", label: "Orders", path: "/merchant/orders" },
  { id: "products", icon: "✿", label: "Products", path: "/merchant/products" },
  {
    id: "inventory",
    icon: "📊",
    label: "Inventory",
    path: "/merchant/inventory",
  },
  { id: "pricing", icon: "💰", label: "Pricing", path: "/merchant/pricing" },
  { id: "returns", icon: "↩", label: "Returns", path: "/merchant/returns" },
  { id: "coaching", icon: "🤖", label: "Coaching", path: "/merchant/coaching" },
  {
    id: "compliance",
    icon: "🛡️",
    label: "Compliance",
    path: "/merchant/compliance",
  },
  { id: "settings", icon: "⚙", label: "Settings", path: "/merchant/settings" },
];

/* ════════════════════════════════════════════════════════════════
   MINI SPARKLINE
════════════════════════════════════════════════════════════════ */
function Sparkline({ data, color, h = 40, w = 120 }) {
  if (!data || data.length === 0) return null;
  const min = Math.min(...data),
    max = Math.max(...data);
  const range = max - min || 1;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * (w - 2) + 1;
      const y = h - ((v - min) / range) * (h - 8) - 4;
      return `${x},${y}`;
    })
    .join(" ");
  const fill = data.map((v, i) => {
    const x = (i / (data.length - 1)) * (w - 2) + 1;
    const y = h - ((v - min) / range) * (h - 8) - 4;
    return `${x},${y}`;
  });
  const areaPath = `M ${fill[0]} L ${fill.slice(1).join(" L ")} L ${((data.length - 1) / (data.length - 1)) * (w - 2) + 1},${h} L 1,${h} Z`;
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      style={{ overflow: "visible" }}
    >
      <defs>
        <linearGradient
          id={`sg-${color.replace("#", "")}`}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#sg-${color.replace("#", "")})`} />
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={fill[fill.length - 1].split(",")[0]}
        cy={fill[fill.length - 1].split(",")[1]}
        r="3"
        fill={color}
        stroke="white"
        strokeWidth="1.5"
      />
    </svg>
  );
}

/* ════════════════════════════════════════════════════════════════
   REVENUE BAR CHART
════════════════════════════════════════════════════════════════ */
function BarChart({ data, labels, color }) {
  const max = Math.max(...data);
  const [hov, setHov] = useState(null);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 5,
        height: 96,
        padding: "0 4px",
      }}
    >
      {data.map((v, i) => {
        const pct = (v / max) * 100;
        const isHov = hov === i;
        const isCur = i === data.length - 1;
        return (
          <div
            key={i}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              cursor: "pointer",
              position: "relative",
            }}
            onMouseEnter={() => setHov(i)}
            onMouseLeave={() => setHov(null)}
          >
            {isHov && (
              <div
                style={{
                  position: "absolute",
                  bottom: "100%",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "#1e1018",
                  color: "white",
                  fontSize: ".6rem",
                  fontWeight: 700,
                  fontFamily: "'DM Sans',sans-serif",
                  padding: "3px 7px",
                  borderRadius: 6,
                  whiteSpace: "nowrap",
                  zIndex: 10,
                  marginBottom: 4,
                }}
              >
                Rs. {v}K
              </div>
            )}
            <div
              style={{
                width: "100%",
                borderRadius: "4px 4px 0 0",
                height: `${pct}%`,
                minHeight: 4,
                background: isCur
                  ? `linear-gradient(to top,${color},${color}dd)`
                  : isHov
                    ? `${color}99`
                    : `${color}44`,
                transition: "all .22s",
              }}
            />
            <span
              style={{
                fontSize: ".52rem",
                color: "#b09090",
                fontFamily: "'DM Sans',sans-serif",
                fontWeight: 600,
              }}
            >
              {labels[i]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   DONUT CHART (channel mix) - Dynamic
════════════════════════════════════════════════════════════════ */
function Donut({ slices }) {
  const [hov, setHov] = useState(null);
  const r = 36,
    cx = 44,
    cy = 44,
    circ = 2 * Math.PI * r;
  let acc = 0;
  return (
    <svg width={88} height={88} viewBox="0 0 88 88">
      {slices.map((s, i) => {
        const dash = circ * (s.pct / 100),
          gap = circ - dash;
        const offset = circ * (1 - acc / 100) - circ * 0.25;
        acc += s.pct;
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth={hov === i ? 9 : 7}
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              transition: "stroke-width .2s",
              cursor: "pointer",
              filter: hov === i ? `drop-shadow(0 0 6px ${s.color}88)` : "",
            }}
            onMouseEnter={() => setHov(i)}
            onMouseLeave={() => setHov(null)}
          />
        );
      })}
      <text
        x={cx}
        y={cy - 4}
        textAnchor="middle"
        style={{
          fontFamily: "'Cormorant Garamond',serif",
          fontSize: 14,
          fontWeight: 700,
          fill: "#1e1018",
        }}
      >
        {hov !== null ? `${slices[hov].pct}%` : "100%"}
      </text>
      <text
        x={cx}
        y={cy + 12}
        textAnchor="middle"
        style={{
          fontFamily: "'DM Sans',sans-serif",
          fontSize: 7.5,
          fill: "#9a7080",
          fontWeight: 600,
        }}
      >
        {hov !== null ? slices[hov].label : "Orders"}
      </text>
    </svg>
  );
}

/* ════════════════════════════════════════════════════════════════
   KPI CARD
════════════════════════════════════════════════════════════════ */
function KpiCard({ label, value, change, icon, color, series }) {
  const isPositive = change >= 0;
  const formattedValue =
    label === "Total Revenue"
      ? `Rs. ${value?.toLocaleString()}`
      : value?.toLocaleString();
  return (
    <div
      style={{
        background: "white",
        borderRadius: 22,
        border: "1.5px solid #f0d5d8",
        padding: "20px 20px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        boxShadow: "0 4px 20px rgba(140,40,60,.06)",
        transition: "transform .22s, box-shadow .22s",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = "0 12px 36px rgba(140,40,60,.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "0 4px 20px rgba(140,40,60,.06)";
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <p
            style={{
              fontFamily: "'DM Sans',sans-serif",
              fontSize: ".68rem",
              fontWeight: 800,
              letterSpacing: ".1em",
              color: "#9a7080",
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            {label}
          </p>
          <p
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontWeight: 700,
              fontSize: "1.6rem",
              color: "#1e1018",
              lineHeight: 1,
            }}
          >
            {formattedValue}
          </p>
        </div>
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 14,
            background: `${color}18`,
            border: `1.5px solid ${color}30`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.15rem",
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
      </div>
      {series && <Sparkline data={series} color={color} w={150} h={36} />}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            fontFamily: "'DM Sans',sans-serif",
            fontSize: ".72rem",
            fontWeight: 800,
            color: isPositive ? "#16a34a" : "#dc2626",
            background: isPositive ? "#dcfce7" : "#fee2e2",
            padding: "3px 8px",
            borderRadius: 999,
            display: "flex",
            alignItems: "center",
            gap: 3,
          }}
        >
          <span>{isPositive ? "▲" : "▼"}</span>
          {Math.abs(change)}%
        </span>
        <span
          style={{
            fontFamily: "'DM Sans',sans-serif",
            fontSize: ".72rem",
            color: "#9a7080",
            fontWeight: 500,
          }}
        >
          vs last month
        </span>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   AI ALERTS COMPONENT - Dynamic
════════════════════════════════════════════════════════════════ */
function AIAlerts({ alerts = [] }) {
  const [alertDismissed, setAlertDismissed] = useState([]);
  const activeAlerts = alerts.filter((a) => !alertDismissed.includes(a.id));
  const urgColors = { high: "#dc2626", medium: "#d97706", low: "#7c3aed" };
  if (!alerts.length) return null;
  return (
    <div
      style={{
        background: "white",
        borderRadius: 22,
        border: "1.5px solid #f0d5d8",
        boxShadow: "0 4px 20px rgba(140,40,60,.06)",
        overflow: "hidden",
        flex: 1,
      }}
    >
      <div
        style={{
          padding: "16px 20px 12px",
          borderBottom: "1.5px solid #f5e8e8",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 9,
              background: "linear-gradient(135deg,#1c1016,#2d1a22)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: ".85rem",
            }}
          >
            ✦
          </div>
          <div>
            <p
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontSize: ".68rem",
                fontWeight: 800,
                color: "#9a7080",
                letterSpacing: ".08em",
                textTransform: "uppercase",
              }}
            >
              AI Alerts
            </p>
            <p
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontWeight: 700,
                fontSize: ".95rem",
                color: "#1e1018",
              }}
            >
              {activeAlerts.length} active
            </p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#4ade80",
              animation: "pulse 1.5s infinite",
            }}
          />
          <span
            style={{
              fontFamily: "'DM Sans',sans-serif",
              fontSize: ".62rem",
              fontWeight: 700,
              color: "#9a7080",
            }}
          >
            Live
          </span>
        </div>
      </div>
      <div
        style={{
          padding: "10px 14px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          maxHeight: 340,
          overflowY: "auto",
        }}
      >
        {activeAlerts.map((alert) => {
          const s = ALERT_STYLE[alert.type];
          return (
            <div
              key={alert.id}
              style={{
                background: s.bg,
                borderRadius: 14,
                border: `1.5px solid ${s.border}`,
                padding: "12px 13px",
                position: "relative",
              }}
            >
              <button
                onClick={() => setAlertDismissed((d) => [...d, alert.id])}
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  width: 18,
                  height: 18,
                  borderRadius: 6,
                  background: "rgba(0,0,0,.06)",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: ".6rem",
                  color: "#9a7080",
                }}
              >
                ✕
              </button>
              <div
                style={{
                  display: "flex",
                  gap: 9,
                  alignItems: "flex-start",
                  paddingRight: 16,
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 9,
                    background: s.iconBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    fontSize: ".85rem",
                  }}
                >
                  {alert.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginBottom: 4,
                      flexWrap: "wrap",
                    }}
                  >
                    <p
                      style={{
                        fontFamily: "'DM Sans',sans-serif",
                        fontSize: ".76rem",
                        fontWeight: 800,
                        color: "#1e1018",
                        lineHeight: 1.2,
                      }}
                    >
                      {alert.title}
                    </p>
                    <span
                      style={{
                        fontFamily: "'DM Sans',sans-serif",
                        fontSize: ".58rem",
                        fontWeight: 800,
                        background: `${urgColors[alert.urgency]}18`,
                        color: urgColors[alert.urgency],
                        padding: "1px 6px",
                        borderRadius: 999,
                        textTransform: "uppercase",
                        letterSpacing: ".06em",
                      }}
                    >
                      {alert.urgency}
                    </span>
                  </div>
                  <p
                    style={{
                      fontFamily: "'DM Sans',sans-serif",
                      fontSize: ".72rem",
                      color: "#7a6068",
                      lineHeight: 1.5,
                      marginBottom: 8,
                    }}
                  >
                    {alert.body}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <button
                      style={{
                        fontFamily: "'DM Sans',sans-serif",
                        fontSize: ".67rem",
                        fontWeight: 800,
                        color: s.dot,
                        background: `${s.dot}18`,
                        border: `1px solid ${s.dot}30`,
                        padding: "4px 10px",
                        borderRadius: 8,
                        cursor: "pointer",
                      }}
                    >
                      {alert.action} →
                    </button>
                    <span
                      style={{
                        fontFamily: "'DM Sans',sans-serif",
                        fontSize: ".62rem",
                        color: "#b09090",
                        fontWeight: 500,
                      }}
                    >
                      {alert.time}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {activeAlerts.length === 0 && (
          <div style={{ padding: "24px", textAlign: "center" }}>
            <p style={{ fontSize: "1.5rem", marginBottom: 8 }}>✿</p>
            <p
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontWeight: 700,
                fontSize: "1rem",
                color: "#1e1018",
                marginBottom: 4,
              }}
            >
              All clear!
            </p>
            <p
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontSize: ".75rem",
                color: "#9a7080",
              }}
            >
              No active alerts right now.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   AI CHAT COMPONENT - Static (no API integration yet)
════════════════════════════════════════════════════════════════ */
function AIChat() {
  const [aiTyping, setAiTyping] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [aiChat, setAiChat] = useState([
    {
      role: "ai",
      text: "Hi! I've spotted insights for your store today. What would you like to explore?",
    },
  ]);
  const chatRef = useRef(null);
  useEffect(() => {
    if (chatRef.current)
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [aiChat]);
  const sendAiMessage = () => {
    if (!aiInput.trim()) return;
    const userMsg = aiInput.trim();
    setAiChat((c) => [...c, { role: "user", text: userMsg }]);
    setAiInput("");
    setAiTyping(true);
    const replies = {
      revenue:
        "Revenue is trending up 18.4% this month, driven primarily by top selling products.",
      stock:
        "3 products need attention: low stock alerts triggered for Champagne Tote and Silk Blouse.",
      default:
        "I've analysed your store data. Would you like insights on revenue trends, top products, or inventory health?",
    };
    setTimeout(() => {
      const key =
        userMsg.toLowerCase().includes("revenue") ||
        userMsg.toLowerCase().includes("sales")
          ? "revenue"
          : userMsg.toLowerCase().includes("stock") ||
              userMsg.toLowerCase().includes("inventory")
            ? "stock"
            : "default";
      setAiChat((c) => [...c, { role: "ai", text: replies[key] }]);
      setAiTyping(false);
    }, 1400);
  };
  return (
    <div
      style={{
        background: "linear-gradient(135deg,#1c1016,#2d1a22)",
        borderRadius: 22,
        border: "1px solid rgba(255,255,255,.08)",
        boxShadow: "0 8px 32px rgba(0,0,0,.2)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "14px 18px 12px",
          borderBottom: "1px solid rgba(255,255,255,.08)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 9,
            background: "linear-gradient(135deg,#c9727a,#e8a0a0)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: ".75rem",
            color: "white",
            fontWeight: 900,
          }}
        >
          AI
        </div>
        <div style={{ flex: 1 }}>
          <p
            style={{
              fontFamily: "'DM Sans',sans-serif",
              fontSize: ".78rem",
              fontWeight: 800,
              color: "rgba(255,255,255,.9)",
            }}
          >
            Rosée AI Assistant
          </p>
          <p
            style={{
              fontFamily: "'DM Sans',sans-serif",
              fontSize: ".62rem",
              color: "rgba(255,255,255,.35)",
            }}
          >
            Ask me anything about your store
          </p>
        </div>
        <div
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "#4ade80",
            boxShadow: "0 0 6px #4ade80",
          }}
        />
      </div>
      <div
        ref={chatRef}
        style={{
          padding: "12px 14px",
          maxHeight: 160,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {aiChat.map((msg, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              animation: "fadeIn .25s ease",
            }}
          >
            <div
              style={{
                maxWidth: "85%",
                padding: "9px 12px",
                borderRadius: 12,
                background:
                  msg.role === "user"
                    ? "linear-gradient(135deg,#c9727a,#e8a0a0)"
                    : "rgba(255,255,255,.07)",
                fontFamily: "'DM Sans',sans-serif",
                fontSize: ".75rem",
                lineHeight: 1.5,
                color: msg.role === "user" ? "white" : "rgba(255,255,255,.8)",
                fontWeight: 500,
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {aiTyping && (
          <div style={{ display: "flex", gap: 4, padding: "6px 10px" }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,.4)",
                  animation: `pulse 1s ${i * 0.2}s infinite`,
                }}
              />
            ))}
          </div>
        )}
      </div>
      <div
        style={{
          padding: "10px 12px 14px",
          borderTop: "1px solid rgba(255,255,255,.06)",
          display: "flex",
          gap: 8,
        }}
      >
        <input
          value={aiInput}
          onChange={(e) => setAiInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendAiMessage()}
          placeholder="Ask about revenue, stock, trends…"
          style={{
            flex: 1,
            background: "rgba(255,255,255,.07)",
            border: "1px solid rgba(255,255,255,.1)",
            borderRadius: 10,
            padding: "9px 12px",
            fontFamily: "'DM Sans',sans-serif",
            fontSize: ".75rem",
            color: "rgba(255,255,255,.9)",
            outline: "none",
          }}
        />
        <button
          onClick={sendAiMessage}
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            border: "none",
            flexShrink: 0,
            background: "linear-gradient(135deg,#c9727a,#e8a0a0)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: ".8rem",
            color: "white",
          }}
        >
          ↑
        </button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   MAIN DASHBOARD - Fully Dynamic with SAME DESIGN as mock code
   + Responsive sidebar (open by default on lg, overlay on mobile)
════════════════════════════════════════════════════════════════ */
export default function MerchantDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const location = useLocation();

  const [kpis, setKpis] = useState(null);
  const [orders, setOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [aiAlerts, setAiAlerts] = useState([]);
  const [channelMix, setChannelMix] = useState([
    { label: "Web", pct: 58, color: "#c9727a" },
    { label: "App", pct: 27, color: "#8b6aaf" },
    { label: "Social", pct: 15, color: "#c8a04a" },
  ]);
  const [quickStats, setQuickStats] = useState({
    newCustomers: 284,
    repeatRate: 41,
  });
  const [loading, setLoading] = useState(true);
  const [orderFilter, setOrderFilter] = useState("all");
  const [dateRange, setDateRange] = useState("30d");
  const [revenueSeries, setRevenueSeries] = useState([
    42, 58, 51, 74, 68, 85, 79, 93, 88, 106, 112, 128,
  ]);
  const [ordersSeries, setOrdersSeries] = useState([
    18, 24, 21, 30, 27, 35, 32, 38, 36, 44, 47, 52,
  ]);

  /* ── NEW: sidebar open/close state ──
     Open by default on large screens, closed by default on mobile. */
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, []);

  // Close sidebar automatically after navigating on mobile
  const handleNavClick = (path) => {
    navigate(path);
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role !== "merchant") {
      navigate("/customer/dashboard");
      return;
    }

    const fetchAll = async () => {
      try {
        const [kpiRes, ordersRes, alertsRes] = await Promise.all([
          orderAPI.getKPIs(),
          orderAPI.getMerchantOrders({ limit: 10 }),
          merchantAPI.getAIAlerts().catch(() => ({ data: { data: [] } })),
        ]);

        const kpiData = kpiRes.data.data || {};
        setKpis(kpiData);
        setOrders(ordersRes.data.data?.orders || []);
        setTopProducts(kpiData.topProducts || []);

        const alertsData = alertsRes.data.data || [];
        if (alertsData.length) {
          setAiAlerts(alertsData);
        } else {
          setAiAlerts([
            {
              id: 1,
              type: "opportunity",
              urgency: "high",
              title: "Demand spike detected",
              body: "Search volume is up 340% this week.",
              action: "Boost campaign",
              icon: "📈",
              time: "Just now",
            },
            {
              id: 2,
              type: "warning",
              urgency: "medium",
              title: "Low stock warning",
              body: "Only 7 units remaining.",
              action: "Reorder now",
              icon: "⚠️",
              time: "8 min ago",
            },
          ]);
        }

        // Try to fetch analytics data (if endpoint exists)
        try {
          const analyticsRes = await merchantAPI.getAnalytics({
            range: dateRange,
          });
          const analytics = analyticsRes.data.data || {};
          if (analytics.channelMix) setChannelMix(analytics.channelMix);
          if (analytics.quickStats) setQuickStats(analytics.quickStats);
          if (analytics.revenueSeries)
            setRevenueSeries(analytics.revenueSeries);
          if (analytics.ordersSeries) setOrdersSeries(analytics.ordersSeries);
        } catch {
          /* analytics endpoint may not exist yet */
        }
      } catch (err) {
        toast.error("Failed to load dashboard data");
        setKpis({
          revenue: 125000,
          totalOrders: 342,
          returnRate: 3.2,
          aov: 365,
        });
        setTopProducts([
          {
            name: "Silk Scarf",
            totalRevenue: 45000,
            totalUnits: 120,
            stock: 45,
          },
          {
            name: "Leather Bag",
            totalRevenue: 78000,
            totalUnits: 89,
            stock: 12,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [user, navigate, dateRange]);

  const filteredOrders =
    orderFilter === "all"
      ? orders
      : orders.filter((o) => o.orderStatus === orderFilter);
  const kpiCards = kpis
    ? [
        {
          label: "Total Revenue",
          value: kpis.revenue || 0,
          change: 18.4,
          icon: "💰",
          color: "#c9727a",
          series: revenueSeries,
        },
        {
          label: "Total Orders",
          value: kpis.totalOrders || 0,
          change: 11.2,
          icon: "📦",
          color: "#8b6aaf",
          series: ordersSeries,
        },
        {
          label: "Return Rate",
          value: parseFloat(kpis.returnRate) || 0,
          change: -0.8,
          icon: "↩",
          color: "#e07070",
          series: [5.2, 4.8, 4.5, 4.2, 3.9, 3.7, 3.5, 3.4, 3.3, 3.2, 3.2, 3.2],
        },
        {
          label: "AOV",
          value: kpis.aov || 365,
          change: 5.3,
          icon: "🛍️",
          color: "#c8a04a",
          series: [320, 335, 340, 355, 360, 365, 370, 372, 375, 378, 380, 385],
        },
      ]
    : [];

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "M";

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#faf7f4",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#faf7f4",
        display: "flex",
        fontFamily: "'DM Sans',sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:none} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes slideIn { from{opacity:0;transform:translateX(-14px)} to{opacity:1;transform:none} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        ::-webkit-scrollbar { width:4px; height:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:#e8a0a0; border-radius:4px; }
      `}</style>

      {/* MOBILE OVERLAY BACKDROP - shows only when sidebar open on small screens */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[190] lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR - same visual design, now responsive via Tailwind transform classes */}
      <aside
        className={`fixed top-0 left-0 h-screen w-[220px] flex-shrink-0 z-[200] transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          background:
            "linear-gradient(180deg,#1c1016 0%,#2d1a22 60%,#1a1020 100%)",
          borderRight: "1px solid rgba(255,255,255,.06)",
          display: "flex",
          flexDirection: "column",
          boxShadow: "4px 0 32px rgba(0,0,0,.2)",
        }}
      >
        <div
          style={{
            padding: "26px 22px 20px",
            borderBottom: "1px solid rgba(255,255,255,.07)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                background: "linear-gradient(135deg,#c9727a,#e8a0a0)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                color: "white",
                flexShrink: 0,
              }}
            >
              ✿
            </div>
            <div>
              <p
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontWeight: 700,
                  fontSize: "1.2rem",
                  color: "white",
                  letterSpacing: ".03em",
                }}
              >
                Rosée
              </p>
              <p
                style={{
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: ".6rem",
                  color: "rgba(255,255,255,.35)",
                  fontWeight: 600,
                  letterSpacing: ".08em",
                  textTransform: "uppercase",
                }}
              >
                Merchant Suite
              </p>
            </div>
          </div>

          {/* NEW: close button for sidebar (visible on all screen sizes) */}
          <button
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
            className="flex items-center justify-center flex-shrink-0"
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: "rgba(255,255,255,.06)",
              border: "1px solid rgba(255,255,255,.1)",
              color: "rgba(255,255,255,.6)",
              cursor: "pointer",
              fontSize: ".8rem",
            }}
          >
            ✕
          </button>
        </div>
        <nav
          style={{
            flex: 1,
            padding: "16px 12px",
            display: "flex",
            flexDirection: "column",
            gap: 3,
            overflowY: "auto",
          }}
        >
          {NAV.map((item) => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.path)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 11,
                  padding: "10px 12px",
                  borderRadius: 13,
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  background: active
                    ? "linear-gradient(135deg,rgba(201,114,122,.25),rgba(232,160,160,.12))"
                    : "transparent",
                  color: active ? "#f5c8cc" : "rgba(255,255,255,.45)",
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: ".83rem",
                  fontWeight: active ? 700 : 500,
                  transition: "all .2s",
                  boxShadow: active
                    ? "inset 1px 0 0 #c9727a,0 2px 8px rgba(180,80,80,.12)"
                    : "none",
                }}
              >
                <span style={{ fontSize: "1rem", opacity: active ? 1 : 0.65 }}>
                  {item.icon}
                </span>
                {item.label}
              </button>
            );
          })}
        </nav>
        <div
          style={{
            padding: "16px 16px 22px",
            borderTop: "1px solid rgba(255,255,255,.07)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 11,
                background: "linear-gradient(135deg,#c9727a,#8b3a4a)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: ".72rem",
                  fontWeight: 800,
                  color: "white",
                }}
              >
                {initials}
              </span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: ".78rem",
                  fontWeight: 700,
                  color: "rgba(255,255,255,.9)",
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
                  fontSize: ".62rem",
                  color: "rgba(255,255,255,.35)",
                  fontWeight: 500,
                }}
              >
                Store Owner
              </p>
            </div>
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#4ade80",
                flexShrink: 0,
                boxShadow: "0 0 6px #4ade80",
              }}
            />
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT - margin-left responds to sidebarOpen only on lg+, mobile is always full width */}
      <main
        className={`flex-1 transition-all duration-300 ease-in-out ml-0 ${
          sidebarOpen ? "lg:ml-[220px]" : "lg:ml-0"
        }`}
        style={{
          minHeight: "100vh",
          overflowX: "hidden",
          width: "100%",
        }}
      >
        <header
          style={{
            background: "white",
            height: 64,
            borderBottom: "1.5px solid #f0d5d8",
            padding: "0 clamp(16px,3vw,32px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 100,
            boxShadow: "0 2px 16px rgba(140,40,60,.05)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* NEW: hamburger / sidebar toggle button */}
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label="Toggle sidebar"
              className="flex items-center justify-center flex-shrink-0"
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "#fdf5f5",
                border: "1.5px solid #f0d5d8",
                cursor: "pointer",
                color: "#c9727a",
                fontSize: "1rem",
              }}
            >
              ☰
            </button>
            <div>
              <h1 className="hidden sm:block"
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontWeight: 700,
                  fontSize: "1.35rem",
                  color: "#1e1018",
                }}
              >
                Good morning,{" "}
                <em style={{ color: "#c9727a" }}>
                  {user?.name?.split(" ")[0] || "Merchant"}
                </em>{" "}
                ✿
              </h1>
              <p
                style={{
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: ".7rem",
                  color: "#9a7080",
                  fontWeight: 500,
                  marginTop: 1,
                }}
                className="hidden sm:block"
              >
                Here's what's happening in your store today
              </p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                display: "flex",
                gap: 4,
                background: "#fdf5f5",
                borderRadius: 12,
                padding: 4,
                border: "1.5px solid #f0d5d8",
              }}
              className="hidden sm:flex"
            >
              {["7d", "30d", "90d"].map((d) => (
                <button
                  key={d}
                  onClick={() => setDateRange(d)}
                  style={{
                    padding: "5px 11px",
                    borderRadius: 9,
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "'DM Sans',sans-serif",
                    fontSize: ".7rem",
                    fontWeight: 700,
                    background: dateRange === d ? "white" : "transparent",
                    color: dateRange === d ? "#c9727a" : "#9a7080",
                    boxShadow:
                      dateRange === d ? "0 1px 4px rgba(140,40,60,.1)" : "none",
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                background: "linear-gradient(135deg,#c9727a,#8b3a4a)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: ".7rem",
                  fontWeight: 800,
                  color: "white",
                }}
              >
                {initials}
              </span>
            </div>
          </div>
        </header>

        <div
          style={{
            padding: "clamp(16px,2.5vw,28px) clamp(16px,3vw,32px) 48px",
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          {/* KPI Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {kpiCards.map((kpi, i) => (
              <KpiCard key={i} {...kpi} />
            ))}
          </div>

          {/* Mid Row: Chart + Channel Mix + Quick Stats */}
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_260px] gap-4">
            <div
              style={{
                background: "white",
                borderRadius: 22,
                border: "1.5px solid #f0d5d8",
                padding: "22px 22px 18px",
                boxShadow: "0 4px 20px rgba(140,40,60,.06)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  marginBottom: 18,
                  flexWrap: "wrap",
                  gap: 10,
                }}
              >
                <div>
                  <p
                    style={{
                      fontFamily: "'DM Sans',sans-serif",
                      fontSize: ".68rem",
                      fontWeight: 800,
                      color: "#9a7080",
                      letterSpacing: ".1em",
                      textTransform: "uppercase",
                      marginBottom: 4,
                    }}
                  >
                    Revenue Overview
                  </p>
                  <p
                    style={{
                      fontFamily: "'Cormorant Garamond',serif",
                      fontWeight: 700,
                      fontSize: "1.6rem",
                      color: "#1e1018",
                    }}
                  >
                    Rs. {kpis?.revenue?.toLocaleString() || "0"}
                  </p>
                  <p
                    style={{
                      fontFamily: "'DM Sans',sans-serif",
                      fontSize: ".72rem",
                      color: "#16a34a",
                      fontWeight: 700,
                    }}
                  >
                    ▲ 18.4% from last month
                  </p>
                </div>
                <div style={{ display: "flex", gap: 14 }}>
                  {[
                    ["#c9727a", "Revenue"],
                    ["#8b6aaf", "Orders"],
                  ].map(([c, l]) => (
                    <div
                      key={l}
                      style={{ display: "flex", alignItems: "center", gap: 5 }}
                    >
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 2,
                          background: c,
                        }}
                      />
                      <span
                        style={{
                          fontSize: ".65rem",
                          color: "#9a7080",
                          fontWeight: 600,
                        }}
                      >
                        {l}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="overflow-x-auto">
                <BarChart data={revenueSeries} labels={MONTHS} color="#c9727a" />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div
                style={{
                  background: "white",
                  borderRadius: 22,
                  border: "1.5px solid #f0d5d8",
                  padding: "18px 18px",
                  flex: 1,
                  boxShadow: "0 4px 20px rgba(140,40,60,.06)",
                }}
              >
                <p
                  style={{
                    fontSize: ".68rem",
                    fontWeight: 800,
                    color: "#9a7080",
                    letterSpacing: ".1em",
                    textTransform: "uppercase",
                    marginBottom: 14,
                  }}
                >
                  Channel Mix
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <Donut slices={channelMix} />
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    {channelMix.map(({ color, label, pct }) => (
                      <div
                        key={label}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 7,
                        }}
                      >
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 2,
                            background: color,
                          }}
                        />
                        <span
                          style={{
                            fontSize: ".74rem",
                            color: "#1e1018",
                            fontWeight: 600,
                            flex: 1,
                          }}
                        >
                          {label}
                        </span>
                        <span
                          style={{
                            fontSize: ".74rem",
                            color: "#9a7080",
                            fontWeight: 700,
                          }}
                        >
                          {pct}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div
                  style={{
                    background: "white",
                    borderRadius: 16,
                    border: "1.5px solid #f0d5d8",
                    padding: "14px 14px",
                  }}
                >
                  <span style={{ fontSize: "1.1rem" }}>👥</span>
                  <p
                    style={{
                      fontFamily: "'Cormorant Garamond',serif",
                      fontWeight: 700,
                      fontSize: "1.3rem",
                      color: "#1e1018",
                      marginTop: 5,
                      marginBottom: 2,
                    }}
                  >
                    {quickStats.newCustomers}
                  </p>
                  <p
                    style={{
                      fontSize: ".62rem",
                      color: "#9a7080",
                      fontWeight: 600,
                      marginBottom: 4,
                    }}
                  >
                    New Customers
                  </p>
                  <span
                    style={{
                      fontSize: ".65rem",
                      fontWeight: 800,
                      color: "#16a34a",
                      background: "#dcfce7",
                      padding: "2px 6px",
                      borderRadius: 999,
                    }}
                  >
                    +23%
                  </span>
                </div>
                <div
                  style={{
                    background: "white",
                    borderRadius: 16,
                    border: "1.5px solid #f0d5d8",
                    padding: "14px 14px",
                  }}
                >
                  <span style={{ fontSize: "1.1rem" }}>🔁</span>
                  <p
                    style={{
                      fontFamily: "'Cormorant Garamond',serif",
                      fontWeight: 700,
                      fontSize: "1.3rem",
                      color: "#1e1018",
                      marginTop: 5,
                      marginBottom: 2,
                    }}
                  >
                    {quickStats.repeatRate}%
                  </p>
                  <p
                    style={{
                      fontSize: ".62rem",
                      color: "#9a7080",
                      fontWeight: 600,
                      marginBottom: 4,
                    }}
                  >
                    Repeat Rate
                  </p>
                  <span
                    style={{
                      fontSize: ".65rem",
                      fontWeight: 800,
                      color: "#16a34a",
                      background: "#dcfce7",
                      padding: "2px 6px",
                      borderRadius: 999,
                    }}
                  >
                    +5%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div
            style={{
              background: "white",
              borderRadius: 22,
              border: "1.5px solid #f0d5d8",
              boxShadow: "0 4px 20px rgba(140,40,60,.06)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "18px 22px 0",
                borderBottom: "1.5px solid #f5e8e8",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 14,
                  flexWrap: "wrap",
                  gap: 10,
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: ".68rem",
                      fontWeight: 800,
                      color: "#9a7080",
                      letterSpacing: ".1em",
                      textTransform: "uppercase",
                    }}
                  >
                    Recent Orders
                  </p>
                  <p
                    style={{
                      fontFamily: "'Cormorant Garamond',serif",
                      fontWeight: 700,
                      fontSize: "1.15rem",
                      color: "#1e1018",
                    }}
                  >
                    {orders.length} orders
                  </p>
                </div>
                <button
                  onClick={() => navigate("/merchant/orders")}
                  style={{
                    fontSize: ".76rem",
                    fontWeight: 800,
                    color: "#c9727a",
                    background: "#fdf5f5",
                    border: "1.5px solid #f5c8cc",
                    padding: "7px 16px",
                    borderRadius: 10,
                    cursor: "pointer",
                  }}
                >
                  View All Orders
                </button>
              </div>
              <div
                style={{ display: "flex", gap: 4, flexWrap: "nowrap" }}
                className="overflow-x-auto"
              >
                {[
                  "all",
                  "pending",
                  "processing",
                  "shipped",
                  "delivered",
                  "cancelled",
                ].map((f) => {
                  const count =
                    f === "all"
                      ? orders.length
                      : orders.filter((o) => o.orderStatus === f).length;
                  const active = orderFilter === f;
                  return (
                    <button
                      key={f}
                      onClick={() => setOrderFilter(f)}
                      style={{
                        fontSize: ".7rem",
                        fontWeight: 700,
                        padding: "6px 14px",
                        borderRadius: "10px 10px 0 0",
                        border: "none",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                        background: active ? "white" : "transparent",
                        color: active ? "#c9727a" : "#9a7080",
                        borderBottom: active
                          ? "2px solid #c9727a"
                          : "2px solid transparent",
                      }}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}{" "}
                      {count > 0 && (
                        <span
                          style={{
                            marginLeft: 4,
                            background: active ? "#fde8e8" : "#f0e8e8",
                            color: active ? "#c9727a" : "#9a7080",
                            borderRadius: 999,
                            padding: "0 5px",
                            fontSize: ".62rem",
                          }}
                        >
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#fdf8f8" }}>
                    {[
                      "Order ID",
                      "Customer",
                      "Items",
                      "Total",
                      "Status",
                      "Date",
                      "",
                    ].map((h) => (
                      <th
                        key={h}
                        style={{
                          fontSize: ".62rem",
                          fontWeight: 800,
                          color: "#9a7080",
                          padding: "10px 16px",
                          textAlign: "left",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.slice(0, 6).map((order) => {
                    const st =
                      STATUS_MAP[order.orderStatus] || STATUS_MAP.pending;
                    return (
                      <tr
                        key={order._id}
                        style={{
                          borderBottom: "1px solid #fdf0f0",
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "#fdf8f8")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                      >
                        <td
                          style={{
                            padding: "13px 16px",
                            fontWeight: 700,
                            color: "#c9727a",
                            whiteSpace: "nowrap",
                          }}
                        >
                          #{order._id?.slice(-8).toUpperCase()}
                        </td>
                        <td
                          style={{
                            padding: "13px 16px",
                            fontWeight: 600,
                            color: "#1e1018",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {order.userId?.name || "Customer"}
                        </td>
                        <td style={{ padding: "13px 16px", color: "#9a7080", whiteSpace: "nowrap" }}>
                          {order.items?.length || 0} item
                        </td>
                        <td style={{ padding: "13px 16px", fontWeight: 700, whiteSpace: "nowrap" }}>
                          Rs. {order.total?.toLocaleString()}
                        </td>
                        <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 5,
                              fontSize: ".65rem",
                              fontWeight: 800,
                              background: st.bg,
                              color: st.color,
                              padding: "4px 10px",
                              borderRadius: 999,
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
                        </td>
                        <td
                          style={{
                            padding: "13px 16px",
                            fontSize: ".72rem",
                            color: "#9a7080",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                          <button
                            onClick={() => navigate("/merchant/orders")}
                            style={{
                              fontSize: ".65rem",
                              fontWeight: 800,
                              color: "#c9727a",
                              border: "1.5px solid #f5c8cc",
                              padding: "5px 12px",
                              borderRadius: 9,
                              cursor: "pointer",
                            }}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Row: Top Products + AI Alerts + AI Chat */}
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4">
            {/* Top Products */}
            <div
              style={{
                background: "white",
                borderRadius: 22,
                border: "1.5px solid #f0d5d8",
                boxShadow: "0 4px 20px rgba(140,40,60,.06)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "18px 22px 14px",
                  borderBottom: "1.5px solid #f5e8e8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 10,
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: ".68rem",
                      fontWeight: 800,
                      color: "#9a7080",
                      letterSpacing: ".1em",
                      textTransform: "uppercase",
                    }}
                  >
                    Top Products
                  </p>
                  <p
                    style={{
                      fontFamily: "'Cormorant Garamond',serif",
                      fontWeight: 700,
                      fontSize: "1.15rem",
                      color: "#1e1018",
                    }}
                  >
                    By revenue this month
                  </p>
                </div>
                <button
                  onClick={() => navigate("/merchant/products")}
                  style={{
                    fontSize: ".72rem",
                    fontWeight: 700,
                    color: "#9a7080",
                    background: "#fdf8f8",
                    border: "1.5px solid #f0d5d8",
                    padding: "6px 13px",
                    borderRadius: 10,
                    cursor: "pointer",
                  }}
                >
                  Manage →
                </button>
              </div>
              <div style={{ padding: "8px 0" }}>
                {topProducts.slice(0, 5).map((p, i) => {
                  const maxRev = topProducts[0]?.totalRevenue || 1;
                  const barW = (p.totalRevenue / maxRev) * 100;
                  const isLow = p.stock < 20;
                  return (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        padding: "13px 22px",
                        borderBottom:
                          i < topProducts.length - 1
                            ? "1px solid #fdf0f0"
                            : "none",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#fdf8f8")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <div
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 8,
                          flexShrink: 0,
                          background:
                            i === 0
                              ? "linear-gradient(135deg,#c8a04a,#e8c87a)"
                              : i === 1
                                ? "#f5e8f8"
                                : i === 2
                                  ? "#fde8e8"
                                  : "#f5f0f5",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: ".65rem",
                          fontWeight: 900,
                          color:
                            i === 0
                              ? "white"
                              : i === 1
                                ? "#8b6aaf"
                                : i === 2
                                  ? "#c9727a"
                                  : "#9a7080",
                        }}
                      >
                        {i + 1}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            marginBottom: 3,
                          }}
                        >
                          <p style={{ fontWeight: 700 }}>{p.name}</p>
                          {isLow && (
                            <span
                              style={{
                                fontSize: ".55rem",
                                fontWeight: 800,
                                background: "#fee2e2",
                                color: "#dc2626",
                                padding: "1px 6px",
                                borderRadius: 999,
                              }}
                            >
                              Low
                            </span>
                          )}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            marginBottom: 6,
                          }}
                        >
                          <p style={{ fontSize: ".66rem", color: "#9a7080" }}>
                            {p.totalUnits} units
                          </p>
                        </div>
                        <div
                          style={{
                            height: 4,
                            borderRadius: 4,
                            background: "#f5e8e8",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${barW}%`,
                              borderRadius: 4,
                              background:
                                "linear-gradient(90deg,#c9727a,#e8a0a0)",
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <p style={{ fontWeight: 700 }}>
                          Rs. {(p.totalRevenue / 1000).toFixed(1)}K
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Alerts + AI Chat */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <AIAlerts alerts={aiAlerts} />
              <AIChat />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}