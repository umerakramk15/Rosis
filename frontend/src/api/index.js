import api from "./axiosInstance";

// ── Products ────────────────────────────────────────────────────────────
export const productAPI = {
  getAll: (params) => api.get("/products", { params }),
  getById: (id) => api.get(`/products/${id}`),
  getMyProducts: (params) =>
    api.get("/products/merchant/my-products", { params }),
  create: (formData) =>
    api.post("/products", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id, formData) =>
    api.put(`/products/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (id) => api.delete(`/products/${id}`),
  deleteImage: (id, publicId) =>
    api.delete(`/products/${id}/image`, { data: { publicId } }),
};

// Add Category API
export const categoryAPI = {
  getAll: () => api.get("/categories"),
  getMyCategories: () => api.get("/categories/my/categories"),
  create: (data) => api.post("/categories", data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

// ── Orders ────────────────────────────────────────────────────────────
export const orderAPI = {
  placeOrder: (data) => api.post("/orders", data),
  getMyOrders: (params) => api.get("/orders/my-orders", { params }),
  getById: (id) => api.get(`/orders/${id}`),
  cancelOrder: (id) => api.patch(`/orders/${id}/cancel`),

  // Merchant
  getMerchantOrders: (params) => api.get("/orders/merchant/all", { params }),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  getKPIs: () => api.get("/orders/merchant/kpis"),
};

// ── Wishlist ──────────────────────────────────────────────────────────
export const wishlistAPI = {
  getWishlist: () => api.get("/wishlist"),
  toggleWishlist: (productId) => api.post("/wishlist/toggle", { productId }),
  moveToCart: (productId) => api.post("/wishlist/move-to-cart", { productId }),
  clearWishlist: () => api.delete("/wishlist/clear"),
};

// ── Search ────────────────────────────────────────────────────────────
export const searchAPI = {
  keyword: (params) => api.get("/search", { params }),
  visual: (imageBase64) => api.post("/search/visual", { imageBase64 }),
  llm: (query) => api.post("/search/llm", { query }),
};

// ── Merchant AI ───────────────────────────────────────────────────────
export const merchantAPI = {
  // Forecast
  getAllForecasts: () => api.get("/merchant/forecast"),
  getForecast: (productId, days = 7) =>
    api.get(`/merchant/forecast/${productId}`, { params: { days } }),

  // Pricing
  getPricing: (productId) => api.get(`/merchant/pricing/${productId}`),
  approvePricing: (productId, suggestedPrice) =>
    api.post(`/merchant/pricing/${productId}/approve`, { suggestedPrice }),

  // Returns
  getReturnRisks: () => api.get("/merchant/returns"),

  // Coaching
  getCoaching: () => api.get("/merchant/coaching"),

  // Compliance
  getCompliance: () => api.get("/merchant/compliance"),
  getAIAlerts: () => api.get("/merchant/alerts"),
  getAnalytics: (params) => api.get("/merchant/analytics", { params }),
  getTrendAnalysis: (period = "30d") =>
    api.get(`/merchant/trend-analysis?period=${period}`),
  getChannelInsights: () => api.get("/merchant/channel-insights"),

  // NEW: Force refresh forecast for a product
  refreshForecast: (productId, days = 7) =>
    api.post(`/merchant/forecast/${productId}/refresh?days=${days}`),

  // NEW: Refresh all forecasts
  refreshAllForecasts: () => api.post("/merchant/forecast/refresh-all"),
};

// ── User Profile ──────────────────────────────────────────────────────
export const userAPI = {
  getProfile: () => api.get("/users/profile"),
  updateProfile: (formData) =>
    api.put("/users/profile", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // Addresses
  getAddresses: () => api.get("/users/addresses"),
  addAddress: (data) => api.post("/users/addresses", data),
  updateAddress: (id, data) => api.put(`/users/addresses/${id}`, data),
  deleteAddress: (id) => api.delete(`/users/addresses/${id}`),
  setDefaultAddress: (id) => api.patch(`/users/addresses/${id}/default`),
};
