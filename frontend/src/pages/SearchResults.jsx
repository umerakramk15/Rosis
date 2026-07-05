import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { searchAPI } from "../api/index";
import useCartStore from "../store/cartStore";
import useAuthStore from "../store/authStore";
import { toast } from "react-toastify";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const CATEGORIES = ["All", "shirts", "shoes", "electronics", "bags", "watches", "pants", "jackets", "perfumes"];
const BRANDS = ["Rosée", "LuxeCarry", "GlimmerCo", "FloralFit", "StepSoft"];
const SORT_OPTIONS = [
  { value: "relevance", label: "Most Relevant" },
  { value: "newest", label: "Newest First" },
  { value: "price-asc", label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
  { value: "rating", label: "Top Rated" },
];

const TRENDING_SEARCHES = ["Linen dress", "Gold earrings", "Mini bags", "Floral tops", "Strappy heels"];

// ─── ICONS (same as your old design) ──────────────────────────────────────────
const icons = {
  search: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  camera: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><circle cx="12" cy="13" r="3" /></svg>,
  sparkle: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" /></svg>,
  heart: (f) => <svg className="w-[18px] h-[18px]" fill={f ? "#c9727a" : "none"} stroke={f ? "#c9727a" : "#9ca3af"} strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
  cart: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>,
  x: () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>,
  filter: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M6 12h12M10 20h4" /></svg>,
  chevDown: (o) => <svg className={`w-4 h-4 transition-transform ${o ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>,
  grid: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>,
  list: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>,
  close: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>,
  arrow: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>,
  image: () => <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 16M14 8h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
};

function StarRating({ rating, size = "sm" }) {
  const cls = size === "sm" ? "w-3 h-3" : "w-4 h-4";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => {
        const diff = (rating || 0) - (i - 1);
        return (
          <svg key={i} className={cls} viewBox="0 0 20 20">
            {diff >= 1 ? (
              <path fill="#f59e0b" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118L10 14.347l-3.35 2.436c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.664 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z"/>
            ) : diff > 0 ? (
              <>
                <defs><linearGradient id={`s${i}`}><stop offset={`${diff*100}%`} stopColor="#f59e0b"/><stop offset={`${diff*100}%`} stopColor="#e5e7eb"/></linearGradient></defs>
                <path fill={`url(#s${i})`} d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118L10 14.347l-3.35 2.436c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.664 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z"/>
              </>
            ) : (
              <path fill="#e5e7eb" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118L10 14.347l-3.35 2.436c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.664 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z"/>
            )}
          </svg>
        );
      })}
    </div>
  );
}

// ─── PRODUCT CARD (from your design) ──────────────────────────────────────────
function ProductCard({ product, onCart, onNavigate }) {
  const [hov, setHov] = useState(false);
  const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : null;

  return (
    <div style={{ background: "white", borderRadius: 22, overflow: "hidden", border: "1.5px solid #f0d5d8", cursor: "pointer", transition: "transform .3s,box-shadow .3s", transform: hov ? "translateY(-5px)" : "none", boxShadow: hov ? "0 16px 40px rgba(180,80,80,.13)" : "0 2px 12px rgba(140,40,60,.06)" }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      onClick={() => onNavigate(product._id)}>
      <div style={{ position: "relative", height: 260, background: "#fdf5f5", overflow: "hidden" }}>
        <img src={product.images?.[0]?.url || "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400"}
          alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .6s", transform: hov ? "scale(1.07)" : "scale(1)" }} />
        <span style={{ position: "absolute", top: 10, left: 10, background: "#c9727a", color: "white", fontFamily: "'DM Sans',sans-serif", fontSize: ".6rem", fontWeight: 800, padding: "3px 10px", borderRadius: 999, textTransform: "capitalize" }}>
          {product.category}
        </span>
        {discount && (
          <span style={{ position: "absolute", top: 10, right: 60, background: "#22c55e", color: "white", fontFamily: "'DM Sans',sans-serif", fontSize: ".6rem", fontWeight: 800, padding: "3px 10px", borderRadius: 999 }}>
            -{discount}%
          </span>
        )}
        <div style={{ position: "absolute", inset: "0 0 0 0", bottom: 0, padding: 12, background: "linear-gradient(to top,rgba(0,0,0,.3),transparent)", opacity: hov ? 1 : 0, transition: "opacity .3s", display: "flex", alignItems: "flex-end" }}>
          <button onClick={e => { e.stopPropagation(); onCart(product._id); }}
            style={{ width: "100%", padding: "10px", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#c9727a,#e8a0a0)", color: "white", fontFamily: "'DM Sans',sans-serif", fontSize: ".78rem", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            {icons.cart()} Add to Cart
          </button>
        </div>
      </div>
      <div style={{ padding: "14px 16px" }}>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: ".68rem", color: "#9a7080", marginBottom: 3, textTransform: "capitalize" }}>{product.category}</p>
        <p style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 700, fontSize: ".95rem", color: "#1e1018", marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{product.name}</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 800, fontSize: "1rem", color: "#c9727a" }}>Rs. {product.price?.toLocaleString()}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <StarRating rating={product.ratings?.average || 0} />
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: ".75rem", fontWeight: 700, color: "#1e1018" }}>{product.ratings?.average?.toFixed(1) || "—"}</span>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: ".68rem", color: "#9a7080" }}>({product.ratings?.count || 0})</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── FILTER ACCORDION ─────────────────────────────────────────────────────────
function FilterAccordion({ title, children, open: defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b" style={{ borderColor: "#f0e0e0" }}>
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between py-3.5">
        <span className="text-sm font-semibold" style={{ color: "#2d1a1a", fontFamily: "Jost, sans-serif", letterSpacing: "0.03em" }}>{title}</span>
        {icons.chevDown(open)}
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? "max-h-80 pb-4" : "max-h-0"}`}>{children}</div>
    </div>
  );
}

// ─── SKELETON CARD ────────────────────────────────────────────────────────────
const SkCard = () => (
  <div style={{ background: "white", borderRadius: 22, overflow: "hidden", border: "1.5px solid #f0d5d8" }}>
    <div style={{ height: 260, background: "linear-gradient(90deg,#fde8e8 25%,#fdf0f0 50%,#fde8e8 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
    <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ height: 12, borderRadius: 6, background: "linear-gradient(90deg,#fde8e8 25%,#fdf0f0 50%,#fde8e8 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite", width: "60%" }} />
      <div style={{ height: 14, borderRadius: 6, background: "linear-gradient(90deg,#fde8e8 25%,#fdf0f0 50%,#fde8e8 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite", width: "80%" }} />
      <div style={{ height: 14, borderRadius: 6, background: "linear-gradient(90deg,#fde8e8 25%,#fdf0f0 50%,#fde8e8 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite", width: "40%" }} />
    </div>
  </div>
);

// ─── VISUAL SEARCH PANEL COMPONENT ────────────────────────────────────────────
function VisualSearchPanel({ onResults, onClose }) {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef();

  const handleFile = (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSearch = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target.result.split(",")[1];
        const res = await searchAPI.visual(base64);
        onResults(res.data.data.products || [], res.data.data.keywords || []);
        onClose();
        toast.success("Visual search complete!");
      };
      reader.readAsDataURL(image);
    } catch (err) {
      toast.error("Visual search failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="relative rounded-2xl border-2 border-dashed cursor-pointer transition-all flex flex-col items-center justify-center py-12 mb-4"
        style={{ borderColor: "#f0d0d0", background: "#fdf8f8" }}
        onClick={() => inputRef.current?.click()}>
        {preview ? (
          <img src={preview} alt="Preview" className="w-full h-48 object-cover rounded-2xl" />
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "linear-gradient(135deg,#fde8e8,#fdf0f8)", border: "1.5px solid #f5d0d0" }}>
              <span style={{ color: "#c9727a" }}>{icons.image()}</span>
            </div>
            <p className="font-semibold mb-1" style={{ color: "#2d1a1a", fontFamily: "Jost, sans-serif" }}>Click to upload an image</p>
            <p className="text-xs" style={{ color: "#a07070", fontFamily: "Jost, sans-serif" }}>JPG, PNG, WebP up to 5MB</p>
          </div>
        )}
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files[0])} />
      </div>
      <button onClick={handleSearch} disabled={!image || loading}
        className="btn-primary w-full py-3.5 rounded-2xl flex items-center justify-center gap-2">
        {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : icons.search()} 
        {loading ? "Searching..." : "Find Similar Styles"}
      </button>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
const ITEMS_PER_PAGE = 12;

export default function SearchResultsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCartStore();
  const { user } = useAuthStore();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [inputVal, setInputVal] = useState(searchParams.get("q") || "");
  const [mode, setMode] = useState("keyword");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiFilters, setAiFilters] = useState({});
  const [keywords, setKeywords] = useState([]);
  const [sortBy, setSortBy] = useState("relevance");
  const [showVisual, setShowVisual] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [view, setView] = useState("grid");
  const [selectedCats, setCats] = useState(["All"]);
  const [selectedBrands, setBrands] = useState([]);
  const [priceRange, setPrice] = useState([0, 50000]);
  const [minRating, setMinRating] = useState(0);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [mobileFilter, setMobileFilter] = useState(false);
  const inputRef = useRef();
  const LIMIT = 12;

  // Search on query/mode/sort/page change
  useEffect(() => {
    if (!query.trim() && mode !== "visual") { setProducts([]); setTotal(0); return; }
    doSearch();
  }, [query, mode, sortBy, page, selectedCats, selectedBrands, priceRange, minRating, onlyInStock]);

  const doSearch = async () => {
    setLoading(true);
    try {
      let res;
      if (mode === "llm") {
        res = await searchAPI.llm(query);
        setAiFilters(res.data.data.extractedFilters || {});
        setProducts(res.data.data.products || []);
        setTotal(res.data.data.products?.length || 0);
        setTotalPages(1);
      } else {
        const params = {
          q: query,
          page,
          limit: LIMIT,
          ...(sortBy === "price-asc" && { sortBy: "price", order: "asc" }),
          ...(sortBy === "price-desc" && { sortBy: "price", order: "desc" }),
          ...(sortBy === "rating" && { sortBy: "ratings.average", order: "desc" }),
          ...(!selectedCats.includes("All") && selectedCats[0] && { category: selectedCats[0] }),
          ...(priceRange[0] > 0 && { minPrice: priceRange[0] }),
          ...(priceRange[1] < 50000 && { maxPrice: priceRange[1] }),
        };
        res = await searchAPI.keyword(params);
        setProducts(res.data.data.products || []);
        setTotal(res.data.data.total || 0);
        setTotalPages(res.data.data.pages || 1);
        setAiFilters({});
      }
    } catch (err) {
      console.error("Search failed:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    setPage(1);
    setQuery(inputVal.trim());
    setSearchParams({ q: inputVal.trim() });
    if (mode === "llm") setMode("keyword");
  };

  const handleLLMSearch = async () => {
    if (!inputVal.trim()) return;
    if (!user) { toast.info("Please login to use AI search"); navigate("/login"); return; }
    setMode("llm");
    setPage(1);
    setQuery(inputVal.trim());
  };

  const handleAddToCart = async (productId) => {
    if (!user) { toast.info("Please login to add items to cart"); navigate("/login"); return; }
    const result = await addToCart(productId, 1);
    if (result.success) toast.success("Added to cart!");
    else toast.error(result.message);
  };

  const handleVisualResults = (prods, kws) => {
    setProducts(prods);
    setKeywords(kws);
    setMode("visual");
    setTotal(prods.length);
    setTotalPages(1);
  };

  const toggleCat = (c) => {
    if (c === "All") { setCats(["All"]); return; }
    setCats(prev => {
      const next = prev.filter(x => x !== "All");
      return next.includes(c) ? (next.filter(x => x !== c).length ? next.filter(x => x !== c) : ["All"]) : [...next, c];
    });
    setPage(1);
  };

  const clearAll = () => {
    setCats(["All"]);
    setBrands([]);
    setPrice([0, 50000]);
    setMinRating(0);
    setOnlyInStock(false);
    setPage(1);
  };

  const activeFilters = [
    !selectedCats.includes("All") && selectedCats,
    selectedBrands.length && selectedBrands,
    (priceRange[0] > 0 || priceRange[1] < 50000) && [`Rs. ${priceRange[0]}–${priceRange[1]}`],
    minRating > 0 && [`★ ${minRating}+`],
    onlyInStock && ["In Stock"],
  ].filter(Boolean).flat();

  const SidebarContent = () => (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="display-font font-bold text-lg" style={{ color: "#2d1a1a" }}>Refine</h2>
        {activeFilters.length > 0 && (
          <button onClick={clearAll} className="text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1"
            style={{ background: "#fde8e8", color: "#c9727a", fontFamily: "Jost, sans-serif" }}>
            {icons.x()} Clear ({activeFilters.length})
          </button>
        )}
      </div>

      {/* Quick toggles */}
      <div className="flex flex-col gap-2 mb-5">
        <label className="flex items-center justify-between cursor-pointer py-1">
          <span className="text-sm" style={{ fontFamily: "Jost, sans-serif", color: "#5a3d3d" }}>In Stock Only</span>
          <div onClick={() => setOnlyInStock(v => !v)} className="relative w-9 h-5 rounded-full transition-all"
            style={{ background: onlyInStock ? "linear-gradient(90deg, #c9727a, #e8a0a0)" : "#e5e0dc" }}>
            <div className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all"
              style={{ left: onlyInStock ? "calc(100% - 18px)" : "2px" }} />
          </div>
        </label>
      </div>

      <FilterAccordion title="Category">
        <div className="flex flex-col gap-1.5">
          {CATEGORIES.map(cat => {
            const active = selectedCats.includes(cat);
            return (
              <label key={cat} className="flex items-center gap-2.5 cursor-pointer" onClick={() => { toggleCat(cat); setPage(1); }}>
                <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all"
                  style={{ background: active ? "#c9727a" : "white", border: `1.5px solid ${active ? "#c9727a" : "#e0c8c8"}` }}>
                  {active && <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="white" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                </div>
                <span className="text-sm capitalize" style={{ fontFamily: "Jost, sans-serif", color: active ? "#c9727a" : "#5a3d3d", fontWeight: active ? 600 : 400 }}>{cat}</span>
              </label>
            );
          })}
        </div>
      </FilterAccordion>

      <FilterAccordion title="Price Range">
        <div className="px-1">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-semibold" style={{ color: "#c9727a", fontFamily: "Jost, sans-serif" }}>Rs. {priceRange[0]}</span>
            <span className="text-sm font-semibold" style={{ color: "#c9727a", fontFamily: "Jost, sans-serif" }}>Rs. {priceRange[1]}</span>
          </div>
          <div className="flex gap-2 mt-2">
            <input type="number" value={priceRange[0]} onChange={e => { setPrice([Math.max(0, +e.target.value), priceRange[1]]); setPage(1); }}
              className="w-full text-center py-1.5 rounded-xl text-sm" style={{ border: "1.5px solid #f0d8d8", fontFamily: "Jost, sans-serif", color: "#2d1a1a", outline: "none" }} />
            <span className="text-gray-400 self-center">—</span>
            <input type="number" value={priceRange[1]} onChange={e => { setPrice([priceRange[0], Math.min(100000, +e.target.value)]); setPage(1); }}
              className="w-full text-center py-1.5 rounded-xl text-sm" style={{ border: "1.5px solid #f0d8d8", fontFamily: "Jost, sans-serif", color: "#2d1a1a", outline: "none" }} />
          </div>
        </div>
      </FilterAccordion>

      <FilterAccordion title="Rating" defaultOpen={false}>
        <div className="flex flex-col gap-2">
          {[0, 3, 3.5, 4, 4.5].map(r => (
            <label key={r} className="flex items-center gap-2.5 cursor-pointer" onClick={() => { setMinRating(r); setPage(1); }}>
              <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                style={{ borderColor: minRating === r ? "#c9727a" : "#e0c8c8", background: minRating === r ? "#c9727a" : "white" }}>
                {minRating === r && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
              {r === 0
                ? <span className="text-sm" style={{ fontFamily: "Jost, sans-serif", color: minRating === 0 ? "#c9727a" : "#5a3d3d" }}>All ratings</span>
                : <div className="flex items-center gap-1.5"><StarRating rating={r} /><span className="text-xs" style={{ color: "#7a5555", fontFamily: "Jost, sans-serif" }}>{r}+</span></div>
              }
            </label>
          ))}
        </div>
      </FilterAccordion>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: "#fdf8f5" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Jost:wght@300;400;500;600;700&display=swap');
        .display-font { font-family: 'Playfair Display', serif; }
        .btn-primary { background: linear-gradient(135deg,#c9727a,#e8a0a0); color:white; font-family:'Jost',sans-serif; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; font-size:0.75rem; transition:all 0.28s ease; border:none; cursor:pointer; }
        .btn-primary:hover { background:linear-gradient(135deg,#b05e66,#d48888); transform:translateY(-1px); box-shadow:0 6px 20px rgba(180,80,80,0.3); }
        .tag-badge { font-family:'Jost',sans-serif; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; }
        .card-hover { transition:transform 0.32s cubic-bezier(0.34,1.56,0.64,1),box-shadow 0.32s ease; }
        .card-hover:hover { transform:translateY(-5px); box-shadow:0 18px 50px rgba(180,80,80,0.12); }
        .fade-up { animation:fadeUp 0.45s ease both; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .hide-scroll { scrollbar-width:none; -ms-overflow-style:none; }
        .hide-scroll::-webkit-scrollbar { display:none; }
        ::-webkit-scrollbar { width:5px } ::-webkit-scrollbar-track{background:#fdf8f5} ::-webkit-scrollbar-thumb{background:#e8a0a0;border-radius:3px}
        input[type=range] { -webkit-appearance:none }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:#c9727a;cursor:pointer;border:2px solid white;box-shadow:0 2px 6px rgba(180,80,80,0.3) }
        .ai-shimmer { background:linear-gradient(90deg,#fde8e8 25%,#fdf0f8 50%,#fde8e8 75%); background-size:200% auto; animation:shimmer 1.5s linear infinite; }
        @keyframes shimmer { from{background-position:200%} to{background-position:-200%} }
      `}</style>

      {/* HERO SEARCH AREA */}
      <div style={{ background: "linear-gradient(135deg,#fde8e8 0%,#fff5f0 45%,#fde8f4 100%)", borderBottom: "1px solid #f0d8d8" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
          <nav className="flex items-center gap-2 mb-5 text-xs" style={{ color: "#a07070", fontFamily: "Jost, sans-serif" }}>
            <span className="cursor-pointer hover:text-rose-500 transition-colors" onClick={() => navigate("/")}>Home</span>
            <span style={{ color: "#d0b0b0" }}>›</span>
            <span style={{ color: "#c9727a", fontWeight: 600 }}>Search Results</span>
          </nav>

          <div className="mb-5 fade-up">
            <h1 className="display-font font-bold mb-1" style={{ fontSize: "clamp(1.5rem,3vw,2.2rem)", color: "#2d1a1a" }}>
              {query ? <>Results for <em style={{ color: "#c9727a" }}>"{query}"</em></> : "Explore Everything"}
            </h1>
            <p className="text-sm" style={{ color: "#8a6060", fontFamily: "Jost, sans-serif", fontWeight: 300 }}>
              {total} products found
            </p>
          </div>

          {/* SEARCH BAR */}
          <div className="relative max-w-3xl fade-up" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-center rounded-2xl overflow-hidden transition-all"
              style={{ background: "white", border: `2px solid ${mode === "llm" ? "#c9727a" : "#f0d8d8"}` }}>
              {mode === "llm" && (
                <div className="flex items-center gap-1.5 pl-4 flex-shrink-0">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg,#c9727a,#e8a0a0)" }}>
                    <span style={{ color: "white", fontSize: 10 }}>{icons.sparkle()}</span>
                  </div>
                  <span className="text-xs font-semibold hidden sm:inline" style={{ color: "#c9727a", fontFamily: "Jost, sans-serif" }}>AI</span>
                </div>
              )}
              {!mode === "llm" && <span className="pl-4 flex-shrink-0" style={{ color: "#c9727a" }}>{icons.search()}</span>}
              <input ref={inputRef} value={inputVal} onChange={e => setInputVal(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()}
                placeholder={mode === "llm" ? "Describe what you're looking for in natural language…" : "Search for styles, brands, occasions…"}
                className="flex-1 px-4 py-3.5 text-sm bg-transparent" style={{ fontFamily: "Jost, sans-serif", color: "#2d1a1a", outline: "none", minWidth: 0 }} />
              {inputVal && <button onClick={() => { setInputVal(""); setQuery(""); inputRef.current?.focus(); }} className="flex-shrink-0 p-2 rounded-full mr-1 hover:bg-rose-50 transition-colors" style={{ color: "#c9727a" }}>{icons.x()}</button>}
              <button onClick={() => setShowVisual(true)} className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2.5 mx-1 rounded-xl text-xs font-semibold"
                style={{ background: "linear-gradient(135deg,#fde8e8,#fdf0f8)", color: "#8b3a4a", fontFamily: "Jost, sans-serif", border: "1px solid #f5d0d0" }}>
                {icons.camera()} <span className="hidden sm:inline">Search by Image</span>
              </button>
              <button onClick={handleSubmit} className="btn-primary flex-shrink-0 px-5 py-3.5 m-1 rounded-xl flex items-center gap-2">
                {icons.search()} <span className="hidden sm:inline">Search</span>
              </button>
            </div>

            {/* AI Toggle */}
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              <button onClick={handleLLMSearch} className="flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold transition-all"
                style={{ background: mode === "llm" ? "linear-gradient(135deg,#c9727a,#e8a0a0)" : "white", color: mode === "llm" ? "white" : "#8b3a4a", border: `1.5px solid ${mode === "llm" ? "transparent" : "#f0d0d0"}` }}>
                {icons.sparkle()} {mode === "llm" ? "AI Search On" : "Try AI Search"}
              </button>
              <div className="flex items-center gap-2 overflow-x-auto hide-scroll">
                <span className="text-xs flex-shrink-0" style={{ color: "#a07070", fontFamily: "Jost, sans-serif" }}>Trending:</span>
                {TRENDING_SEARCHES.map(t => (
                  <button key={t} onClick={() => { setInputVal(t); setQuery(t); setMode("keyword"); setPage(1); handleSubmit(); }}
                    className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full transition-all hover:shadow-sm"
                    style={{ background: "white", border: "1px solid #f0d0d0", color: "#8b3a4a", fontFamily: "Jost, sans-serif" }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* AI Banner */}
          {mode === "llm" && (
            <div className="mt-5 max-w-3xl fade-up rounded-2xl p-5 flex gap-4" style={{ background: "linear-gradient(135deg,#fde8e8,#fdf0f8)", border: "1.5px solid #f0d0d0" }}>
              {/* <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg,#c9727a,#e8a0a0) }}>
                <span style={{ color: "white", fontSize: 12 }}>{icons.sparkle()}</span>
              </div> */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-sm" style={{ color: "#2d1a1a", fontFamily: "Jost, sans-serif" }}>Rosée AI</p>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(201,114,122,0.15)", color: "#c9727a" }}>✦ Smart Search</span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "#5a3d3d", fontFamily: "Jost, sans-serif", fontWeight: 300 }}>
                  Results based on understanding your intent: <strong>"{query}"</strong>
                </p>
              </div>
              <button onClick={() => { setMode("keyword"); setAiFilters({}); }} className="text-xs font-semibold" style={{ color: "#c9727a" }}>Clear AI</button>
            </div>
          )}
        </div>
      </div>

      {/* BODY */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Active filter chips */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {activeFilters.map((f, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                style={{ background: "white", border: "1.5px solid #f0d0d0", color: "#c9727a", fontFamily: "Jost, sans-serif" }}>
                {Array.isArray(f) ? f.join(", ") : f}
                <button onClick={clearAll} className="hover:opacity-70">{icons.x()}</button>
              </span>
            ))}
            <button onClick={clearAll} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: "#fde8e8", color: "#c9727a", fontFamily: "Jost, sans-serif" }}>
              {icons.x()} Clear All
            </button>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileFilter(true)} className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold"
              style={{ background: "white", border: "1.5px solid #f0d0d0", color: "#c9727a", fontFamily: "Jost, sans-serif" }}>
              {icons.filter()} Filters {activeFilters.length > 0 && <span className="w-5 h-5 rounded-full text-white text-xs flex items-center justify-center" style={{ background: "#c9727a" }}>{activeFilters.length}</span>}
            </button>
            <p className="text-sm" style={{ color: "#8a6060", fontFamily: "Jost, sans-serif" }}>
              <span className="font-semibold" style={{ color: "#2d1a1a" }}>{total}</span> results
              {query && <> for <span style={{ color: "#c9727a" }}>"{query}"</span></>}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select value={sortBy} onChange={e => { setSortBy(e.target.value); setPage(1); }}
              className="appearance-none pl-4 pr-9 py-2.5 rounded-2xl text-sm font-medium cursor-pointer"
              style={{ border: "1.5px solid #f0d0d0", background: "white", color: "#2d1a1a", fontFamily: "Jost, sans-serif", outline: "none" }}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <div className="flex rounded-2xl overflow-hidden" style={{ border: "1.5px solid #f0d0d0", background: "white" }}>
              {[["grid", icons.grid()], ["list", icons.list()]].map(([v, ic]) => (
                <button key={v} onClick={() => setView(v)} className="px-3 py-2.5 flex items-center transition-all"
                  style={{ background: view === v ? "#c9727a" : "transparent", color: view === v ? "white" : "#a07070" }}>{ic}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block flex-shrink-0" style={{ width: "240px" }}>
            <div className="sticky top-6 rounded-3xl p-5 bg-white" style={{ border: "1.5px solid #f5e0e0", boxShadow: "0 4px 24px rgba(180,80,80,0.06)" }}>
              <SidebarContent />
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 20 }}>
                {Array(8).fill(0).map((_, i) => <SkCard key={i} />)}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 fade-up">
                <div className="text-6xl mb-5">✿</div>
                <h2 className="display-font text-2xl font-bold mb-3" style={{ color: "#2d1a1a" }}>No results found</h2>
                <p className="mb-2 text-sm" style={{ color: "#8a6060", fontFamily: "Jost, sans-serif" }}>We couldn't find anything matching <strong>"{query}"</strong></p>
                <button onClick={clearAll} className="btn-primary px-8 py-3.5 rounded-full mt-4">Clear All Filters</button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {products.map((p, i) => (
                    <div key={p._id} className="fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
                      <ProductCard product={p} onCart={handleAddToCart} onNavigate={id => navigate(`/products/${id}`)} />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12 flex-wrap">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                      className="px-4 py-2 rounded-2xl text-sm font-medium disabled:opacity-40"
                      style={{ border: "1.5px solid #f0d0d0", background: "white", color: "#c9727a", fontFamily: "Jost, sans-serif" }}>← Prev</button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1).map(n => (
                      <button key={n} onClick={() => setPage(n)}
                        className="w-10 h-10 rounded-2xl text-sm font-semibold"
                        style={{ background: page === n ? "linear-gradient(135deg,#c9727a,#e8a0a0)" : "white", color: page === n ? "white" : "#5a3d3d", border: page === n ? "none" : "1.5px solid #f0d0d0" }}>
                        {n}
                      </button>
                    ))}
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                      className="px-4 py-2 rounded-2xl text-sm font-medium disabled:opacity-40"
                      style={{ border: "1.5px solid #f0d0d0", background: "white", color: "#c9727a", fontFamily: "Jost, sans-serif" }}>Next →</button>
                  </div>
                )}
                <p className="text-center mt-4 text-xs" style={{ color: "#b0a0a0", fontFamily: "Jost, sans-serif" }}>
                  Showing {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, total)} of {total} results
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFilter && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black bg-opacity-40" onClick={() => setMobileFilter(false)} />
          <div className="absolute right-0 top-0 h-full w-80 bg-white flex flex-col overflow-hidden" style={{ boxShadow: "-4px 0 30px rgba(180,80,80,0.12)" }}>
            <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-5 border-b" style={{ borderColor: "#f0e0e0" }}>
              <h2 className="display-font font-bold text-lg" style={{ color: "#2d1a1a" }}>✿ Refine</h2>
              <button onClick={() => setMobileFilter(false)} className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: "#fde8e8", color: "#c9727a" }}>{icons.close()}</button>
            </div>
            <div className="flex-1 overflow-y-auto p-5"><SidebarContent /></div>
            <div className="p-4 border-t" style={{ borderColor: "#f0e0e0" }}>
              <button onClick={() => setMobileFilter(false)} className="btn-primary w-full py-3.5 rounded-2xl text-sm">Show {total} Results</button>
            </div>
          </div>
        </div>
      )}

      {/* Visual Search Modal */}
      {showVisual && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(20,10,10,0.75)", backdropFilter: "blur(10px)" }}>
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto" style={{ border: "1.5px solid #f5d0d0", boxShadow: "0 30px 80px rgba(180,80,80,0.25)" }}>
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: "#f5e0e0" }}>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #c9727a, #e8a0a0)" }}>
                    <span style={{ color: "white", fontSize: 12 }}>{icons.camera()}</span>
                  </div>
                  <h2 className="display-font font-bold text-lg" style={{ color: "#2d1a1a" }}>Visual Search</h2>
                </div>
                <p className="text-xs" style={{ color: "#8a6060", fontFamily: "Jost, sans-serif" }}>Upload a photo to find similar styles</p>
              </div>
              <button onClick={() => setShowVisual(false)} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ color: "#c9727a", border: "1.5px solid #f0d0d0" }}>{icons.close()}</button>
            </div>
            <VisualSearchPanel onResults={handleVisualResults} onClose={() => setShowVisual(false)} />
          </div>
        </div>
      )}
    </div>
  );
}