require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const corsOptions = require("./config/corsConfig");
const errorHandler = require("./middleware/errorHandler");
const {
  authLimiter,
  apiLimiter,
} = require("./middleware/rateLimit.middleware");
// ── Route Imports ─────────────────────────────────────────────────────
const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/product.routes");
const cartRoutes = require("./routes/cart.routes");
const orderRoutes = require("./routes/order.routes");
const searchRoutes = require("./routes/search.routes");
const merchantRoutes = require("./routes/merchant.routes");
const wishlistRoutes = require("./routes/wishlist.routes");
const userRoutes = require("./routes/user.routes");
const categoryRoutes = require("./routes/category.routes");

const app = express();

// ── Security Middleware ───────────────────────────────────────────────
app.use(helmet());
app.use(cors(corsOptions));

// ── Request Logging (dev only) ────────────────────────────────────────
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ── Body Parsers ──────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Rate Limiting ─────────────────────────────────────────────────────
app.use("/api/auth", authLimiter);
app.use("/api", apiLimiter);

// ── Routes ────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/merchant", merchantRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);

// ── Health Check ──────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "AI E-Commerce Backend is running",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ── 404 Handler ───────────────────────────────────────────────────────
app.use((req, res) => {
  res
    .status(404)
    .json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Global Error Handler (must be last) ───────────────────────────────
app.use(errorHandler);

module.exports = app;
