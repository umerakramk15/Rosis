import api from './axiosInstance';

export const cartAPI = {
  // Get cart
  getCart: () => api.get('/cart'),

  // Add item to cart
  addToCart: (productId, qty = 1) =>
    api.post('/cart/add', { productId, qty }),

  // Update item quantity
  updateItem: (itemId, qty) =>
    api.put(`/cart/item/${itemId}`, { qty }),

  // Remove item
  removeItem: (itemId) => api.delete(`/cart/item/${itemId}`),

  // Clear cart
  clearCart: () => api.delete('/cart/clear'),

  // Apply promo code
  applyPromo: (promoCode) => api.post('/cart/promo', { promoCode }),
};
