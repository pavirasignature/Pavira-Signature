/**
 * API Client Utility
 * Centralized API communication
 */

"use client";

import axios from "axios";

// Safe API URL resolution
let API_URL: string;
const isBrowser = typeof window !== "undefined";
const isLocalhost = isBrowser && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
const envApiUrl = process.env.NEXT_PUBLIC_API_URL;

if (envApiUrl && (!isBrowser || !envApiUrl.includes("localhost") || isLocalhost)) {
  API_URL = envApiUrl;
} else if (isBrowser && !isLocalhost) {
  API_URL = "/api";
} else if (process.env.NODE_ENV === "production") {
  API_URL = "/api";
} else {
  API_URL = "http://localhost:5000/api";
}

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 30000,
});

// Add request interceptor for token
api.interceptors.request.use((config: any) => {
  const token =
    typeof window !== "undefined" ? sessionStorage.getItem("token") : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response: any) => response,
  (error: any) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");

        // Dynamically clear Zustand store to avoid circular dependency
        import("@/store/useStore")
          .then((m) => {
            m.useStore.getState().logout();
          })
          .catch((err) =>
            console.error("Failed to load store for logout", err),
          );

        // Redirect to login only if accessing a protected page
        const pathname = window.location.pathname;
        const protectedPaths = ["/dashboard", "/checkout", "/admin", "/wishlist", "/cart"];
        const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
        
        if (isProtected) {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  },
);

// ===== Auth Endpoints =====
export const authAPI = {
  register: (data: any) => api.post("/auth/register", data),
  login: (data: any) => api.post("/auth/login", data),
  logout: () => api.post("/auth/logout"),
  getMe: () => api.get("/auth/me"),
  verifyEmail: (token: string) => api.get(`/auth/verify-email/${token}`),
  updateProfile: (data: any) => api.put("/auth/profile", data),
  updatePassword: (data: any) => api.put("/auth/password", data),
  changePassword: (data: any) => api.post("/auth/change-password", data),
  forgotPassword: (email: string) =>
    api.post("/auth/forgot-password", { email }),
  resetPassword: (token: string, data: any) =>
    api.put(`/auth/reset-password/${token}`, data),
  deleteAccount: () => api.delete("/auth/account"),
};

// ===== Product Endpoints =====
export const productAPI = {
  getAll: (params: any) => api.get("/products", { params }),
  getOne: (id: string) => api.get(`/products/${id}`),
  getFeatured: (limit: number = 8) =>
    api.get("/products/featured", { params: { limit } }),
  getTrending: (limit: number = 8) =>
    api.get("/products/trending", { params: { limit } }),
  getBestSellers: (limit: number = 8) =>
    api.get("/products/bestsellers", { params: { limit } }),
  getRelated: (id: string, limit: number = 4) =>
    api.get(`/products/${id}/related`, { params: { limit } }),
  getByCategory: (slug: string, params: any) =>
    api.get(`/products/category/${slug}`, { params }),
};

// ===== Category Endpoints =====
export const categoryAPI = {
  getAll: () => api.get("/categories"),
  getOne: (id: string) => api.get(`/categories/${id}`),
};

// ===== Order Endpoints =====
export const orderAPI = {
  create: (data: any) => api.post("/orders", data),
  getAll: (params: any) => api.get("/orders", { params }),
  getOne: (id: string) => api.get(`/orders/${id}`),
  updateStatus: (id: string, data: any) =>
    api.put(`/orders/${id}/status`, data),
  cancel: (id: string, data: any) => api.put(`/orders/${id}/cancel`, data),
  generateInvoice: (id: string) => api.get(`/orders/${id}/invoice`),
};

// ===== Payment Endpoints =====
export const paymentAPI = {
  stripe: {
    createIntent: (orderId: string) =>
      api.post("/payments/stripe/create-intent", { orderId }),
    confirm: (data: any) => api.post("/payments/stripe/confirm", data),
  },
  razorpay: {
    createOrder: (orderId: string) =>
      api.post("/payments/razorpay/create-order", { orderId }),
    verify: (data: any) => api.post("/payments/razorpay/verify", data),
  },
  cod: {
    confirm: (orderId: string) =>
      api.post("/payments/cod/confirm", { orderId }),
  },
  getDetails: (orderId: string) => api.get(`/payments/${orderId}`),
  refund: (orderId: string, data: any) =>
    api.post(`/payments/${orderId}/refund`, data),
};

// ===== Cart Endpoints =====
export const cartAPI = {
  add: (data: any) => api.post("/cart", data),
  get: () => api.get("/cart"),
  update: (productId: string, quantity: number) =>
    api.put(`/cart/${productId}`, { quantity }),
  remove: (productId: string) => api.delete(`/cart/${productId}`),
  clear: () => api.delete("/cart"),
};

// ===== Wishlist Endpoints =====
export const wishlistAPI = {
  getAll: () => api.get("/wishlists"),
  add: (productId: string) => api.post("/wishlists/add", { productId }),
  remove: (productId: string) => api.delete(`/wishlists/remove/${productId}`),
  check: (productId: string) => api.get(`/wishlists/check/${productId}`),
  clear: () => api.delete("/wishlists/clear"),
};

export default api;
