/**
 * Configuration Template
 * Copy this file and create your own config files:
 * - backend/.env
 * - frontend/.env.local
 */

module.exports = {
  // ========================================
  // BACKEND CONFIGURATION
  // ========================================
  backend: {
    // Server Settings
    PORT: 5000,
    NODE_ENV: 'development', // development | production

    // Database (Supabase)
    SUPABASE_URL: 'your_supabase_project_url',
    SUPABASE_ANON_KEY: 'your_supabase_anon_key',
    SUPABASE_SERVICE_ROLE_KEY: 'your_supabase_service_role_key',

    // JWT Authentication
    JWT_SECRET: 'your_super_secret_jwt_key_change_in_production',
    JWT_EXPIRE: '7d',
    JWT_COOKIE_EXPIRE: 7,

    // Frontend URL (for CORS)
    FRONTEND_URL: 'http://localhost:3000',

    // Production Frontend URL
    PRODUCTION_FRONTEND_URL: 'https://your-domain.vercel.app',

    // Cloudinary (Image Uploads)
    CLOUDINARY_CLOUD_NAME: 'your_cloud_name',
    CLOUDINARY_API_KEY: 'your_api_key',
    CLOUDINARY_API_SECRET: 'your_api_secret',

    // Email Service (Optional)
    EMAIL_HOST: 'smtp.gmail.com',
    EMAIL_PORT: 587,
    EMAIL_USER: 'your_email@gmail.com',
    EMAIL_PASSWORD: 'your_app_password',
    EMAIL_FROM: 'noreply@pavira-signature.com',

    // Payment Gateways
    STRIPE_SECRET_KEY: 'sk_test_your_stripe_secret_key',
    RAZORPAY_KEY_ID: 'rzp_test_your_key_id',
    RAZORPAY_KEY_SECRET: 'your_razorpay_secret',
  },

  // ========================================
  // FRONTEND CONFIGURATION
  // ========================================
  frontend: {
    // API URL
    NEXT_PUBLIC_API_URL: 'http://localhost:5000/api',

    // Production API URL
    NEXT_PUBLIC_PRODUCTION_API_URL: '/api',

    // Supabase (Same as backend)
    NEXT_PUBLIC_SUPABASE_URL: 'your_supabase_project_url',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'your_supabase_anon_key',

    // Payment Gateway Public Keys
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_your_stripe_publishable_key',
    NEXT_PUBLIC_RAZORPAY_KEY_ID: 'rzp_test_your_key_id',

    // App Configuration
    NEXT_PUBLIC_APP_NAME: 'Pavira Signature',
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
    NEXT_PUBLIC_PRODUCTION_APP_URL: 'https://your-domain.vercel.app',
  },

  // ========================================
  // APPLICATION CONSTANTS
  // ========================================
  constants: {
    // Default admin credentials (CHANGE THESE!)
    DEFAULT_ADMIN_EMAIL: 'admin@pavira-signature.com',
    DEFAULT_ADMIN_PASSWORD: 'Admin@123456',

    // Default customer for testing (CHANGE THESE!)
    DEFAULT_USER_EMAIL: 'user@pavira-signature.com',
    DEFAULT_USER_PASSWORD: 'User@123456',

    // Product defaults
    DEFAULT_PRODUCT_IMAGE: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=800&q=80',

    // Pagination
    DEFAULT_PAGE_SIZE: 12,
    MAX_PAGE_SIZE: 50,

    // Currency
    CURRENCY: 'INR',
    CURRENCY_SYMBOL: '₹',

    // Limits
    MAX_CART_ITEMS: 99,
    MAX_WISHLIST_ITEMS: 100,
    MAX_IMAGE_SIZE_MB: 5,
  }
};
