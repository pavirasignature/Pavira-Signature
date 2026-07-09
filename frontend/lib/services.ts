import api from "./api";

// Auth Services
export const authService = {
  register: async (data: any) => {
    const response = await api.post("/auth/register", data);
    return response.data;
  },
  login: async (data: any) => {
    const response = await api.post("/auth/login", data);
    return response.data;
  },
  googleLogin: async (data: any) => {
    const response = await api.post("/auth/google", data);
    return response.data;
  },
  getMe: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },
  updateProfile: async (data: any) => {
    const response = await api.put("/auth/profile", data);
    return response.data;
  },
  updatePassword: async (data: any) => {
    const response = await api.put("/auth/password", data);
    return response.data;
  },
  forgotPassword: async (data: any) => {
    const response = await api.post("/auth/forgot-password", data);
    return response.data;
  },
  resetPassword: async (token: string, data: any) => {
    const response = await api.put(`/auth/reset-password/${token}`, data);
    return response.data;
  },
  deleteAccount: async () => {
    const response = await api.delete("/auth/account");
    return response.data;
  },
};

// Product Services
export const productService = {
  getProducts: async (params?: any) => {
    const response = await api.get("/products", { params });
    // Backend returns { success, data, pagination }
    return {
      data: response.data.data || [],
      pagination: response.data.pagination,
    };
  },
  getProduct: async (id: string) => {
    const response = await api.get(`/products/${id}`);
    return response.data.data || response.data;
  },
  getRelatedProducts: async (id: string) => {
    const response = await api.get(`/products/${id}/related`);
    return response.data.data || [];
  },

  createProduct: async (data: any) => {
    const response = await api.post("/products", data);
    return response.data.data || response.data;
  },
  updateProduct: async (id: string, data: any) => {
    const response = await api.put(`/products/${id}`, data);
    return response.data.data || response.data;
  },
  deleteProduct: async (id: string) => {
    const response = await api.delete(`/products/${id}`);
    return response.data.data || response.data;
  },
};

// Category Services
export const categoryService = {
  getCategories: async () => {
    const response = await api.get("/categories");
    return {
      data: response.data.data || [],
    };
  },
  getCategory: async (id: string) => {
    const response = await api.get(`/categories/${id}`);
    return response.data.data || response.data;
  },
};

// Featured/Trending/Bestsellers
export const featuredProductService = {
  getFeatured: async (limit: number = 8) => {
    const response = await api.get("/products/featured", { params: { limit } });
    return response.data.data || [];
  },
  getTrending: async (limit: number = 8) => {
    const response = await api.get("/products/trending", { params: { limit } });
    return response.data.data || [];
  },
  getBestSellers: async (limit: number = 8) => {
    const response = await api.get("/products/bestsellers", { params: { limit } });
    return response.data.data || [];
  },
};

// Order Services
export const orderService = {
  createOrder: async (data: any) => {
    const response = await api.post("/orders", data);
    return response.data;
  },
  getOrder: async (id: string) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },
  getMyOrders: async (params?: any) => {
    const response = await api.get("/orders/my-orders", { params });
    return response.data;
  },
  addToCart: async (data: any) => {
    const response = await api.post("/orders/cart", data);
    return response.data;
  },
  getCart: async () => {
    const response = await api.get("/orders/cart");
    return response.data;
  },
  updateCartItem: async (productId: string, data: any) => {
    const response = await api.put(`/orders/cart/${productId}`, data);
    return response.data;
  },
  removeFromCart: async (productId: string) => {
    const response = await api.delete(`/orders/cart/${productId}`);
    return response.data;
  },
  updateOrderStatus: async (id: string, status: string, note?: string) => {
    const response = await api.put(`/orders/${id}/status`, { status, note });
    return response.data;
  },
  updateOrderTracking: async (
    id: string,
    trackingData: {
      carrier: string;
      trackingNumber: string;
      estimatedDelivery?: string;
    },
  ) => {
    const response = await api.put(`/orders/${id}/tracking`, trackingData);
    return response.data;
  },
  deleteOrder: async (id: string) => {
    const response = await api.delete(`/orders/${id}`);
    return response.data;
  },
};

// User Services
export const userService = {
  addAddress: async (data: any) => {
    const response = await api.post("/users/address", data);
    return response.data;
  },
  updateAddress: async (addressId: string, data: any) => {
    const response = await api.put(`/users/address/${addressId}`, data);
    return response.data;
  },
  deleteAddress: async (addressId: string) => {
    const response = await api.delete(`/users/address/${addressId}`);
    return response.data;
  },
  addToWishlist: async (productId: string) => {
    const response = await api.post("/users/wishlist", { productId });
    return response.data;
  },
  removeFromWishlist: async (productId: string) => {
    const response = await api.delete(`/users/wishlist/${productId}`);
    return response.data;
  },
  getWishlist: async () => {
    const response = await api.get("/users/wishlist");
    return response.data;
  },
};

// Coupon Services
export const couponService = {
  getCoupons: async () => {
    const response = await api.get("/coupons");
    return response.data;
  },
  createCoupon: async (data: any) => {
    const response = await api.post("/coupons", data);
    return response.data;
  },
  deleteCoupon: async (id: string) => {
    const response = await api.delete(`/coupons/${id}`);
    return response.data;
  },
  validateCoupon: async (data: any) => {
    const response = await api.post("/coupons/validate", data);
    return response.data;
  },
};

// Payment Services
export const paymentService = {
  createStripeCheckout: async (data: any) => {
    const response = await api.post(
      "/payments/stripe/create-checkout-session",
      data,
    );
    return response.data;
  },
  verifyStripePayment: async (data: any) => {
    const response = await api.post("/payments/stripe/verify", data);
    return response.data;
  },
  createRazorpayOrder: async (data: any) => {
    const response = await api.post("/payments/razorpay/create-order", data);
    return response.data;
  },
  verifyRazorpayPayment: async (data: any) => {
    const response = await api.post("/payments/razorpay/verify", data);
    return response.data;
  },
  confirmCODPayment: async (data: any) => {
    const response = await api.post("/payments/cod/confirm", data);
    return response.data;
  },
  processCardPayment: async (data: any) => {
    const response = await api.post("/payments/card/process", data);
    return response.data;
  },
};

// Admin Services
export const adminService = {
  getAnalytics: async () => {
    const response = await api.get("/admin/analytics");
    return response.data;
  },
  getLowStock: async () => {
    const response = await api.get("/admin/low-stock");
    return response.data;
  },
  getSalesReport: async (params?: { startDate?: string; endDate?: string }) => {
    const response = await api.get("/admin/sales-report", { params });
    return response.data;
  },
  generateInvoice: async (orderId: string) => {
    const response = await api.post(`/admin/invoice/${orderId}`);
    return response.data;
  },
};

// Upload Services
export const uploadService = {
  uploadSingle: async (file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    const response = await api.post("/upload/single", formData);
    return response.data;
  },
  uploadMultiple: async (files: File[]) => {
    // 1. Get presigned URLs from backend
    const fileMetadata = files.map(f => ({ name: f.name, type: f.type }));
    const presignedRes = await api.post("/upload/presigned", { files: fileMetadata });
    
    if (!presignedRes.data.success) {
      throw new Error("Failed to get upload URLs");
    }

    const { urls } = presignedRes.data;

    // 2. Upload directly to Supabase using native fetch (bypasses Next.js limits)
    const uploadPromises = files.map((file, i) => {
      return fetch(urls[i].signedUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type
        }
      });
    });

    const uploadResults = await Promise.all(uploadPromises);

    for (const res of uploadResults) {
      if (!res.ok) {
         throw new Error("Failed to upload file to storage bucket");
      }
    }

    // 3. Format response to match existing expectations
    return {
      success: true,
      images: urls.map((u: any) => ({ url: u.publicUrl, publicId: u.path }))
    };
  },
  deleteImage: async (publicId: string) => {
    const response = await api.delete(`/upload/${publicId}`);
    return response.data;
  },
};
