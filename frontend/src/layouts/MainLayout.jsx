import { Outlet, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import useCartStore from "../store/cartStore";
import useAuthStore from "../store/authStore";
import { toast } from "react-toastify";
import { wishlistAPI } from "../api/index";

// Icons (same as Home2)
function SearchIcon() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
      />
    </svg>
  );
}

function WishlistIcon() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
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

function MenuIcon() {
  return (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 6h16M4 12h16M4 18h16"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
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

const NAV_LINKS = ["New Arrivals", "Clothing", "Accessories", "Beauty", "Sale"];

const MainLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const navigate = useNavigate();
  const { addToCart, cartCount } = useCartStore();
  const { user, logout } = useAuthStore();
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const count = cartCount();

  useEffect(() => {
    if (user) {
      wishlistAPI.getWishlist().then((res) => {
        setWishlistCount(res.data.data.wishlist?.length || 0);
      });
    }
  }, [user]);

  return (
    <div
      className="min-h-screen font-sans"
      style={{ background: "#fdf8f5", color: "#2d2020" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Jost:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; }
        .display-font { font-family: 'Playfair Display', serif; }
        .card-hover { transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.35s ease; }
        .card-hover:hover { transform: translateY(-6px); box-shadow: 0 20px 60px rgba(180,80,80,0.13); }
        .img-zoom img { transition: transform 0.6s ease; }
        .img-zoom:hover img { transform: scale(1.07); }
        .btn-primary { background: linear-gradient(135deg, #c9727a, #e8a0a0); color: white; letter-spacing: 0.08em; transition: all 0.3s ease; font-family: 'Jost', sans-serif; font-weight: 500; text-transform: uppercase; font-size: 0.78rem; }
        .btn-primary:hover { background: linear-gradient(135deg, #b05e66, #d48888); transform: translateY(-1px); box-shadow: 0 8px 25px rgba(180,80,80,0.35); }
        .btn-outline { border: 1.5px solid #c9727a; color: #c9727a; letter-spacing: 0.08em; transition: all 0.3s ease; font-family: 'Jost', sans-serif; font-weight: 500; text-transform: uppercase; font-size: 0.78rem; }
        .btn-outline:hover { background: #c9727a; color: white; transform: translateY(-1px); }
        .nav-link { font-family: 'Jost', sans-serif; font-weight: 400; position: relative; font-size: 0.9rem; }
        .nav-link::after { content: ''; position: absolute; bottom: -2px; left: 0; width: 0; height: 1px; background: #c9727a; transition: width 0.3s ease; }
        .nav-link:hover::after { width: 100%; }
        .promo-bar { background: linear-gradient(90deg, #c9727a, #e8a0a0, #c9727a); background-size: 200% auto; animation: shimmer 4s linear infinite; }
        @keyframes shimmer { from { background-position: 200% center; } to { background-position: -200% center; } }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #fdf8f5; } ::-webkit-scrollbar-thumb { background: #e8a0a0; border-radius: 3px; }
      `}</style>

      {/* PROMO BAR */}
      <div
        className="promo-bar text-white text-center py-2 text-xs font-medium"
        style={{ fontFamily: "Jost, sans-serif", letterSpacing: "0.15em" }}
      >
        FREE SHIPPING ON ORDERS OVER Rs. 2000 &nbsp;·&nbsp; USE CODE:{" "}
        <span className="font-bold">SAVE10</span> FOR DISCOUNT
      </div>

      {/* HEADER */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "shadow-md bg-white bg-opacity-95 backdrop-blur-md" : "bg-white bg-opacity-90 backdrop-blur-sm"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <div
              className="flex items-center gap-2 flex-shrink-0 cursor-pointer"
              onClick={() => navigate("/")}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #f9c5c5, #e8a0a0)",
                }}
              >
                <span style={{ fontSize: "14px" }}>✿</span>
              </div>
              <span
                className="display-font text-xl font-bold"
                style={{ color: "#8b3a4a" }}
              >
                Rosée
              </span>
            </div>
            <nav className="hidden lg:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <a
                  key={link}
                  href="#"
                  className="nav-link"
                  style={{ color: "#3d2a2a" }}
                >
                  {link}
                </a>
              ))}
            </nav>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/search")}
                className="hidden sm:flex p-2 rounded-full hover:bg-rose-50 transition-colors"
                style={{ color: "#8b3a4a" }}
              >
                <SearchIcon />
              </button>
              <button
                onClick={() =>
                  navigate(
                    user
                      ? user.role === "merchant"
                        ? "/merchant/dashboard"
                        : "/customer/dashboard"
                      : "/login",
                  )
                }
                className="hidden sm:flex p-2 rounded-full hover:bg-rose-50 transition-colors"
                style={{ color: "#8b3a4a" }}
              >
                <UserIcon />
              </button>
              <button
                onClick={() => navigate("/wishlist")}
                className="relative p-2 rounded-full hover:bg-rose-50 transition-colors"
                style={{ color: "#8b3a4a" }}
              >
                <WishlistIcon />
                {wishlistCount > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-bold"
                    style={{ background: "#c9727a" }}
                  >
                    {wishlistCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => navigate("/cart")}
                className="relative p-2 rounded-full hover:bg-rose-50 transition-colors"
                style={{ color: "#8b3a4a" }}
              >
                <CartIcon />
                {count > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-bold"
                    style={{ background: "#c9727a" }}
                  >
                    {count}
                  </span>
                )}
              </button>
              <div className="hidden lg:flex items-center gap-2 ml-2">
                {user ? (
                  <>
                    <button
                      onClick={() =>
                        navigate(
                          user.role === "merchant"
                            ? "/merchant/dashboard"
                            : "/customer/dashboard",
                        )
                      }
                      className="btn-outline px-4 py-2 rounded-full text-sm"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={handleLogout}
                      className="btn-primary px-4 py-2 rounded-full text-sm"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => navigate("/login")}
                      className="btn-outline px-4 py-2 rounded-full text-sm"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => navigate("/login")}
                      className="btn-primary px-4 py-2 rounded-full text-sm"
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </div>
              <button
                className="lg:hidden p-2 rounded-full hover:bg-rose-50 transition-colors"
                style={{ color: "#8b3a4a" }}
                onClick={() => setMobileOpen(true)}
              >
                <MenuIcon />
              </button>
            </div>
          </div>
        </div>

        {/* Category sub-nav */}
        <div
          className="hidden lg:flex border-t items-center justify-center gap-10 py-2"
          style={{ borderColor: "#f0e0e0" }}
        >
          {[
            "All",
            "Tops",
            "Bottoms",
            "Dresses",
            "Outerwear",
            "Accessories",
            "Shoes",
            "Beauty",
          ].map((cat) => (
            <button
              key={cat}
              onClick={() =>
                setActiveCategory(cat === activeCategory ? null : cat)
              }
              className="text-xs tracking-wider transition-colors"
              style={{
                fontFamily: "Jost, sans-serif",
                letterSpacing: "0.1em",
                color: activeCategory === cat ? "#c9727a" : "#6b4a4a",
                fontWeight: activeCategory === cat ? "600" : "400",
                borderBottom:
                  activeCategory === cat ? "1.5px solid #c9727a" : "none",
                paddingBottom: "2px",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black bg-opacity-30"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-2xl flex flex-col">
            <div
              className="flex items-center justify-between p-5 border-b"
              style={{ borderColor: "#f0e0e0" }}
            >
              <span
                className="display-font text-xl font-bold"
                style={{ color: "#8b3a4a" }}
              >
                ✿ Rosée
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                style={{ color: "#8b3a4a" }}
              >
                <CloseIcon />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-1">
              {NAV_LINKS.map((link) => (
                <a
                  key={link}
                  href="#"
                  className="flex items-center justify-between py-3 border-b"
                  style={{
                    borderColor: "#f9f0f0",
                    color: "#3d2a2a",
                    fontFamily: "Jost, sans-serif",
                  }}
                >
                  {link} <ChevronRight />
                </a>
              ))}
              <div className="pt-4 space-y-3">
                {user ? (
                  <>
                    <button
                      onClick={() => {
                        navigate(
                          user.role === "merchant"
                            ? "/merchant/dashboard"
                            : "/customer/dashboard",
                        );
                        setMobileOpen(false);
                      }}
                      className="btn-outline w-full py-3 rounded-full"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={handleLogout}
                      className="btn-primary w-full py-3 rounded-full"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        navigate("/login");
                        setMobileOpen(false);
                      }}
                      className="btn-outline w-full py-3 rounded-full"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => {
                        navigate("/login");
                        setMobileOpen(false);
                      }}
                      className="btn-primary w-full py-3 rounded-full"
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT - THIS IS WHERE PAGE COMPONENTS RENDER */}
      <main>
        <Outlet />
      </main>

      {/* FOOTER */}
      <footer className="footer-bg text-white pt-16 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #f9c5c5, #e8a0a0)",
                  }}
                >
                  <span style={{ fontSize: "14px" }}>✿</span>
                </div>
                <span
                  className="display-font text-xl font-bold"
                  style={{ color: "#f9d0d0" }}
                >
                  Rosée
                </span>
              </div>
              <p
                className="text-sm leading-relaxed"
                style={{
                  color: "#f0d0d0",
                  fontFamily: "Jost, sans-serif",
                  fontWeight: "300",
                }}
              >
                Curated styles for the modern lifestyle.
              </p>
            </div>
            {[
              { title: "Shop", links: ["New Arrivals", "Bestsellers", "Sale"] },
              { title: "Help", links: ["FAQs", "Shipping", "Returns"] },
              { title: "About", links: ["Our Story", "Contact"] },
            ].map((col) => (
              <div key={col.title}>
                <h4
                  className="display-font font-semibold mb-5"
                  style={{ color: "#f0d0d0", fontSize: "1rem" }}
                >
                  {col.title}
                </h4>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-sm text-white hover:text-white transition-colors underline"
                        style={{
                          color: "#f0d0d0",
                          fontFamily: "Jost, sans-serif",
                        }}
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div
            className="border-t pt-8 text-center"
            style={{ borderColor: "#f0d0d0" }}
          >
            <p
              className="text-xs"
              style={{ color: "#f0d0d0", fontFamily: "Jost, sans-serif" }}
            >
              © 2026 Rosée. All rights reserved. Made with ♡
            </p>
          </div>
        </div>
      </footer>

      <style>{`
        .footer-bg { background-color: #C27377; }
      `}</style>
    </div>
  );
};

export default MainLayout;
