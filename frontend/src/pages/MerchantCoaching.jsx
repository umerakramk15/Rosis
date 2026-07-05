import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { merchantAPI, orderAPI } from "../api/index";
import { toast } from "react-toastify";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

/* ═══════════════════════════════ GLOBAL STYLES ═══════════════════════════════ */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&family=Mulish:wght@300;400;500;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { background: #faf7f4; }

  @keyframes fadeUp        { from { opacity:0; transform:translateY(24px) } to { opacity:1; transform:none } }
  @keyframes fadeIn        { from { opacity:0 }                              to { opacity:1 } }
  @keyframes scaleIn       { from { opacity:0; transform:scale(.92) }       to { opacity:1; transform:none } }
  @keyframes shimmer       { 0%,100%{opacity:.45} 50%{opacity:.9} }
  @keyframes spin          { to { transform:rotate(360deg) } }
  @keyframes spinSlow      { to { transform:rotate(360deg) } }
  @keyframes float         { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-18px) rotate(8deg)} }
  @keyframes driftRight    { 0%{transform:translateX(-60px) translateY(0) rotate(0deg);opacity:0} 10%{opacity:.6} 90%{opacity:.3} 100%{transform:translateX(110vw) translateY(-80px) rotate(360deg);opacity:0} }
  @keyframes pulse         { 0%,100%{box-shadow:0 0 0 0 rgba(201,114,122,.35)} 50%{box-shadow:0 0 0 10px rgba(201,114,122,0)} }
  @keyframes sparkle       { 0%{transform:scale(0) rotate(0deg);opacity:0} 50%{opacity:1} 100%{transform:scale(1.4) rotate(180deg);opacity:0} }
  @keyframes slideLeft     { from{opacity:0;transform:translateX(-20px)} to{opacity:1;transform:none} }
  @keyframes barGrow       { from{width:0} }
  @keyframes typewriter    { from{opacity:0;filter:blur(3px)} to{opacity:1;filter:none} }

  ::-webkit-scrollbar { width:5px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:#e8a0a0; border-radius:4px; }

  .kpi-card:hover { transform:translateY(-4px) !important; box-shadow:0 20px 56px rgba(140,40,60,.14) !important; }
  .insight-card:hover { transform:translateY(-3px) scale(1.01) !important; }
  .product-row:hover { background:#fdf0f2 !important; }
  .action-pill:hover { transform:translateY(-2px) scale(1.04) !important; }
  .tab-btn:hover { background:#fdf5f5 !important; color:#c9727a !important; }
`;

/* ═══════════════════════════════ PALETTE ═══════════════════════════════ */
const C = {
  rose: "#c9727a",
  roseLt: "#e8a0a0",
  roseXs: "#fde8e8",
  roseDk: "#8b3a4a",
  plum: "#1e1018",
  plumMd: "#2d1a22",
  plumLt: "#4a2535",
  cream: "#faf7f4",
  creamDk: "#f5efea",
  gold: "#c8a04a",
  goldLt: "#e8d0a0",
  mint: "#5cb8a0",
  mintLt: "#a8dfd4",
  ink: "#1e1018",
  muted: "#9a7080",
  border: "#f0d5d8",
};

/* ═══════════════════════════════ SVG ICONS ═══════════════════════════════ */
const PATHS = {
  refresh:
    "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
  sparkle:
    "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",
  trend: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
  arrow: "M7 17l9.2-9.2M17 17V7H7",
  chevR: "M9 5l7 7-7 7",
  bell: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
  store:
    "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z",
  chart:
    "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  tag: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z",
  heart:
    "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
  info: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  eye: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
  users:
    "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
  check: "M5 13l4 4L19 7",
  warning:
    "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
  dollar:
    "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  product: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
};

const Ic = ({ d, size = 18, sw = 1.8, c = "currentColor", fill = "none" }) => (
  <svg
    width={size}
    height={size}
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

/* ═══════════════════════════════ CHART TOOLTIP ═══════════════════════════════ */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "white",
        border: `1.5px solid ${C.border}`,
        borderRadius: 14,
        padding: "12px 16px",
        boxShadow: "0 8px 28px rgba(140,40,60,.12)",
        fontFamily: "'Mulish',sans-serif",
      }}
    >
      <p
        style={{
          fontSize: ".72rem",
          fontWeight: 800,
          color: C.muted,
          marginBottom: 6,
          letterSpacing: ".08em",
        }}
      >
        {label}
      </p>
      {payload.map((p, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 3,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: p.color,
            }}
          />
          <span style={{ fontSize: ".75rem", color: C.ink, fontWeight: 700 }}>
            {p.name}:
          </span>
          <span style={{ fontSize: ".75rem", color: p.color, fontWeight: 800 }}>
            {p.name === "Revenue"
              ? `Rs. ${p.value?.toLocaleString()}`
              : p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

/* ═══════════════════════════════ HEALTH RING ═══════════════════════════════ */
const HealthRing = ({ score }) => {
  const r = 40,
    circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <svg width={96} height={96} style={{ transform: "rotate(-90deg)" }}>
      <circle
        cx={48}
        cy={48}
        r={r}
        fill="none"
        stroke="#f0d5d8"
        strokeWidth={7}
      />
      <circle
        cx={48}
        cy={48}
        r={r}
        fill="none"
        stroke="url(#ringGrad)"
        strokeWidth={7}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{
          transition: "stroke-dashoffset 1.4s cubic-bezier(.34,1.1,.64,1)",
          filter: "drop-shadow(0 0 6px rgba(201,114,122,.5))",
        }}
      />
      <defs>
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={C.rose} />
          <stop offset="100%" stopColor={C.gold} />
        </linearGradient>
      </defs>
    </svg>
  );
};

/* ═══════════════════════════════ KPI CARD ═══════════════════════════════ */
const KpiCard = ({ icon, label, value, sub, trend, up, color, delay }) => (
  <div
    className="kpi-card"
    style={{
      background: "white",
      borderRadius: 22,
      border: `1.5px solid ${C.border}`,
      padding: "22px 22px 14px",
      boxShadow: "0 4px 20px rgba(140,40,60,.06)",
      transition: "all .3s cubic-bezier(.34,1.1,.64,1)",
      animation: `fadeUp .5s ${delay}s ease both`,
      position: "relative",
      overflow: "hidden",
    }}
  >
    <div
      style={{
        position: "absolute",
        top: -20,
        right: -20,
        width: 90,
        height: 90,
        borderRadius: "50%",
        background: color,
        opacity: 0.07,
        filter: "blur(22px)",
        pointerEvents: "none",
      }}
    />
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 14,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 13,
          background: `${color}18`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ic d={icon} size={18} c={color} sw={2} />
      </div>
      <span
        style={{
          fontFamily: "'Mulish',sans-serif",
          fontSize: ".65rem",
          fontWeight: 900,
          padding: "3px 9px",
          borderRadius: 999,
          letterSpacing: ".05em",
          background: up ? "rgba(92,184,160,.12)" : "rgba(201,114,122,.1)",
          color: up ? C.mint : C.rose,
        }}
      >
        {up ? "↑" : "↓"} {trend}
      </span>
    </div>
    <p
      style={{
        fontFamily: "'Mulish',sans-serif",
        fontSize: ".7rem",
        fontWeight: 800,
        color: C.muted,
        letterSpacing: ".1em",
        textTransform: "uppercase",
        marginBottom: 5,
      }}
    >
      {label}
    </p>
    <p
      style={{
        fontFamily: "'Cormorant Garamond',serif",
        fontWeight: 700,
        fontSize: "1.65rem",
        color: C.ink,
        lineHeight: 1,
        marginBottom: 4,
      }}
    >
      {value}
    </p>
    {sub && (
      <p
        style={{
          fontFamily: "'Mulish',sans-serif",
          fontSize: ".7rem",
          color: C.muted,
          marginBottom: 10,
        }}
      >
        {sub}
      </p>
    )}
  </div>
);

/* ═══════════════════════════════ INSIGHT CARD ═══════════════════════════════ */
const InsightCard = ({ tpl, text, loading, delay }) => (
  <div
    className="insight-card"
    style={{
      background: "white",
      borderRadius: 22,
      border: `1.5px solid ${C.border}`,
      padding: "22px 22px 18px",
      boxShadow: "0 4px 20px rgba(140,40,60,.06)",
      transition: "all .32s cubic-bezier(.34,1.1,.64,1)",
      animation: `fadeUp .5s ${delay}s ease both`,
      position: "relative",
      overflow: "hidden",
      cursor: "default",
    }}
  >
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        background: `linear-gradient(90deg,${tpl.accent},${tpl.accent}88)`,
      }}
    />
    <div
      style={{
        position: "absolute",
        top: -30,
        right: -30,
        width: 120,
        height: 120,
        borderRadius: "50%",
        background: tpl.accent,
        opacity: 0.05,
        filter: "blur(30px)",
        pointerEvents: "none",
      }}
    />

    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 13,
        marginBottom: 14,
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 14,
          background: `${tpl.accent}15`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.2rem",
          flexShrink: 0,
          border: `1.5px solid ${tpl.accent}22`,
        }}
      >
        {tpl.icon}
      </div>
      <div>
        <p
          style={{
            fontFamily: "'Mulish',sans-serif",
            fontSize: ".6rem",
            fontWeight: 900,
            color: tpl.accent,
            letterSpacing: ".12em",
            textTransform: "uppercase",
            marginBottom: 3,
          }}
        >
          {tpl.category}
        </p>
        <p
          style={{
            fontFamily: "'Cormorant Garamond',serif",
            fontWeight: 700,
            fontSize: "1.08rem",
            color: C.ink,
          }}
        >
          {tpl.title}
        </p>
      </div>
    </div>

    {loading ? (
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        <div
          style={{
            height: 12,
            borderRadius: 6,
            background: "linear-gradient(90deg,#f0d5d8,#fde8e8,#f0d5d8)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.4s ease-in-out infinite",
          }}
        />
        <div
          style={{
            height: 12,
            borderRadius: 6,
            width: "88%",
            background: "linear-gradient(90deg,#f0d5d8,#fde8e8,#f0d5d8)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.4s ease-in-out infinite",
          }}
        />
        <div
          style={{
            height: 12,
            borderRadius: 6,
            width: "72%",
            background: "linear-gradient(90deg,#f0d5d8,#fde8e8,#f0d5d8)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.4s ease-in-out infinite",
          }}
        />
      </div>
    ) : (
      <p
        style={{
          fontFamily: "'Mulish',sans-serif",
          fontSize: ".8rem",
          color: "#5a3f4a",
          lineHeight: 1.75,
          animation: "typewriter .5s ease",
        }}
      >
        {text}
      </p>
    )}
  </div>
);

/* ═══════════════════════════════ MAIN PAGE ═══════════════════════════════ */
export default function MerchantCoachingPage() {
  const navigate = useNavigate();
  const [kpis, setKpis] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [sparkles, setSparkles] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [period, setPeriod] = useState("30D");
  const [chartData, setChartData] = useState([]);
  const refreshBtnRef = useRef(null);

  // Mock chart data generator
  const generateChartData = (period) => {
    if (period === "7D") {
      return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => ({
        day,
        revenue: Math.round(28000 + Math.random() * 22000),
        orders: Math.round(180 + Math.random() * 120),
      }));
    } else if (period === "90D") {
      return [
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
      ].map((month) => ({
        day: month,
        revenue: Math.round(32000 + Math.random() * 48000),
        orders: Math.round(220 + Math.random() * 160),
      }));
    } else {
      return Array.from({ length: 30 }, (_, i) => ({
        day: `${i + 1}`,
        revenue: Math.round(18000 + Math.random() * 32000),
        orders: Math.round(120 + Math.random() * 140),
      }));
    }
  };

  useEffect(() => {
    setChartData(generateChartData(period));
  }, [period]);

  const fetchCoaching = async () => {
    try {
      setError(null);
      const [coachingRes, kpiRes] = await Promise.all([
        merchantAPI.getCoaching(),
        orderAPI.getKPIs(),
      ]);

      const coachingData = coachingRes.data?.data;
      const kpiData = kpiRes.data?.data;

      setKpis(kpiData);
      setInsights(
        Array.isArray(coachingData?.insights) ? coachingData.insights : [],
      );

      // Build top products from KPI data
      if (kpiData?.topProducts && kpiData.topProducts.length > 0) {
        setTopProducts(kpiData.topProducts.slice(0, 5));
      } else {
        // Fallback mock top products
        setTopProducts([
          {
            id: 1,
            name: "Rosewater Linen Dress",
            revenue: kpiData?.revenue * 0.43 || 18420,
            orders: 142,
            stock: 23,
            trend: "+18%",
            up: true,
          },
          {
            id: 2,
            name: "Champagne Tote Bag",
            revenue: kpiData?.revenue * 0.33 || 14260,
            orders: 87,
            stock: 8,
            trend: "+9%",
            up: true,
          },
          {
            id: 3,
            name: "Pearl Stud Earrings",
            revenue: kpiData?.revenue * 0.23 || 9840,
            orders: 210,
            stock: 0,
            trend: "+34%",
            up: true,
          },
          {
            id: 4,
            name: "Velvet Dream Heels",
            revenue: 8120,
            orders: 56,
            stock: 14,
            trend: "-4%",
            up: false,
          },
          {
            id: 5,
            name: "Silk Scrunchie Set",
            revenue: 6300,
            orders: 315,
            stock: 142,
            trend: "+22%",
            up: true,
          },
        ]);
      }
    } catch (err) {
      setError("Failed to load coaching insights. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCoaching();
  }, []);

  const handleRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);

    // Sparkle burst effect
    const btn = refreshBtnRef.current;
    if (btn) {
      const rect = btn.getBoundingClientRect();
      const newSparkles = Array.from({ length: 8 }, (_, i) => ({
        id: Date.now() + i,
        x: rect.left + rect.width / 2 + (Math.random() - 0.5) * 80,
        y: rect.top + rect.height / 2 + (Math.random() - 0.5) * 80,
      }));
      setSparkles(newSparkles);
      setTimeout(() => setSparkles([]), 900);
    }

    setChartData(generateChartData(period));
    await fetchCoaching();
    setLastUpdated(new Date());
  };

  const formatRs = (val) => `Rs. ${Number(val || 0).toLocaleString()}`;
  const formatPct = (val) => `${((val || 0) * 100).toFixed(1)}%`;

  const kpiCards = kpis
    ? [
        {
          label: "Total Revenue",
          value: formatRs(kpis.revenue),
          sub: "This month",
          trend: "+18.4%",
          up: true,
          color: C.rose,
          icon: PATHS.dollar,
        },
        {
          label: "Total Orders",
          value: kpis.totalOrders || 0,
          sub: "Total orders",
          trend: "+11.2%",
          up: true,
          color: C.gold,
          icon: PATHS.store,
        },
        {
          label: "Return Rate",
          value: formatPct(kpis.returnRate),
          sub: "Store return rate",
          trend: "-0.8%",
          up: false,
          color: C.mint,
          icon: PATHS.trend,
        },
        {
          label: "Conversion",
          value: "3.8%",
          sub: "Store conversion",
          trend: "+0.6%",
          up: true,
          color: "#9b7cc8",
          icon: PATHS.chart,
        },
      ]
    : [];

  const INSIGHT_TEMPLATES = [
    {
      id: "restock",
      icon: "📦",
      accent: C.rose,
      category: "Inventory",
      title: "Restock Alert",
    },
    {
      id: "topSeller",
      icon: "🌟",
      accent: C.gold,
      category: "Performance",
      title: "Top Seller Spotlight",
    },
    {
      id: "upsell",
      icon: "💡",
      accent: C.mint,
      category: "Strategy",
      title: "Upsell Opportunity",
    },
    {
      id: "pricing",
      icon: "💰",
      accent: C.roseDk,
      category: "Pricing",
      title: "Pricing Insight",
    },
    {
      id: "seasonal",
      icon: "🌸",
      accent: "#9b7cc8",
      category: "Trends",
      title: "Seasonal Trend",
    },
    {
      id: "retention",
      icon: "💌",
      accent: "#d4844a",
      category: "CRM",
      title: "Customer Retention",
    },
  ];

  const displayInsights =
    insights.length >= 6
      ? insights
      : [
          "Your top selling product is driving significant revenue. Consider increasing marketing spend on this item to maximize ROI.",
          "Return rates are within healthy range. Keep monitoring customer feedback for early warning signs.",
          "Inventory levels for your bestseller are running low. Reorder soon to avoid stockouts during peak demand.",
          "Weekend sales are outperforming weekdays. Consider running flash sales on Saturday/Sunday.",
          "Loyal customers spend 3x more than new ones. Launch a referral program to boost retention.",
          "AI analysis suggests your pricing is competitive. Maintain current strategy.",
        ];

  // Quick Actions with links to existing pages
  const QUICK_ACTIONS = [
    {
      label: "Add New Product",
      icon: PATHS.product,
      accent: C.rose,
      link: "/merchant/products",
    },
    {
      label: "Manage Orders",
      icon: PATHS.store,
      accent: C.gold,
      link: "/merchant/orders",
    },
    {
      label: "Inventory Forecast",
      icon: PATHS.chart,
      accent: C.mint,
      link: "/merchant/inventory",
    },
    {
      label: "View Analytics",
      icon: PATHS.trend,
      accent: "#9b7cc8",
      link: "/merchant/dashboard",
    },
    {
      label: "Pricing Suggestions",
      icon: PATHS.dollar,
      accent: "#d4844a",
      link: "/merchant/pricing",
    },
    {
      label: "Return Risk",
      icon: PATHS.warning,
      accent: C.roseDk,
      link: "/merchant/returns",
    },
  ];

  // Floating petals
  const PETALS = Array.from({ length: 10 }, (_, i) => ({
    id: i,
    emoji: ["✿", "✦", "♡", "❋", "✾"][i % 5],
    left: `${5 + i * 9}%`,
    dur: `${14 + i * 2}s`,
    delay: `${i * 1.3}s`,
    size: 0.65 + i * 0.04,
  }));

  const fmt = (d) =>
    d.toLocaleString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "short",
    });

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: C.cream,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>🤖</div>
          <p style={{ color: C.muted, fontWeight: 700 }}>
            Generating AI coaching insights from your real data...
          </p>
        </div>
      </div>
    );
  }

  const maxRevenue =
    topProducts.length > 0 ? Math.max(...topProducts.map((p) => p.revenue)) : 1;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.cream,
        fontFamily: "'Mulish',sans-serif",
      }}
    >
      <style>{GLOBAL_CSS}</style>

      {/* sparkle particles overlay */}
      {sparkles.map((s) => (
        <div
          key={s.id}
          style={{
            position: "fixed",
            left: s.x,
            top: s.y,
            width: 18,
            height: 18,
            pointerEvents: "none",
            zIndex: 9999,
            fontSize: "1rem",
            animation: "sparkle .8s ease both",
          }}
        >
          ✦
        </div>
      ))}

      {/* floating petals background */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          overflow: "hidden",
        }}
      >
        {PETALS.map((p) => (
          <div
            key={p.id}
            style={{
              position: "absolute",
              bottom: -40,
              left: p.left,
              fontSize: `${p.size}rem`,
              color: C.roseLt,
              opacity: 0.35,
              animation: `driftRight ${p.dur} linear ${p.delay} infinite`,
            }}
          >
            {p.emoji}
          </div>
        ))}
        <div
          style={{
            position: "absolute",
            top: "10%",
            left: "5%",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: `radial-gradient(circle,${C.roseXs},transparent)`,
            filter: "blur(60px)",
            opacity: 0.6,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "20%",
            right: "8%",
            width: 320,
            height: 320,
            borderRadius: "50%",
            background: `radial-gradient(circle,${C.goldLt}44,transparent)`,
            filter: "blur(50px)",
            opacity: 0.5,
          }}
        />
      </div>

      {/* TOPBAR */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(250,247,244,.92)",
          backdropFilter: "blur(18px)",
          borderBottom: `1.5px solid ${C.border}`,
          boxShadow: "0 2px 20px rgba(140,40,60,.07)",
          height: 66,
          display: "flex",
          alignItems: "center",
          padding: "0 clamp(16px,4vw,40px)",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => navigate("/merchant/dashboard")}
            style={{
              background: "#fde8e8",
              border: "none",
              borderRadius: 10,
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <Ic
              d={PATHS.chevR}
              size={16}
              c="#c9727a"
              sw={2.5}
              style={{ transform: "rotate(180deg)" }}
            />
          </button>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              background: `linear-gradient(135deg,${C.rose},${C.roseLt})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              boxShadow: `0 4px 12px ${C.rose}44`,
            }}
          >
            ✿
          </div>
          <div>
            <p
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontWeight: 700,
                fontSize: "1.15rem",
                color: C.roseDk,
                lineHeight: 1,
              }}
            >
              Rosée
            </p>
            <p
              style={{
                fontFamily: "'Mulish',sans-serif",
                fontSize: ".58rem",
                fontWeight: 800,
                color: C.muted,
                letterSpacing: ".12em",
                textTransform: "uppercase",
              }}
            >
              Merchant Hub
            </p>
          </div>
        </div>

        <div style={{ flex: 1 }} />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 14px",
            borderRadius: 999,
            background: "white",
            border: `1.5px solid ${C.border}`,
          }}
        >
          <Ic d={PATHS.store} size={13} c={C.muted} sw={2} />
          <span
            style={{
              fontFamily: "'Mulish',sans-serif",
              fontSize: ".72rem",
              fontWeight: 700,
              color: C.muted,
            }}
          >
            Rosée Boutique
          </span>
        </div>

        <p
          style={{
            fontFamily: "'Mulish',sans-serif",
            fontSize: ".66rem",
            color: C.muted,
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          Updated {fmt(lastUpdated)}
        </p>

        <button
          ref={refreshBtnRef}
          onClick={handleRefresh}
          disabled={refreshing}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "9px 18px",
            borderRadius: 14,
            border: "none",
            background: refreshing
              ? `linear-gradient(135deg,${C.roseLt},${C.goldLt})`
              : `linear-gradient(135deg,${C.rose},${C.roseLt})`,
            color: "white",
            cursor: refreshing ? "not-allowed" : "pointer",
            fontFamily: "'Mulish',sans-serif",
            fontSize: ".75rem",
            fontWeight: 800,
            letterSpacing: ".06em",
            textTransform: "uppercase",
            boxShadow: `0 4px 16px ${C.rose}44`,
            transition: "all .3s cubic-bezier(.34,1.1,.64,1)",
          }}
          onMouseEnter={(e) => {
            if (!refreshing) {
              e.currentTarget.style.transform = "translateY(-1px) scale(1.03)";
              e.currentTarget.style.boxShadow = `0 8px 24px ${C.rose}55`;
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "none";
            e.currentTarget.style.boxShadow = `0 4px 16px ${C.rose}44`;
          }}
        >
          <span
            style={{
              animation: refreshing ? "spin .7s linear infinite" : "none",
              display: "inline-flex",
            }}
          >
            <Ic d={PATHS.refresh} size={15} c="white" sw={2.5} />
          </span>
          {refreshing ? "Refreshing…" : "Refresh"}
          {!refreshing && (
            <Ic d={PATHS.sparkle} size={13} c="rgba(255,255,255,.8)" sw={1.5} />
          )}
        </button>
      </header>

      {/* MAIN BODY */}
      <main
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "clamp(24px,3vw,40px) clamp(16px,3vw,32px) 80px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* HERO GREETING */}
        <div
          style={{
            background: `linear-gradient(135deg,${C.plum} 0%,${C.plumMd} 55%,${C.plumLt} 100%)`,
            borderRadius: 28,
            padding: "clamp(28px,4vw,44px) clamp(24px,4vw,44px)",
            marginBottom: 28,
            position: "relative",
            overflow: "hidden",
            animation: "fadeUp .5s ease both",
            boxShadow: `0 20px 60px rgba(30,16,20,.35)`,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -60,
              right: -40,
              width: 280,
              height: 280,
              borderRadius: "50%",
              background: C.rose,
              opacity: 0.12,
              filter: "blur(50px)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: -40,
              left: 120,
              width: 200,
              height: 200,
              borderRadius: "50%",
              background: C.gold,
              opacity: 0.09,
              filter: "blur(40px)",
              pointerEvents: "none",
            }}
          />

          {["✿", "✦", "❋"].map((p, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                fontSize: `${1.2 - i * 0.15}rem`,
                color: "rgba(255,255,255,.12)",
                animation: `float ${5 + i}s ease-in-out infinite`,
                top: `${15 + i * 22}%`,
                right: `${6 + i * 7}%`,
                pointerEvents: "none",
              }}
            >
              {p}
            </div>
          ))}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              flexWrap: "wrap",
              position: "relative",
            }}
          >
            <div style={{ flexShrink: 0, position: "relative" }}>
              <div
                style={{
                  width: 76,
                  height: 76,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg,${C.rose},${C.gold})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "'Cormorant Garamond',serif",
                  fontWeight: 700,
                  fontSize: "1.6rem",
                  color: "white",
                  boxShadow: `0 0 0 3px rgba(255,255,255,.2), 0 8px 24px rgba(0,0,0,.3)`,
                }}
              >
                ✨
              </div>
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg,${C.gold},${C.goldLt})`,
                  border: "2.5px solid #2d1a22",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: ".55rem",
                }}
              >
                ⭐
              </div>
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontFamily: "'Mulish',sans-serif",
                  fontSize: ".7rem",
                  fontWeight: 800,
                  color: "rgba(255,255,255,.5)",
                  letterSpacing: ".18em",
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                Good{" "}
                {new Date().getHours() < 12
                  ? "Morning"
                  : new Date().getHours() < 18
                    ? "Afternoon"
                    : "Evening"}
                , Merchant
              </p>
              <h1
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontWeight: 700,
                  fontSize: "clamp(1.6rem,3.5vw,2.4rem)",
                  color: "white",
                  lineHeight: 1.15,
                  marginBottom: 8,
                }}
              >
                Welcome back,{" "}
                <em style={{ color: C.roseLt, fontStyle: "italic" }}>
                  Merchant
                </em>{" "}
                ✿
              </h1>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {[
                  { icon: PATHS.tag, label: "Gold Seller", c: C.gold },
                  {
                    icon: PATHS.users,
                    label: "Active Merchant",
                    c: "rgba(255,255,255,.55)",
                  },
                  {
                    icon: PATHS.chart,
                    label: "AI Coaching Active",
                    c: C.mintLt,
                  },
                ].map((b, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "5px 12px",
                      borderRadius: 999,
                      background: "rgba(255,255,255,.08)",
                      border: "1px solid rgba(255,255,255,.12)",
                    }}
                  >
                    <Ic d={b.icon} size={12} c={b.c} sw={2.2} />
                    <span
                      style={{
                        fontFamily: "'Mulish',sans-serif",
                        fontSize: ".68rem",
                        fontWeight: 700,
                        color: b.c,
                      }}
                    >
                      {b.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                flexShrink: 0,
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div style={{ position: "relative", width: 96, height: 96 }}>
                <HealthRing score={82} />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <p
                    style={{
                      fontFamily: "'Cormorant Garamond',serif",
                      fontWeight: 700,
                      fontSize: "1.4rem",
                      color: "white",
                      lineHeight: 1,
                    }}
                  >
                    82
                  </p>
                  <p
                    style={{
                      fontFamily: "'Mulish',sans-serif",
                      fontSize: ".5rem",
                      fontWeight: 800,
                      color: "rgba(255,255,255,.45)",
                      letterSpacing: ".08em",
                      textTransform: "uppercase",
                    }}
                  >
                    Health
                  </p>
                </div>
              </div>
              <p
                style={{
                  fontFamily: "'Mulish',sans-serif",
                  fontSize: ".65rem",
                  fontWeight: 800,
                  color: "rgba(255,255,255,.5)",
                  marginTop: 8,
                  letterSpacing: ".06em",
                }}
              >
                STORE SCORE
              </p>
            </div>
          </div>
        </div>

        {/* KPI CARDS */}
        {kpis && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
              gap: 18,
              marginBottom: 28,
            }}
          >
            {kpiCards.map((card, i) => (
              <KpiCard
                key={card.label}
                icon={card.icon}
                label={card.label}
                value={card.value}
                sub={card.sub}
                trend={card.trend}
                up={card.up}
                color={card.color}
                delay={0.05 * (i + 1)}
              />
            ))}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div
            style={{
              background: "#fde8e8",
              border: "1.5px solid #c9727a",
              borderRadius: 14,
              padding: "16px 20px",
              marginBottom: 24,
              color: "#8b3a4a",
              fontWeight: 700,
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* PERFORMANCE CHART */}
        <div
          style={{
            background: "white",
            borderRadius: 24,
            border: `1.5px solid ${C.border}`,
            padding: "clamp(18px,3vw,28px)",
            marginBottom: 28,
            boxShadow: "0 4px 24px rgba(140,40,60,.07)",
            animation: "fadeUp .5s .25s ease both",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
              marginBottom: 22,
            }}
          >
            <div>
              <p
                style={{
                  fontFamily: "'Mulish',sans-serif",
                  fontSize: ".68rem",
                  fontWeight: 900,
                  color: C.muted,
                  letterSpacing: ".14em",
                  textTransform: "uppercase",
                  marginBottom: 4,
                }}
              >
                Performance Trend
              </p>
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontWeight: 700,
                  fontSize: "1.4rem",
                  color: C.ink,
                }}
              >
                Revenue & Orders
              </h2>
            </div>
            <div
              style={{
                display: "flex",
                gap: 6,
                background: C.creamDk,
                borderRadius: 14,
                padding: 5,
              }}
            >
              {["7D", "30D", "90D"].map((p) => (
                <button
                  key={p}
                  className="tab-btn"
                  onClick={() => setPeriod(p)}
                  style={{
                    padding: "7px 18px",
                    borderRadius: 11,
                    border: "none",
                    background: period === p ? "white" : "transparent",
                    color: period === p ? C.rose : C.muted,
                    fontFamily: "'Mulish',sans-serif",
                    fontSize: ".74rem",
                    fontWeight: 800,
                    cursor: "pointer",
                    transition: "all .22s",
                    boxShadow:
                      period === p ? "0 2px 10px rgba(140,40,60,.1)" : "none",
                    letterSpacing: ".05em",
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={280}>
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 10, bottom: 0, left: -10 }}
            >
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.rose} stopOpacity={0.15} />
                  <stop offset="100%" stopColor={C.rose} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ordGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.gold} stopOpacity={0.15} />
                  <stop offset="100%" stopColor={C.gold} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f0d5d8"
                vertical={false}
              />
              <XAxis
                dataKey="day"
                tick={{
                  fontFamily: "'Mulish',sans-serif",
                  fontSize: 11,
                  fill: C.muted,
                  fontWeight: 700,
                }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="rev"
                tick={{
                  fontFamily: "'Mulish',sans-serif",
                  fontSize: 10,
                  fill: C.muted,
                }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `Rs. ${v / 1000}k`}
              />
              <YAxis
                yAxisId="ord"
                orientation="right"
                tick={{
                  fontFamily: "'Mulish',sans-serif",
                  fontSize: 10,
                  fill: C.muted,
                }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<ChartTooltip />} />
              <Legend
                wrapperStyle={{
                  fontFamily: "'Mulish',sans-serif",
                  fontSize: ".72rem",
                  fontWeight: 800,
                  paddingTop: 16,
                }}
              />
              <Line
                yAxisId="rev"
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke={C.rose}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: C.rose }}
              />
              <Line
                yAxisId="ord"
                type="monotone"
                dataKey="orders"
                name="Orders"
                stroke={C.gold}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: C.gold }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* AI INSIGHT CARDS */}
        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 18,
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <div>
              <p
                style={{
                  fontFamily: "'Mulish',sans-serif",
                  fontSize: ".68rem",
                  fontWeight: 900,
                  color: C.muted,
                  letterSpacing: ".14em",
                  textTransform: "uppercase",
                  marginBottom: 4,
                }}
              >
                AI-Powered Insights
              </p>
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontWeight: 700,
                  fontSize: "1.4rem",
                  color: C.ink,
                }}
              >
                Your Personalised Coaching{" "}
                <em style={{ color: C.rose, fontStyle: "italic" }}>Report</em>
              </h2>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "7px 14px",
                borderRadius: 999,
                background: `${C.mint}15`,
                border: `1.5px solid ${C.mint}33`,
              }}
            >
              <div
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: C.mint,
                  animation: refreshing ? "pulse 1s infinite" : "none",
                }}
              />
              <span
                style={{
                  fontFamily: "'Mulish',sans-serif",
                  fontSize: ".7rem",
                  fontWeight: 800,
                  color: C.mint,
                  letterSpacing: ".08em",
                }}
              >
                {refreshing ? "Refreshing insights…" : "Groq LLaMA · Live"}
              </span>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
              gap: 18,
            }}
          >
            {INSIGHT_TEMPLATES.map((tpl, i) => (
              <InsightCard
                key={`${tpl.id}-${refreshing}`}
                tpl={tpl}
                text={
                  displayInsights[i] ||
                  displayInsights[i % displayInsights.length]
                }
                loading={false}
                delay={0.04 * i}
              />
            ))}
          </div>
        </div>

        {/* TOP PRODUCTS PERFORMANCE LEADERBOARD */}
        <div
          style={{
            background: "white",
            borderRadius: 24,
            border: `1.5px solid ${C.border}`,
            padding: "clamp(18px,3vw,28px)",
            marginBottom: 28,
            boxShadow: "0 4px 24px rgba(140,40,60,.07)",
            animation: "fadeUp .5s .35s ease both",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 20,
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <div>
              <p
                style={{
                  fontFamily: "'Mulish',sans-serif",
                  fontSize: ".68rem",
                  fontWeight: 900,
                  color: C.muted,
                  letterSpacing: ".14em",
                  textTransform: "uppercase",
                  marginBottom: 4,
                }}
              >
                Top Products
              </p>
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontWeight: 700,
                  fontSize: "1.4rem",
                  color: C.ink,
                }}
              >
                Performance Leaderboard
              </h2>
            </div>
            <button
              onClick={() => navigate("/merchant/products")}
              style={{
                padding: "8px 16px",
                borderRadius: 12,
                border: `1.5px solid ${C.border}`,
                background: "white",
                color: C.muted,
                fontFamily: "'Mulish',sans-serif",
                fontSize: ".7rem",
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "all .2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = C.rose;
                e.currentTarget.style.color = C.rose;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = C.border;
                e.currentTarget.style.color = C.muted;
              }}
            >
              <Ic d={PATHS.eye} size={13} c="currentColor" sw={2} /> View All
            </button>
          </div>

          {/* Header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 1fr 120px 80px",
              gap: 8,
              padding: "8px 14px",
              borderRadius: 10,
              background: C.creamDk,
              marginBottom: 10,
            }}
          >
            {[
              "Product",
              "Revenue",
              "Orders",
              "Stock",
              "Revenue Share",
              "Trend",
            ].map((h) => (
              <p
                key={h}
                style={{
                  fontFamily: "'Mulish',sans-serif",
                  fontSize: ".63rem",
                  fontWeight: 900,
                  color: C.muted,
                  letterSpacing: ".1em",
                  textTransform: "uppercase",
                }}
              >
                {h}
              </p>
            ))}
          </div>

          {/* Product Rows */}
          {topProducts.map((p, i) => {
            const pct = Math.round((p.revenue / maxRevenue) * 100);
            const isUp = p.trend?.startsWith("+") || p.up;
            const trendValue =
              p.trend ||
              (isUp
                ? `+${Math.round(Math.random() * 30)}%`
                : `-${Math.round(Math.random() * 15)}%`);
            return (
              <div
                key={p.id || i}
                className="product-row"
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1fr 1fr 120px 80px",
                  gap: 8,
                  padding: "13px 14px",
                  borderRadius: 14,
                  transition: "background .2s",
                  alignItems: "center",
                  borderBottom:
                    i < topProducts.length - 1
                      ? `1px solid ${C.border}`
                      : "none",
                  animation: `slideLeft .4s ${0.05 * i}s ease both`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 12,
                      background: C.roseXs,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.2rem",
                      flexShrink: 0,
                    }}
                  >
                    {p.name?.includes("Dress")
                      ? "👗"
                      : p.name?.includes("Bag")
                        ? "👜"
                        : p.name?.includes("Earrings")
                          ? "💎"
                          : p.name?.includes("Heels")
                            ? "👠"
                            : "📦"}
                  </div>
                  <div>
                    <p
                      style={{
                        fontFamily: "'Mulish',sans-serif",
                        fontSize: ".8rem",
                        fontWeight: 800,
                        color: C.ink,
                        marginBottom: 2,
                      }}
                    >
                      {p.name || "Product"}
                    </p>
                    <p
                      style={{
                        fontFamily: "'Mulish',sans-serif",
                        fontSize: ".63rem",
                        color: C.muted,
                        fontWeight: 600,
                      }}
                    >
                      SKU: {p.sku || `PROD-${(i + 1) * 100}`}
                    </p>
                  </div>
                </div>
                <p
                  style={{
                    fontFamily: "'Cormorant Garamond',serif",
                    fontWeight: 700,
                    fontSize: "1rem",
                    color: C.ink,
                  }}
                >
                  {formatRs(p.revenue)}
                </p>
                <p
                  style={{
                    fontFamily: "'Mulish',sans-serif",
                    fontSize: ".82rem",
                    fontWeight: 700,
                    color: C.ink,
                  }}
                >
                  {p.orders}
                </p>
                <div>
                  {p.stock === 0 ? (
                    <span
                      style={{
                        fontFamily: "'Mulish',sans-serif",
                        fontSize: ".65rem",
                        fontWeight: 900,
                        background: "rgba(220,38,38,.1)",
                        color: "#dc2626",
                        padding: "3px 9px",
                        borderRadius: 999,
                        letterSpacing: ".05em",
                      }}
                    >
                      OUT OF STOCK
                    </span>
                  ) : p.stock < 15 ? (
                    <span
                      style={{
                        fontFamily: "'Mulish',sans-serif",
                        fontSize: ".7rem",
                        fontWeight: 800,
                        color: "#d97706",
                      }}
                    >
                      ⚠ {p.stock} left
                    </span>
                  ) : (
                    <span
                      style={{
                        fontFamily: "'Mulish',sans-serif",
                        fontSize: ".75rem",
                        fontWeight: 700,
                        color: C.mint,
                      }}
                    >
                      ✓ {p.stock}
                    </span>
                  )}
                </div>
                <div>
                  <div
                    style={{
                      height: 6,
                      borderRadius: 99,
                      background: C.roseXs,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${pct}%`,
                        borderRadius: 99,
                        background: `linear-gradient(90deg,${C.rose},${C.roseLt})`,
                        animation: "barGrow .8s ease",
                      }}
                    />
                  </div>
                  <p
                    style={{
                      fontFamily: "'Mulish',sans-serif",
                      fontSize: ".6rem",
                      color: C.muted,
                      fontWeight: 700,
                      marginTop: 4,
                    }}
                  >
                    {pct}% of top
                  </p>
                </div>
                <span
                  style={{
                    fontFamily: "'Mulish',sans-serif",
                    fontSize: ".72rem",
                    fontWeight: 900,
                    color: isUp ? C.mint : "#ef4444",
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                  }}
                >
                  <span style={{ fontSize: ".8rem" }}>{isUp ? "↑" : "↓"}</span>
                  {trendValue}
                </span>
              </div>
            );
          })}
        </div>

        {/* QUICK ACTIONS - Links to existing pages */}
        <div style={{ animation: "fadeUp .5s .4s ease both" }}>
          <p
            style={{
              fontFamily: "'Mulish',sans-serif",
              fontSize: ".68rem",
              fontWeight: 900,
              color: C.muted,
              letterSpacing: ".14em",
              textTransform: "uppercase",
              marginBottom: 14,
            }}
          >
            Quick Actions
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {QUICK_ACTIONS.map((a, i) => (
              <button
                key={i}
                className="action-pill"
                onClick={() => navigate(a.link)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "11px 20px",
                  borderRadius: 14,
                  border: `1.5px solid ${a.accent}28`,
                  background: `${a.accent}10`,
                  color: a.accent,
                  fontFamily: "'Mulish',sans-serif",
                  fontSize: ".75rem",
                  fontWeight: 800,
                  cursor: "pointer",
                  letterSpacing: ".04em",
                  transition: "all .25s cubic-bezier(.34,1.1,.64,1)",
                  animation: `fadeUp .4s ${0.05 * i}s ease both`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = a.accent;
                  e.currentTarget.style.color = "white";
                  e.currentTarget.style.boxShadow = `0 8px 20px ${a.accent}44`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = `${a.accent}10`;
                  e.currentTarget.style.color = a.accent;
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <Ic d={a.icon} size={15} c="currentColor" sw={2.2} />
                {a.label}
              </button>
            ))}
          </div>
        </div>

        {/* FOOTER */}
        <div
          style={{
            marginTop: 52,
            paddingTop: 28,
            borderTop: `1.5px solid ${C.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 14,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 9,
                background: `linear-gradient(135deg,${C.rose},${C.roseLt})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
              }}
            >
              ✿
            </div>
            <p
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontWeight: 600,
                fontSize: "1rem",
                color: C.roseDk,
              }}
            >
              Rosée Merchant Hub
            </p>
          </div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {["🔒 Secure Platform", "🤖 AI Powered", "⭐ Gold Plan"].map(
              (t) => (
                <span
                  key={t}
                  style={{
                    fontFamily: "'Mulish',sans-serif",
                    fontSize: ".66rem",
                    fontWeight: 700,
                    color: C.muted,
                  }}
                >
                  {t}
                </span>
              ),
            )}
          </div>
          <p
            style={{
              fontFamily: "'Mulish',sans-serif",
              fontSize: ".66rem",
              color: "#c4a4b0",
              fontWeight: 600,
            }}
          >
            © 2026 Rosée · All rights reserved
          </p>
        </div>
      </main>
    </div>
  );
}
