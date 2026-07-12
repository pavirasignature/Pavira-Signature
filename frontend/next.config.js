const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.join(__dirname, '../'),
  poweredByHeader: false,
  devIndicators: false,

  // ─── Compression for smaller payloads ───
  compress: true,

  // ─── Image optimization ───
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: process.env.NEXT_PUBLIC_PRODUCTION_DOMAIN || "*.vercel.app",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "*.vercel.app",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Smaller device sizes for faster loading on mobile
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    // Cache optimized images for 60 days
    minimumCacheTTL: 60 * 60 * 24 * 60,
  },

  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL ||
      (process.env.NODE_ENV === "production"
        ? "/api"
        : "http://localhost:5000/api"),
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    NEXT_PUBLIC_BUILD_TIME: Date.now().toString(),
    // Pass Supabase vars to the backend running inside serverless functions
    SUPABASE_URL: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_KEY: process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  },

  async rewrites() {
    // On Vercel, the Express backend is mounted via pages/api/[...all].ts
    // so rewrites must NOT intercept /api/* requests.
    // Rewrites are only needed in local dev to proxy to localhost:5000.
    if (process.env.VERCEL === '1' || process.env.NODE_ENV === 'production') {
      return [];
    }
    return [
      {
        source: '/api/auth/:path*',
        destination: '/api/auth/:path*',
      },
      {
        source: '/api/auth',
        destination: '/api/auth',
      },
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/api/:path*'
      }
    ]
  },

  // optimizePackageImports is intentionally disabled - it causes React #31 during
  // static prerendering of error pages (404/500) in Next.js 15 + React 19.
  // The experimental feature creates React 18-style elements incompatible with
  // React 19's static generation worker.

  // Skip ESLint during production build (lint locally instead)
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Allow TS errors to not block build on Vercel CI
  typescript: {
    ignoreBuildErrors: true,
  },

  // Disable webpack warnings
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      net: false,
      tls: false,
    };
    return config;
  },
};

module.exports = nextConfig;
