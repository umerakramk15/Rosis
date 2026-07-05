import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { productAPI } from "../api/productAPI";
import useCartStore from "../store/cartStore";
import useAuthStore from "../store/authStore";
import { toast } from "react-toastify";
import { Leaf, CornerDownLeft, TruckElectric, HeartPulse } from "lucide-react";
import { Link } from "react-router-dom";
import { wishlistAPI } from "../api/index"; // Add this import

const CATEGORIES = [
  {
    name: "Shirts",
    img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80",
    count: "124 styles",
  },
  {
    name: "Bags",
    img: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&q=80",
    count: "89 styles",
  },
  {
    name: "Shoes",
    img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80",
    count: "210 styles",
  },
  {
    name: "Watches",
    img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80",
    count: "156 styles",
  },
  {
    name: "Electronics",
    img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80",
    count: "98 styles",
  },
  {
    name: "Pants",
    img: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80",
    count: "73 styles",
  },
];

const REVIEWS = [
  {
    name: "Sophia L.",
    avatar: "S",
    review:
      "Absolutely obsessed with every piece I have ordered. The quality is unmatched.",
    stars: 5,
  },
  {
    name: "Amara K.",
    avatar: "A",
    review:
      "My go-to for everything. The products fit like they were made for me!",
    stars: 5,
  },
  {
    name: "Isabella R.",
    avatar: "I",
    review: "Fast delivery and every item is even more beautiful in person.",
    stars: 5,
  },
];

function StarIcon({ filled }) {
  return (
    <svg
      className={`w-4 h-4 ${filled ? "text-amber-400" : "text-gray-300"}`}
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118L10 14.347l-3.35 2.436c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.664 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z" />
    </svg>
  );
}

function HeartIcon({ filled }) {
  return (
    <svg
      className={`w-5 h-5 ${filled ? "fill-rose-400 text-rose-400" : "text-gray-400"}`}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
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
}

function ChevronRight() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

export default function GirlyShop() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const heroRef = useRef(null);
  const navigate = useNavigate();
  const { addToCart } = useCartStore();
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await productAPI.getAll({ limit: 9 });
        const products = res.data.data.products;
        setFeaturedProducts(products.slice(0, 4));
        setTrendingProducts(products.slice(4, 9));
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);
  useEffect(() => {
    if (user) {
      wishlistAPI.getWishlist().then((res) => {
        setWishlistItems(res.data.data.map((item) => item.product._id));
      });
    }
  }, [user]);
  useEffect(() => {
    const fetchWishlist = async () => {
      if (user) {
        try {
          const res = await wishlistAPI.getWishlist();
          setWishlistItems(res.data.data.map((item) => item.product._id));
        } catch (err) {
          console.error("Failed to fetch wishlist:", err);
        }
      }
    };
    fetchWishlist();
  }, [user]);

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

  const toggleWishlist = async (productId) => {
    if (!user) {
      toast.info("Please login to use wishlist");
      navigate("/login");
      return;
    }

    try {
      const res = await wishlistAPI.toggleWishlist(productId);
      if (res.data.success) {
        // ✅ ADD THIS - Update local state
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
  };

  const handleAddToCart = async (productId) => {
    if (!user) {
      toast.info("Please login to add items to cart");
      navigate("/login");
      return;
    }
    const result = await addToCart(productId, 1);
    if (result.success)
      toast.success("Added to cart!", {
        position: "bottom-right",
        autoClose: 2000,
      });
    else toast.error(result.message);
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) setSubscribed(true);
  };

  return (
    <div>
      {/* HERO SECTION */}
      <section
        ref={heroRef}
        className="relative overflow-hidden"
        style={{
          minHeight: "88vh",
          background:
            "linear-gradient(130deg, #fdf0f0 0%, #fff5f0 40%, #fdeaf5 100%)",
        }}
      >
        <div
          className="absolute top-20 right-10 w-72 h-72 rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, #f9a0a0, transparent)",
          }}
        />
        <div
          className="absolute bottom-10 left-5 w-48 h-48 rounded-full opacity-15"
          style={{
            background: "radial-gradient(circle, #f5c5e0, transparent)",
          }}
        />
        <div
          className="absolute top-1/2 left-1/3 w-32 h-32 rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, #f9c784, transparent)",
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div
            className="flex flex-col lg:flex-row items-center justify-between"
            style={{
              minHeight: "88vh",
              gap: "2rem",
              paddingTop: "4rem",
              paddingBottom: "4rem",
            }}
          >
            <div className="flex-1 text-center lg:text-left z-10">
              <div
                className="hero-float stagger-1 inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
                style={{
                  background: "rgba(201,114,122,0.12)",
                  border: "1px solid rgba(201,114,122,0.25)",
                }}
              >
                <span
                  className="text-xs font-semibold tracking-widest"
                  style={{ color: "#c9727a", fontFamily: "Jost, sans-serif" }}
                >
                  NEW SPRING COLLECTION 2026
                </span>
              </div>
              <h1
                className="display-font hero-float stagger-2 font-bold leading-tight mb-4"
                style={{
                  fontSize: "clamp(2.8rem, 6vw, 5rem)",
                  color: "#2d1a1a",
                  lineHeight: "1.1",
                }}
              >
                Bloom Into
                <br />
                <em style={{ color: "#c9727a" }}>Your Style</em>
              </h1>
              <p
                className="hero-float stagger-3 mb-8 max-w-md mx-auto lg:mx-0"
                style={{
                  fontFamily: "Jost, sans-serif",
                  color: "#7a5555",
                  fontSize: "1.05rem",
                  lineHeight: "1.7",
                  fontWeight: "300",
                }}
              >
                Discover our curated collection of feminine pieces crafted for
                the modern woman who embraces beauty in every detail.
              </p>
              <div className="hero-float stagger-4 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link
                  to="/products"
                  className="btn-primary px-8 py-4 rounded-full text-sm shadow-lg"
                >
                  Shop New Arrivals
                </Link>
                <Link
                  to="/products"
                  className="btn-outline px-8 py-4 rounded-full text-sm"
                >
                  Explore Looks
                </Link>
              </div>
              <div className="hero-float stagger-4 flex items-center gap-6 mt-10 justify-center lg:justify-start">
                {["Free Returns", "Secure Pay", "Eco Packaging"].map(
                  (badge) => (
                    <div key={badge} className="flex items-center gap-1.5">
                      <span style={{ color: "#c9727a", fontSize: "14px" }}>
                        ✓
                      </span>
                      <span
                        className="text-xs"
                        style={{
                          fontFamily: "Jost, sans-serif",
                          color: "#7a5555",
                        }}
                      >
                        {badge}
                      </span>
                    </div>
                  ),
                )}
              </div>
            </div>

            <div
              className="flex-1 relative flex justify-center lg:justify-end"
              style={{ minHeight: "400px" }}
            >
              <div className="relative w-full max-w-md">
                <div
                  className="relative rounded-3xl overflow-hidden shadow-2xl img-zoom"
                  style={{ height: "480px", border: "3px solid white" }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&q=80"
                    alt="Hero"
                    className="w-full h-full object-cover"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(45,26,26,0.2) 0%, transparent 60%)",
                    }}
                  />
                  <div className="absolute bottom-6 left-6 right-6 bg-white bg-opacity-90 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p
                          className="text-xs text-gray-500 mb-0.5"
                          style={{ fontFamily: "Jost, sans-serif" }}
                        >
                          Spring Edit
                        </p>
                        <p
                          className="display-font font-semibold text-base"
                          style={{ color: "#2d1a1a" }}
                        >
                          Cherry Blossom Dress
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className="font-bold"
                          style={{
                            color: "#c9727a",
                            fontFamily: "Jost, sans-serif",
                          }}
                        >
                          $148
                        </p>
                        <button
                          onClick={handleAddToCart}
                          className="text-xs btn-primary px-3 py-1.5 rounded-full mt-1 block"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className="absolute -left-8 top-16 bg-white rounded-2xl shadow-xl p-3 w-28 hidden sm:block"
                  style={{ border: "2px solid #fde8e8" }}
                >
                  <div className="rounded-xl overflow-hidden h-20 img-zoom">
                    <img
                      src="https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=200&q=80"
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p
                    className="text-xs mt-2 font-medium"
                    style={{ fontFamily: "Jost, sans-serif", color: "#3d2a2a" }}
                  >
                    Blush Set
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "#c9727a", fontFamily: "Jost, sans-serif" }}
                  >
                    $86
                  </p>
                </div>
                <div
                  className="absolute -right-4 top-24 bg-white rounded-2xl shadow-xl p-3 hidden sm:block"
                  style={{ border: "2px solid #fde8e8", minWidth: "130px" }}
                >
                  <div className="flex gap-0.5 mb-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <StarIcon key={i} filled />
                    ))}
                  </div>
                  <p
                    className="text-xs font-semibold"
                    style={{ fontFamily: "Jost, sans-serif", color: "#2d1a1a" }}
                  >
                    4.9/5 Rating
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "#7a5555", fontFamily: "Jost, sans-serif" }}
                  >
                    12k+ reviews
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 scroll-indicator">
          <p
            className="text-xs tracking-widest"
            style={{
              color: "#c9727a",
              fontFamily: "Jost, sans-serif",
              letterSpacing: "0.2em",
            }}
          >
            SCROLL
          </p>
          <div
            className="w-px h-8"
            style={{
              background: "linear-gradient(to bottom, #c9727a, transparent)",
            }}
          />
        </div>
      </section>

      {/* MARQUEE */}
      <div
        className="py-4 border-y"
        style={{ background: "#fde8e8", borderColor: "#f0d0d0" }}
      >
        <div className="marquee-container">
          <div className="marquee-track">
            {Array(2)
              .fill([
                "✿ New Arrivals",
                "⋆ Free Shipping",
                "✦ Handpicked Styles",
                "❀ Sustainable Fashion",
                "✿ Exclusive Deals",
                "⋆ Spring Sale",
                "✦ Premium Quality",
              ])
              .flat()
              .map((item, i) => (
                <span
                  key={i}
                  className="inline-block px-8 text-sm font-medium"
                  style={{
                    color: "#8b3a4a",
                    fontFamily: "Jost, sans-serif",
                    letterSpacing: "0.12em",
                  }}
                >
                  {item}
                </span>
              ))}
          </div>
        </div>
      </div>

      {/* FEATURED PRODUCTS */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span
            className="text-xs tracking-widest font-semibold uppercase"
            style={{
              color: "#c9727a",
              fontFamily: "Jost, sans-serif",
              letterSpacing: "0.2em",
            }}
          >
            Handpicked for You
          </span>
          <h2
            className="display-font text-4xl font-bold mt-2"
            style={{ color: "#2d1a1a" }}
          >
            Featured Collection
          </h2>
          <div className="flex items-center justify-center gap-3 mt-3">
            <div
              className="h-px w-16"
              style={{
                background: "linear-gradient(to right, transparent, #e8a0a0)",
              }}
            />
            <span style={{ color: "#e8a0a0", fontSize: "18px" }}>✿</span>
            <div
              className="h-px w-16"
              style={{
                background: "linear-gradient(to left, transparent, #e8a0a0)",
              }}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loadingProducts
            ? Array(4)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="rounded-3xl overflow-hidden bg-white shadow-sm"
                    style={{ border: "1px solid #f5e0e0" }}
                  >
                    <div className="skeleton" style={{ height: "300px" }} />
                    <div className="p-4 space-y-2">
                      <div
                        className="skeleton h-3 rounded"
                        style={{ width: "60%" }}
                      />
                      <div
                        className="skeleton h-4 rounded"
                        style={{ width: "80%" }}
                      />
                      <div
                        className="skeleton h-4 rounded"
                        style={{ width: "40%" }}
                      />
                    </div>
                  </div>
                ))
            : featuredProducts.map((product) => (
                <div
                  key={product._id}
                  className="group card-hover rounded-3xl overflow-hidden bg-white shadow-sm cursor-pointer"
                  style={{ border: "1px solid #f5e0e0" }}
                >
                  <div
                    className="relative overflow-hidden img-zoom"
                    style={{ height: "300px" }}
                    onClick={() => navigate(`/products/${product._id}`)}
                  >
                    <img
                      src={
                        product.images[0]?.url ||
                        "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400"
                      }
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    <span
                      className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold text-white"
                      style={{ background: "#c9727a" }}
                    >
                      {product.category}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(product._id);
                      }}
                      className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center transition-transform hover:scale-110"
                    >
                      <HeartIcon filled={wishlistItems.includes(product._id)} />
                    </button>
                    <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 p-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product._id);
                        }}
                        className="btn-primary w-full py-3 rounded-2xl shadow-lg"
                      >
                        Quick Add to Cart
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <p
                      className="text-xs mb-1"
                      style={{
                        color: "#a07070",
                        fontFamily: "Jost, sans-serif",
                      }}
                    >
                      {product.category}
                    </p>
                    <h3
                      className="display-font font-semibold mb-2"
                      style={{ color: "#2d1a1a", fontSize: "1rem" }}
                    >
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span
                        className="font-bold text-lg"
                        style={{
                          color: "#c9727a",
                          fontFamily: "Jost, sans-serif",
                        }}
                      >
                        Rs. {product.price}
                      </span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <StarIcon
                            key={i}
                            filled={
                              i <= Math.round(product.ratings?.average || 4)
                            }
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
        </div>
        <div className="text-center mt-10">
          <button
            onClick={() => navigate("/products")}
            className="btn-outline px-10 py-4 rounded-full"
          >
            View All Products
          </button>
        </div>
      </section>

      {/* CATEGORY GRID */}
      <section
        className="py-10 px-4 sm:px-6 lg:px-8"
        style={{
          background: "linear-gradient(180deg, #fdf8f5 0%, #fff0f0 100%)",
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <span
              className="text-xs tracking-widest font-semibold uppercase"
              style={{
                color: "#c9727a",
                fontFamily: "Jost, sans-serif",
                letterSpacing: "0.2em",
              }}
            >
              Browse by Category
            </span>
            <h2
              className="display-font text-4xl font-bold mt-2"
              style={{ color: "#2d1a1a" }}
            >
              Shop the Edit
            </h2>
            <div className="flex items-center justify-center gap-3 mt-3">
              <div
                className="h-px w-16"
                style={{
                  background: "linear-gradient(to right, transparent, #e8a0a0)",
                }}
              />
              <span style={{ color: "#e8a0a0", fontSize: "18px" }}>❀</span>
              <div
                className="h-px w-16"
                style={{
                  background: "linear-gradient(to left, transparent, #e8a0a0)",
                }}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {CATEGORIES.map((cat, i) => (
              <div
                key={cat.name}
                className={`relative category-card cursor-pointer overflow-hidden ${i === 0 ? "md:row-span-2" : ""}`}
                style={{
                  borderRadius: "24px",
                  height: i === 0 ? undefined : "200px",
                  minHeight: i === 0 ? "420px" : undefined,
                }}
                onClick={() =>
                  navigate(`/products?category=${cat.name.toLowerCase()}`)
                }
              >
                <div className="img-zoom w-full h-full">
                  <img
                    src={cat.img}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                    style={{ borderRadius: "24px" }}
                  />
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-white bg-opacity-85 backdrop-blur-sm rounded-2xl px-4 py-2 flex items-center justify-between">
                    <div>
                      <p
                        className="display-font font-semibold text-sm"
                        style={{ color: "#2d1a1a" }}
                      >
                        {cat.name}
                      </p>
                      <p
                        className="text-xs"
                        style={{
                          color: "#7a5555",
                          fontFamily: "Jost, sans-serif",
                        }}
                      >
                        {cat.count}
                      </p>
                    </div>
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center"
                      style={{ background: "#c9727a" }}
                    >
                      <ChevronRight />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRENDING */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4">
          <div>
            <span
              className="text-xs tracking-widest font-semibold uppercase"
              style={{
                color: "#c9727a",
                fontFamily: "Jost, sans-serif",
                letterSpacing: "0.2em",
              }}
            >
              What's Hot
            </span>
            <h2
              className="display-font text-4xl font-bold mt-1"
              style={{ color: "#2d1a1a" }}
            >
              Trending Now
            </h2>
          </div>
          <button
            onClick={() => navigate("/products")}
            className="btn-outline px-6 py-2.5 rounded-full text-sm flex-shrink-0"
          >
            See All Trends
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {loadingProducts
            ? Array(5)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="rounded-2xl overflow-hidden bg-white shadow-sm"
                    style={{ border: "1px solid #f5e0e0" }}
                  >
                    <div className="skeleton" style={{ height: "220px" }} />
                    <div className="p-3 space-y-2">
                      <div className="skeleton h-3 rounded" />
                      <div
                        className="skeleton h-3 rounded"
                        style={{ width: "50%" }}
                      />
                    </div>
                  </div>
                ))
            : trendingProducts.map((product) => (
                <div
                  key={product._id}
                  className="group card-hover rounded-2xl overflow-hidden bg-white shadow-sm cursor-pointer"
                  style={{ border: "1px solid #f5e0e0" }}
                  onClick={() => navigate(`/products/${product._id}`)}
                >
                  <div
                    className="relative overflow-hidden img-zoom"
                    style={{ height: "220px" }}
                  >
                    <img
                      src={
                        product.images[0]?.url ||
                        "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=300"
                      }
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(product._id);
                      }}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center transition-transform hover:scale-110"
                    >
                      <HeartIcon filled={wishlistItems.includes(product._id)} />
                    </button>
                    <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 p-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product._id);
                        }}
                        className="btn-primary w-full py-2 rounded-xl text-xs"
                      >
                        + Add to Cart
                      </button>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3
                      className="text-sm font-medium mb-1 leading-tight"
                      style={{
                        color: "#2d1a1a",
                        fontFamily: "Jost, sans-serif",
                      }}
                    >
                      {product.name}
                    </h3>
                    <p
                      className="font-bold text-sm"
                      style={{
                        color: "#c9727a",
                        fontFamily: "Jost, sans-serif",
                      }}
                    >
                      Rs. {product.price}
                    </p>
                  </div>
                </div>
              ))}
        </div>
      </section>

      {/* BRAND PROMISE */}
      <section className="py-14 px-4 brand-promise">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          {[
            {
              icon: <Leaf size={48} color="#BA6A70" />,
              title: "Sustainably Made",
              desc: "Eco-conscious materials",
            },
            {
              icon: <HeartPulse size={48} color="#BA6A70" />,
              title: "Ethically Sourced",
              desc: "Fair trade certified",
            },
            {
              icon: <TruckElectric size={48} color="#BA6A70" />,
              title: "Fast Delivery",
              desc: "2-5 business days",
            },
            {
              icon: <CornerDownLeft size={48} color="#BA6A70" />,
              title: "Easy Returns",
              desc: "30-day hassle free",
            },
          ].map((item) => (
            <div key={item.title} className="flex flex-col items-center gap-2">
              <span className="text-3xl">{item.icon}</span>
              <h3 className="display-font font-semibold">{item.title}</h3>
              <p
                className="text-sm"
                style={{ color: "#a08080", fontFamily: "Jost, sans-serif" }}
              >
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* REVIEWS */}
      <section
        className="py-20 px-4 sm:px-6 lg:px-8"
        style={{ background: "#fdf8f5" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <span
              className="text-xs tracking-widest font-semibold uppercase"
              style={{
                color: "#c9727a",
                fontFamily: "Jost, sans-serif",
                letterSpacing: "0.2em",
              }}
            >
              Our Community
            </span>
            <h2
              className="display-font text-4xl font-bold mt-2"
              style={{ color: "#2d1a1a" }}
            >
              Loved by Thousands
            </h2>
            <div className="flex items-center justify-center gap-3 mt-3">
              <div
                className="h-px w-16"
                style={{
                  background: "linear-gradient(to right, transparent, #e8a0a0)",
                }}
              />
              <span style={{ color: "#e8a0a0", fontSize: "18px" }}>❀</span>
              <div
                className="h-px w-16"
                style={{
                  background: "linear-gradient(to left, transparent, #e8a0a0)",
                }}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {REVIEWS.map((review) => (
              <div
                key={review.name}
                className="card-hover rounded-3xl p-7 bg-white shadow-sm"
                style={{ border: "1px solid #f0e0e0" }}
              >
                <div className="flex gap-0.5 mb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <StarIcon key={i} filled={i <= review.stars} />
                  ))}
                </div>
                <p
                  className="mb-6 leading-relaxed"
                  style={{
                    color: "#5a3d3d",
                    fontFamily: "Jost, sans-serif",
                    fontWeight: "300",
                    fontSize: "0.95rem",
                  }}
                >
                  "{review.review}"
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{
                      background: "linear-gradient(135deg, #c9727a, #e8a0a0)",
                    }}
                  >
                    {review.avatar}
                  </div>
                  <div>
                    <p
                      className="font-semibold text-sm"
                      style={{
                        color: "#2d1a1a",
                        fontFamily: "Jost, sans-serif",
                      }}
                    >
                      {review.name}
                    </p>
                    <p
                      className="text-xs"
                      style={{
                        color: "#a07070",
                        fontFamily: "Jost, sans-serif",
                      }}
                    >
                      Verified Buyer ✓
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="newsletter-section py-20 px-4">
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <span className="text-4xl block mb-4">✉️</span>
          <h2
            className="display-font text-4xl font-bold mb-3"
            style={{ color: "#2d1a1a" }}
          >
            Join the Rosée Circle
          </h2>
          <p
            className="mb-8"
            style={{
              fontFamily: "Jost, sans-serif",
              color: "#7a5555",
              fontSize: "1rem",
              lineHeight: "1.7",
              fontWeight: "300",
            }}
          >
            Subscribe for exclusive early access to new drops, members-only
            discounts, and style inspiration curated just for you.
          </p>
          {subscribed ? (
            <div className="flex flex-col items-center gap-3">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
                style={{
                  background: "linear-gradient(135deg, #c9727a, #e8a0a0)",
                }}
              >
                ✓
              </div>
              <p
                className="display-font text-xl font-semibold"
                style={{ color: "#2d1a1a" }}
              >
                Welcome to the circle!
              </p>
              <p
                className="text-sm"
                style={{ color: "#7a5555", fontFamily: "Jost, sans-serif" }}
              >
                Check your inbox for a special welcome gift 🎁
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubscribe}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                required
                className="flex-1 px-5 py-4 rounded-full bg-white shadow-sm text-sm"
                style={{
                  border: "1.5px solid rgba(201,114,122,0.3)",
                  fontFamily: "Jost, sans-serif",
                  color: "#2d1a1a",
                }}
              />
              <button
                type="submit"
                className="btn-primary px-7 py-4 rounded-full shadow-lg flex-shrink-0"
              >
                Subscribe
              </button>
            </form>
          )}
          <p
            className="text-xs mt-4"
            style={{ color: "#a08080", fontFamily: "Jost, sans-serif" }}
          >
            No spam, ever. Unsubscribe anytime. 💕
          </p>
        </div>
      </section>

      {/* INSTAGRAM STRIP */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2
            className="display-font text-3xl font-bold"
            style={{ color: "#2d1a1a" }}
          >
            @rosee.shop
          </h2>
          <p
            className="mt-2 text-sm"
            style={{ fontFamily: "Jost, sans-serif", color: "#7a5555" }}
          >
            Tag us for a chance to be featured ✨
          </p>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
          {[
            "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=250&q=80",
            "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=250&q=80",
            "https://images.unsplash.com/photo-1588117305388-c2631a279f82?w=250&q=80",
            "https://plus.unsplash.com/premium_photo-1727942991384-9523c773bc30?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=250&q=80",
            "https://images.unsplash.com/photo-1519707574798-77140649cfe5?q=80&w=1335&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          ].map((src, i) => (
            <div
              key={i}
              className="relative group overflow-hidden cursor-pointer img-zoom"
              style={{ borderRadius: "16px", aspectRatio: "1" }}
            >
              <img src={src} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-25 transition-all duration-300 flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 text-white text-2xl transition-opacity duration-300">
                  ♡
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <style>{`
        .hero-float { animation: floatUp 1s ease forwards; opacity: 0; }
        @keyframes floatUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .stagger-1 { animation-delay: 0.1s; } .stagger-2 { animation-delay: 0.3s; } .stagger-3 { animation-delay: 0.5s; } .stagger-4 { animation-delay: 0.7s; }
        .marquee-container { overflow: hidden; white-space: nowrap; }
        .marquee-track { display: inline-flex; animation: marquee 22s linear infinite; }
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .newsletter-section {
          background: linear-gradient(135deg, #fde0e0 0%, #fce8f4 40%, #fde0d0 100%);
          position: relative; overflow: hidden;
        }
        .newsletter-section::before {
          content: '';
          position: absolute;
          width: 400px; height: 400px;
          border-radius: 50%;
          background: rgba(255,255,255,0.25);
          top: -100px; right: -100px;
        }
        .newsletter-section::after {
          content: '';
          position: absolute;
          width: 300px; height: 300px;
          border-radius: 50%;
          background: rgba(255,255,255,0.15);
          bottom: -80px; left: -80px;
        }
        .brand-promise { background: linear-gradient(135deg, #fde0e0 0%, #fce8f4 40%, #fde0d0 100%); position: relative; overflow: hidden;}
        .scroll-indicator { animation: bounce 2s infinite; }
        @keyframes bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(8px); } }
        .skeleton { background: linear-gradient(90deg, #f0e0e0 25%, #fde8e8 50%, #f0e0e0 75%); background-size: 200% 100%; animation: skeletonAnim 1.5s infinite; }
        @keyframes skeletonAnim { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
      `}</style>
    </div>
  );
}
