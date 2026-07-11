"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface StoreState {
  // Auth
  user: any;
  token: string | null;
  lastUserId: string | null;
  setUser: (user: any) => void;
  setToken: (token: string | null) => void;
  logout: () => void;

  // Cart
  cart: any[];
  addToCart: (product: any, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  fetchCart: () => Promise<void>;

  // Wishlist
  wishlist: any[];
  addToWishlist: (product: any) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: any) => void;
  fetchWishlist: () => Promise<void>;

  // UI
  isCartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Auth
      user:
        typeof window !== "undefined"
          ? sessionStorage.getItem("user")
            ? JSON.parse(sessionStorage.getItem("user")!)
            : null
          : null,
      token:
        typeof window !== "undefined" ? sessionStorage.getItem("token") : null,
      lastUserId: null,
      setUser: (user) => {
        set({ user, lastUserId: user ? user._id || user.id : null });
        if (typeof window !== "undefined") {
          if (user) {
            sessionStorage.setItem("user", JSON.stringify(user));
          } else {
            sessionStorage.removeItem("user");
          }
        }
      },
      setToken: (token) => {
        set({ token });
        if (typeof window !== "undefined") {
          if (token) {
            sessionStorage.setItem("token", token);
          } else {
            sessionStorage.removeItem("token");
          }
        }
        if (token) {
          get().fetchCart();
          get().fetchWishlist();
        }
      },
      logout: () => {
        set({
          user: null,
          token: null,
          cart: [],
          wishlist: [],
          lastUserId: null,
        });
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("user");
          // Also clear the persisted Zustand storage so stale cart/wishlist
          // never reappears on next page load
          localStorage.removeItem("pavira-signature-app-storage");
        }
      },

      // Cart
      cart: [],
      addToCart: async (product, quantity = 1) => {
        const productId = product._id || product.id || product.product;
        if (!productId) return;

        const currentCart = get().cart;
        const existingItem = currentCart.find(
          (item) => item.product === productId,
        );

        if (existingItem) {
          set({
            cart: currentCart.map((item) =>
              item.product === productId
                ? { ...item, quantity: item.quantity + quantity }
                : item,
            ),
          });
        } else {
          let image = product.image;
          if (!image && product.images && product.images.length > 0) {
            const firstImg = product.images[0];
            image = typeof firstImg === "string" ? firstImg : (firstImg && typeof firstImg === "object" ? firstImg.url : "");
          }

          set({
            cart: [
              ...currentCart,
              {
                product: productId,
                name: product.name,
                price: product.price,
                image: image || "",
                quantity,
                stock: product.stock !== undefined ? product.stock : 0,
              },
            ],
          });
        }

        const token =
          get().token ||
          (typeof window !== "undefined"
            ? sessionStorage.getItem("token")
            : null);
        if (token) {
          try {
            const { orderService } = await import("@/lib/services");
            await orderService.addToCart({ productId, quantity });
          } catch (error) {
            console.error("Failed to sync cart item with backend:", error);
          }
        }
      },
      removeFromCart: async (productId) => {
        set({ cart: get().cart.filter((item) => item.product !== productId) });

        const token =
          get().token ||
          (typeof window !== "undefined"
            ? sessionStorage.getItem("token")
            : null);
        if (token) {
          try {
            const { orderService } = await import("@/lib/services");
            const response = await orderService.removeFromCart(productId);
            if (!response.success) {
              console.error(
                "Failed to remove item from backend cart:",
                response.message,
              );
              // Re-add the item if backend removal failed
              const product = get().cart.find(
                (item) => item.product === productId,
              );
              if (!product) {
                set({
                  cart: [
                    ...get().cart,
                    { product: productId, quantity: 1, price: 0 },
                  ],
                });
              }
            }
          } catch (error: any) {
            console.error(
              "Failed to remove item from backend cart:",
              error?.message || error,
            );
            // Don't re-add since we already removed from local state
            // The backend will handle cleaning up orphaned cart items
          }
        }
      },
      updateCartQuantity: async (productId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId);
          return;
        }
        set({
          cart: get().cart.map((item) =>
            item.product === productId ? { ...item, quantity } : item,
          ),
        });

        const token =
          get().token ||
          (typeof window !== "undefined"
            ? sessionStorage.getItem("token")
            : null);
        if (token) {
          try {
            const { orderService } = await import("@/lib/services");
            await orderService.updateCartItem(productId, { quantity });
          } catch (error) {
            console.error(
              "Failed to update cart item quantity in backend:",
              error,
            );
          }
        }
      },
      clearCart: () => set({ cart: [] }),
      getCartTotal: () =>
        get().cart.reduce(
          (total, item) => total + item.price * item.quantity,
          0,
        ),
      fetchCart: async () => {
        const token =
          get().token ||
          (typeof window !== "undefined"
            ? sessionStorage.getItem("token")
            : null);
        const lastUserId = get().lastUserId;
        if (!token) {
          if (lastUserId) {
            set({ cart: [], wishlist: [], lastUserId: null });
          }
          return;
        }
        try {
          const { orderService } = await import("@/lib/services");
          const response = await orderService.getCart();
          if (response.success && response.cart) {
            const backendCart = response.cart.map((item: any) => ({
              product: item.product._id || item.product,
              name: item.product.name || item.name,
              price: item.price || item.product.price,
              image:
                item.product.images?.[0]?.url ||
                item.product.image ||
                item.image ||
                "",
              quantity: item.quantity,
              stock: item.product.stock !== undefined ? item.product.stock : 0,
            }));
            set({ cart: backendCart });
          }
        } catch (error) {
          console.error("Failed to fetch cart from backend:", error);
        }
      },

      // Wishlist
      wishlist: [],
      addToWishlist: (product) => {
        const productId =
          typeof product === "string" ? product : product._id || product.id;
        if (!productId) return;

        const isAlreadyIn = get().isInWishlist(productId);
        if (isAlreadyIn) return;

        // Save normalized product objects or simple representation
        const newItem =
          typeof product === "string" ? { _id: product } : product;
        set({ wishlist: [...get().wishlist, newItem] });
      },
      removeFromWishlist: (productId) =>
        set({
          wishlist: get().wishlist.filter(
            (item) => item._id !== productId && item.id !== productId,
          ),
        }),
      isInWishlist: (productId) =>
        get().wishlist.some(
          (item) =>
            item._id === productId ||
            item.id === productId ||
            item === productId,
        ),
      toggleWishlist: (product) => {
        const productId =
          typeof product === "string" ? product : product._id || product.id;
        if (get().isInWishlist(productId)) {
          get().removeFromWishlist(productId);
        } else {
          get().addToWishlist(product);
        }
      },
      fetchWishlist: async () => {
        const token =
          get().token ||
          (typeof window !== "undefined"
            ? sessionStorage.getItem("token")
            : null);
        if (!token) return;
        try {
          const { wishlistAPI } = await import("@/lib/api");
          const response = await wishlistAPI.getAll();
          if (response.data?.success && response.data?.data?.products) {
            const backendProducts = response.data.data.products.map(
              (item: any) => item.product,
            );
            set({ wishlist: backendProducts });
          }
        } catch (error) {
          console.error("Failed to fetch wishlist from backend:", error);
        }
      },

      // UI
      isCartOpen: false,
      setCartOpen: (open) => set({ isCartOpen: open }),
      isMobileMenuOpen: false,
      setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
    }),
    {
      name: "pavira-signature-app-storage",
      partialize: (state) => ({
        cart: state.cart,
        wishlist: state.wishlist,
        lastUserId: state.lastUserId,
      }),
      onRehydrateStorage: () => {
        // This callback fires after Zustand has rehydrated persisted state
        return (state, error) => {
          if (error) {
            console.error("Zustand rehydration error:", error);
            return;
          }
          if (!state) return;

          // If there is no active session token, the persisted cart/wishlist
          // belongs to a previous (now logged-out) user — clear it immediately
          if (typeof window !== "undefined") {
            const token = sessionStorage.getItem("token");
            if (!token) {
              state.cart = [];
              state.wishlist = [];
              state.lastUserId = null;
              // Also wipe the persisted key so it doesn't reappear
              localStorage.removeItem("pavira-signature-app-storage");
            }
          }
        };
      },
    },
  ),
);
