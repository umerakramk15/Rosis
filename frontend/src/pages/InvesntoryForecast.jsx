import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import useAuthStore from "../store/authStore";
import { merchantAPI, productAPI } from "../api/index";
import { toast } from "react-toastify";

/* ═══ TOKENS ═══ */
const C = {
  rose: "#c9727a",
  roseLt: "#e8a0a0",
  roseXs: "#fde8e8",
  roseDk: "#8b3a4a",
  ink: "#1e1018",
  cream: "#faf7f4",
  gold: "#c8a04a",
  success: "#16a34a",
  warn: "#d97706",
  danger: "#dc2626",
  border: "#f0d5d8",
};

/* ═══ ICONS ═══ */
const Ic = ({ d, size = 16, sw = 2, c = "currentColor", fill = "none" }) => (
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

const IC = {
  chevL: "M15 19l-7-7 7-7",
  refresh:
    "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
  alert:
    "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
  box: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  trend: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
};

/* ═══ SKELETON ═══ */
const Sk = ({ h = 60, r = 12 }) => (
  <div
    style={{
      height: h,
      borderRadius: r,
      background: "linear-gradient(90deg,#fde8e8 25%,#fdf0f0 50%,#fde8e8 75%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.5s infinite",
    }}
  />
);

/* ═══ STOCK STATUS ═══ */
function getStockStatus(stock, forecast) {
  const totalForecast = Array.isArray(forecast)
    ? forecast.reduce((sum, d) => sum + (d.predicted_units || 0), 0)
    : 0;
  if (stock === 0)
    return {
      label: "Out of Stock",
      color: C.danger,
      bg: "#fee2e2",
      border: "#fca5a5",
    };
  if (stock < 10)
    return {
      label: "Critical",
      color: C.danger,
      bg: "#fee2e2",
      border: "#fca5a5",
    };
  if (totalForecast > stock)
    return {
      label: "Reorder Soon",
      color: C.warn,
      bg: "#fef3c7",
      border: "#fde68a",
    };
  if (stock < 20)
    return {
      label: "Low Stock",
      color: C.warn,
      bg: "#fef3c7",
      border: "#fde68a",
    };
  return {
    label: "In Stock",
    color: C.success,
    bg: "#dcfce7",
    border: "#a7f3d0",
  };
}

/* ═══ CUSTOM TOOLTIP ═══ */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "white",
        border: "1.5px solid #f0d5d8",
        borderRadius: 14,
        padding: "12px 16px",
        boxShadow: "0 8px 24px rgba(140,40,60,.12)",
        fontFamily: "'DM Sans',sans-serif",
      }}
    >
      <p
        style={{
          fontSize: ".72rem",
          fontWeight: 800,
          color: "#9a7080",
          marginBottom: 6,
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
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: p.color,
              flexShrink: 0,
            }}
          />
          <span
            style={{ fontSize: ".78rem", color: "#1e1018", fontWeight: 700 }}
          >
            {p.name}: {p.value} units
          </span>
        </div>
      ))}
    </div>
  );
};

/* ═══ PRODUCT FORECAST CARD ═══ */
function ForecastCard({ product, forecast, loading, onRefresh }) {
  const [days, setDays] = useState(7);
  const [refreshingLocal, setRefreshingLocal] = useState(false);

  const chartData = Array.isArray(forecast)
    ? forecast.slice(0, days).map((d, i) => ({
        day: `Day ${i + 1}`,
        "Predicted Demand": d.predicted_units || 0,
        "Current Stock": i === 0 ? product.stock : null,
      }))
    : [];

  const totalDemand = chartData.reduce(
    (s, d) => s + (d["Predicted Demand"] || 0),
    0,
  );
  const status = getStockStatus(product.stock, forecast);
  const needsReorder = totalDemand > product.stock;
  const hasForecast = forecast && forecast.length > 0;

  const handleLocalRefresh = async () => {
    setRefreshingLocal(true);
    try {
      await onRefresh(product._id);
    } finally {
      setRefreshingLocal(false);
    }
  };

  // Get first image URL
  const productImage = product.images?.[0]?.url || product.image || null;

  return (
    <div
      style={{
        background: "white",
        border: `2px solid ${needsReorder ? "#fde68a" : C.border}`,
        borderRadius: 22,
        overflow: "hidden",
        boxShadow: needsReorder
          ? "0 4px 20px rgba(217,119,6,.1)"
          : "0 2px 12px rgba(140,40,60,.06)",
      }}
    >
      {/* Card header */}
      <div
        style={{
          padding: "16px 20px",
          borderBottom: `1.5px solid ${C.border}`,
          background: "linear-gradient(90deg,#fdf8f8,white)",
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <div
          style={{
            width: 48,
            height: 52,
            borderRadius: 12,
            overflow: "hidden",
            background: C.roseXs,
            flexShrink: 0,
            border: `1px solid ${C.border}`,
          }}
        >
          {productImage ? (
            <img
              src={productImage}
              alt={product.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ic d={IC.box} size={18} c={C.roseLt} sw={1.5} />
            </div>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <h3
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontWeight: 700,
                fontSize: "1rem",
                color: C.ink,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {product.name}
            </h3>
            <span
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontSize: ".62rem",
                fontWeight: 800,
                background: status.bg,
                color: status.color,
                border: `1px solid ${status.border}`,
                padding: "2px 9px",
                borderRadius: 999,
                flexShrink: 0,
              }}
            >
              {status.label}
            </span>
          </div>
          <p
            style={{
              fontFamily: "'DM Sans',sans-serif",
              fontSize: ".72rem",
              color: "#9a7080",
              marginTop: 2,
              textTransform: "capitalize",
            }}
          >
            {product.category}
          </p>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <p
            style={{
              fontFamily: "'DM Sans',sans-serif",
              fontSize: ".65rem",
              fontWeight: 700,
              color: "#9a7080",
            }}
          >
            CURRENT STOCK
          </p>
          <p
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontWeight: 700,
              fontSize: "1.4rem",
              color: product.stock < 10 ? C.danger : C.ink,
            }}
          >
            {product.stock}
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div
        style={{
          padding: "12px 20px",
          display: "flex",
          gap: 16,
          borderBottom: `1px solid ${C.border}`,
          flexWrap: "wrap",
        }}
      >
        {[
          {
            label: `${days}-Day Demand`,
            val: hasForecast ? `${totalDemand} units` : "—",
            color: hasForecast ? C.rose : "#9a7080",
          },
          {
            label: "Stock Gap",
            val: !hasForecast
              ? "Run forecast"
              : needsReorder
                ? `${totalDemand - product.stock} units short`
                : "Sufficient",
            color: !hasForecast ? C.warn : needsReorder ? C.warn : C.success,
          },
          {
            label: "Price",
            val: `Rs. ${product.price?.toLocaleString() || 0}`,
            color: C.ink,
          },
        ].map((s) => (
          <div key={s.label} style={{ flex: "1 1 100px" }}>
            <p
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontSize: ".65rem",
                fontWeight: 700,
                color: "#9a7080",
                letterSpacing: ".04em",
              }}
            >
              {s.label}
            </p>
            <p
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontWeight: 800,
                fontSize: ".85rem",
                color: s.color,
                marginTop: 2,
              }}
            >
              {s.val}
            </p>
          </div>
        ))}
      </div>

      {/* Day toggle + Refresh button */}
      <div
        style={{
          padding: "12px 20px 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <p
          style={{
            fontFamily: "'DM Sans',sans-serif",
            fontSize: ".7rem",
            fontWeight: 800,
            color: "#9a7080",
            letterSpacing: ".04em",
          }}
        >
          FORECAST CHART
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={handleLocalRefresh}
            disabled={refreshingLocal}
            style={{
              padding: "4px 10px",
              borderRadius: 8,
              border: `1.5px solid ${C.border}`,
              background: "white",
              color: C.rose,
              fontFamily: "'DM Sans',sans-serif",
              fontSize: ".68rem",
              fontWeight: 800,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            {refreshingLocal ? (
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  border: "2px solid #fde8e8",
                  borderTopColor: C.rose,
                  animation: "spin .7s linear infinite",
                }}
              />
            ) : (
              "⟳"
            )}
            Refresh
          </button>
          <div style={{ display: "flex", gap: 4 }}>
            {[7, 14, 30].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                style={{
                  padding: "4px 10px",
                  borderRadius: 8,
                  border: `1.5px solid ${days === d ? C.rose : C.border}`,
                  background:
                    days === d
                      ? "linear-gradient(135deg,#c9727a,#e8a0a0)"
                      : "white",
                  color: days === d ? "white" : "#9a7080",
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: ".68rem",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div style={{ padding: "8px 20px 20px" }}>
        {loading ? (
          <Sk h={160} r={10} />
        ) : !hasForecast ? (
          <div
            style={{
              height: 160,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background: "#fdf8f8",
              borderRadius: 12,
              gap: 8,
            }}
          >
            <Ic d={IC.alert} size={24} c={C.warn} sw={1.5} />
            <p
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontSize: ".72rem",
                color: "#9a7080",
              }}
            >
              No forecast available. Click Refresh to generate.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={160}>
            <BarChart
              data={chartData}
              margin={{ top: 8, right: 0, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#fde8e8"
                vertical={false}
              />
              <XAxis
                dataKey="day"
                tick={{
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: 10,
                  fill: "#b09090",
                }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: 10,
                  fill: "#b09090",
                }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: "0.72rem",
                  paddingTop: 8,
                }}
              />
              <Bar
                dataKey="Predicted Demand"
                fill={C.rose}
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Reorder alert */}
      {hasForecast && needsReorder && (
        <div
          style={{
            margin: "0 20px 20px",
            padding: "12px 14px",
            background: "linear-gradient(135deg,#fef3c7,#fffbeb)",
            border: "1.5px solid #fde68a",
            borderRadius: 14,
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
          }}
        >
          <Ic d={IC.alert} size={16} c={C.warn} sw={2} />
          <div>
            <p
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontSize: ".78rem",
                fontWeight: 800,
                color: C.warn,
              }}
            >
              Reorder Recommended
            </p>
            <p
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontSize: ".72rem",
                color: "#a16207",
                marginTop: 2,
              }}
            >
              Predicted demand of {totalDemand} units exceeds current stock of{" "}
              {product.stock} units over {days} days.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══ MAIN PAGE ═══ */
export default function InventoryForecastPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [products, setProducts] = useState([]);
  const [forecasts, setForecasts] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  // Redirect if not merchant
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role !== "merchant") {
      navigate("/customer/dashboard");
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // getAllForecasts now returns full product details including price and category
      const res = await merchantAPI.getAllForecasts();
      const data = res.data.data || [];

      // No need for separate productAPI call - data already has everything
      const productsList = data.map((item) => ({
        _id: item.productId,
        name: item.name,
        price: item.price || 0, // ← Now has real price
        stock: item.currentStock,
        category: item.category || "product", // ← Now has real category
        images: item.image ? [{ url: item.image }] : [],
      }));

      const forecastMap = {};
      data.forEach((d) => {
        forecastMap[d.productId] = d.forecast;
      });

      setProducts(productsList);
      setForecasts(forecastMap);
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to load forecast data");
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshProduct = async (productId) => {
    try {
      await merchantAPI.refreshForecast(productId, 7);
      toast.success("Forecast refreshed!");
      await fetchData();
    } catch (err) {
      toast.error("Failed to refresh forecast");
    }
  };

  const handleRefreshAll = async () => {
    setRefreshing(true);
    try {
      await merchantAPI.refreshAllForecasts();
      toast.success("All forecasts refreshed!");
      await fetchData();
    } catch (err) {
      toast.error("Failed to refresh forecasts");
    } finally {
      setRefreshing(false);
    }
  };

  const filtered = products.filter(
    (p) => !search || p.name?.toLowerCase().includes(search.toLowerCase()),
  );

  const needsReorderCount = products.filter((p) => {
    const fc = forecasts[p._id];
    const total = Array.isArray(fc)
      ? fc.reduce((s, d) => s + (d.predicted_units || 0), 0)
      : 0;
    return total > p.stock;
  }).length;

  const criticalCount = products.filter((p) => p.stock < 10).length;
  const healthyCount = products.filter((p) => p.stock >= 20).length;

  return (
    <div style={{ minHeight: "100vh", background: C.cream }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-thumb{background:#e8a0a0;border-radius:4px;}
        img{display:block;}
      `}</style>

      {/* HEADER */}
      <div
        style={{
          background: "white",
          borderBottom: `1.5px solid ${C.border}`,
          padding: "16px clamp(16px,4vw,32px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 100,
          boxShadow: "0 2px 16px rgba(140,40,60,.06)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button
            onClick={() => navigate("/merchant/dashboard")}
            style={{
              background: C.roseXs,
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
            <Ic d={IC.chevL} size={16} c={C.rose} sw={2.5} />
          </button>
          <div>
            <h1
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontWeight: 700,
                fontSize: "clamp(1.2rem,3vw,1.6rem)",
                color: C.ink,
              }}
            >
              Inventory Forecast
            </h1>
            <p
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontSize: ".72rem",
                color: "#9a7080",
              }}
            >
              {products.length} products · {needsReorderCount} need reorder
            </p>
          </div>
        </div>
        <button
          onClick={handleRefreshAll}
          disabled={refreshing}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "9px 16px",
            borderRadius: 12,
            border: `1.5px solid ${C.border}`,
            background: "white",
            color: C.rose,
            fontFamily: "'DM Sans',sans-serif",
            fontSize: ".78rem",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {refreshing ? (
            <div
              style={{
                width: 13,
                height: 13,
                borderRadius: "50%",
                border: "2px solid #fde8e8",
                borderTopColor: C.rose,
                animation: "spin .7s linear infinite",
              }}
            />
          ) : (
            <Ic d={IC.refresh} size={14} c={C.rose} sw={2} />
          )}
          Refresh All
        </button>
      </div>

      {/* KPI SUMMARY */}
      <div
        style={{
          padding: "16px clamp(16px,4vw,32px)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
          gap: 14,
        }}
      >
        {[
          {
            label: "Total Products",
            val: products.length,
            color: C.rose,
            bg: "#fde8e8",
          },
          {
            label: "Need Reorder",
            val: needsReorderCount,
            color: C.warn,
            bg: "#fef3c7",
          },
          {
            label: "Critical Stock",
            val: criticalCount,
            color: C.danger,
            bg: "#fee2e2",
          },
          {
            label: "Healthy Stock",
            val: healthyCount,
            color: C.success,
            bg: "#dcfce7",
          },
        ].map((s, i) => (
          <div
            key={i}
            style={{
              background: "white",
              border: `1.5px solid ${C.border}`,
              borderRadius: 18,
              padding: "16px 20px",
              animation: `fadeUp .3s ${i * 0.06}s ease both`,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: s.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 10,
              }}
            >
              <Ic d={IC.box} size={16} c={s.color} sw={2} />
            </div>
            <p
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontWeight: 700,
                fontSize: "1.6rem",
                color: C.ink,
                lineHeight: 1,
              }}
            >
              {s.val}
            </p>
            <p
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontSize: ".72rem",
                color: "#9a7080",
                marginTop: 4,
              }}
            >
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* SEARCH */}
      <div style={{ padding: "0 clamp(16px,4vw,32px) 16px" }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products…"
          style={{
            padding: "10px 16px",
            borderRadius: 14,
            border: `1.5px solid ${C.border}`,
            fontFamily: "'DM Sans',sans-serif",
            fontSize: ".83rem",
            color: C.ink,
            background: "white",
            outline: "none",
            width: "100%",
            maxWidth: 380,
            boxShadow: "0 2px 8px rgba(140,40,60,.05)",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = C.rose;
            e.target.style.boxShadow = "0 0 0 3px rgba(201,114,122,.1)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = C.border;
            e.target.style.boxShadow = "0 2px 8px rgba(140,40,60,.05)";
          }}
        />
      </div>

      {/* FORECAST CARDS */}
      <div
        style={{
          padding: "0 clamp(16px,4vw,32px) 32px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(520px,1fr))",
          gap: 20,
        }}
      >
        {loading ? (
          Array(4)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                style={{
                  background: "white",
                  borderRadius: 22,
                  overflow: "hidden",
                  border: `1.5px solid ${C.border}`,
                  animation: `fadeUp .3s ${i * 0.06}s ease both`,
                }}
              >
                <div
                  style={{
                    padding: "16px 20px",
                    borderBottom: `1px solid ${C.border}`,
                    display: "flex",
                    gap: 14,
                  }}
                >
                  <Sk h={52} r={10} />
                </div>
                <div
                  style={{
                    padding: "16px 20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                  }}
                >
                  <Sk h={20} r={8} />
                  <Sk h={160} r={10} />
                </div>
              </div>
            ))
        ) : filtered.length === 0 ? (
          <div
            style={{
              gridColumn: "1/-1",
              textAlign: "center",
              padding: "60px 0",
            }}
          >
            <p
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontWeight: 700,
                fontSize: "1.3rem",
                color: C.rose,
                marginBottom: 8,
              }}
            >
              No products found
            </p>
            <p
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontSize: ".82rem",
                color: "#9a7080",
              }}
            >
              {products.length === 0
                ? "No forecast data available yet. Add products first."
                : "Try a different search."}
            </p>
          </div>
        ) : (
          filtered.map((product, i) => (
            <div
              key={product._id}
              style={{ animation: `fadeUp .35s ${i * 0.06}s ease both` }}
            >
              <ForecastCard
                product={product}
                forecast={forecasts[product._id] || []}
                loading={false}
                onRefresh={handleRefreshProduct}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
