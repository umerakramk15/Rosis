import { create } from 'zustand';
// import { cartAPI } from '../api/index';
import { cartAPI } from '../api/cartAPI';

const useCartStore = create((set, get) => ({
  items: [],
  total: 0,
  discount: 0,
  isLoading: false,

  // ── Fetch cart from backend ─────────────────────────────────────────
  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const res = await cartAPI.getCart();
      const cart = res.data.data;
      set({
        items: cart.items || [],
        discount: cart.discount || 0,
        isLoading: false,
      });
    } catch (_) {
      set({ isLoading: false });
    }
  },

  // ── Add to cart ─────────────────────────────────────────────────────
  addToCart: async (productId, qty = 1) => {
    try {
      const res = await cartAPI.addToCart(productId, qty);
      const cart = res.data.data;
      set({ items: cart.items || [], discount: cart.discount || 0 });
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to add to cart' };
    }
  },

  // ── Update quantity ─────────────────────────────────────────────────
  updateItem: async (itemId, qty) => {
    try {
      const res = await cartAPI.updateItem(itemId, qty);
      set({ items: res.data.data.items || [] });
    } catch (err) {
      console.error(err);
    }
  },

  // ── Remove item ─────────────────────────────────────────────────────
  removeItem: async (itemId) => {
    try {
      const res = await cartAPI.removeItem(itemId);
      set({ items: res.data.data.items || [] });
    } catch (err) {
      console.error(err);
    }
  },

  // ── Clear cart ──────────────────────────────────────────────────────
  clearCart: async () => {
    try {
      await cartAPI.clearCart();
      set({ items: [], discount: 0 });
    } catch (err) {
      console.error(err);
    }
  },

  // ── Apply promo ─────────────────────────────────────────────────────
  applyPromo: async (promoCode) => {
    try {
      const res = await cartAPI.applyPromo(promoCode);
      const cart = res.data.data;
      set({ items: cart.items || [], discount: cart.discount || 0 });
      return { success: true, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Invalid promo code' };
    }
  },

  // ── Cart count (for navbar badge) ───────────────────────────────────
  cartCount: () => get().items.reduce((sum, item) => sum + item.qty, 0),

  // ── Cart subtotal ────────────────────────────────────────────────────
  subtotal: () => get().items.reduce((sum, item) => sum + item.price * item.qty, 0),
}));

export default useCartStore;
