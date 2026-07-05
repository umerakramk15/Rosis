import { useState, useCallback, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { productAPI } from "../api/productAPI";
import useCartStore from "../store/cartStore";
import useAuthStore from "../store/authStore";
import { toast } from "react-toastify";
import { wishlistAPI } from "../api/index";
// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  "All",
  "shirts",
  "shoes",
  "electronics",
  "bags",
  "watches",
  "pants",
];
const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest First" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

const RISK_CONFIG = {
  low: {
    label: "Low Return Risk",
    color: "#22c55e",
    bg: "rgba(34,197,94,0.1)",
    icon: "✓",
  },
  medium: {
    label: "Medium Return Risk",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
    icon: "⚠",
  },
  high: {
    label: "High Return Risk",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.1)",
    icon: "↩",
  },
};

// ─── ICONS ────────────────────────────────────────────────────────────────────
const HeartIcon = ({ filled }) => (
  <svg
    className="w-[18px] h-[18px]"
    fill={filled ? "#c9727a" : "none"}
    stroke={filled ? "#c9727a" : "#9ca3af"}
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
    />
  </svg>
);
const CartIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
    />
  </svg>
);
const SearchIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);
const GridIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);
const ListIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 6h16M4 12h16M4 18h16"
    />
  </svg>
);
const ChevronDown = ({ open }) => (
  <svg
    className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);
const FilterIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"
    />
  </svg>
);
const XIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);
const StarIcon = ({ filled }) => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 20 20">
    <path
      fill={filled ? "#f59e0b" : "#d1d5db"}
      d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118L10 14.347l-3.35 2.436c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.664 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z"
    />
  </svg>
);

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function RatingStars({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <StarIcon key={i} filled={i <= Math.floor(rating)} />
      ))}
    </div>
  );
}

function RiskBadge({ risk }) {
  if (!risk) return null;
  const cfg = RISK_CONFIG[risk] || RISK_CONFIG.low;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{
        background: cfg.bg,
        color: cfg.color,
        fontFamily: "Jost, sans-serif",
        fontSize: "0.65rem",
        letterSpacing: "0.04em",
      }}
    >
      <span>{cfg.icon}</span>
      {cfg.label}
    </span>
  );
}

// ─── SKELETON CARD ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div
      className="bg-white rounded-3xl overflow-hidden"
      style={{ border: "1.5px solid #f5e0e0" }}
    >
      <div className="skeleton" style={{ paddingBottom: "120%" }} />
      <div className="p-4 space-y-2">
        <div className="skeleton h-3 rounded" style={{ width: "60%" }} />
        <div className="skeleton h-4 rounded" style={{ width: "80%" }} />
        <div className="skeleton h-4 rounded" style={{ width: "40%" }} />
      </div>
    </div>
  );
}

// ─── PRODUCT CARD — GRID VIEW ─────────────────────────────────────────────────
function ProductCardGrid({
  product,
  wishlisted,
  onWishlist,
  onCart,
  onNavigate,
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="group relative bg-white rounded-3xl overflow-hidden flex flex-col card-hover cursor-pointer"
      style={{
        border: "1.5px solid #f5e0e0",
        boxShadow: "0 2px 12px rgba(180,80,80,0.06)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onNavigate(product._id)}
    >
      {/* Image */}
      <div
        className="relative overflow-hidden"
        style={{ paddingBottom: "120%", background: "#fdf5f5" }}
      >
        <img
          src={
            product.images?.[0]?.url ||
            "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500"
          }
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out"
          style={{ transform: hovered ? "scale(1.07)" : "scale(1)" }}
        />

        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span
            className="tag-badge px-2.5 py-1 rounded-full text-white"
            style={{ background: "#c9727a", fontSize: "0.6rem" }}
          >
            {product.category}
          </span>
        </div>

        {/* Stock badge */}
        {product.stock < 10 && product.stock > 0 && (
          <div className="absolute top-3 right-12">
            <span
              className="tag-badge px-2.5 py-1 rounded-full text-white"
              style={{ background: "#f59e0b", fontSize: "0.6rem" }}
            >
              Low Stock
            </span>
          </div>
        )}

        {/* Wishlist */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onWishlist(product._id);
          }}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center transition-all duration-200 hover:scale-110 z-10"
        >
          <HeartIcon filled={wishlisted} />
        </button>

        {/* Quick Add overlay */}
        <div
          className={`absolute inset-x-0 bottom-0 p-3 transition-all duration-300 ${hovered ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}`}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCart(product._id);
            }}
            className="w-full py-2.5 rounded-2xl font-semibold text-xs uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2 btn-primary"
          >
            <CartIcon />
            Quick Add to Cart
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div>
          <p
            className="text-xs mb-0.5 capitalize"
            style={{ color: "#a07070", fontFamily: "Jost, sans-serif" }}
          >
            {product.category}
          </p>
          <h3
            className="display-font font-semibold leading-snug"
            style={{ color: "#2d1a1a", fontSize: "0.95rem" }}
          >
            {product.name}
          </h3>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1.5">
          <RatingStars rating={product.ratings?.average || 0} />
          <span
            className="text-xs font-semibold"
            style={{ color: "#c9727a", fontFamily: "Jost, sans-serif" }}
          >
            {product.ratings?.average?.toFixed(1) || "0.0"}
          </span>
          <span
            className="text-xs"
            style={{ color: "#b0a0a0", fontFamily: "Jost, sans-serif" }}
          >
            ({product.ratings?.count || 0})
          </span>
        </div>

        {/* Price + Risk */}
        <div className="mt-auto pt-2 flex items-end justify-between gap-2 flex-wrap">
          <span
            className="font-bold text-lg"
            style={{ color: "#c9727a", fontFamily: "Jost, sans-serif" }}
          >
            Rs. {product.price?.toLocaleString()}
          </span>
          <RiskBadge risk={product.returnRisk?.level} />
        </div>
      </div>
    </div>
  );
}

// ─── PRODUCT CARD — LIST VIEW ─────────────────────────────────────────────────
function ProductCardList({
  product,
  wishlisted,
  onWishlist,
  onCart,
  onNavigate,
}) {
  return (
    <div
      className="bg-white rounded-2xl overflow-hidden flex flex-col sm:flex-row card-hover cursor-pointer"
      style={{
        border: "1.5px solid #f5e0e0",
        boxShadow: "0 2px 12px rgba(180,80,80,0.06)",
      }}
      onClick={() => onNavigate(product._id)}
    >
      {/* Image */}
      <div
        className="relative overflow-hidden flex-shrink-0"
        style={{ width: "100%", maxWidth: "220px", minHeight: "200px" }}
      >
        <img
          src={
            product.images?.[0]?.url ||
            "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500"
          }
          alt={product.name}
          className="w-full h-full object-cover"
          style={{ minHeight: "200px" }}
        />
        <div className="absolute top-3 left-3">
          <span
            className="tag-badge px-2 py-0.5 rounded-full text-white capitalize"
            style={{ background: "#c9727a", fontSize: "0.6rem" }}
          >
            {product.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-5 flex flex-col justify-between gap-3">
        <div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p
                className="text-xs mb-0.5 capitalize"
                style={{
                  color: "#a07070",
                  fontFamily: "Jost, sans-serif",
                  textTransform: "uppercase",
                }}
              >
                {product.category}
              </p>
              <h3
                className="display-font font-semibold text-xl"
                style={{ color: "#2d1a1a" }}
              >
                {product.name}
              </h3>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onWishlist(product._id);
              }}
              className="w-9 h-9 rounded-full bg-rose-50 flex items-center justify-center hover:scale-110 transition-transform flex-shrink-0"
            >
              <HeartIcon filled={wishlisted} />
            </button>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <RatingStars rating={product.ratings?.average || 0} />
            <span
              className="text-sm font-semibold"
              style={{ color: "#c9727a", fontFamily: "Jost, sans-serif" }}
            >
              {product.ratings?.average?.toFixed(1) || "0.0"}
            </span>
            <span
              className="text-sm"
              style={{ color: "#b0a0a0", fontFamily: "Jost, sans-serif" }}
            >
              ({product.ratings?.count || 0} reviews)
            </span>
          </div>

          {product.description && (
            <p
              className="text-sm mt-2 line-clamp-2"
              style={{
                color: "#7a5555",
                fontFamily: "Jost, sans-serif",
                fontWeight: "300",
              }}
            >
              {product.description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex flex-col gap-1">
            <span
              className="font-bold text-2xl"
              style={{ color: "#c9727a", fontFamily: "Jost, sans-serif" }}
            >
              Rs. {product.price?.toLocaleString()}
            </span>
            <RiskBadge risk={product.returnRisk?.level} />
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCart(product._id);
            }}
            className="px-6 py-3 rounded-2xl font-semibold text-xs uppercase tracking-widest flex items-center gap-2 transition-all duration-200 btn-primary"
          >
            <CartIcon />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── FILTER SECTION ───────────────────────────────────────────────────────────
function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b" style={{ borderColor: "#f0e0e0" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between py-3.5 text-left"
        style={{ fontFamily: "Jost, sans-serif" }}
      >
        <span
          className="font-semibold text-sm"
          style={{ color: "#2d1a1a", letterSpacing: "0.04em" }}
        >
          {title}
        </span>
        <ChevronDown open={open} />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${open ? "max-h-96 pb-4" : "max-h-0"}`}
      >
        {children}
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
const ITEMS_PER_PAGE = 12;

export default function ProductListingPage() {
  const [search, setSearch] = useState("");
  const [selectedCats, setCats] = useState(["All"]);
  const [priceRange, setPrice] = useState([0, 50000]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSort] = useState("featured");
  const [view, setView] = useState("grid");
  const [page, setPage] = useState(1);
  const [wishlist, setWishlist] = useState({});
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [wishlistItems, setWishlistItems] = useState([]);

  // Real data
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToCart } = useCartStore();
  const { user } = useAuthStore();

  // Fetch from backend
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const categoryFromURL = searchParams.get("category");
        const params = {
          page,
          limit: ITEMS_PER_PAGE,
          ...(search && { search }),
          ...(!selectedCats.includes("All") && { category: selectedCats[0] }),
          ...(categoryFromURL && { category: categoryFromURL }),
          ...(priceRange[1] < 50000 && { maxPrice: priceRange[1] }),
          ...(priceRange[0] > 0 && { minPrice: priceRange[0] }),
          ...(sortBy === "price-asc" && { sortBy: "price", order: "asc" }),
          ...(sortBy === "price-desc" && { sortBy: "price", order: "desc" }),
          ...(sortBy === "rating" && {
            sortBy: "ratings.average",
            order: "desc",
          }),
        };
        const res = await productAPI.getAll(params);
        setProducts(res.data.data.products || []);
        setTotal(res.data.data.total || 0);
        setTotalPages(res.data.data.pages || 1);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [page, search, selectedCats, priceRange, sortBy, searchParams]);

  const handleAddToCart = useCallback(
    async (productId) => {
      if (!user) {
        toast.info("Please login to add items to cart");
        navigate("/login");
        return;
      }
      const result = await addToCart(productId, 1);
      if (result.success) toast.success("Added to cart!");
      else toast.error(result.message);
    },
    [user, addToCart, navigate],
  );

  const handleWishlist = useCallback(
    async (productId) => {
      if (!user) {
        toast.info("Please login to use wishlist");
        navigate("/login");
        return;
      }
      try {
        const res = await wishlistAPI.toggleWishlist(productId);
        if (res.data.success) {
          // Update wishlistItems state
          setWishlistItems((prev) =>
            prev.includes(productId)
              ? prev.filter((id) => id !== productId)
              : [...prev, productId],
          );
          toast.success(res.data.message || "Wishlist updated!");
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Something went wrong");
      }
    },
    [user, navigate],
  );

  useEffect(() => {
    if (!user) return;
    wishlistAPI
      .getWishlist()
      .then((res) => {
        const ids = (res.data?.data?.wishlist || []).map((p) => p._id);
        setWishlistItems(ids);
      })
      .catch(() => {});
  }, [user]);

  const handleNavigate = useCallback(
    (productId) => {
      navigate(`/products/${productId}`);
    },
    [navigate],
  );

  const toggleCat = (cat) => {
    if (cat === "All") {
      setCats(["All"]);
      setPage(1);
      return;
    }
    setCats((prev) => {
      const next = prev.filter((c) => c !== "All");
      const updated = next.includes(cat)
        ? next.filter((c) => c !== cat)
        : [...next, cat];
      return updated.length === 0 ? ["All"] : updated;
    });
    setPage(1);
  };

  const clearAll = () => {
    setSearch("");
    setCats(["All"]);
    setPrice([0, 50000]);
    setMinRating(0);
    setSort("featured");
    setPage(1);
  };

  const activeFilterCount = [
    !selectedCats.includes("All") ? selectedCats.length : 0,
    priceRange[0] > 0 || priceRange[1] < 50000 ? 1 : 0,
    minRating > 0 ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  // ── SIDEBAR ──────────────────────────────────────────────────────────────────
  const Sidebar = () => (
    <aside className="w-full">
      <div className="flex items-center justify-between mb-5">
        <h2
          className="display-font font-bold text-lg"
          style={{ color: "#2d1a1a" }}
        >
          Filters
        </h2>
        {activeFilterCount > 0 && (
          <button
            onClick={clearAll}
            className="text-xs font-medium flex items-center gap-1 px-3 py-1.5 rounded-full transition-all hover:opacity-80"
            style={{
              background: "#fde8e8",
              color: "#c9727a",
              fontFamily: "Jost, sans-serif",
            }}
          >
            <XIcon /> Clear all ({activeFilterCount})
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <span
          className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: "#c9727a" }}
        >
          <SearchIcon />
        </span>
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search products…"
          className="w-full pl-9 pr-4 py-2.5 rounded-2xl text-sm"
          style={{
            border: "1.5px solid #f0d8d8",
            background: "#fdf8f8",
            fontFamily: "Jost, sans-serif",
            color: "#2d1a1a",
            outline: "none",
          }}
        />
      </div>

      {/* Category */}
      <FilterSection title="Category">
        <div className="flex flex-col gap-1.5">
          {CATEGORIES.map((cat) => {
            const active = selectedCats.includes(cat);
            return (
              <label
                key={cat}
                className="flex items-center gap-2.5 cursor-pointer"
                onClick={() => toggleCat(cat)}
              >
                <div
                  className="w-4 h-4 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all"
                  style={{
                    borderColor: active ? "#c9727a" : "#e0c8c8",
                    background: active ? "#c9727a" : "white",
                  }}
                >
                  {active && (
                    <svg
                      className="w-2.5 h-2.5 text-white"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
                <span
                  className="text-sm capitalize transition-colors"
                  style={{
                    fontFamily: "Jost, sans-serif",
                    color: active ? "#c9727a" : "#5a3d3d",
                    fontWeight: active ? "600" : "400",
                  }}
                >
                  {cat}
                </span>
              </label>
            );
          })}
        </div>
      </FilterSection>

      {/* Price */}
      <FilterSection title="Price Range (Rs.)">
        <div className="px-1">
          <div className="flex items-center justify-between mb-3">
            <span
              className="text-sm font-semibold"
              style={{ color: "#c9727a", fontFamily: "Jost, sans-serif" }}
            >
              Rs. {priceRange[0]}
            </span>
            <span
              className="text-sm font-semibold"
              style={{ color: "#c9727a", fontFamily: "Jost, sans-serif" }}
            >
              Rs. {priceRange[1]}
            </span>
          </div>
          <div className="flex gap-2 mt-2">
            <input
              type="number"
              value={priceRange[0]}
              min={0}
              max={priceRange[1] - 100}
              onChange={(e) => {
                setPrice([Math.max(0, +e.target.value), priceRange[1]]);
                setPage(1);
              }}
              className="w-full text-center py-1.5 rounded-xl text-sm"
              style={{
                border: "1.5px solid #f0d8d8",
                fontFamily: "Jost, sans-serif",
                color: "#2d1a1a",
                outline: "none",
              }}
            />
            <span className="text-gray-400 self-center">—</span>
            <input
              type="number"
              value={priceRange[1]}
              min={priceRange[0] + 100}
              max={100000}
              onChange={(e) => {
                setPrice([priceRange[0], Math.min(100000, +e.target.value)]);
                setPage(1);
              }}
              className="w-full text-center py-1.5 rounded-xl text-sm"
              style={{
                border: "1.5px solid #f0d8d8",
                fontFamily: "Jost, sans-serif",
                color: "#2d1a1a",
                outline: "none",
              }}
            />
          </div>
        </div>
      </FilterSection>

      {/* Rating */}
      <FilterSection title="Minimum Rating">
        <div className="flex flex-col gap-2">
          {[0, 3, 3.5, 4, 4.5].map((r) => (
            <label
              key={r}
              className="flex items-center gap-2.5 cursor-pointer"
              onClick={() => {
                setMinRating(r);
                setPage(1);
              }}
            >
              <div
                className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                style={{
                  borderColor: minRating === r ? "#c9727a" : "#e0c8c8",
                  background: minRating === r ? "#c9727a" : "white",
                }}
              >
                {minRating === r && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </div>
              {r === 0 ? (
                <span
                  className="text-sm"
                  style={{
                    fontFamily: "Jost, sans-serif",
                    color: minRating === 0 ? "#c9727a" : "#5a3d3d",
                    fontWeight: minRating === 0 ? "600" : "400",
                  }}
                >
                  All ratings
                </span>
              ) : (
                <div className="flex items-center gap-1.5">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <StarIcon key={i} filled={i <= r} />
                    ))}
                  </div>
                  <span
                    className="text-xs"
                    style={{ fontFamily: "Jost, sans-serif", color: "#7a5555" }}
                  >
                    {r}+
                  </span>
                </div>
              )}
            </label>
          ))}
        </div>
      </FilterSection>
    </aside>
  );

  // ── RENDER ────────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen"
      style={{ background: "#fdf8f5", fontFamily: "Jost, sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Jost:wght@300;400;500;600;700&display=swap');
        .display-font { font-family: 'Playfair Display', serif; }
        .card-hover { transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease; }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 16px 48px rgba(180,80,80,0.12); }
        .btn-primary { background: linear-gradient(135deg, #c9727a, #e8a0a0); color: white; font-family: 'Jost', sans-serif; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; font-size: 0.72rem; transition: all 0.25s ease; border: none; cursor: pointer; }
        .btn-primary:hover { background: linear-gradient(135deg, #b05e66, #d48888); transform: translateY(-1px); box-shadow: 0 6px 20px rgba(180,80,80,0.3); }
        .tag-badge { font-family: 'Jost', sans-serif; font-size: 0.6rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; }
        ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-track { background: #fdf8f5; } ::-webkit-scrollbar-thumb { background: #e8a0a0; border-radius: 3px; }
        .fade-in { animation: fadeIn 0.4s ease forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .skeleton { background: linear-gradient(90deg, #f0e0e0 25%, #fde8e8 50%, #f0e0e0 75%); background-size: 200% 100%; animation: skeletonAnim 1.5s infinite; }
        @keyframes skeletonAnim { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
      `}</style>

      {/* TOP BAR */}
      <div
        style={{
          background:
            "linear-gradient(135deg, #fde8e8 0%, #fdf0e8 50%, #fde8f4 100%)",
          borderBottom: "1px solid #f0d8d8",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav
            className="flex items-center gap-2 mb-4 text-xs"
            style={{ color: "#a07070", fontFamily: "Jost, sans-serif" }}
          >
            <span
              className="cursor-pointer hover:text-rose-500 transition-colors"
              onClick={() => navigate("/")}
            >
              Home
            </span>
            <span>›</span>
            <span style={{ color: "#c9727a", fontWeight: "600" }}>
              All Products
            </span>
          </nav>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1
                className="display-font font-bold"
                style={{
                  fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
                  color: "#2d1a1a",
                  lineHeight: 1.15,
                }}
              >
                All Products
              </h1>
              <p
                className="mt-1 text-sm"
                style={{ color: "#8a6060", fontWeight: "300" }}
              >
                {loading ? "Loading..." : `Discover ${total} products ✿`}
              </p>
            </div>
            <div
              className="relative hidden sm:flex items-center"
              style={{ minWidth: "260px" }}
            >
              <span className="absolute left-4" style={{ color: "#c9727a" }}>
                <SearchIcon />
              </span>
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search products…"
                className="w-full pl-10 pr-5 py-3 rounded-full text-sm"
                style={{
                  border: "1.5px solid rgba(201,114,122,0.3)",
                  background: "white",
                  color: "#2d1a1a",
                  outline: "none",
                  boxShadow: "0 2px 12px rgba(180,80,80,0.08)",
                  fontFamily: "Jost, sans-serif",
                }}
              />
            </div>
          </div>

          {/* Active filter chips */}
          {(activeFilterCount > 0 || search) && (
            <div className="flex flex-wrap gap-2 mt-4">
              {search && (
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                  style={{
                    background: "white",
                    border: "1px solid #f0d0d0",
                    color: "#c9727a",
                    fontFamily: "Jost, sans-serif",
                  }}
                >
                  Search: "{search}"
                  <button
                    onClick={() => setSearch("")}
                    className="hover:text-red-500 transition-colors"
                  >
                    <XIcon />
                  </button>
                </span>
              )}
              {!selectedCats.includes("All") &&
                selectedCats.map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium capitalize"
                    style={{
                      background: "white",
                      border: "1px solid #f0d0d0",
                      color: "#c9727a",
                      fontFamily: "Jost, sans-serif",
                    }}
                  >
                    {c}
                    <button
                      onClick={() => toggleCat(c)}
                      className="hover:text-red-500"
                    >
                      <XIcon />
                    </button>
                  </span>
                ))}
              {(priceRange[0] > 0 || priceRange[1] < 50000) && (
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                  style={{
                    background: "white",
                    border: "1px solid #f0d0d0",
                    color: "#b07a3a",
                    fontFamily: "Jost, sans-serif",
                  }}
                >
                  Rs.{priceRange[0]}–Rs.{priceRange[1]}
                  <button
                    onClick={() => setPrice([0, 50000])}
                    className="hover:text-red-500"
                  >
                    <XIcon />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium"
              style={{
                border: "1.5px solid #f0d0d0",
                background: "white",
                color: "#c9727a",
                fontFamily: "Jost, sans-serif",
              }}
            >
              <FilterIcon /> Filters{" "}
              {activeFilterCount > 0 && `(${activeFilterCount})`}
            </button>
            <p
              className="text-sm"
              style={{ color: "#8a6060", fontFamily: "Jost, sans-serif" }}
            >
              {loading ? "" : `${total} products`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2.5 rounded-2xl text-sm appearance-none cursor-pointer"
              style={{
                border: "1.5px solid #f0d0d0",
                background: "white",
                color: "#5a3d3d",
                fontFamily: "Jost, sans-serif",
                outline: "none",
              }}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            {/* View toggle */}
            <div
              className="flex rounded-2xl overflow-hidden"
              style={{ border: "1.5px solid #f0d0d0", background: "white" }}
            >
              {[
                ["grid", <GridIcon />],
                ["list", <ListIcon />],
              ].map(([v, icon]) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className="px-3 py-2.5 flex items-center justify-center transition-all"
                  style={{
                    background: view === v ? "#c9727a" : "transparent",
                    color: view === v ? "white" : "#a07070",
                  }}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* DESKTOP SIDEBAR */}
          <div
            className="hidden lg:block flex-shrink-0"
            style={{ width: "240px" }}
          >
            <div
              className="sticky top-24 bg-white rounded-3xl p-5"
              style={{
                border: "1.5px solid #f5e0e0",
                boxShadow: "0 4px 24px rgba(180,80,80,0.06)",
              }}
            >
              <Sidebar />
            </div>
          </div>

          {/* PRODUCT GRID / LIST */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div
                className={
                  view === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
                    : "flex flex-col gap-4"
                }
              >
                {Array(6)
                  .fill(0)
                  .map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">✿</div>
                <h3
                  className="display-font text-2xl font-semibold mb-2"
                  style={{ color: "#2d1a1a" }}
                >
                  No products found
                </h3>
                <p
                  className="mb-6 text-sm"
                  style={{ color: "#8a6060", fontFamily: "Jost, sans-serif" }}
                >
                  Try adjusting your filters or search term.
                </p>
                <button
                  onClick={clearAll}
                  className="btn-primary px-8 py-3 rounded-full"
                >
                  Clear All Filters
                </button>
              </div>
            ) : view === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {products.map((p) => (
                  <div key={p._id} className="fade-in">
                    <ProductCardGrid
                      product={p}
                      wishlisted={wishlistItems.includes(p._id)}
                      onWishlist={handleWishlist}
                      onCart={handleAddToCart}
                      onNavigate={handleNavigate}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {products.map((p) => (
                  <div key={p._id} className="fade-in">
                    <ProductCardList
                      product={p}
                      wishlisted={wishlistItems.includes(p._id)}
                      onWishlist={handleWishlist}
                      onCart={handleAddToCart}
                      onNavigate={handleNavigate}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12 flex-wrap">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-2xl text-sm font-medium transition-all disabled:opacity-40"
                  style={{
                    border: "1.5px solid #f0d0d0",
                    background: "white",
                    color: "#c9727a",
                    fontFamily: "Jost, sans-serif",
                  }}
                >
                  ← Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (n) =>
                      n === 1 || n === totalPages || Math.abs(n - page) <= 1,
                  )
                  .reduce((acc, n, i, arr) => {
                    if (i > 0 && n - arr[i - 1] > 1) acc.push("…");
                    acc.push(n);
                    return acc;
                  }, [])
                  .map((n, i) =>
                    n === "…" ? (
                      <span key={`e-${i}`} className="px-2 text-gray-400">
                        …
                      </span>
                    ) : (
                      <button
                        key={n}
                        onClick={() => setPage(n)}
                        className="w-10 h-10 rounded-2xl text-sm font-semibold transition-all"
                        style={{
                          background:
                            page === n
                              ? "linear-gradient(135deg, #c9727a, #e8a0a0)"
                              : "white",
                          color: page === n ? "white" : "#5a3d3d",
                          border: page === n ? "none" : "1.5px solid #f0d0d0",
                          fontFamily: "Jost, sans-serif",
                        }}
                      >
                        {n}
                      </button>
                    ),
                  )}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-2xl text-sm font-medium transition-all disabled:opacity-40"
                  style={{
                    border: "1.5px solid #f0d0d0",
                    background: "white",
                    color: "#c9727a",
                    fontFamily: "Jost, sans-serif",
                  }}
                >
                  Next →
                </button>
              </div>
            )}

            {/* Results info */}
            {!loading && total > 0 && (
              <p
                className="text-center mt-4 text-xs"
                style={{ color: "#b0a0a0", fontFamily: "Jost, sans-serif" }}
              >
                Showing {(page - 1) * ITEMS_PER_PAGE + 1}–
                {Math.min(page * ITEMS_PER_PAGE, total)} of {total} products
              </p>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE FILTER DRAWER */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black bg-opacity-40"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div
            className="absolute right-0 top-0 h-full w-80 bg-white overflow-y-auto"
            style={{ boxShadow: "-4px 0 30px rgba(180,80,80,0.12)" }}
          >
            <div
              className="sticky top-0 bg-white z-10 flex items-center justify-between p-5 border-b"
              style={{ borderColor: "#f0e0e0" }}
            >
              <h2
                className="display-font font-bold text-lg"
                style={{ color: "#2d1a1a" }}
              >
                ✿ Filters
              </h2>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: "#fde8e8", color: "#c9727a" }}
              >
                <XIcon />
              </button>
            </div>
            <div className="p-5">
              <Sidebar />
            </div>
            <div
              className="sticky bottom-0 bg-white p-4 border-t"
              style={{ borderColor: "#f0e0e0" }}
            >
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="btn-primary w-full py-3.5 rounded-2xl text-sm"
              >
                Show {total} Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
