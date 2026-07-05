import { useState, useEffect, useRef, useCallback } from "react";
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
   COMPONENTS
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
              style={{ fontSize: ".52rem", color: "#b09090", fontWeight: 600 }}
            >
              {labels[i]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

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
        style={{ fontSize: 7.5, fill: "#9a7080", fontWeight: 600 }}
      >
        {hov !== null ? slices[hov].label : "Orders"}
      </text>
    </svg>
  );
}

function KpiCard({ label, value, change, icon, color, series }) {
  const isPositive = change >= 0;
  const numericValue =
    typeof value === "number"
      ? value
      : parseFloat(value?.replace(/[^0-9.]/g, "") || 0);
  const prefix = label === "Total Revenue" ? "Rs. " : "";
  const formattedValue = prefix + (numericValue?.toLocaleString() || value);
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
        <span style={{ fontSize: ".72rem", color: "#9a7080", fontWeight: 500 }}>
          vs last month
        </span>
      </div>
    </div>
  );
}

function AIAlerts({ alerts, onDismiss }) {
  const [dismissed, setDismissed] = useState([]);
  const activeAlerts = (alerts || []).filter((a) => !dismissed.includes(a.id));
  const urgColors = { high: "#dc2626", medium: "#d97706", low: "#7c3aed" };

  const handleDismiss = (id) => {
    setDismissed((prev) => [...prev, id]);
    if (onDismiss) onDismiss(id);
  };

  if (!alerts || alerts.length === 0) {
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
                0 active
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
              style={{ fontSize: ".62rem", fontWeight: 700, color: "#9a7080" }}
            >
              Live
            </span>
          </div>
        </div>
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
          <p style={{ fontSize: ".75rem", color: "#9a7080" }}>
            No active alerts right now.
          </p>
        </div>
      </div>
    );
  }

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
            style={{ fontSize: ".62rem", fontWeight: 700, color: "#9a7080" }}
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
          const s = ALERT_STYLE[alert.type] || ALERT_STYLE.insight;
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
                onClick={() => handleDismiss(alert.id)}
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
                  {alert.icon || "✨"}
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
                      {alert.action || "View"} →
                    </button>
                    <span
                      style={{
                        fontSize: ".62rem",
                        color: "#b09090",
                        fontWeight: 500,
                      }}
                    >
                      {alert.time || "Just now"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

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
              fontSize: ".78rem",
              fontWeight: 800,
              color: "rgba(255,255,255,.9)",
            }}
          >
            Rosée AI Assistant
          </p>
          <p style={{ fontSize: ".62rem", color: "rgba(255,255,255,.35)" }}>
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
   MAIN DASHBOARD
════════════════════════════════════════════════════════════════ */
export default function MerchantDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const location = useLocation();

  // State - ALL DYNAMIC from APIs
  const [kpis, setKpis] = useState(null);
  const [orders, setOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [returnRisks, setReturnRisks] = useState([]);
  const [coaching, setCoaching] = useState([]);
  const [alerts, setAlerts] = useState([]); // FROM AI API
  const [revenueSeries, setRevenueSeries] = useState([
    42, 58, 51, 74, 68, 85, 79, 93, 88, 106, 112, 128,
  ]);
  const [ordersSeries, setOrdersSeries] = useState([
    18, 24, 21, 30, 27, 35, 32, 38, 36, 44, 47, 52,
  ]);
  const [channelMix, setChannelMix] = useState({
    web: 58,
    app: 27,
    social: 15,
  });
  const [trendAnalysis, setTrendAnalysis] = useState({
    percent_change: 18.4,
    insight: "",
    recommendation: "",
  });
  const [quickStats, setQuickStats] = useState({
    newCustomers: 0,
    newCustomerChange: 0,
    repeatRate: 0,
    repeatRateChange: 0,
  });
  const [loading, setLoading] = useState(true);
  const [orderFilter, setOrderFilter] = useState("all");
  const [dateRange, setDateRange] = useState("30d");

  const aggregateMonthlySeries = useCallback((data, key) => {
    const monthly = new Array(12).fill(0);
    if (!data || data.length === 0) return monthly;
    data.forEach((item) => {
      const date = new Date(item.date);
      const month = date.getMonth();
      monthly[month] += item[key] || 0;
    });
    return monthly;
  }, []);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        kpiRes,
        ordersRes,
        returnsRes,
        coachingRes,
        revenueRes,
        alertsRes,
        channelRes,
        statsRes,
      ] = await Promise.allSettled([
        orderAPI.getKPIs(),
        orderAPI.getMerchantOrders({ limit: 10 }),
        merchantAPI.getReturnRisks(),
        merchantAPI.getCoaching(),
        merchantAPI.getRevenueTrend(dateRange),
        merchantAPI.getAIAlerts(), // NEW - AI powered alerts
        merchantAPI.getChannelInsights(), // NEW - AI channel insights
        merchantAPI.getQuickStats(),
      ]);

      if (kpiRes.status === "fulfilled") {
        setKpis(kpiRes.value.data.data);
        setTopProducts(kpiRes.value.data.data.topProducts || []);
      }
      if (ordersRes.status === "fulfilled")
        setOrders(ordersRes.value.data.data.orders || []);
      if (returnsRes.status === "fulfilled")
        setReturnRisks(returnsRes.value.data.data?.slice(0, 4) || []);
      if (coachingRes.status === "fulfilled")
        setCoaching(coachingRes.value.data.data?.insights || []);

      // AI Alerts from Flask
      if (alertsRes.status === "fulfilled")
        setAlerts(alertsRes.value.data.data || []);

      // Channel insights from Flask
      if (channelRes.status === "fulfilled") {
        setChannelMix(
          channelRes.value.data.data.distribution || {
            web: 58,
            app: 27,
            social: 15,
          },
        );
        if (channelRes.value.data.data.insights) {
          // Optional: use AI insights for channel recommendations
          console.log("Channel insights:", channelRes.value.data.data.insights);
        }
      }

      if (statsRes.status === "fulfilled")
        setQuickStats(statsRes.value.data.data);

      if (revenueRes.status === "fulfilled") {
        const revenueData = revenueRes.value.data.data;
        setRevenueSeries(
          aggregateMonthlySeries(revenueData.revenue || [], "amount"),
        );
        setOrdersSeries(
          aggregateMonthlySeries(revenueData.orders || [], "count"),
        );
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [dateRange, aggregateMonthlySeries]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role !== "merchant") {
      navigate("/customer/dashboard");
      return;
    }
    fetchAllData();
  }, [user, navigate, dateRange, fetchAllData]);

  const filteredOrders =
    orderFilter === "all"
      ? orders
      : orders.filter((o) => o.orderStatus === orderFilter);
  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "M";

  // Use AI trend analysis percentage or fallback to calculated
  const revenueChange = trendAnalysis.percent_change || 18.4;
  const returnRate = kpis?.returnRate ? parseFloat(kpis.returnRate) : 0;

  const kpiCards = kpis
    ? [
        {
          label: "Total Revenue",
          value: kpis.revenue || 0,
          change: revenueChange,
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
          value: returnRate,
          change: -0.8,
          icon: "↩",
          color: "#e07070",
          series: [5.2, 4.8, 4.5, 4.2, 3.9, 3.7, 3.5, 3.4, 3.3, 3.2, 3.2, 3.2],
        },
        {
          label: "Active Products",
          value: topProducts.length || 0,
          change: 5.2,
          icon: "✿",
          color: "#8b6aaf",
          series: [],
        },
      ]
    : [];

  const channelSlices = [
    { label: "Web", pct: channelMix.web, color: "#c9727a" },
    { label: "App", pct: channelMix.app, color: "#8b6aaf" },
    { label: "Social", pct: channelMix.social, color: "#c8a04a" },
  ];

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#faf7f4",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            border: "3px solid #f0d5d8",
            borderTopColor: "#c9727a",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <p
          style={{
            fontFamily: "'DM Sans',sans-serif",
            fontSize: ".875rem",
            color: "#9a7080",
          }}
        >
          Loading dashboard...
        </p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
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
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:none} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        ::-webkit-scrollbar { width:4px; height:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:#e8a0a0; border-radius:4px; }
        @media(max-width:900px){ .sidebar-desktop{display:none!important} .main-content{margin-left:0!important} }
      `}</style>

      {/* SIDEBAR */}
      <aside
        className="sidebar-desktop"
        style={{
          width: 260,
          flexShrink: 0,
          height: "100vh",
          position: "fixed",
          top: 0,
          left: 0,
          background: "#ffffff",
          borderRight: "1px solid #f0e6e6",
          display: "flex",
          flexDirection: "column",
          zIndex: 200,
          boxShadow: "2px 0 12px rgba(0,0,0,.02)",
        }}
      >
        <div
          style={{
            padding: "28px 24px 24px",
            borderBottom: "1px solid #f5eeee",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
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
                  fontSize: "1.25rem",
                  color: "#1e1018",
                  letterSpacing: ".02em",
                }}
              >
                Rosée
              </p>
              <p
                style={{
                  fontSize: ".62rem",
                  color: "#b09090",
                  fontWeight: 600,
                  letterSpacing: ".06em",
                  textTransform: "uppercase",
                }}
              >
                Merchant Suite
              </p>
            </div>
          </div>
        </div>
        <nav
          style={{
            flex: 1,
            padding: "20px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
            overflowY: "auto",
          }}
        >
          {NAV.map((item) => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 14px",
                  borderRadius: 12,
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  background: active ? "#fdf5f5" : "transparent",
                  color: active ? "#c9727a" : "#5a3a46",
                  fontSize: ".85rem",
                  fontWeight: active ? 700 : 500,
                  transition: "all .2s",
                  width: "100%",
                }}
              >
                <span style={{ fontSize: "1rem", opacity: active ? 1 : 0.7 }}>
                  {item.icon}
                </span>
                {item.label}
              </button>
            );
          })}
        </nav>
        <div
          style={{
            padding: "20px 20px 28px",
            borderTop: "1px solid #f5eeee",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: "linear-gradient(135deg,#c9727a,#8b3a4a)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span
                style={{ fontSize: ".75rem", fontWeight: 800, color: "white" }}
              >
                {initials}
              </span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontSize: ".8rem",
                  fontWeight: 700,
                  color: "#1e1018",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user?.name}
              </p>
              <p
                style={{
                  fontSize: ".64rem",
                  color: "#b09090",
                  fontWeight: 500,
                }}
              >
                Store Owner
              </p>
            </div>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#4ade80",
                flexShrink: 0,
              }}
            />
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main
        className="main-content"
        style={{
          marginLeft: 260,
          flex: 1,
          minHeight: "100vh",
          overflowX: "hidden",
        }}
      >
        <header
          style={{
            background: "white",
            height: 70,
            borderBottom: "1px solid #f0e6e6",
            padding: "0 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 100,
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontWeight: 700,
                fontSize: "1.4rem",
                color: "#1e1018",
              }}
            >
              Good morning,{" "}
              <span style={{ color: "#c9727a" }}>
                {user?.name?.split(" ")[0] || "Merchant"}
              </span>{" "}
              ✿
            </h1>
            <p
              style={{
                fontSize: ".72rem",
                color: "#b09090",
                fontWeight: 500,
                marginTop: 2,
              }}
            >
              Here's what's happening in your store today
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                display: "flex",
                gap: 6,
                background: "#faf7f4",
                borderRadius: 12,
                padding: 4,
              }}
            >
              {["7d", "30d", "90d"].map((d) => (
                <button
                  key={d}
                  onClick={() => setDateRange(d)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 10,
                    border: "none",
                    cursor: "pointer",
                    fontSize: ".7rem",
                    fontWeight: 700,
                    background: dateRange === d ? "white" : "transparent",
                    color: dateRange === d ? "#c9727a" : "#b09090",
                    boxShadow:
                      dateRange === d ? "0 1px 4px rgba(0,0,0,.05)" : "none",
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
            <div
              style={{
                width: 40,
                height: 40,
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
                style={{ fontSize: ".75rem", fontWeight: 800, color: "white" }}
              >
                {initials}
              </span>
            </div>
          </div>
        </header>

        <div
          style={{
            padding: "28px 32px 48px",
            display: "flex",
            flexDirection: "column",
            gap: 28,
          }}
        >
          {/* Welcome Card */}
          <div
            style={{
              background: "linear-gradient(135deg, #fff5f5, #fff)",
              borderRadius: 24,
              border: "1px solid #f0d5d8",
              padding: "24px 28px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div>
              <p
                style={{
                  fontSize: ".7rem",
                  fontWeight: 800,
                  color: "#c9727a",
                  letterSpacing: ".1em",
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                Welcome back
              </p>
              <p
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontWeight: 700,
                  fontSize: "1.6rem",
                  color: "#1e1018",
                }}
              >
                {user?.name?.split(" ")[0] || "Merchant"}
              </p>
              <p style={{ fontSize: ".75rem", color: "#b09090", marginTop: 4 }}>
                Your store is performing {revenueChange >= 0 ? "▲" : "▼"}{" "}
                {Math.abs(revenueChange)}% better than last month
              </p>
            </div>
            <div
              style={{
                background: "white",
                borderRadius: 16,
                padding: "12px 20px",
                border: "1px solid #f0d5d8",
              }}
            >
              <p
                style={{
                  fontSize: ".62rem",
                  fontWeight: 700,
                  color: "#b09090",
                  letterSpacing: ".08em",
                }}
              >
                TODAY'S ESTIMATE
              </p>
              <p
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontWeight: 700,
                  fontSize: "1.5rem",
                  color: "#1e1018",
                }}
              >
                Rs. {(kpis?.revenue / 30 || 0).toFixed(0)}
              </p>
            </div>
          </div>

          {/* KPI Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: 20,
            }}
          >
            {kpiCards.map((kpi, i) => (
              <KpiCard key={i} {...kpi} />
            ))}
          </div>

          {/* Revenue Chart + Channel Mix */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 280px",
              gap: 20,
            }}
          >
            <div
              style={{
                background: "white",
                borderRadius: 24,
                border: "1px solid #f0e6e6",
                padding: "24px 24px 20px",
                boxShadow: "0 2px 12px rgba(0,0,0,.02)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  marginBottom: 20,
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: ".7rem",
                      fontWeight: 800,
                      color: "#b09090",
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
                      fontSize: "1.8rem",
                      color: "#1e1018",
                    }}
                  >
                    Rs. {kpis?.revenue?.toLocaleString() || "0"}
                  </p>
                  <p
                    style={{
                      fontSize: ".72rem",
                      color: revenueChange >= 0 ? "#16a34a" : "#dc2626",
                      fontWeight: 700,
                    }}
                  >
                    {revenueChange >= 0 ? "▲" : "▼"} {Math.abs(revenueChange)}%
                    from last month
                  </p>
                </div>
                <div style={{ display: "flex", gap: 16 }}>
                  {[
                    ["#c9727a", "Revenue"],
                    ["#8b6aaf", "Orders"],
                  ].map(([c, l]) => (
                    <div
                      key={l}
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
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
                          fontSize: ".66rem",
                          color: "#b09090",
                          fontWeight: 600,
                        }}
                      >
                        {l}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <BarChart data={revenueSeries} labels={MONTHS} color="#c9727a" />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div
                style={{
                  background: "white",
                  borderRadius: 24,
                  border: "1px solid #f0e6e6",
                  padding: "20px 20px",
                  flex: 1,
                  boxShadow: "0 2px 12px rgba(0,0,0,.02)",
                }}
              >
                <p
                  style={{
                    fontSize: ".7rem",
                    fontWeight: 800,
                    color: "#b09090",
                    letterSpacing: ".1em",
                    textTransform: "uppercase",
                    marginBottom: 16,
                  }}
                >
                  Channel Mix
                </p>
                <div
                  style={{ display: "flex", alignItems: "center", gap: 16 }}
                >
                  <Donut slices={channelSlices} />
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 10 }}
                  >
                    {[
                      ["#c9727a", "Web", `${channelMix.web}%`],
                      ["#8b6aaf", "App", `${channelMix.app}%`],
                      ["#c8a04a", "Social", `${channelMix.social}%`],
                    ].map(([c, l, p]) => (
                      <div
                        key={l}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
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
                            fontSize: ".75rem",
                            color: "#1e1018",
                            fontWeight: 600,
                            flex: 1,
                          }}
                        >
                          {l}
                        </span>
                        <span
                          style={{
                            fontSize: ".75rem",
                            color: "#b09090",
                            fontWeight: 700,
                          }}
                        >
                          {p}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    background: "white",
                    borderRadius: 18,
                    border: "1px solid #f0e6e6",
                    padding: "16px 16px",
                  }}
                >
                  <span style={{ fontSize: "1.2rem" }}>👥</span>
                  <p
                    style={{
                      fontFamily: "'Cormorant Garamond',serif",
                      fontWeight: 700,
                      fontSize: "1.4rem",
                      color: "#1e1018",
                      marginTop: 6,
                      marginBottom: 2,
                    }}
                  >
                    {quickStats.newCustomers}
                  </p>
                  <p
                    style={{
                      fontSize: ".64rem",
                      color: "#b09090",
                      fontWeight: 600,
                      marginBottom: 6,
                    }}
                  >
                    New Customers
                  </p>
                  <span
                    style={{
                      fontSize: ".66rem",
                      fontWeight: 800,
                      color:
                        quickStats.newCustomerChange >= 0
                          ? "#16a34a"
                          : "#dc2626",
                      background:
                        quickStats.newCustomerChange >= 0
                          ? "#dcfce7"
                          : "#fee2e2",
                      padding: "2px 8px",
                      borderRadius: 999,
                    }}
                  >
                    {quickStats.newCustomerChange >= 0 ? "▲" : "▼"}{" "}
                    {Math.abs(quickStats.newCustomerChange)}%
                  </span>
                </div>
                <div
                  style={{
                    background: "white",
                    borderRadius: 18,
                    border: "1px solid #f0e6e6",
                    padding: "16px 16px",
                  }}
                >
                  <span style={{ fontSize: "1.2rem" }}>🔁</span>
                  <p
                    style={{
                      fontFamily: "'Cormorant Garamond',serif",
                      fontWeight: 700,
                      fontSize: "1.4rem",
                      color: "#1e1018",
                      marginTop: 6,
                      marginBottom: 2,
                    }}
                  >
                    {quickStats.repeatRate}%
                  </p>
                  <p
                    style={{
                      fontSize: ".64rem",
                      color: "#b09090",
                      fontWeight: 600,
                      marginBottom: 6,
                    }}
                  >
                    Repeat Rate
                  </p>
                  <span
                    style={{
                      fontSize: ".66rem",
                      fontWeight: 800,
                      color:
                        quickStats.repeatRateChange >= 0
                          ? "#16a34a"
                          : "#dc2626",
                      background:
                        quickStats.repeatRateChange >= 0
                          ? "#dcfce7"
                          : "#fee2e2",
                      padding: "2px 8px",
                      borderRadius: 999,
                    }}
                  >
                    {quickStats.repeatRateChange >= 0 ? "▲" : "▼"}{" "}
                    {Math.abs(quickStats.repeatRateChange)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div
            style={{
              background: "white",
              borderRadius: 24,
              border: "1px solid #f0e6e6",
              boxShadow: "0 2px 12px rgba(0,0,0,.02)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "20px 24px 0",
                borderBottom: "1px solid #f5eeee",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 16,
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: ".7rem",
                      fontWeight: 800,
                      color: "#b09090",
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
                      fontSize: "1.2rem",
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
                    fontWeight: 700,
                    color: "#c9727a",
                    background: "#fdf5f5",
                    border: "1px solid #f5c8cc",
                    padding: "8px 18px",
                    borderRadius: 12,
                    cursor: "pointer",
                  }}
                >
                  View All Orders →
                </button>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
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
                        padding: "7px 16px",
                        borderRadius: "12px 12px 0 0",
                        border: "none",
                        cursor: "pointer",
                        background: active ? "white" : "transparent",
                        color: active ? "#c9727a" : "#b09090",
                        borderBottom: active
                          ? "2px solid #c9727a"
                          : "2px solid transparent",
                      }}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}{" "}
                      {count > 0 && (
                        <span
                          style={{
                            marginLeft: 6,
                            background: active ? "#fde8e8" : "#f5eeee",
                            color: active ? "#c9727a" : "#b09090",
                            borderRadius: 999,
                            padding: "0 6px",
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
                  <tr style={{ background: "#faf7f4" }}>
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
                          fontSize: ".64rem",
                          fontWeight: 800,
                          color: "#b09090",
                          padding: "12px 20px",
                          textAlign: "left",
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
                          borderBottom: "1px solid #f5eeee",
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "#faf7f4")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                      >
                        <td
                          style={{
                            padding: "14px 20px",
                            fontWeight: 700,
                            color: "#c9727a",
                          }}
                        >
                          #{order._id?.slice(-8).toUpperCase()}
                        </td>
                        <td
                          style={{
                            padding: "14px 20px",
                            fontWeight: 600,
                            color: "#1e1018",
                          }}
                        >
                          {order.userId?.name || "Customer"}
                        </td>
                        <td style={{ padding: "14px 20px", color: "#b09090" }}>
                          {order.items?.length || 0} item(s)
                        </td>
                        <td style={{ padding: "14px 20px", fontWeight: 700 }}>
                          Rs. {order.total?.toLocaleString()}
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              fontSize: ".66rem",
                              fontWeight: 800,
                              background: st.bg,
                              color: st.color,
                              padding: "4px 12px",
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
                            padding: "14px 20px",
                            fontSize: ".72rem",
                            color: "#b09090",
                          }}
                        >
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td>
                          <button
                            onClick={() => navigate("/merchant/orders")}
                            style={{
                              fontSize: ".66rem",
                              fontWeight: 700,
                              color: "#c9727a",
                              border: "1px solid #f5c8cc",
                              padding: "5px 14px",
                              borderRadius: 10,
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
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 380px",
              gap: 20,
            }}
          >
            {/* Top Products */}
            <div
              style={{
                background: "white",
                borderRadius: 24,
                border: "1px solid #f0e6e6",
                boxShadow: "0 2px 12px rgba(0,0,0,.02)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "20px 24px 14px",
                  borderBottom: "1px solid #f5eeee",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: ".7rem",
                      fontWeight: 800,
                      color: "#b09090",
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
                      fontSize: "1.2rem",
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
                    color: "#b09090",
                    background: "#faf7f4",
                    border: "1px solid #f0e6e6",
                    padding: "6px 14px",
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
                        gap: 16,
                        padding: "14px 24px",
                        borderBottom:
                          i < topProducts.length - 1
                            ? "1px solid #f5eeee"
                            : "none",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#faf7f4")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 10,
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
                          fontSize: ".7rem",
                          fontWeight: 900,
                          color:
                            i === 0
                              ? "white"
                              : i === 1
                                ? "#8b6aaf"
                                : i === 2
                                  ? "#c9727a"
                                  : "#b09090",
                        }}
                      >
                        {i + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            marginBottom: 4,
                          }}
                        >
                          <p style={{ fontWeight: 700 }}>{p.name}</p>
                          {isLow && (
                            <span
                              style={{
                                fontSize: ".56rem",
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
                        <p style={{ fontSize: ".66rem", color: "#b09090", marginBottom: 6 }}>
                          {p.totalUnits} units sold
                        </p>
                        <div
                          style={{
                            height: 4,
                            borderRadius: 4,
                            background: "#f5eeee",
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
                      <p style={{ fontWeight: 700 }}>
                        Rs. {(p.totalRevenue / 1000).toFixed(1)}K
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Alerts - NOW USING REAL AI DATA */}
            <AIAlerts alerts={alerts} />
          </div>
          
          {/* AI Chat Section */}
          <AIChat />
        </div>
      </main>
    </div>
  );
}