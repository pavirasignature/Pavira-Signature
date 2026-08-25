const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const slowDown = require("express-slow-down");
const path = require("path");
const fs = require("fs");

// Global process exception handlers to prevent server crashes
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception! Shutting down gracefully...", err);
});
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection! Shutting down gracefully...", err);
});

// Load environment variables - Handle both direct execution and Vercel serverless
try {
  const envPath = path.resolve(__dirname, ".env");
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  } else {
    dotenv.config();
  }
} catch (_) {
  // Expected on Vercel — fs/path may be stubbed out by webpack
}

// Import routes
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");
const userRoutes = require("./routes/users");
const categoryRoutes = require("./routes/categories");
const couponRoutes = require("./routes/coupons");
const paymentRoutes = require("./routes/payments");
const adminRoutes = require("./routes/admin");
const uploadRoutes = require("./routes/upload");
const wishlistRoutes = require("./routes/wishlists");
const redirectRoutes = require("./routes/redirects");
const contactRoutes = require("./routes/contact");

// Initialize express app
const app = express();

// Trust proxy for rate-limiting behind rewrites or deployment platforms like Vercel
const proxyConfig = "trust proxy";
app.set(proxyConfig, 1);

// CORS configuration - Must be defined first so that all responses (including rate-limited ones) carry valid headers
// CORS configuration
const allowedOrigins = [
  "http://localhost:3000",
  "https://www.pavirasignature.in",
  "https://pavirasignature.in",
  process.env.FRONTEND_URL,
  process.env.PRODUCTION_FRONTEND_URL,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // Clean the origin to avoid trailing slash issues
      const cleanOrigin = origin.replace(/\/$/, "");

      // Check if origin is in our allowed origins list
      const isAllowed = allowedOrigins.some(allowed => {
        if (!allowed) return false;
        return allowed.replace(/\/$/, "") === cleanOrigin;
      });

      // Also allow any vercel.app subdomain (useful for Vercel preview/production deployments)
      let isVercelSubdomain = false;
      try {
        const parsedUrl = new URL(origin);
        isVercelSubdomain = parsedUrl.hostname.endsWith(".vercel.app");
      } catch (e) {
        // Ignore parsing error for non-standard origins
      }

      if (
        isAllowed ||
        isVercelSubdomain ||
        process.env.NODE_ENV === "development"
      ) {
        return callback(null, true);
      } else {
        return callback(new Error(`Not allowed by CORS policy: ${origin}`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    optionsSuccessStatus: 200,
  }),
);

// Security middleware - safe for Next.js / serverless / edge runtime
app.use((req, res, next) => {
  try {
    helmet({
      hidePoweredBy: false,
      crossOriginResourcePolicy: false,
    })(req, res, (err) => {
      if (err) return next();
      next();
    });
  } catch (_) {
    next();
  }
});

// Safe IP Key Generator for Express behind Next.js / Vercel Serverless
const safeKeyGenerator = (req) => {
  const xForwardedFor = req.headers ? req.headers["x-forwarded-for"] : null;
  if (xForwardedFor) {
    return Array.isArray(xForwardedFor) ? xForwardedFor[0] : String(xForwardedFor).split(",")[0].trim();
  }
  return (
    req.headers?.["x-real-ip"] ||
    req.socket?.remoteAddress ||
    req.connection?.remoteAddress ||
    "127.0.0.1"
  );
};

// 1. Speed Limiter: Slows down requests after 100 hits in 15 mins
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 100,
  delayMs: (hits) => (hits - 100) * 200,
  keyGenerator: safeKeyGenerator,
  validate: { default: false },
});

// 2. Global Rate Limiter: Hard limit at 500 hits in 15 mins
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "development" || !process.env.NODE_ENV ? 5000 : 500,
  skip: (req) => req.method === "OPTIONS",
  keyGenerator: safeKeyGenerator,
  validate: { default: false },
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});

// 3. Stricter Limiter for Auth Routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "development" || !process.env.NODE_ENV ? 1000 : 100,
  skip: (req) => req.method === "OPTIONS",
  keyGenerator: safeKeyGenerator,
  validate: { default: false },
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later.",
  },
});

// 4. Stricter Limiter for Checkout/Orders
const checkoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // Max 20 checkout attempts per 15 mins
  skip: (req) => req.method === "OPTIONS",
  keyGenerator: safeKeyGenerator,
  validate: { default: false },
  message: {
    success: false,
    message: "Too many order requests, please try again later.",
  },
});

app.use("/api", speedLimiter);
app.use("/api", globalLimiter);

const mongoSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");

// Custom zero-dependency XSS sanitization middleware
// NOTE: Sensitive auth fields (passwords, emails, tokens) are excluded
// from sanitization to prevent breaking authentication flows.
const SENSITIVE_FIELDS = new Set([
  "password",
  "currentPassword",
  "newPassword",
  "confirmPassword",
  "email",
  "token",
  "resetToken",
  "googleId",
  // URL fields must not be sanitized — encoding &, /, etc. breaks valid URLs
  "image",
  "url",
  "imageUrl",
  "publicUrl",
  "publicId",
]);

const sanitizeXss = (val) => {
  if (typeof val !== "string") return val;
  return val
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
};

const xssClean = (req, res, next) => {
  const clean = (obj) => {
    if (typeof obj !== "object" || obj === null) return;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        // Skip sensitive fields that must not be altered
        if (SENSITIVE_FIELDS.has(key)) continue;
        if (typeof obj[key] === "string") {
          obj[key] = sanitizeXss(obj[key]);
        } else if (typeof obj[key] === "object") {
          clean(obj[key]);
        }
      }
    }
  };

  if (req.body) clean(req.body);
  if (req.query) clean(req.query);
  if (req.params) clean(req.params);
  next();
};

// Body parser middleware
// Skip if body was already parsed upstream (e.g. injected by Next.js API route)
app.use((req, res, next) => {
  if (req.body !== undefined && req.body !== null) {
    // Body already pre-populated — skip Express body parsing
    return next();
  }
  express.json({ limit: "50mb" })(req, res, (err) => {
    if (err) return next(err);
    if (req.body !== undefined && req.body !== null) return next();
    express.urlencoded({ extended: true, limit: "50mb" })(req, res, next);
  });
});
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xssClean);

// Prevent http parameter pollution
app.use(hpp());

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Database connection
const { supabase } = require("./utils/supabase");

// Ensure Supabase storage bucket exists
const ensureUploadBucket = async () => {
  try {
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) {
      console.warn("Could not list buckets:", listError.message);
      return;
    }
    const hasUploadsBucket = buckets?.some(b => b.name === 'uploads');
    if (!hasUploadsBucket) {
      const { error: createError } = await supabase.storage.createBucket('uploads', { public: true });
      if (createError) {
        console.error("Failed to create 'uploads' bucket:", createError.message);
      } else {
        console.log("Created 'uploads' storage bucket");
      }
    }
  } catch (err) {
    console.warn("Bucket check/creation warning:", err.message);
  }
};

ensureUploadBucket();

// Public Cache Middleware for GET requests to improve SEO & Performance
const publicCache = (req, res, next) => {
  if (req.method === "GET") {
    res.setHeader("Cache-Control", "public, max-age=3600"); // Cache for 1 hour
    res.setHeader("X-Content-Type-Options", "nosniff");
  }
  next();
};

// Routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/products", publicCache, productRoutes);
app.use("/api/orders", checkoutLimiter, orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", publicCache, categoryRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/wishlists", wishlistRoutes);
app.use("/api/redirects", redirectRoutes);
app.use("/api/contact", contactRoutes);

// Health check route
app.get("/api/health", async (req, res) => {
  try {
    const { error } = await supabase.from("categories").select("id", { count: "exact", head: true });
    if (error) {
      return res.status(500).json({ status: "error", message: "Database connection failed", error: error.message });
    }
    res.json({ status: "ok", message: "Server and database are running" });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// Start server
const PORT = process.env.PORT || 5000;

if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.error(
        `\n❌ Port ${PORT} is already in use. This usually means a previous instance is still running.\n` +
          `✅ To fix this on Windows, run: \n` +
          `   npm run kill-port\n`,
      );
      process.exit(1);
    } else {
      console.error("Server error:", error);
    }
  });
}

module.exports = app;
