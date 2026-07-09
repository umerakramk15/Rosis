import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productAPI } from "../api/productAPI";
import useCartStore from "../store/cartStore";
import useWishlistStore from "../store/wishlistStore";
import useAuthStore from "../store/authStore";
import { toast } from "react-toastify";
import api from "../api/axiosInstance";

// ─── IMPORT DYNAMIC ATTRIBUTE COMPONENTS ──────────────────────────────────────
import DynamicAttributes from "../components/attributes/DynamicAttributes";
import ReviewSection from "../components/ReviewSection";
import RatingBreakdown from "../components/RatingBreakdown";

// ─── ICONS ────────────────────────────────────────────────────────────────────
const HeartIcon = ({ filled }) => (
  <svg
    className="w-5 h-5"
    fill={filled ? "#c9727a" : "none"}
    stroke={filled ? "#c9727a" : "currentColor"}
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
    className="w-5 h-5"
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

const ChevronLeft = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRight = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

const ShieldIcon = () => (
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
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    />
  </svg>
);

const TruckIcon = () => (
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
      d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3m0 0h3l3 4v5h-6m0-9H5m11 0v9m-6 0a2 2 0 100 4 2 2 0 000-4zm6 0a2 2 0 100 4 2 2 0 000-4z"
    />
  </svg>
);

const CheckIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const ShareIcon = () => (
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
      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
    />
  </svg>
);

const ZoomIcon = () => (
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
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
    />
  </svg>
);

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function RatingStars({ rating, size = "md" }) {
  const sz = size === "lg" ? "w-5 h-5" : size === "sm" ? "w-3 h-3" : "w-4 h-4";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => {
        const diff = (rating || 0) - (i - 1);
        return (
          <svg key={i} className={sz} viewBox="0 0 20 20">
            {diff >= 1 ? (
              <path
                fill="#f59e0b"
                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118L10 14.347l-3.35 2.436c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.664 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z"
              />
            ) : diff > 0 ? (
              <>
                <defs>
                  <linearGradient id={`s${i}`}>
                    <stop offset={`${diff * 100}%`} stopColor="#f59e0b" />
                    <stop offset={`${diff * 100}%`} stopColor="#e5e7eb" />
                  </linearGradient>
                </defs>
                <path
                  fill={`url(#s${i})`}
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118L10 14.347l-3.35 2.436c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.664 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z"
                />
              </>
            ) : (
              <path
                fill="#e5e7eb"
                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118L10 14.347l-3.35 2.436c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.664 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z"
              />
            )}
          </svg>
        );
      })}
    </div>
  );
}

// ─── RELATED PRODUCT CARD ─────────────────────────────────────────────────────
function RelatedCard({ product, onNavigate, onCart }) {
  const [wishlisted, setWishlisted] = useState(false);
  const [added, setAdded] = useState(false);

  return (
    <div
      className="group flex-shrink-0 w-52 bg-white rounded-3xl overflow-hidden related-card cursor-pointer"
      style={{
        border: "1.5px solid #f5e0e0",
        boxShadow: "0 2px 12px rgba(180,80,80,0.06)",
      }}
      onClick={() => onNavigate(product._id)}
    >
      <div
        className="relative overflow-hidden"
        style={{ height: "220px", background: "#fdf5f5" }}
      >
        <img
          src={
            product.images?.[0]?.url ||
            "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400"
          }
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {product.tags?.[0] && (
          <span
            className="absolute top-3 left-3 tag-badge px-2.5 py-1 rounded-full text-white"
            style={{
              background: product.tags[0] === "Sale" ? "#c9727a" : "#7a9ec9",
              fontSize: "0.58rem",
            }}
          >
            {product.tags[0]}
          </span>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setWishlisted((w) => !w);
          }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center transition-transform hover:scale-110"
        >
          <HeartIcon filled={wishlisted} />
        </button>
        <div
          className={`absolute inset-x-0 bottom-0 p-2.5 transition-all duration-300 ${
            false
              ? ""
              : "translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
          }`}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setAdded(true);
              onCart(product._id);
              setTimeout(() => setAdded(false), 1400);
            }}
            className={`w-full py-2 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
              added ? "bg-green-500 text-white" : "btn-primary"
            }`}
          >
            <CartIcon />
            {added ? "Added!" : "Quick Add"}
          </button>
        </div>
      </div>
      <div className="p-3.5">
        <p
          className="text-xs mb-0.5 capitalize"
          style={{ color: "#a07070", fontFamily: "Jost, sans-serif" }}
        >
          {product.category}
        </p>
        <h4
          className="display-font font-semibold text-sm leading-snug mb-2"
          style={{ color: "#2d1a1a" }}
        >
          {product.name}
        </h4>
        <div className="flex items-center gap-1 mb-2">
          <RatingStars rating={product.ratings?.average || 0} size="sm" />
          <span
            className="text-xs"
            style={{ color: "#b0a0a0", fontFamily: "Jost, sans-serif" }}
          >
            ({product.ratings?.count || 0})
          </span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span
            className="font-bold"
            style={{ color: "#c9727a", fontFamily: "Jost, sans-serif" }}
          >
            Rs. {product.price?.toLocaleString()}
          </span>
          {product.originalPrice && (
            <span
              className="text-xs line-through"
              style={{ color: "#c0a0a0", fontFamily: "Jost, sans-serif" }}
            >
              Rs. {product.originalPrice?.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── SKELETON ─────────────────────────────────────────────────────────────────
function ProductSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col lg:flex-row gap-10">
        <div className="flex-1">
          <div className="skeleton rounded-3xl" style={{ height: "520px" }} />
          <div className="flex gap-2 mt-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="skeleton rounded-2xl flex-1"
                style={{ height: "80px" }}
              />
            ))}
          </div>
        </div>
        <div className="flex-1 space-y-4">
          <div className="skeleton h-6 rounded" style={{ width: "40%" }} />
          <div className="skeleton h-10 rounded" style={{ width: "80%" }} />
          <div className="skeleton h-4 rounded" style={{ width: "30%" }} />
          <div className="skeleton h-8 rounded" style={{ width: "25%" }} />
          <div className="skeleton h-20 rounded" />
          <div className="skeleton h-12 rounded-full" />
        </div>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { user } = useAuthStore();

  const [product, setProduct] = useState(null);
  const [category, setCategory] = useState(null);
  const [relatedProducts, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [quantity, setQty] = useState(1);
  const [addedCart, setAddedCart] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const [activeTab, setTab] = useState("description");
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [variantPrice, setVariantPrice] = useState(null);
  const [variantStock, setVariantStock] = useState(null);
  const relScrollRef = useRef(null);

  // Fetch product by ID
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await productAPI.getById(id);
        const prod = res.data.data;
        setProduct(prod);
        setActiveImg(0);

        // Fetch category details
        // Fetch category details
        if (prod.categoryId) {
          // Check if categoryId is an object with _id, or just a string
          const catId =
            typeof prod.categoryId === "object"
              ? prod.categoryId._id
              : prod.categoryId;
          if (catId) {
            const catRes = await api.get(`/categories/${catId}`);
            setCategory(catRes.data.data);
          }
        }

        // Fetch related products (same category)
        const cat = prod.category;
        const relRes = await productAPI.getAll({ category: cat, limit: 6 });
        const filtered = relRes.data.data.products.filter((p) => p._id !== id);
        setRelated(filtered.slice(0, 5));
      } catch (err) {
        console.error("Failed to fetch product:", err);
        toast.error("Product not found");
        navigate("/products");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  const handleAddToCart = useCallback(async () => {
    if (!user) {
      toast.info("Please login to add items to cart");
      navigate("/login");
      return;
    }

    // Check if attributes are required but not selected
    const requiredAttrs = category?.attributes?.filter((a) => a.required) || [];
    const missingAttrs = requiredAttrs.filter(
      (attr) => !selectedAttributes[attr.name],
    );

    if (missingAttrs.length > 0) {
      toast.error(
        `Please select ${missingAttrs.map((a) => a.label).join(", ")}`,
      );
      return;
    }

    const result = await addToCart(product._id, quantity);
    if (result.success) {
      setAddedCart(true);
      toast.success("Added to cart!");
      setTimeout(() => setAddedCart(false), 2000);
    } else {
      toast.error(result.message);
    }
  }, [
    user,
    product,
    quantity,
    addToCart,
    navigate,
    selectedAttributes,
    category,
  ]);

  const handleWishlist = useCallback(async () => {
    if (!user) {
      toast.info("Please login to use wishlist");
      navigate("/login");
      return;
    }
    const result = await toggleWishlist(product._id);
    if (result.success) {
      toast.success(
        result.added ? "Added to wishlist!" : "Removed from wishlist",
      );
    }
  }, [user, product, toggleWishlist, navigate]);

  const handleRelatedCart = useCallback(
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

  const handleAttributeChange = (attrName, value) => {
    setSelectedAttributes((prev) => ({ ...prev, [attrName]: value }));
  };

  const handleVariantChange = (variant) => {
    if (variant.price) setVariantPrice(variant.price);
    if (variant.stock !== undefined) setVariantStock(variant.stock);
  };

  const scrollRel = (dir) => {
    if (relScrollRef.current) {
      relScrollRef.current.scrollBy({ left: dir * 220, behavior: "smooth" });
    }
  };

  if (loading)
    return (
      <div className="min-h-screen" style={{ background: "#fdf8f5" }}>
        <style>{`
          .skeleton { background: linear-gradient(90deg, #f0e0e0 25%, #fde8e8 50%, #f0e0e0 75%); background-size: 200% 100%; animation: skeletonAnim 1.5s infinite; }
          @keyframes skeletonAnim { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        `}</style>
        <ProductSkeleton />
      </div>
    );

  if (!product) return null;

  const images =
    product.images?.length > 0
      ? product.images.map((img) => img.url)
      : ["https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800"];

  const wishlisted = isInWishlist(product._id);
  const inStock = (variantStock !== null ? variantStock : product.stock) > 0;
  const displayPrice = variantPrice || product.price;
  const originalPrice = product.originalPrice;
  const discount = originalPrice
    ? Math.round((1 - displayPrice / originalPrice) * 100)
    : null;

  // Get available attributes for review form
  const availableColors = product?.availableAttributes?.color || [];
  const availableSizes = product?.availableAttributes?.size || [];

  return (
    <div className="min-h-screen" style={{ background: "#fdf8f5" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Jost:wght@300;400;500;600;700&display=swap');
        .display-font { font-family: 'Playfair Display', serif; }
        .btn-primary { background: linear-gradient(135deg, #c9727a, #e8a0a0); color: white; font-family: 'Jost', sans-serif; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; font-size: 0.78rem; transition: all 0.28s ease; border: none; cursor: pointer; }
        .btn-primary:hover:not(:disabled) { background: linear-gradient(135deg, #b05e66, #d48888); transform: translateY(-1px); box-shadow: 0 8px 24px rgba(180,80,80,0.32); }
        .btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }
        .btn-outline { border: 1.5px solid #c9727a; color: #c9727a; font-family: 'Jost', sans-serif; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; font-size: 0.78rem; transition: all 0.25s ease; background: transparent; cursor: pointer; }
        .btn-outline:hover { background: #fde8e8; }
        .thumb-active { box-shadow: 0 0 0 2.5px #c9727a; }
        .tab-btn { font-family: 'Jost', sans-serif; font-size: 0.88rem; font-weight: 500; letter-spacing: 0.04em; transition: all 0.2s ease; padding-bottom: 12px; border-bottom: 2px solid transparent; white-space: nowrap; }
        .tab-btn.active { color: #c9727a; border-bottom-color: #c9727a; font-weight: 600; }
        .tab-btn:not(.active) { color: #8a6060; }
        .tab-btn:not(.active):hover { color: #2d1a1a; }
        .related-card { transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease; }
        .related-card:hover { transform: translateY(-5px); box-shadow: 0 16px 40px rgba(180,80,80,0.13); }
        .lightbox-bg { position: fixed; inset: 0; background: rgba(20,10,10,0.92); z-index: 100; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(8px); }
        .fade-up { animation: fadeUp 0.5s ease both; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        ::-webkit-scrollbar { height: 4px; } ::-webkit-scrollbar-track { background: #fdf8f5; } ::-webkit-scrollbar-thumb { background: #e8a0a0; border-radius: 3px; }
      `}</style>

      {/* BREADCRUMB */}
      <div
        style={{
          background:
            "linear-gradient(135deg, #fde8e8 0%, #fdf0e8 50%, #fde8f4 100%)",
          borderBottom: "1px solid #f0d8d8",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav
            className="flex items-center gap-2 text-xs"
            style={{ color: "#a07070", fontFamily: "Jost, sans-serif" }}
          >
            <span
              className="cursor-pointer hover:text-rose-500 transition-colors"
              onClick={() => navigate("/")}
            >
              Home
            </span>
            <span>›</span>
            <span
              className="cursor-pointer hover:text-rose-500 transition-colors"
              onClick={() => navigate("/products")}
            >
              Products
            </span>
            <span>›</span>
            <span className="capitalize" style={{ color: "#c9727a" }}>
              {product.category}
            </span>
            <span>›</span>
            <span style={{ color: "#8a6060" }} className="truncate max-w-xs">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
          {/* ── IMAGE GALLERY ── */}
          <div className="flex-1 lg:max-w-xl fade-up">
            {/* Main image */}
            <div
              className="relative rounded-3xl overflow-hidden bg-white cursor-zoom-in group"
              style={{
                aspectRatio: "4/5",
                border: "1.5px solid #f5e0e0",
                boxShadow: "0 8px 40px rgba(180,80,80,0.1)",
              }}
              onClick={() => setLightbox(true)}
            >
              <img
                src={images[activeImg]}
                alt={product.name}
                className="w-full h-full object-cover gallery-main transition-opacity duration-300"
              />

              {/* Zoom hint */}
              <div
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white bg-opacity-80 backdrop-blur-sm flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: "#c9727a" }}
              >
                <ZoomIcon />
              </div>

              {/* Stock badge */}
              {!inStock && (
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <span
                    className="text-white font-bold text-lg"
                    style={{ fontFamily: "Jost, sans-serif" }}
                  >
                    Out of Stock
                  </span>
                </div>
              )}

              {inStock &&
                (variantStock !== null ? variantStock : product.stock) > 0 &&
                (variantStock !== null ? variantStock : product.stock) < 10 && (
                  <div className="absolute top-4 left-4">
                    <span
                      className="px-3 py-1 rounded-full text-white text-xs font-bold"
                      style={{
                        background: "#f59e0b",
                        fontFamily: "Jost, sans-serif",
                      }}
                    >
                      Only{" "}
                      {variantStock !== null ? variantStock : product.stock}{" "}
                      left!
                    </span>
                  </div>
                )}

              {/* Tag badge */}
              {product.tags?.[0] && (
                <span
                  className="absolute top-4 left-4 tag-badge px-3 py-1.5 rounded-full text-white text-xs"
                  style={{
                    background:
                      product.tags[0] === "Sale" ? "#c9727a" : "#b07a3a",
                  }}
                >
                  {product.tags[0]}
                </span>
              )}

              {/* Nav arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImg(
                        (i) => (i - 1 + images.length) % images.length,
                      );
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white bg-opacity-90 shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-105"
                    style={{ color: "#2d1a1a" }}
                  >
                    <ChevronLeft />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImg((i) => (i + 1) % images.length);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white bg-opacity-90 shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-105"
                    style={{ color: "#2d1a1a" }}
                  >
                    <ChevronRight />
                  </button>
                </>
              )}

              {/* Slide counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImg(i);
                    }}
                    className="rounded-full transition-all"
                    style={{
                      width: i === activeImg ? "20px" : "6px",
                      height: "6px",
                      background:
                        i === activeImg ? "#c9727a" : "rgba(255,255,255,0.7)",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1 hide-scrollbar">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden transition-all duration-200 ${
                      activeImg === i ? "thumb-active" : "hover:opacity-80"
                    }`}
                    style={{ border: "1.5px solid #f0e0e0" }}
                  >
                    <img
                      src={img}
                      alt={`View ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── PRODUCT INFO ── */}
          <div className="flex-1 fade-up" style={{ animationDelay: "0.12s" }}>
            {/* Brand + SKU */}
            <div className="flex items-center justify-between mb-2">
              {product.brand && (
                <span
                  className="text-xs font-semibold tracking-widest uppercase"
                  style={{
                    color: "#c9727a",
                    fontFamily: "Jost, sans-serif",
                    letterSpacing: "0.2em",
                  }}
                >
                  {product.brand}
                </span>
              )}
              <div className="flex items-center gap-2">
                {product.sku && (
                  <span
                    className="text-xs"
                    style={{ color: "#b0a0a0", fontFamily: "Jost, sans-serif" }}
                  >
                    SKU: {product.sku}
                  </span>
                )}
                <button
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-rose-50 transition-colors"
                  style={{ color: "#c9727a", border: "1.5px solid #f0d0d0" }}
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success("Link copied to clipboard!");
                  }}
                >
                  <ShareIcon />
                </button>
              </div>
            </div>

            {/* Name */}
            <h1
              className="display-font font-bold mb-3"
              style={{
                fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)",
                color: "#2d1a1a",
                lineHeight: 1.15,
              }}
            >
              {product.name}
            </h1>

            {/* Rating row */}
            <div className="flex items-center gap-3 mb-5 flex-wrap">
              <RatingStars rating={product.ratings?.average || 0} size="lg" />
              <span
                className="font-bold"
                style={{ color: "#c9727a", fontFamily: "Jost, sans-serif" }}
              >
                {product.ratings?.average?.toFixed(1)}
              </span>
              <a
                href="#reviews"
                className="text-sm underline underline-offset-2 hover:no-underline transition-all"
                style={{
                  color: "#8b3a4a",
                  fontFamily: "Jost, sans-serif",
                  textDecorationColor: "#e8a0a0",
                }}
              >
                {product.ratings?.count?.toLocaleString() || 0} reviews
              </a>
              <span
                className="w-1 h-1 rounded-full"
                style={{ background: "#d0b0b0" }}
              />
              <span
                className="text-xs font-medium capitalize"
                style={{ color: "#5a3d3d", fontFamily: "Jost, sans-serif" }}
              >
                {product.category}
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span
                className="display-font font-bold"
                style={{ fontSize: "2rem", color: "#c9727a" }}
              >
                Rs. {displayPrice?.toLocaleString()}
              </span>
              {originalPrice && originalPrice > displayPrice && (
                <>
                  <span
                    className="text-lg line-through"
                    style={{ color: "#c0a0a0", fontFamily: "Jost, sans-serif" }}
                  >
                    Rs. {originalPrice?.toLocaleString()}
                  </span>
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-bold"
                    style={{
                      background: "#fde8e8",
                      color: "#c9727a",
                      fontFamily: "Jost, sans-serif",
                      border: "1px solid #f5d0d0",
                    }}
                  >
                    Save {discount}% ✦
                  </span>
                </>
              )}
            </div>

            <div
              className="h-px mb-6"
              style={{
                background: "linear-gradient(90deg, #f5d0d0, transparent)",
              }}
            />

            {/* ── DYNAMIC ATTRIBUTES (Color, Size, etc.) ── */}
            <div className="mb-6">
              <DynamicAttributes
                product={product}
                category={category}
                onAttributeChange={handleAttributeChange}
                selectedAttributes={selectedAttributes}
                onPriceChange={setVariantPrice}
                onStockChange={setVariantStock}
                onVariantChange={handleVariantChange}
              />
            </div>

            {/* Description preview */}
            {product.description && (
              <p
                className="mb-6 leading-relaxed"
                style={{
                  color: "#5a3d3d",
                  fontFamily: "Jost, sans-serif",
                  fontWeight: "300",
                  fontSize: "0.95rem",
                  lineHeight: "1.8",
                }}
              >
                {product.description.slice(0, 200)}
                {product.description.length > 200 ? "..." : ""}
              </p>
            )}

            {/* Stock info */}
            <div className="flex items-center gap-2 mb-6">
              <div
                className={`w-2 h-2 rounded-full ${inStock ? "bg-green-500" : "bg-red-400"}`}
              />
              <span
                className="text-sm font-medium"
                style={{
                  fontFamily: "Jost, sans-serif",
                  color: inStock ? "#22c55e" : "#ef4444",
                }}
              >
                {inStock
                  ? `In Stock (${variantStock !== null ? variantStock : product.stock} available)`
                  : "Out of Stock"}
              </span>
            </div>

            {/* Quantity */}
            {inStock && (
              <div className="mb-6">
                <p
                  className="text-xs font-semibold tracking-wider uppercase mb-2"
                  style={{ color: "#8a6060", fontFamily: "Jost, sans-serif" }}
                >
                  Quantity
                </p>
                <div
                  className="inline-flex items-center rounded-2xl overflow-hidden"
                  style={{ border: "1.5px solid #f0d0d0" }}
                >
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center text-lg font-medium transition-colors hover:bg-rose-50"
                    style={{ color: "#c9727a", fontFamily: "Jost, sans-serif" }}
                  >
                    −
                  </button>
                  <span
                    className="w-12 text-center font-semibold text-sm"
                    style={{ color: "#2d1a1a", fontFamily: "Jost, sans-serif" }}
                  >
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQty((q) =>
                        Math.min(
                          variantStock !== null ? variantStock : product.stock,
                          q + 1,
                        ),
                      )
                    }
                    className="w-10 h-10 flex items-center justify-center text-lg font-medium transition-colors hover:bg-rose-50"
                    style={{ color: "#c9727a", fontFamily: "Jost, sans-serif" }}
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={!inStock || addedCart}
                className={`btn-primary flex-1 py-4 rounded-2xl flex items-center justify-center gap-2 ${
                  addedCart ? "bg-green-500 text-white" : ""
                }`}
                style={{
                  boxShadow: inStock
                    ? "0 6px 20px rgba(180,80,80,0.28)"
                    : "none",
                }}
              >
                <CartIcon />
                {addedCart
                  ? "Added to Cart!"
                  : inStock
                    ? `Add to Cart — Rs. ${(displayPrice * quantity)?.toLocaleString()}`
                    : "Out of Stock"}
              </button>
              <button
                onClick={handleWishlist}
                className={`btn-outline w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all hover:scale-105 ${
                  wishlisted ? "pulse-once" : ""
                }`}
                style={{
                  borderColor: wishlisted ? "#c9727a" : "#e0c8c8",
                  background: wishlisted ? "#fde8e8" : "white",
                }}
              >
                <HeartIcon filled={wishlisted} />
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                {
                  icon: <TruckIcon />,
                  title: "Free delivery",
                  sub: "Orders over Rs. 2000",
                },
                {
                  icon: <ShieldIcon />,
                  title: "Secure checkout",
                  sub: "SSL encrypted",
                },
                {
                  icon: <CheckIcon />,
                  title: "Free returns",
                  sub: "30-day window",
                },
                {
                  icon: <CheckIcon />,
                  title: "Authentic",
                  sub: "100% genuine",
                },
              ].map(({ icon, title, sub }) => (
                <div
                  key={title}
                  className="flex flex-col items-center text-center rounded-2xl py-3 px-2"
                  style={{ background: "#fdf0f0", border: "1px solid #f5e0e0" }}
                >
                  <span style={{ color: "#c9727a" }} className="mb-1">
                    {icon}
                  </span>
                  <p
                    className="text-xs font-semibold"
                    style={{ color: "#2d1a1a", fontFamily: "Jost, sans-serif" }}
                  >
                    {title}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "#a07070", fontFamily: "Jost, sans-serif" }}
                  >
                    {sub}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="mt-16">
          <div
            className="flex gap-6 border-b overflow-x-auto hide-scrollbar mb-8"
            style={{ borderColor: "#f0e0e0" }}
          >
            {["description", "features", "details", "reviews"].map((tab) => (
              <button
                key={tab}
                onClick={() => setTab(tab)}
                className={`tab-btn capitalize ${activeTab === tab ? "active" : ""}`}
              >
                {tab === "features" ? "Features" : tab}
                {tab === "reviews" && ` (${product.ratings?.count || 0})`}
              </button>
            ))}
          </div>

          <div className="max-w-3xl fade-up">
            {/* Description Tab */}
            {activeTab === "description" && (
              <div>
                <p
                  className="leading-relaxed mb-6"
                  style={{
                    color: "#5a3d3d",
                    fontFamily: "Jost, sans-serif",
                    fontWeight: 300,
                    fontSize: "1.02rem",
                    lineHeight: "1.85",
                  }}
                >
                  {product.description || "No description available."}
                </p>
              </div>
            )}

            {/* Features Tab */}
            {activeTab === "features" &&
              product.features &&
              product.features.length > 0 && (
                <div className="grid sm:grid-cols-2 gap-4">
                  {product.features.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 rounded-2xl p-4"
                      style={{
                        background: "white",
                        border: "1.5px solid #f5e0e0",
                      }}
                    >
                      <span
                        className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: "#fde8e8", color: "#c9727a" }}
                      >
                        <CheckIcon />
                      </span>
                      <p
                        className="text-sm"
                        style={{
                          color: "#5a3d3d",
                          fontFamily: "Jost, sans-serif",
                        }}
                      >
                        {f}
                      </p>
                    </div>
                  ))}
                </div>
              )}

            {/* Details Tab */}
            {activeTab === "details" && (
              <div className="space-y-4">
                {[
                  ["Category", product.category],
                  ["Price", `Rs. ${displayPrice?.toLocaleString()}`],
                  originalPrice && originalPrice > displayPrice
                    ? [
                        "Original Price",
                        `Rs. ${originalPrice?.toLocaleString()}`,
                      ]
                    : null,
                  [
                    "Stock",
                    (variantStock !== null ? variantStock : product.stock) > 0
                      ? `${variantStock !== null ? variantStock : product.stock} units`
                      : "Out of Stock",
                  ],
                  [
                    "Rating",
                    `${product.ratings?.average?.toFixed(1) || "0.0"} / 5`,
                  ],
                  ["Reviews", product.ratings?.count || 0],
                  product.brand ? ["Brand", product.brand] : null,
                  product.sku ? ["SKU", product.sku] : null,
                  product.returnRisk?.level
                    ? ["Return Risk", product.returnRisk.level.toUpperCase()]
                    : null,
                ]
                  .filter(Boolean)
                  .map(([k, v]) => (
                    <div
                      key={k}
                      className="flex gap-4 py-3"
                      style={{ borderBottom: "1px solid #f5e8e8" }}
                    >
                      <span
                        className="w-28 flex-shrink-0 text-sm font-semibold"
                        style={{
                          color: "#8b3a4a",
                          fontFamily: "Jost, sans-serif",
                        }}
                      >
                        {k}
                      </span>
                      <span
                        className="text-sm capitalize"
                        style={{
                          color: "#5a3d3d",
                          fontFamily: "Jost, sans-serif",
                        }}
                      >
                        {v}
                      </span>
                    </div>
                  ))}
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === "reviews" && (
              <div id="reviews">
                <ReviewSection
                  productId={id}
                  ratings={product.ratings}
                  availableSizes={availableSizes}
                  availableColors={availableColors}
                />
              </div>
            )}
          </div>
        </div>

        {/* ── RELATED PRODUCTS ── */}
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <div className="flex items-center justify-between gap-4 mb-8">
              <div>
                <span
                  className="text-xs font-semibold tracking-widest uppercase"
                  style={{
                    color: "#c9727a",
                    fontFamily: "Jost, sans-serif",
                    letterSpacing: "0.2em",
                  }}
                >
                  You May Also Love
                </span>
                <h2
                  className="display-font font-bold text-3xl mt-1"
                  style={{ color: "#2d1a1a" }}
                >
                  Related Pieces
                </h2>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => scrollRel(-1)}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105"
                  style={{
                    background: "white",
                    border: "1.5px solid #f0d0d0",
                    color: "#c9727a",
                  }}
                >
                  <ChevronLeft />
                </button>
                <button
                  onClick={() => scrollRel(1)}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105"
                  style={{
                    background: "white",
                    border: "1.5px solid #f0d0d0",
                    color: "#c9727a",
                  }}
                >
                  <ChevronRight />
                </button>
              </div>
            </div>

            <div
              ref={relScrollRef}
              className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar"
              style={{ scrollbarWidth: "none" }}
            >
              {relatedProducts.map((p) => (
                <RelatedCard
                  key={p._id}
                  product={p}
                  onNavigate={(pid) => navigate(`/products/${pid}`)}
                  onCart={handleRelatedCart}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── LIGHTBOX ── */}
      {lightbox && (
        <div className="lightbox-bg" onClick={() => setLightbox(false)}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveImg((i) => (i - 1 + images.length) % images.length);
            }}
            className="absolute left-4 sm:left-8 w-12 h-12 rounded-full bg-white bg-opacity-10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-opacity-20 transition-all"
          >
            <ChevronLeft />
          </button>
          <div
            className="relative max-w-2xl w-full mx-4 sm:mx-12"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[activeImg]}
              alt={product.name}
              className="w-full rounded-3xl object-cover"
              style={{
                maxHeight: "85vh",
                boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
              }}
            />
            <div className="flex gap-2 justify-center mt-4">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className="rounded-full transition-all"
                  style={{
                    width: i === activeImg ? "24px" : "8px",
                    height: "8px",
                    background:
                      i === activeImg ? "#e8a0a0" : "rgba(255,255,255,0.4)",
                  }}
                />
              ))}
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveImg((i) => (i + 1) % images.length);
            }}
            className="absolute right-4 sm:right-8 w-12 h-12 rounded-full bg-white bg-opacity-10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-opacity-20 transition-all"
          >
            <ChevronRight />
          </button>
          <button
            onClick={() => setLightbox(false)}
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white bg-opacity-10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-opacity-20 transition-all text-xl font-light"
          >
            ×
          </button>
        </div>
      )}

      {/* ── STICKY MOBILE CTA ── */}
      {/* <div
        className="sticky bottom-0 lg:hidden bg-white px-4 py-3 flex gap-3"
        style={{
          borderTop: "1.5px solid #f0d8d8",
          boxShadow: "0 -4px 24px rgba(180,80,80,0.1)",
        }}
      >
        <button
          onClick={handleWishlist}
          className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{
            border: "1.5px solid #f0d0d0",
            background: wishlisted ? "#fde8e8" : "white",
            color: "#c9727a",
          }}
        >
          <HeartIcon filled={wishlisted} />
        </button>
        <button
          onClick={handleAddToCart}
          disabled={!inStock}
          className={`flex-1 h-12 rounded-2xl flex items-center justify-center gap-2 text-sm transition-all ${
            addedCart ? "bg-green-500 text-white" : "btn-primary"
          }`}
        >
          {addedCart ? (
            <>
              <CheckIcon /> Added!
            </>
          ) : (
            <>
              <CartIcon />
              {inStock
                ? `Add to Cart — Rs. ${(displayPrice * quantity)?.toLocaleString()}`
                : "Out of Stock"}
            </>
          )}
        </button>
      </div> */}

      {/* Hide scrollbar style */}
      <style>{`
        .hide-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .sticky-cta {
          position: sticky;
          bottom: 0;
          z-index: 20;
        }
        .pulse-once {
          animation: pulseOnce 0.5s ease;
        }
        @keyframes pulseOnce {
          0% { transform: scale(1); }
          50% { transform: scale(1.06); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
