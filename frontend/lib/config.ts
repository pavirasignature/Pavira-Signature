/**
 * Centralized Configuration
 * All app configuration in one place
 */

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

export const config = {
  // Environment
  env: {
    isDevelopment,
    isProduction,
    nodeEnv: process.env.NODE_ENV || 'development',
  },

  // API Configuration
  api: {
    baseUrl: (function() {
      const envUrl = process.env.NEXT_PUBLIC_API_URL;
      const isBrowser = typeof window !== "undefined";
      const isLocalhost = isBrowser && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
      if (envUrl && (!isBrowser || !envUrl.includes("localhost") || isLocalhost)) {
        return envUrl;
      }
      return isProduction ? "/api" : "http://localhost:5000/api";
    })(),
    timeout: 30000, // 30 seconds
  },

  // App Information
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'Pavira Signature',
    description: 'Premium Home Decor & Wall Art',
    url: process.env.NEXT_PUBLIC_APP_URL ||
      (isProduction
        ? `https://${process.env.NEXT_PUBLIC_PRODUCTION_DOMAIN || 'pavira-signature.vercel.app'}`
        : 'http://localhost:3000'),
  },

  // Supabase
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  },

  // Payment Gateways
  payments: {
    stripe: {
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
    },
    razorpay: {
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
    },
  },

  // Pagination
  pagination: {
    defaultLimit: 12,
    maxLimit: 50,
    productsPerPage: 12,
  },

  // Currency
  currency: {
    code: 'INR',
    symbol: '₹',
    locale: 'en-IN',
  },

  // Limits
  limits: {
    maxCartItems: 99,
    maxWishlistItems: 100,
    maxImageSizeMB: 5,
    maxImagesPerProduct: 10,
  },

  // Features (Feature flags)
  features: {
    enableWishlist: true,
    enableReviews: true,
    enableSocialLogin: true,
    enable3DView: false, // Set to true when 3D viewer is ready
  },

  // Image fallbacks
  images: {
    productPlaceholder: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=800&q=80',
    categoryPlaceholder: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    userAvatar: 'https://ui-avatars.com/api/?name=User&background=D4AF37&color=1B2D20',
  },

  // Contact Information
  contact: {
    email: 'info@pavira-signature.com',
    phone: '+91-XXXXXXXXXX',
    address: 'Your Address Here',
  },

  // Social Media (Add your links)
  social: {
    facebook: '',
    instagram: '',
    twitter: '',
    pinterest: '',
  },
};

// Helper function to get backend URL (for image URLs)
export function getBackendUrl(): string {
  const apiUrl = config.api.baseUrl;
  return apiUrl.replace(/\/api$/, '');
}

// Helper to format price
export function formatPrice(price: number): string {
  return `${config.currency.symbol}${price.toLocaleString(config.currency.locale)}`;
}

// Helper to check if URL is external
export function isExternalUrl(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://');
}

// Helper to get absolute URL
export function getAbsoluteUrl(path: string): string {
  if (isExternalUrl(path)) return path;
  if (path.startsWith('/')) return `${getBackendUrl()}${path}`;
  if (path.startsWith('uploads/')) return `${getBackendUrl()}/${path}`;
  return path;
}
