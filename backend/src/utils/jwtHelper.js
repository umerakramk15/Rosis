const jwt = require('jsonwebtoken');

// Short-lived access token (15 min) — used for API requests
const signToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '15m',
    issuer: 'ai-ecommerce',
    audience: 'ai-ecommerce-users',
  });
};

// Long-lived refresh token (7 days) — used to get new access token
const signRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET, {
    issuer: 'ai-ecommerce',
    audience: 'ai-ecommerce-users',
  });
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

module.exports = { signToken, signRefreshToken, verifyToken, verifyRefreshToken };
