import { create } from 'zustand';
import { wishlistAPI } from '../api/index';

const useWishlistStore = create((set, get) => ({
  items: [],
  isLoading: false,

  // ── Fetch wishlist ──────────────────────────────────────────────────
  fetchWishlist: async () => {
    set({ isLoading: true });
    try {
      const res = await wishlistAPI.getWishlist();
      set({ items: res.data.data.wishlist || [], isLoading: false });
    } catch (_) {
      set({ isLoading: false });
    }
  },

  // ── Toggle item (add/remove) ────────────────────────────────────────
  toggleWishlist: async (productId) => {
    try {
      const res = await wishlistAPI.toggleWishlist(productId);
      const { added } = res.data.data;

      if (added) {
        // Will be refreshed on next fetch
        set((state) => ({ items: [...state.items, { _id: productId }] }));
      } else {
        set((state) => ({
          items: state.items.filter((i) => i._id !== productId),
        }));
      }
      return { success: true, added };
    } catch (err) {
      return { success: false, message: err.response?.data?.message };
    }
  },

  // ── Move to cart ────────────────────────────────────────────────────
  moveToCart: async (productId) => {
    try {
      await wishlistAPI.moveToCart(productId);
      set((state) => ({
        items: state.items.filter((i) => i._id !== productId),
      }));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message };
    }
  },

  // ── Check if item is in wishlist ────────────────────────────────────
  isInWishlist: (productId) =>
    get().items.some((i) => i._id === productId || i === productId),

  // ── Wishlist count ──────────────────────────────────────────────────
  wishlistCount: () => get().items.length,
}));

export default useWishlistStore;
