const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // ── MongoDB: Duplicate key (e.g. email already exists) ────────────
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists. Please use a different value.`;
    statusCode = 409;
  }

  // ── Mongoose: Validation error ────────────────────────────────────
  if (err.name === "ValidationError") {
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
    statusCode = 422;
  }

  // ── Mongoose: Invalid ObjectId ────────────────────────────────────
  if (err.name === "CastError") {
    message = `Invalid ${err.path}: ${err.value}`;
    statusCode = 400;
  }

  // ── JWT: Invalid token ────────────────────────────────────────────
  if (err.name === "JsonWebTokenError") {
    message = "Invalid token. Please log in again.";
    statusCode = 401;
  }

  // ── JWT: Expired token ────────────────────────────────────────────
  if (err.name === "TokenExpiredError") {
    message = "Token expired. Please log in again.";
    statusCode = 401;
  }

  // ── Log errors ────────────────────────────────────────────────────
  if (process.env.NODE_ENV === "development") {
    console.error("ERROR:", err.message);
    console.error(err.stack);
  } else {
    console.error(`[${new Date().toISOString()}] ${statusCode} — ${message}`);
  }

  res.status(statusCode).json({
    success: false,
    message,
    // Show stack trace only in development
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
