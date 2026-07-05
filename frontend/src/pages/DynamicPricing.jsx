import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { merchantAPI, productAPI } from "../api/index";
import { toast } from "react-toastify";

/* ══════════════════════════════════════════════════
   BRAND TOKENS (same as your design)
══════════════════════════════════════════════════ */
const T = {
  rose:    "#c9727a",
  roseLt:  "#e8a0a0",
  roseXs:  "#fde8e8",
  roseDk:  "#8b3a4a",
  plum:    "#2d1a22",
  ink:     "#1e1018",
  cream:   "#faf7f4",
  creamLt: "#fdf8f5",
  gold:    "#c8a04a",
  goldLt:  "#f5e6c8",
  text:    "#3d2030",
  muted:   "#9a7080",
  border:  "#f0d5d8",
  green:   "#16a34a",
  greenBg: "#f0fdf4",
  greenBd: "#bbf7d0",
  red:     "#dc2626",
  redBg:   "#fef2f2",
  redBd:   "#fecaca",
  amber:   "#d97706",
  amberBg: "#fffbeb",
  amberBd: "#fde68a",
};

const CATEGORIES = ["All", "Dresses", "Tops", "Bags", "Shoes", "Jewellery", "Accessories"];

const fmt = (n) => `Rs. ${Number(n).toLocaleString()}`;
const pct = (a, b) => b ? (((a - b) / b) * 100).toFixed(1) : "0";

/* ══════════════════════════════════════════════════
   ICONS (same as your design)
══════════════════════════════════════════════════ */
const PATH = {
  check:     "M5 13l4 4L19 7",
  x:         "M6 18L18 6M6 6l12 12",
  chevD:     "M19 9l-7 7-7-7",
  chevU:     "M5 15l7-7 7 7",
  chevR:     "M9 5l7 7-7 7",
  spark:     "M13 10V3L4 14h7v7l9-11h-7z",
  info:      "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  trend:     "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
  trendD:    "M13 17H5m0 0V9m0 8l8-8 4 4 6-6",
  refresh:   "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
  filter:    "M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z",
  search:    "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  sort:      "M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4",
  eye:       "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
  tag:       "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z",
  dollar:    "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  brain:     "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
  bars:      "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  undo:      "M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6",
  approve:   "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  reject:    "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z",
};

const Ic = ({ d, size=16, sw=2, c="currentColor", fill="none" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
    stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <path d={d}/>
  </svg>
);

/* ══════════════════════════════════════════════════
   COMPONENTS (same as your design)
══════════════════════════════════════════════════ */
function ConfRing({ pct: p, size=38 }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const col = p >= 85 ? T.green : p >= 70 ? T.gold : T.amber;
  return (
    <svg width={size} height={size} style={{ transform:"rotate(-90deg)", flexShrink:0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={T.border} strokeWidth={3}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth={3}
        strokeDasharray={circ} strokeDashoffset={circ * (1 - p/100)}
        strokeLinecap="round" style={{ transition:"stroke-dashoffset .8s ease" }}/>
      <text x={size/2} y={size/2+1} textAnchor="middle" dominantBaseline="middle"
        style={{ fill:col, fontSize:"9px", fontWeight:800, fontFamily:"'DM Sans',sans-serif", transform:"rotate(90deg)", transformOrigin:`${size/2}px ${size/2}px` }}>
        {p}%
      </text>
    </svg>
  );
}

function Sparkline({ trend }) {
  const UP   = [[0,28],[8,22],[16,26],[24,18],[32,20],[40,12],[48,15],[56,8]];
  const DOWN = [[0,8],[8,14],[16,10],[24,16],[32,14],[40,20],[48,18],[56,28]];
  const FLAT = [[0,14],[8,16],[16,14],[24,18],[32,14],[40,16],[48,15],[56,16]];
  const pts  = trend==="up"?UP:trend==="down"?DOWN:FLAT;
  const col  = trend==="up"?T.green:trend==="down"?T.red:T.muted;
  const d    = pts.map((p,i)=>`${i===0?"M":"L"}${p[0]},${p[1]}`).join(" ");
  return (
    <svg width={58} height={36} viewBox="0 0 58 36" fill="none">
      <defs>
        <linearGradient id={`sg-${trend}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={col} stopOpacity=".25"/>
          <stop offset="100%" stopColor={col} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={d+" L56,36 L0,36 Z"} fill={`url(#sg-${trend})`}/>
      <path d={d} stroke={col} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  );
}

function Tooltip({ children, content, width=300 }) {
  const [vis, setVis] = useState(false);
  const [pos, setPos] = useState({ top:0, left:0 });
  const ref = useRef(null);

  const show = useCallback(() => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setPos({ top: r.bottom + window.scrollY + 8, left: Math.max(8, r.left + window.scrollX - width/2 + r.width/2) });
    setVis(true);
  }, [width]);

  return (
    <span ref={ref} onMouseEnter={show} onMouseLeave={()=>setVis(false)} style={{ position:"relative", display:"inline-flex" }}>
      {children}
      {vis && (
        <span style={{
          position:"fixed", top:pos.top, left:Math.min(pos.left, window.innerWidth - width - 12),
          zIndex:9999, width:width, background:T.plum,
          borderRadius:14, padding:"14px 16px",
          boxShadow:"0 16px 48px rgba(30,16,20,.45), 0 0 0 1px rgba(255,255,255,.06)",
          animation:"tipIn .18s ease",
          pointerEvents:"none",
        }}>
          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:".72rem", lineHeight:1.7, color:"rgba(255,255,255,.88)", margin:0 }}>
            {content}
          </p>
        </span>
      )}
    </span>
  );
}

function Badge({ label }) {
  const map = {
    bestseller: { bg:"#fde8e8", color:T.roseDk,  border:"#f0c8c8", text:"Bestseller" },
    trending:   { bg:T.amberBg, color:T.amber,    border:T.amberBd, text:"Trending ↑" },
    "low-stock":{ bg:"#fef2f2", color:T.red,      border:T.redBd,   text:"Low Stock"  },
    new:        { bg:"#f0fdf4", color:T.green,    border:T.greenBd, text:"New"        },
    seasonal:   { bg:"#eff6ff", color:"#2563eb",  border:"#bfdbfe", text:"Seasonal"   },
    sale:       { bg:T.amberBg, color:T.amber,    border:T.amberBd, text:"Sale"       },
  };
  const s = map[label] || { bg:"#f3f4f6", color:"#6b7280", border:"#e5e7eb", text:label };
  return (
    <span style={{
      fontFamily:"'DM Sans',sans-serif", fontSize:".58rem", fontWeight:800,
      letterSpacing:".07em", textTransform:"uppercase",
      background:s.bg, color:s.color, border:`1px solid ${s.border}`,
      padding:"2px 7px", borderRadius:999, flexShrink:0,
    }}>{s.text}</span>
  );
}

function DeltaChip({ delta }) {
  if (delta === 0) return <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:".72rem", fontWeight:700, color:T.muted }}>—</span>;
  const up = delta > 0;
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:3,
      fontFamily:"'DM Sans',sans-serif", fontSize:".72rem", fontWeight:800,
      color: up ? T.green : T.red,
      background: up ? T.greenBg : T.redBg,
      border:`1px solid ${up ? T.greenBd : T.redBd}`,
      padding:"2px 8px", borderRadius:999,
    }}>
      {up ? "▲" : "▼"} {up?"+":""}{delta}
    </span>
  );
}

function StatusPill({ status }) {
  const map = {
    pending:  { bg:"#fffbeb", color:T.amber,  border:T.amberBd, label:"Pending"   },
    approved: { bg:T.greenBg, color:T.green,  border:T.greenBd, label:"Approved"  },
    rejected: { bg:T.redBg,   color:T.red,    border:T.redBd,   label:"Rejected"  },
  };
  const s = map[status] || map.pending;
  return (
    <span style={{
      fontFamily:"'DM Sans',sans-serif", fontSize:".65rem", fontWeight:800,
      letterSpacing:".07em", textTransform:"uppercase",
      background:s.bg, color:s.color, border:`1.5px solid ${s.border}`,
      padding:"3px 10px", borderRadius:999,
    }}>{s.label}</span>
  );
}

function StatCard({ icon, label, value, sub, accent, glow }) {
  return (
    <div style={{
      background:"white", border:`1.5px solid ${T.border}`, borderRadius:20,
      padding:"20px 22px", display:"flex", flexDirection:"column", gap:10,
      boxShadow:`0 4px 20px rgba(140,40,60,.06)${glow?`, 0 0 0 2px ${T.roseLt}20`:""}`,
      transition:"transform .22s, box-shadow .22s",
      cursor:"default",
      position:"relative", overflow:"hidden",
    }}
    onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow=`0 12px 32px rgba(140,40,60,.12)`;}}
    onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow=`0 4px 20px rgba(140,40,60,.06)`;}}>
      <div style={{ position:"absolute", top:-20, right:-20, width:80, height:80, borderRadius:"50%", background:`${accent}12`, pointerEvents:"none" }}/>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:".72rem", fontWeight:800, color:T.muted, letterSpacing:".07em", textTransform:"uppercase" }}>{label}</span>
        <span style={{ color:accent, opacity:.85 }}><Ic d={icon} size={18} c={accent} sw={2}/></span>
      </div>
      <p style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:"1.65rem", color:T.ink, lineHeight:1 }}>{value}</p>
      {sub && <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:".72rem", color:T.muted, fontWeight:500 }}>{sub}</p>}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   MAIN PAGE WITH API INTEGRATION
══════════════════════════════════════════════════ */
export default function DynamicPricingPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [statusF, setStatusF] = useState("All");
  const [sortBy, setSortBy] = useState("default");
  const [sortDir, setSortDir] = useState(1);
  const [expanded, setExpanded] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const [bulkSel, setBulkSel] = useState(new Set());
  const [aiRunning, setAiRunning] = useState(false);
  const [aiTarget, setAiTarget] = useState(null);
  const [viewMode, setViewMode] = useState("table");
  const [hlRow, setHlRow] = useState(null);

  // Fetch products from API
  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    if (user.role !== "merchant") { navigate("/customer/dashboard"); return; }
    fetchProducts();
  }, [user, navigate]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await productAPI.getMyProducts({ limit: 100 });
      const productsData = res.data.data.products || [];
      
      // For each product, fetch AI pricing suggestion
      const productsWithPricing = await Promise.all(
        productsData.map(async (product) => {
          try {
            const pricingRes = await merchantAPI.getPricing(product._id);
            const pricing = pricingRes.data.data;
            return {
              id: product._id,
              name: product.name,
              brand: product.brand || "Rosée",
              sku: product.sku || product._id.slice(-8).toUpperCase(),
              price: product.price,
              compPrice: pricing.competitorPrice || product.price,
              aiPrice: pricing.suggestedPrice || product.price,
              confidence: 85, // Default confidence
              status: "pending",
              trend: pricing.suggestedPrice > product.price ? "up" : pricing.suggestedPrice < product.price ? "down" : "flat",
              aiDelta: Math.abs(pricing.suggestedPrice - product.price),
              reasoning: pricing.reasoning || "AI analysis based on competitor pricing and demand patterns.",
              image: product.images?.[0]?.url,
              category: product.category,
              stock: product.stock,
              sales30d: 0, // Would need sales history API
              badges: product.tags || [],
            };
          } catch {
            return {
              id: product._id,
              name: product.name,
              brand: product.brand || "Rosée",
              sku: product.sku || product._id.slice(-8).toUpperCase(),
              price: product.price,
              compPrice: product.price,
              aiPrice: product.price,
              confidence: 70,
              status: "pending",
              trend: "flat",
              aiDelta: 0,
              reasoning: "Insufficient data for AI pricing recommendation.",
              image: product.images?.[0]?.url,
              category: product.category,
              stock: product.stock,
              sales30d: 0,
              badges: product.tags || [],
            };
          }
        })
      );
      
      setProducts(productsWithPricing);
    } catch (err) {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const pushToast = (msg, type="success") => {
    setToastMsg({ msg, type });
    setTimeout(()=>setToastMsg(null), 3200);
  };

  const approve = async (id) => {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    try {
      await merchantAPI.approvePricing(id, product.aiPrice);
      setProducts(ps => ps.map(p => p.id === id ? { ...p, status:"approved", price:p.aiPrice } : p));
      setHlRow(id);
      setTimeout(()=>setHlRow(null), 1400);
      pushToast("Price approved & updated ✓", "success");
      setBulkSel(s=>{ const n=new Set(s); n.delete(id); return n; });
    } catch (err) {
      toast.error("Failed to approve pricing");
    }
  };

  const reject = (id) => {
    setProducts(ps => ps.map(p => p.id === id ? { ...p, status:"rejected" } : p));
    pushToast("Suggestion rejected", "warning");
    setBulkSel(s=>{ const n=new Set(s); n.delete(id); return n; });
  };

  const undoAction = (id) => {
    setProducts(ps => ps.map(p => p.id === id ? { ...p, status:"pending" } : p));
    pushToast("Action undone", "info");
  };

  const reAnalyze = async (id) => {
    setAiTarget(id);
    setAiRunning(true);
    try {
      const pricingRes = await merchantAPI.getPricing(id);
      const pricing = pricingRes.data.data;
      setProducts(ps => ps.map(p => p.id === id ? { 
        ...p, 
        aiPrice: pricing.suggestedPrice, 
        reasoning: pricing.reasoning,
        aiDelta: Math.abs(pricing.suggestedPrice - p.price),
        trend: pricing.suggestedPrice > p.price ? "up" : pricing.suggestedPrice < p.price ? "down" : "flat"
      } : p));
      pushToast("AI re-analysis complete ✦", "success");
    } catch {
      toast.error("Failed to re-analyze");
    } finally {
      setAiRunning(false);
      setAiTarget(null);
    }
  };

  const bulkApprove = async () => {
    for (const id of bulkSel) {
      const product = products.find(p => p.id === id);
      if (product && product.status === "pending") {
        try {
          await merchantAPI.approvePricing(id, product.aiPrice);
          setProducts(ps => ps.map(p => p.id === id ? { ...p, status:"approved", price:p.aiPrice } : p));
        } catch (err) {
          console.error("Failed to approve", id);
        }
      }
    }
    pushToast(`${bulkSel.size} prices approved ✓`, "success");
    setBulkSel(new Set());
  };

  const bulkReject = () => {
    bulkSel.forEach(id => {
      setProducts(ps => ps.map(p => p.id === id ? { ...p, status:"rejected" } : p));
    });
    pushToast(`${bulkSel.size} suggestions rejected`, "warning");
    setBulkSel(new Set());
  };

  const toggleBulk = (id) => {
    setBulkSel(s=>{ const n=new Set(s); n.has(id)?n.delete(id):n.add(id); return n; });
  };

  const toggleAll = () => {
    const pendingIds = filtered.filter(p=>p.status==="pending").map(p=>p.id);
    if (bulkSel.size === pendingIds.length) setBulkSel(new Set());
    else setBulkSel(new Set(pendingIds));
  };

  const cycleSort = (key) => {
    if (sortBy===key) setSortDir(d=>d*-1);
    else { setSortBy(key); setSortDir(-1); }
  };

  const SortBtn = ({ col, label }) => (
    <button onClick={()=>cycleSort(col)}
      style={{ background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:4, color:sortBy===col?T.rose:T.muted, fontFamily:"'DM Sans',sans-serif", fontSize:".7rem", fontWeight:800, letterSpacing:".06em", textTransform:"uppercase", padding:0, whiteSpace:"nowrap" }}>
      {label}
      {sortBy===col ? (sortDir===1 ? <Ic d={PATH.chevU} size={12} c={T.rose} sw={2.5}/> : <Ic d={PATH.chevD} size={12} c={T.rose} sw={2.5}/>) : <Ic d={PATH.sort} size={12} c={T.muted} sw={1.5}/>}
    </button>
  );

  const filtered = products
    .filter(p=>{
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.brand.toLowerCase().includes(search.toLowerCase()) && !p.sku.toLowerCase().includes(search.toLowerCase())) return false;
      if (category!=="All" && p.category!==category) return false;
      if (statusF!=="All" && p.status!==statusF) return false;
      return true;
    })
    .sort((a,b)=>{
      if (sortBy==="default") return 0;
      const va = sortBy==="name"?a.name:sortBy==="aiDelta"?a.aiDelta:sortBy==="confidence"?a.confidence:sortBy==="ourPrice"?a.price:sortBy==="sales30d"?a.sales30d:0;
      const vb = sortBy==="name"?b.name:sortBy==="aiDelta"?b.aiDelta:sortBy==="confidence"?b.confidence:sortBy==="ourPrice"?b.price:sortBy==="sales30d"?b.sales30d:0;
      return typeof va==="string" ? va.localeCompare(vb)*sortDir : (va-vb)*sortDir;
    });

  const pending = products.filter(p=>p.status==="pending").length;
  const approved = products.filter(p=>p.status==="approved").length;
  const rejected = products.filter(p=>p.status==="rejected").length;

  if (loading) {
    return (
      <div style={{ minHeight:"100vh", background:T.cream, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <p>Loading pricing suggestions...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight:"100vh", background:T.cream, fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,600&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,700;9..40,800&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:4px; height:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:#e8a0a0; border-radius:4px; }

        @keyframes fadeUp   { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
        @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
        @keyframes tipIn    { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:none} }
        @keyframes slideR   { from{opacity:0;transform:translateX(24px)} to{opacity:1;transform:none} }
        @keyframes spin     { to{transform:rotate(360deg)} }
        @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes rowGlow  { 0%{background:#f0fdf4} 100%{background:transparent} }
        @keyframes shimmer  { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes toastIn  { from{opacity:0;transform:translateX(40px)} to{opacity:1;transform:none} }

        .row-hover:hover { background:#fdf8f8 !important; }
        .row-sel { background:#fef5f5 !important; }
        .ai-pulse { animation:pulse 1s ease infinite; }
        .row-approved { animation:rowGlow .8s ease forwards; }
        .btn-approve {
          background:linear-gradient(135deg,${T.green},#22c55e);
          color:white; border:none; border-radius:10px;
          padding:7px 14px; font-family:'DM Sans',sans-serif; font-size:.72rem; font-weight:800;
          letter-spacing:.05em; cursor:pointer; display:flex; align-items:center; gap:6px;
          box-shadow:0 4px 12px rgba(22,163,74,.28); transition:all .22s;
          white-space:nowrap;
        }
        .btn-approve:hover { transform:translateY(-1px); box-shadow:0 8px 20px rgba(22,163,74,.38); }
        .btn-approve:disabled { opacity:.4; cursor:not-allowed; transform:none; box-shadow:none; }
        .btn-reject {
          background:white; color:${T.red}; border:1.5px solid ${T.redBd};
          border-radius:10px; padding:7px 14px; font-family:'DM Sans',sans-serif;
          font-size:.72rem; font-weight:800; letter-spacing:.05em; cursor:pointer;
          display:flex; align-items:center; gap:6px; transition:all .22s; white-space:nowrap;
        }
        .btn-reject:hover { background:${T.redBg}; transform:translateY(-1px); }
        .btn-reject:disabled { opacity:.4; cursor:not-allowed; transform:none; }
        .btn-undo {
          background:white; color:${T.muted}; border:1.5px solid ${T.border};
          border-radius:10px; padding:7px 12px; font-family:'DM Sans',sans-serif;
          font-size:.7rem; font-weight:700; cursor:pointer;
          display:flex; align-items:center; gap:5px; transition:all .2s;
        }
        .btn-undo:hover { border-color:${T.rose}; color:${T.rose}; }
        .cb-wrap { width:18px; height:18px; border-radius:6px; border:2px solid ${T.border};
          display:flex; align-items:center; justify-content:center; cursor:pointer;
          transition:all .18s; flex-shrink:0; background:white; }
        .cb-wrap.checked { background:${T.rose}; border-color:${T.rose}; }
        .chip-filter { font-family:'DM Sans',sans-serif; font-size:.73rem; font-weight:700;
          padding:6px 14px; border-radius:999px; border:1.5px solid ${T.border};
          background:white; color:${T.muted}; cursor:pointer; transition:all .2s; white-space:nowrap; }
        .chip-filter.active { background:linear-gradient(135deg,${T.rose},${T.roseLt}); color:white; border-color:transparent; box-shadow:0 4px 12px rgba(180,80,80,.22); }
        .chip-filter:hover:not(.active) { border-color:${T.rose}; color:${T.rose}; }
        .view-btn { background:none; border:1.5px solid ${T.border}; border-radius:8px; padding:6px 10px; cursor:pointer; transition:all .18s; color:${T.muted}; }
        .view-btn.active { background:${T.rose}; border-color:${T.rose}; color:white; }
      `}</style>

      {/* TOPBAR */}
      <header style={{
        background:"white", height:62, borderBottom:`1.5px solid ${T.border}`,
        padding:"0 clamp(16px,4vw,40px)", display:"flex", alignItems:"center", justifyContent:"space-between",
        position:"sticky", top:0, zIndex:200,
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <button onClick={() => navigate("/merchant/dashboard")} style={{ background:"#fde8e8", border:"none", borderRadius:10, width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
            <Ic d={PATH.chevR} size={16} c="#c9727a" sw={2.5} style={{ transform:"rotate(180deg)" }}/>
          </button>
          <div style={{ width:32,height:32,borderRadius:10,background:`linear-gradient(135deg,${T.rose},${T.roseLt})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,color:"white" }}>✿</div>
          <span style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:"1.28rem", color:T.roseDk }}>Rosée</span>
          <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:".7rem", fontWeight:600, color:T.muted, marginLeft:6, padding:"2px 10px", borderRadius:999, background:"#fdf5f5", border:`1px solid ${T.border}` }}>Merchant</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:".72rem", color:T.muted }}>Dynamic Pricing</span>
          <div style={{ width:6, height:6, borderRadius:"50%", background:T.green, animation:"pulse 2s ease infinite" }}/>
          <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:".72rem", fontWeight:700, color:T.green }}>AI Active</span>
        </div>
      </header>

      {/* HERO BANNER */}
      <div style={{
        background:`linear-gradient(135deg,${T.plum} 0%,#3d1a28 50%,#1c1018 100%)`,
        padding:"clamp(28px,4vw,44px) clamp(16px,4vw,40px)",
        position:"relative", overflow:"hidden",
      }}>
        <div style={{ maxWidth:1240, margin:"0 auto", position:"relative", zIndex:1 }}>
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:20, marginBottom:28 }}>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                <Ic d={PATH.brain} size={16} c={T.roseLt} sw={2}/>
                <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:".68rem", fontWeight:800, letterSpacing:".2em", textTransform:"uppercase", color:T.roseLt }}>AI-Powered · Real-Time</span>
              </div>
              <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:"clamp(1.7rem,3.5vw,2.5rem)", color:"white", lineHeight:1.15, marginBottom:6 }}>
                Dynamic Pricing <em style={{ color:T.roseLt, fontStyle:"italic" }}>Intelligence</em>
              </h1>
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:".85rem", color:"rgba(255,255,255,.55)", fontWeight:400, maxWidth:440, lineHeight:1.7 }}>
                Review AI-generated price recommendations based on competitor analysis, demand signals, and margin optimisation.
              </p>
            </div>
            <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
              {[
                { label:"Pending Review", val:pending,  color:"#fde68a", bg:"rgba(217,119,6,.15)" },
                { label:"Approved",       val:approved, color:"#86efac", bg:"rgba(22,163,74,.15)" },
                { label:"Rejected",       val:rejected, color:"#fca5a5", bg:"rgba(220,38,38,.15)" },
              ].map(s=>(
                <div key={s.label} style={{ background:s.bg, border:`1px solid ${s.color}25`, borderRadius:14, padding:"12px 18px", textAlign:"center", minWidth:90, backdropFilter:"blur(8px)" }}>
                  <p style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:"1.7rem", color:s.color, lineHeight:1 }}>{s.val}</p>
                  <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:".62rem", fontWeight:700, color:`${s.color}bb`, letterSpacing:".07em", textTransform:"uppercase", marginTop:3 }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:14 }}>
            <StatCard icon={PATH.bars}   label="Total Products" value={products.length} sub="Active SKUs" accent={T.rose}/>
            <StatCard icon={PATH.dollar} label="Pending Suggestions" value={pending} sub="Awaiting review" accent={T.gold}/>
            <StatCard icon={PATH.brain}  label="AI Confidence Avg" value="82%" sub="Model accuracy" accent={T.green}/>
            <StatCard icon={PATH.tag}    label="Approved Changes" value={approved} sub="Price updates applied" accent="#7c3aed"/>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ maxWidth:1240, margin:"0 auto", padding:"clamp(20px,3vw,32px) clamp(16px,4vw,40px) 60px" }}>

        {/* FILTERS + SEARCH BAR */}
        <div style={{ background:"white", borderRadius:20, border:`1.5px solid ${T.border}`, padding:"16px 20px", marginBottom:20, boxShadow:`0 4px 20px rgba(140,40,60,.05)` }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap", marginBottom:14 }}>
            <div style={{ position:"relative", flex:1, minWidth:200 }}>
              <span style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)" }}><Ic d={PATH.search} size={15} c={T.muted} sw={2}/></span>
              <input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by product, brand, or SKU…"
                style={{ width:"100%", padding:"9px 14px 9px 38px", borderRadius:12, border:`1.5px solid ${T.border}`, fontFamily:"'DM Sans',sans-serif", fontSize:".83rem", color:T.ink, background:"#fdfafa" }}/>
            </div>
            <div style={{ display:"flex", gap:6 }}>
              <button className={`view-btn${viewMode==="table"?" active":""}`} onClick={()=>setViewMode("table")}>📋 Table</button>
              <button className={`view-btn${viewMode==="cards"?" active":""}`} onClick={()=>setViewMode("cards")}>🗂️ Cards</button>
            </div>
            <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{ padding:"8px 14px", borderRadius:12, border:`1.5px solid ${T.border}`, fontFamily:"'DM Sans',sans-serif", fontSize:".78rem", fontWeight:700, color:T.text, background:"white", cursor:"pointer" }}>
              <option value="default">Sort: Default</option>
              <option value="aiDelta">AI Delta</option>
              <option value="confidence">Confidence</option>
              <option value="ourPrice">Price</option>
              <option value="name">Name</option>
            </select>
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
            <Ic d={PATH.filter} size={14} c={T.muted} sw={2}/>
            {CATEGORIES.map(c=>(
              <button key={c} className={`chip-filter${category===c?" active":""}`} onClick={()=>setCategory(c)}>{c}</button>
            ))}
            <div style={{ width:1, height:20, background:T.border, margin:"0 4px" }}/>
            {["All","pending","approved","rejected"].map(s=>(
              <button key={s} className={`chip-filter${statusF===s?" active":""}`} onClick={()=>setStatusF(s)} style={{ textTransform:"capitalize" }}>
                {s==="All"?"All Status":s}
              </button>
            ))}
          </div>
        </div>

        {/* BULK ACTION BAR */}
        {bulkSel.size > 0 && (
          <div style={{ background:T.plum, borderRadius:16, padding:"12px 20px", display:"flex", alignItems:"center", gap:14, marginBottom:16, flexWrap:"wrap" }}>
            <Ic d={PATH.check} size={16} c={T.roseLt} sw={2.5}/>
            <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:".82rem", fontWeight:700, color:"white" }}>{bulkSel.size} selected</span>
            <div style={{ flex:1 }}/>
            <button className="btn-approve" onClick={bulkApprove}><Ic d={PATH.approve} size={14} c="white" sw={2}/>Approve All</button>
            <button onClick={bulkReject} style={{ background:"rgba(220,38,38,.2)", color:"#fca5a5", border:"1.5px solid rgba(220,38,38,.3)", borderRadius:10, padding:"7px 14px", cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>Reject All</button>
            <button onClick={()=>setBulkSel(new Set())} style={{ background:"rgba(255,255,255,.08)", color:"rgba(255,255,255,.6)", border:"1px solid rgba(255,255,255,.12)", borderRadius:10, padding:"7px 12px", cursor:"pointer" }}>Clear</button>
          </div>
        )}

        {/* TABLE VIEW */}
        {viewMode === "table" && (
          <div style={{ background:"white", borderRadius:22, border:`1.5px solid ${T.border}`, overflow:"hidden" }}>
            <div style={{ padding:"12px 20px 10px", borderBottom:`1.5px solid ${T.border}`, background:"#fdf8f8", display:"flex", alignItems:"center", gap:12 }}>
              <div className={`cb-wrap${bulkSel.size===filtered.filter(p=>p.status==="pending").length&&filtered.filter(p=>p.status==="pending").length>0?" checked":""}`} onClick={toggleAll} style={{ marginRight:4 }}>
                {bulkSel.size===filtered.filter(p=>p.status==="pending").length&&filtered.filter(p=>p.status==="pending").length>0 && <Ic d={PATH.check} size={10} sw={3} c="white"/>}
              </div>
              <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:".68rem", fontWeight:800, color:T.muted, letterSpacing:".08em", textTransform:"uppercase" }}>{filtered.length} Products</span>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"32px 2.5fr 80px 1fr 1fr 1fr 80px 90px 120px 120px", gap:"0 8px", padding:"10px 20px", borderBottom:`1.5px solid ${T.border}`, background:"#fdfafa", alignItems:"center" }}>
              <div/><SortBtn col="name" label="Product"/><div>Trend</div><SortBtn col="ourPrice" label="Price"/><div>Competitor</div><div>AI Price</div><SortBtn col="confidence" label="Conf."/><SortBtn col="aiDelta" label="Delta"/><div>Status</div><div>Actions</div>
            </div>

            {filtered.map((p, ri) => {
              const isApproved = p.status==="approved";
              const isRejected = p.status==="rejected";
              const isPending  = p.status==="pending";
              const isRunning  = aiRunning && aiTarget===p.id;
              const isSel      = bulkSel.has(p.id);
              const isHL       = hlRow===p.id;
              const vsComp     = pct(p.price, p.compPrice);
              const vsCompNum  = parseFloat(vsComp);

              return (
                <div key={p.id} className={`row-hover${isSel?" row-sel":""}${isHL?" row-approved":""}`} style={{
                  display:"grid", gridTemplateColumns:"32px 2.5fr 80px 1fr 1fr 1fr 80px 90px 120px 120px", gap:"0 8px", padding:"13px 20px", borderBottom: ri < filtered.length-1 ? `1px solid ${T.border}` : "none", alignItems:"center", transition:"background .25s", background: isHL ? "#f0fdf4" : undefined, opacity: isRunning ? .7 : 1,
                }}>
                  <div className={`cb-wrap${isSel?" checked":""}`} onClick={()=>isPending&&toggleBulk(p.id)} style={{ opacity:isPending?1:.3, cursor:isPending?"pointer":"default" }}>
                    {isSel && <Ic d={PATH.check} size={10} sw={3} c="white"/>}
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:11, minWidth:0 }}>
                    <div style={{ width:46, height:52, borderRadius:12, overflow:"hidden", flexShrink:0, background:T.roseXs }}>
                      <img src={p.image || "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=80"} alt={p.name} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                    </div>
                    <div style={{ minWidth:0 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:2, flexWrap:"wrap" }}>
                        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:".82rem", fontWeight:800, color:T.ink, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:160 }}>{p.name}</p>
                        {p.badges?.map(b=><Badge key={b} label={b}/>)}
                      </div>
                      <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:".68rem", color:T.muted, fontWeight:500 }}>{p.brand} · {p.sku}</p>
                      <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:".65rem", color:T.muted }}>{p.stock} in stock</p>
                    </div>
                  </div>
                  <div><Sparkline trend={p.trend}/></div>
                  <div><p style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:"1.05rem", color:T.ink }}>{fmt(p.price)}</p></div>
                  <div><p style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:"1.05rem", color:T.text }}>{fmt(p.compPrice)}</p><p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:".62rem", fontWeight:700, color: vsCompNum>0?T.green:vsCompNum<0?T.red:T.muted }}>{vsCompNum>0?"+":""}{vsComp}%</p></div>
                  <div>
                    {isRunning ? <div style={{ display:"flex", alignItems:"center", gap:6 }}><div style={{ width:14,height:14,borderRadius:"50%",border:`2.5px solid ${T.rose}`,borderTopColor:"transparent",animation:"spin .7s linear infinite" }}/><span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:".72rem", color:T.rose, fontWeight:700 }}>Analyzing…</span></div> :
                      <Tooltip width={280} content={p.reasoning}>
                        <p style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:"1.05rem", color:T.rose, cursor:"help", borderBottom:`1px dashed ${T.roseLt}`, display:"inline" }}>{fmt(p.aiPrice)}</p>
                      </Tooltip>
                    }
                  </div>
                  <div style={{ display:"flex", justifyContent:"center" }}><ConfRing pct={p.confidence}/></div>
                  <div><DeltaChip delta={p.aiDelta}/></div>
                  <div><StatusPill status={p.status}/></div>
                  <div style={{ display:"flex", gap:5 }}>
                    {isPending && (
                      <>
                        <button className="btn-approve" onClick={()=>approve(p.id)} disabled={isRunning}><Ic d={PATH.check} size={12} c="white" sw={3}/></button>
                        <button className="btn-reject" onClick={()=>reject(p.id)} disabled={isRunning}><Ic d={PATH.x} size={12} c={T.red} sw={3}/></button>
                        <button className="btn-undo" onClick={()=>reAnalyze(p.id)} title="Re-analyze" disabled={isRunning}><Ic d={PATH.refresh} size={12} c={T.muted} sw={2}/></button>
                      </>
                    )}
                    {(isApproved||isRejected) && <button className="btn-undo" onClick={()=>undoAction(p.id)}><Ic d={PATH.undo} size={11} c={T.muted} sw={2}/>Undo</button>}
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && <div style={{ padding:"48px 20px", textAlign:"center" }}><p>No products match your filters ✿</p></div>}
          </div>
        )}

        {/* CARD VIEW */}
        {viewMode === "cards" && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))", gap:18 }}>
            {filtered.map((p, ci) => {
              const isRunning = aiRunning && aiTarget===p.id;
              const isSel = bulkSel.has(p.id);
              const isPending = p.status==="pending";
              const isHL = hlRow===p.id;
              const vsCompNum = parseFloat(pct(p.price, p.compPrice));

              return (
                <div key={p.id} style={{ background:"white", borderRadius:22, border:`1.5px solid ${isSel?T.rose:T.border}`, overflow:"hidden", boxShadow:`0 4px 20px rgba(140,40,60,.07)`, transition:"all .22s" }}>
                  <div style={{ position:"relative" }}>
                    <div style={{ height:140, overflow:"hidden", background:T.roseXs }}>
                      <img src={p.image || "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=200"} alt={p.name} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                    </div>
                    {isPending && (
                      <div className={`cb-wrap${isSel?" checked":""}`} onClick={()=>toggleBulk(p.id)} style={{ position:"absolute", top:10, left:10, background:"white", boxShadow:"0 2px 8px rgba(0,0,0,.15)" }}>
                        {isSel && <Ic d={PATH.check} size={10} sw={3} c="white"/>}
                      </div>
                    )}
                    <div style={{ position:"absolute", top:10, right:10 }}><StatusPill status={p.status}/></div>
                  </div>
                  <div style={{ padding:"16px 18px" }}>
                    <div style={{ marginBottom:14 }}>
                      <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:".62rem", fontWeight:800, color:T.rose, letterSpacing:".1em", textTransform:"uppercase", marginBottom:2 }}>{p.brand} · {p.sku}</p>
                      <p style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:"1.05rem", color:T.ink, marginBottom:2 }}>{p.name}</p>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}><Sparkline trend={p.trend}/><p style={{ fontSize:".68rem", color:T.muted }}>{p.stock} in stock</p></div>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:14, padding:"12px 14px", background:T.cream, borderRadius:14 }}>
                      <div style={{ textAlign:"center" }}><p style={{ fontSize:".6rem", fontWeight:700, color:T.muted, textTransform:"uppercase", marginBottom:3 }}>Our Price</p><p style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:"1.1rem", color:T.ink }}>{fmt(p.price)}</p></div>
                      <div style={{ textAlign:"center" }}><p style={{ fontSize:".6rem", fontWeight:700, color:T.muted, textTransform:"uppercase", marginBottom:3 }}>Competitor</p><p style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:"1.1rem", color: vsCompNum>0?T.green:vsCompNum<0?T.red:T.muted }}>{fmt(p.compPrice)}</p></div>
                      <div style={{ textAlign:"center" }}><p style={{ fontSize:".6rem", fontWeight:700, color:T.rose, textTransform:"uppercase", marginBottom:3 }}>AI Suggests</p><p style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:"1.1rem", color:T.rose }}>{fmt(p.aiPrice)}</p></div>
                    </div>
                    <div style={{ padding:"10px 13px", background:`${T.rose}08`, border:`1px solid ${T.roseLt}50`, borderRadius:12, marginBottom:14 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:5 }}>
                        <Ic d={PATH.brain} size={12} c={T.rose} sw={2}/>
                        <span style={{ fontSize:".62rem", fontWeight:800, color:T.rose, textTransform:"uppercase" }}>AI Reasoning</span>
                        <div style={{ marginLeft:"auto" }}><ConfRing pct={p.confidence} size={32}/></div>
                      </div>
                      <p style={{ fontSize:".72rem", color:T.text, lineHeight:1.65 }}>{p.reasoning.length > 100 ? p.reasoning.slice(0,100)+"…" : p.reasoning}</p>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <DeltaChip delta={p.aiDelta}/>
                      <div style={{ flex:1 }}/>
                      {isPending && !isRunning && (
                        <>
                          <button className="btn-approve" onClick={()=>approve(p.id)}><Ic d={PATH.check} size={13} c="white" sw={3}/>Approve</button>
                          <button className="btn-reject" onClick={()=>reject(p.id)}><Ic d={PATH.x} size={13} c={T.red} sw={3}/>Reject</button>
                        </>
                      )}
                      {isRunning && <div style={{ display:"flex", alignItems:"center", gap:6 }}><div style={{ width:14,height:14,borderRadius:"50%",border:`2.5px solid ${T.rose}`,borderTopColor:"transparent",animation:"spin .7s linear infinite" }}/><span style={{ fontSize:".72rem", color:T.rose, fontWeight:700 }}>Re-analyzing…</span></div>}
                      {(p.status==="approved"||p.status==="rejected") && <button className="btn-undo" onClick={()=>undoAction(p.id)}><Ic d={PATH.undo} size={11} c={T.muted} sw={2}/>Undo</button>}
                      {isPending && <button className="btn-undo" onClick={()=>reAnalyze(p.id)}><Ic d={PATH.refresh} size={12} c={T.muted} sw={2}/></button>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* TOAST */}
      {toastMsg && (
        <div style={{ position:"fixed", bottom:28, right:28, zIndex:9000, background: toastMsg.type==="success"?T.plum:toastMsg.type==="warning"?"#7c2d12":"#1e3a5f", color:"white", borderRadius:16, padding:"14px 20px", display:"flex", alignItems:"center", gap:10, boxShadow:"0 12px 40px rgba(0,0,0,.3)", animation:"toastIn .28s cubic-bezier(.34,1.4,.64,1)" }}>
          <span>{toastMsg.type==="success"?"✓":toastMsg.type==="warning"?"✗":"ℹ"}</span>
          {toastMsg.msg}
          <button onClick={()=>setToastMsg(null)} style={{ marginLeft:"auto", background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,.5)" }}><Ic d={PATH.x} size={14} c="rgba(255,255,255,.5)" sw={2}/></button>
        </div>
      )}
    </div>
  );
}