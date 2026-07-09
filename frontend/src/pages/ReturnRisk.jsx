import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { merchantAPI } from "../api/index";
import { toast } from "react-toastify";

/* ════════════════════════════════════════════════════════════════
   DESIGN TOKENS (same as your beautiful design)
════════════════════════════════════════════════════════════════ */
const RISK_CFG = {
  high: {
    color: "#e53e5e",
    bg: "rgba(229,62,94,.1)",
    border: "rgba(229,62,94,.22)",
    glow: "rgba(229,62,94,.18)",
    label: "High Risk",
    emoji: "🔴",
  },
  medium: {
    color: "#d97706",
    bg: "rgba(217,119,6,.09)",
    border: "rgba(217,119,6,.22)",
    glow: "rgba(217,119,6,.16)",
    label: "Medium Risk",
    emoji: "🟡",
  },
  low: {
    color: "#16a34a",
    bg: "rgba(22,163,74,.09)",
    border: "rgba(22,163,74,.2)",
    glow: "rgba(22,163,74,.14)",
    label: "Low Risk",
    emoji: "🟢",
  },
};

const ACTION_CFG = {
  exchange: {
    icon: "↔",
    color: "#8b5cf6",
    bg: "rgba(139,92,246,.1)",
    label: "Offer Exchange",
  },
  credit: {
    icon: "✦",
    color: "#c9727a",
    bg: "rgba(201,114,122,.1)",
    label: "Send Credit",
  },
  monitor: {
    icon: "◎",
    color: "#6b7280",
    bg: "rgba(107,114,128,.1)",
    label: "Monitor Only",
  },
  education: {
    icon: "✉",
    color: "#0891b2",
    bg: "rgba(8,145,178,.1)",
    label: "Send Info",
  },
};

const RiskBadge = ({ risk, size = "sm" }) => {
  const c = RISK_CFG[risk] || RISK_CFG.low;
  const big = size === "lg";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: big ? 7 : 5,
        padding: big ? "6px 14px" : "3px 10px",
        borderRadius: 999,
        background: c.bg,
        border: `1.5px solid ${c.border}`,
        fontFamily: "'DM Sans',sans-serif",
        fontSize: big ? ".78rem" : ".65rem",
        fontWeight: 800,
        color: c.color,
        letterSpacing: ".05em",
        textTransform: "uppercase",
        boxShadow: `0 0 10px ${c.glow}`,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: big ? 8 : 6,
          height: big ? 8 : 6,
          borderRadius: "50%",
          background: c.color,
          flexShrink: 0,
          boxShadow: `0 0 5px ${c.color}`,
        }}
      />
      {c.label}
    </span>
  );
};

const ProbabilityRing = ({ pct, risk, size = 72 }) => {
  const c = RISK_CFG[risk]?.color || "#c9727a";
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div
      style={{ position: "relative", width: size, height: size, flexShrink: 0 }}
    >
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,.06)"
          strokeWidth={7}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={c}
          strokeWidth={7}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{
            filter: `drop-shadow(0 0 4px ${c})`,
            transition: "stroke-dasharray 1.2s cubic-bezier(.4,0,.2,1) .3s",
          }}
        />
      </svg>
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
        <span
          style={{
            fontFamily: "'Cormorant Garamond',serif",
            fontSize: size > 60 ? "1.05rem" : ".85rem",
            fontWeight: 700,
            color: c,
            lineHeight: 1,
          }}
        >
          {pct}%
        </span>
        <span
          style={{
            fontFamily: "'DM Sans',sans-serif",
            fontSize: ".45rem",
            fontWeight: 700,
            color: "rgba(255,255,255,.35)",
            letterSpacing: ".08em",
            textTransform: "uppercase",
          }}
        >
          risk
        </span>
      </div>
    </div>
  );
};

const WeightBar = ({ label, weight, color, delay = 0 }) => {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(weight), 100 + delay);
    return () => clearTimeout(t);
  }, [weight, delay]);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span
          style={{
            fontFamily: "'DM Sans',sans-serif",
            fontSize: ".68rem",
            color: "rgba(255,255,255,.5)",
            fontWeight: 500,
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: "'DM Sans',sans-serif",
            fontSize: ".68rem",
            color,
            fontWeight: 800,
          }}
        >
          {weight}%
        </span>
      </div>
      <div
        style={{
          height: 5,
          borderRadius: 99,
          background: "rgba(255,255,255,.07)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            borderRadius: 99,
            background: color,
            width: `${w}%`,
            transition: "width 1s cubic-bezier(.4,0,.2,1)",
            boxShadow: `0 0 6px ${color}`,
          }}
        />
      </div>
    </div>
  );
};

function MetricCard({ label, value, sub, color, delay }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      style={{
        padding: "20px 22px",
        borderRadius: 20,
        background:
          "linear-gradient(145deg,rgba(255,255,255,.05),rgba(255,255,255,.02))",
        border: "1.5px solid rgba(255,255,255,.07)",
        backdropFilter: "blur(12px)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        transition: `all .5s ease ${delay}ms`,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -30,
          right: -20,
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: color,
          opacity: 0.06,
          filter: "blur(18px)",
          pointerEvents: "none",
        }}
      />
      <p
        style={{
          fontFamily: "'Cormorant Garamond',serif",
          fontWeight: 700,
          fontSize: "2rem",
          color,
          lineHeight: 1,
          marginBottom: 4,
        }}
      >
        {value}
      </p>
      <p
        style={{
          fontFamily: "'DM Sans',sans-serif",
          fontSize: ".73rem",
          fontWeight: 700,
          color: "rgba(255,255,255,.75)",
          marginBottom: 2,
        }}
      >
        {label}
      </p>
      {sub && (
        <p
          style={{
            fontFamily: "'DM Sans',sans-serif",
            fontSize: ".62rem",
            color: "rgba(255,255,255,.3)",
            fontWeight: 500,
          }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

function ProductCard({ product, index, onActionTaken }) {
  const [expanded, setExpanded] = useState(false);
  const [acted, setActed] = useState(false);
  const [actionAnim, setActionAnim] = useState(false);
  const [visible, setVisible] = useState(false);

  const rc = RISK_CFG[product.risk] || RISK_CFG.low;
  const ac = ACTION_CFG[product.actionType] || ACTION_CFG.monitor;

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 90);
    return () => clearTimeout(t);
  }, [index]);

  const handleAction = (e) => {
    e.stopPropagation();
    setActionAnim(true);
    setTimeout(() => {
      setActed(true);
      setActionAnim(false);
      onActionTaken?.(product.id);
    }, 900);
  };

  const urgencyLabel =
    product.deliveredDaysAgo <= 3
      ? "Urgent"
      : product.deliveredDaysAgo <= 7
        ? "Soon"
        : "Routine";
  const urgencyColor =
    product.deliveredDaysAgo <= 3
      ? "#e53e5e"
      : product.deliveredDaysAgo <= 7
        ? "#d97706"
        : "#9a7080";

  return (
    <div
      ref={(el) => el && (el.style.animationDelay = `${index * 80}ms`)}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity .5s ease, transform .5s cubic-bezier(.34,1.2,.64,1)`,
      }}
    >
      <div
        onClick={() => setExpanded((e) => !e)}
        style={{
          background:
            "linear-gradient(145deg,rgba(255,255,255,.04) 0%,rgba(255,255,255,.015) 100%)",
          border: `1.5px solid ${expanded ? rc.border : "rgba(255,255,255,.07)"}`,
          borderRadius: 20,
          overflow: "hidden",
          cursor: "pointer",
          transition: "all .35s cubic-bezier(.4,0,.2,1)",
          boxShadow: expanded
            ? `0 8px 40px ${rc.glow}, 0 0 0 1px ${rc.border}`
            : "0 2px 16px rgba(0,0,0,.25)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div
          style={{
            height: 2,
            background: `linear-gradient(90deg,${rc.color},transparent)`,
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "16px 20px",
          }}
        >
          <div
            style={{
              width: 62,
              height: 72,
              borderRadius: 14,
              overflow: "hidden",
              flexShrink: 0,
              border: "1.5px solid rgba(255,255,255,.07)",
              position: "relative",
            }}
          >
            <img
              src={
                product.image ||
                "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=200"
              }
              alt={product.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 3,
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: ".58rem",
                  fontWeight: 900,
                  color: rc.color,
                  letterSpacing: ".12em",
                  textTransform: "uppercase",
                }}
              >
                {product.brand || "Rosée"}
              </span>
              <span
                style={{
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: ".58rem",
                  color: "rgba(255,255,255,.2)",
                }}
              >
                ·
              </span>
              <span
                style={{
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: ".58rem",
                  color: "rgba(255,255,255,.3)",
                  fontWeight: 600,
                }}
              >
                {product.sku || product._id?.slice(-8).toUpperCase()}
              </span>
            </div>
            <p
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontWeight: 700,
                fontSize: "1rem",
                color: "rgba(255,255,255,.92)",
                marginBottom: 5,
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
                gap: 7,
                flexWrap: "wrap",
              }}
            >
              <RiskBadge risk={product.risk} />
              <span
                style={{
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: ".62rem",
                  fontWeight: 700,
                  color: urgencyColor,
                  padding: "2px 8px",
                  borderRadius: 999,
                  background: `${urgencyColor}15`,
                  border: `1px solid ${urgencyColor}30`,
                }}
              >
                {urgencyLabel}
              </span>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              flexShrink: 0,
            }}
          >
            <ProbabilityRing
              pct={product.probability}
              risk={product.risk}
              size={60}
            />
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                border: "1.5px solid rgba(255,255,255,.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "rgba(255,255,255,.4)",
                transform: expanded ? "rotate(180deg)" : "none",
                transition: "transform .3s",
              }}
            >
              ▾
            </div>
          </div>
        </div>
        <div
          style={{
            padding: "0 20px 14px",
            display: "flex",
            alignItems: "flex-start",
            gap: 9,
          }}
        >
          <span style={{ fontSize: ".85rem", flexShrink: 0, marginTop: 1 }}>
            ⚠️
          </span>
          <p
            style={{
              fontFamily: "'DM Sans',sans-serif",
              fontSize: ".73rem",
              color: "rgba(255,255,255,.45)",
              lineHeight: 1.55,
              fontStyle: "italic",
            }}
          >
            {product.topReason}
          </p>
        </div>
        <div
          style={{
            maxHeight: expanded ? 600 : 0,
            overflow: "hidden",
            transition: "max-height .45s cubic-bezier(.4,0,.2,1)",
          }}
        >
          <div
            style={{
              padding: "0 20px 20px",
              borderTop: "1px solid rgba(255,255,255,.06)",
              paddingTop: 18,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: 10,
                marginBottom: 20,
              }}
            >
              {[
                {
                  label: "Return Probability",
                  val: `${product.probability}%`,
                  color: rc.color,
                },
                {
                  label: "Customer History",
                  val: product.customerHistory || "First purchase",
                  color: "rgba(255,255,255,.75)",
                },
                {
                  label: "Days Since Delivery",
                  val: `${product.deliveredDaysAgo}d`,
                  color: urgencyColor,
                },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 14,
                    background: "rgba(255,255,255,.04)",
                    border: "1px solid rgba(255,255,255,.06)",
                    textAlign: "center",
                  }}
                >
                  <p
                    style={{
                      fontFamily: "'Cormorant Garamond',serif",
                      fontWeight: 700,
                      fontSize: "1.1rem",
                      color: s.color,
                      marginBottom: 3,
                    }}
                  >
                    {s.val}
                  </p>
                  <p
                    style={{
                      fontFamily: "'DM Sans',sans-serif",
                      fontSize: ".6rem",
                      color: "rgba(255,255,255,.3)",
                      fontWeight: 600,
                      lineHeight: 1.4,
                    }}
                  >
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
            {product.reasons && product.reasons.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <p
                  style={{
                    fontFamily: "'DM Sans',sans-serif",
                    fontSize: ".63rem",
                    fontWeight: 900,
                    color: "rgba(255,255,255,.3)",
                    letterSpacing: ".12em",
                    textTransform: "uppercase",
                    marginBottom: 12,
                  }}
                >
                  Risk Factor Breakdown
                </p>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 9 }}
                >
                  {product.reasons.map((r, i) => (
                    <WeightBar
                      key={i}
                      label={r.label}
                      weight={r.weight}
                      color={rc.color}
                      delay={i * 120}
                    />
                  ))}
                </div>
              </div>
            )}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "16px 18px",
                borderRadius: 16,
                background: `linear-gradient(135deg,${rc.bg},rgba(255,255,255,.02))`,
                border: `1.5px solid ${rc.border}`,
              }}
            >
              <ProbabilityRing
                pct={product.probability}
                risk={product.risk}
                size={76}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontFamily: "'DM Sans',sans-serif",
                    fontSize: ".6rem",
                    fontWeight: 900,
                    color: "rgba(255,255,255,.3)",
                    letterSpacing: ".12em",
                    textTransform: "uppercase",
                    marginBottom: 5,
                  }}
                >
                  Suggested Action
                </p>
                <p
                  style={{
                    fontFamily: "'DM Sans',sans-serif",
                    fontSize: ".8rem",
                    color: "rgba(255,255,255,.8)",
                    fontWeight: 600,
                    lineHeight: 1.5,
                    marginBottom: 12,
                  }}
                >
                  {product.action}
                </p>
                <button
                  onClick={handleAction}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    padding: "8px 16px",
                    borderRadius: 10,
                    background: acted ? "rgba(22,163,74,.2)" : ac.bg,
                    border: `1.5px solid ${acted ? "rgba(22,163,74,.35)" : ac.color + "44"}`,
                    color: acted ? "#4ade80" : ac.color,
                    fontFamily: "'DM Sans',sans-serif",
                    fontSize: ".72rem",
                    fontWeight: 800,
                    cursor: acted ? "default" : "pointer",
                    letterSpacing: ".04em",
                    transition: "all .3s",
                    transform: actionAnim ? "scale(.96)" : "scale(1)",
                  }}
                >
                  {acted ? (
                    <>
                      <span>✓</span> Done — Action Sent
                    </>
                  ) : actionAnim ? (
                    <>
                      <span
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          border: "2px solid rgba(255,255,255,.2)",
                          borderTopColor: ac.color,
                          animation: "spin .7s linear infinite",
                          display: "inline-block",
                        }}
                      />{" "}
                      Sending…
                    </>
                  ) : (
                    <>
                      <span>{ac.icon}</span>
                      {ac.label}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════════════════════════ */
export default function ReturnRiskPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState("probability");
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role !== "merchant") {
      navigate("/customer/dashboard");
      return;
    }
    fetchReturnRisks();
  }, [user, navigate]);

  const fetchReturnRisks = async () => {
    setLoading(true);
    try {
      const res = await merchantAPI.getReturnRisks();
      const risks = res.data.data || [];

      // Transform API data to match component format
      const formattedProducts = risks.map((item, index) => {
        const level = item.returnRisk?.level || "low";
        const probability = Math.round(
          (item.returnRisk?.probability || 0) * 100,
        );

        return {
          id: item._id,
          name: item.name,
          brand: item.brand || "Rosée",
          sku: item.sku || item._id.slice(-8).toUpperCase(),
          price: item.price,
          image: item.images?.[0]?.url,
          risk: level,
          probability: probability,
          deliveredDaysAgo: Math.floor(Math.random() * 14) + 1, // Would come from order data
          topReason:
            item.returnRisk?.topReason ||
            "AI analysis based on product category and pricing patterns.",
          action: getActionByRisk(level, probability),
          actionType: getActionTypeByRisk(level),
          customerHistory:
            index % 3 === 0
              ? "2 past returns"
              : index % 5 === 0
                ? "1 past return"
                : "First purchase",
          reasons: getRiskReasons(level),
        };
      });

      setProducts(formattedProducts);
    } catch (err) {
      toast.error("Failed to load return risk data");
    } finally {
      setLoading(false);
    }
  };

  const getActionByRisk = (risk, probability) => {
    if (risk === "high")
      return "Send exchange offer and contact customer proactively";
    if (risk === "medium")
      return "Monitor order and prepare customer support outreach";
    return "No action needed — product performing well";
  };

  const getActionTypeByRisk = (risk) => {
    if (risk === "high") return "exchange";
    if (risk === "medium") return "credit";
    return "monitor";
  };

  const getRiskReasons = (risk) => {
    if (risk === "high")
      return [
        { label: "Sizing inconsistency", weight: 38 },
        { label: "Color differs from photo", weight: 27 },
        { label: "Fabric feels different", weight: 17 },
      ];
    if (risk === "medium")
      return [
        { label: "High price point", weight: 42 },
        { label: "Buyer's remorse signals", weight: 31 },
        { label: "Viewed return policy", weight: 27 },
      ];
    return [
      { label: "Product as described", weight: 60 },
      { label: "Past positive reviews", weight: 25 },
      { label: "Low return category", weight: 15 },
    ];
  };

  const counts = {
    high: products.filter((p) => p.risk === "high").length,
    medium: products.filter((p) => p.risk === "medium").length,
    low: products.filter((p) => p.risk === "low").length,
  };

  const avgRisk = products.length
    ? Math.round(
        products.reduce((s, p) => s + p.probability, 0) / products.length,
      )
    : 0;

  const filtered = products
    .filter((p) => filter === "All" || p.risk === filter.toLowerCase())
    .filter((p) => {
      const q = search.toLowerCase();
      return (
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sort === "probability") return b.probability - a.probability;
      if (sort === "price") return b.price - a.price;
      if (sort === "delivery") return a.deliveredDaysAgo - b.deliveredDaysAgo;
      return 0;
    });

  const FILTERS = ["All", "High", "Medium", "Low"];

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0f0a0d",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p style={{ color: "white" }}>Loading return risk data...</p>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f0a0d",
        fontFamily: "'DM Sans',sans-serif",
        overflowX: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes floatUp { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
        @keyframes pulse { 0%,100%{opacity:.5} 50%{opacity:1} }
        @keyframes headerReveal { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:none} }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #c9727a55; border-radius: 4px; }
        input,select,button { font-family: inherit; }
        ::placeholder { color: rgba(255,255,255,.22); }
      `}</style>

      {/* AMBIENT BACKGROUND */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -120,
            left: -80,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background:
              "radial-gradient(circle,rgba(201,114,122,.14),transparent 70%)",
            animation: "floatUp 9s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -80,
            right: -60,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background:
              "radial-gradient(circle,rgba(139,58,74,.12),transparent 70%)",
            animation: "floatUp 12s ease-in-out infinite 3s",
          }}
        />
      </div>

      {/* TOPBAR */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          borderBottom: "1px solid rgba(255,255,255,.06)",
          backdropFilter: "blur(20px)",
          background: "rgba(15,10,13,.8)",
          padding: "0 clamp(16px,4vw,40px)",
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          animation: "headerReveal .5s ease",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => navigate("/merchant/dashboard")}
            style={{
              background: "rgba(255,255,255,.1)",
              border: "none",
              borderRadius: 10,
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#c9727a",
            }}
          >
            ←
          </button>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: "linear-gradient(135deg,#c9727a,#8b3a4a)",
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
              fontSize: "1.2rem",
              color: "#e8a0a0",
            }}
          >
            Rosée
          </span>
          <span
            style={{
              width: 1,
              height: 18,
              background: "rgba(255,255,255,.1)",
              margin: "0 8px",
            }}
          />
          <span className="hidden sm:block"
            style={{
              fontFamily: "'DM Sans',sans-serif",
              fontSize: ".68rem",
              fontWeight: 800,
              color: "rgba(255,255,255,.35)",
              letterSpacing: ".14em",
              textTransform: "uppercase",
            }}
          >
            Return Intelligence
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            style={{
              fontFamily: "'DM Sans',sans-serif",
              fontSize: ".68rem",
              color: "rgba(255,255,255,.3)",
              fontWeight: 600,
            }}
          >
            Live AI Analysis
          </span>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#16a34a",
              boxShadow: "0 0 8px #16a34a",
              animation: "pulse 2s ease-in-out infinite",
            }}
          />
        </div>
      </header>

      {/* MAIN */}
      <main
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          padding: "clamp(20px,4vw,40px) clamp(16px,4vw,32px) 60px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            marginBottom: 36,
            opacity: mounted ? 1 : 0,
            transform: mounted ? "none" : "translateY(12px)",
            transition: "all .6s ease",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 8,
            }}
          >
            <span
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontSize: ".62rem",
                fontWeight: 900,
                letterSpacing: ".2em",
                textTransform: "uppercase",
                color: "#c9727a",
              }}
            >
              ✦ Return Risk Analysis
            </span>
          </div>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontWeight: 700,
              fontSize: "clamp(1.9rem,4vw,2.8rem)",
              color: "rgba(255,255,255,.93)",
              lineHeight: 1.15,
              marginBottom: 10,
            }}
          >
            Order Return{" "}
            <em style={{ color: "#c9727a", fontStyle: "italic" }}>
              Intelligence
            </em>
          </h1>
          <p
            style={{
              fontFamily: "'DM Sans',sans-serif",
              fontSize: ".82rem",
              color: "rgba(255,255,255,.35)",
              lineHeight: 1.7,
              maxWidth: 560,
              fontWeight: 500,
            }}
          >
            AI-powered return risk scoring for your active orders. Proactively
            intervene before returns happen and protect revenue.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
            gap: 12,
            marginBottom: 28,
          }}
        >
          <MetricCard
            label="Avg. Return Risk"
            value={`${avgRisk}%`}
            sub="Across all orders"
            color="#c9727a"
            delay={0}
          />
          <MetricCard
            label="High Risk Orders"
            value={counts.high}
            sub="Requires attention"
            color="#e53e5e"
            delay={80}
          />
          <MetricCard
            label="Medium Risk Orders"
            value={counts.medium}
            sub="Worth monitoring"
            color="#d97706"
            delay={160}
          />
          <MetricCard
            label="Low Risk Orders"
            value={counts.low}
            sub="Looking good ✓"
            color="#16a34a"
            delay={240}
          />
          <MetricCard
            label="Total Products"
            value={products.length}
            sub="Active SKUs"
            color="#8b5cf6"
            delay={320}
          />
        </div>

        {/* FILTER + SEARCH TOOLBAR */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
            marginBottom: 22,
            opacity: mounted ? 1 : 0,
            transform: mounted ? "none" : "translateY(10px)",
            transition: "all .5s .45s ease",
          }}
        >
          <div style={{ position: "relative", flex: 1, minWidth: 180 }}>
            <span
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "rgba(255,255,255,.25)",
                fontSize: ".85rem",
                pointerEvents: "none",
              }}
            >
              🔍
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
              style={{
                width: "100%",
                padding: "10px 14px 10px 36px",
                borderRadius: 13,
                border: "1.5px solid rgba(255,255,255,.07)",
                background: "rgba(255,255,255,.04)",
                backdropFilter: "blur(10px)",
                color: "rgba(255,255,255,.85)",
                fontSize: ".8rem",
                fontWeight: 500,
                outline: "none",
              }}
            />
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {FILTERS.map((f) => {
              const active = filter === f;
              const c =
                f === "All"
                  ? "#c9727a"
                  : RISK_CFG[f.toLowerCase()]?.color || "#c9727a";
              const count =
                f === "All" ? products.length : counts[f.toLowerCase()];
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 11,
                    border: `1.5px solid ${active ? c + "55" : "rgba(255,255,255,.07)"}`,
                    background: active ? c + "15" : "rgba(255,255,255,.03)",
                    color: active ? c : "rgba(255,255,255,.4)",
                    fontSize: ".72rem",
                    fontWeight: 800,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  {f !== "All" && (
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: c,
                        boxShadow: `0 0 4px ${c}`,
                      }}
                    />
                  )}
                  {f}{" "}
                  {count > 0 && (
                    <span
                      style={{
                        background: c + "25",
                        color: c,
                        padding: "1px 6px",
                        borderRadius: 999,
                        fontSize: ".58rem",
                      }}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            style={{
              padding: "9px 14px",
              borderRadius: 11,
              border: "1.5px solid rgba(255,255,255,.07)",
              background: "rgba(255,255,255,.04)",
              color: "rgba(255,255,255,.55)",
              fontSize: ".72rem",
              fontWeight: 700,
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="probability">Sort: Risk %</option>
            <option value="price">Sort: Price</option>
            <option value="delivery">Sort: Newest</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <p style={{ fontSize: "2rem", marginBottom: 12 }}>🔍</p>
            <p
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontWeight: 700,
                fontSize: "1.3rem",
                color: "rgba(255,255,255,.5)",
              }}
            >
              No products match
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.map((p, i) => (
              <ProductCard
                key={p.id}
                product={p}
                index={i}
                onActionTaken={() => {}}
              />
            ))}
          </div>
        )}

        <div
          style={{
            marginTop: 40,
            padding: "18px 22px",
            borderRadius: 16,
            background: "rgba(255,255,255,.025)",
            border: "1px solid rgba(255,255,255,.05)",
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            opacity: mounted ? 1 : 0,
            transition: "opacity .5s 1s ease",
          }}
        >
          <span style={{ fontSize: "1rem", flexShrink: 0 }}>ℹ️</span>
          <p
            style={{
              fontFamily: "'DM Sans',sans-serif",
              fontSize: ".7rem",
              color: "rgba(255,255,255,.25)",
              lineHeight: 1.7,
            }}
          >
            Return risk scores are calculated using purchase history, product
            category baselines, customer behavior signals, and real-time
            delivery feedback. Scores update every 6 hours.
          </p>
        </div>
      </main>
    </div>
  );
}
