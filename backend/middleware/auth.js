/**
 * Authentication Middleware
 * Protects routes and verifies JWT tokens
 */

const { verifyToken } = require("../utils/jwt");
const { sendError } = require("../utils/response");
const User = require("../models/User");

/**
 * Middleware to verify JWT token
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from headers or cookies
    const token = req.headers.authorization?.split(" ")[1] || req.cookies.token;

    if (!token) {
      return sendError(res, 401, "No authentication token provided");
    }

    // Verify token
    const decoded = verifyToken(token);
    req.userId = decoded.id;

    // Fetch user details
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return sendError(res, 404, "User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return sendError(res, 401, "Invalid or expired token");
  }
};

/**
 * Middleware to verify admin role
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, "Not authenticated");
    }

    if (!roles.includes(req.user.role)) {
      return sendError(res, 403, "Not authorized to access this resource");
    }

    next();
  };
};

/**
 * Middleware to verify admin
 */
const isAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return sendError(res, 401, "Not authenticated");
    }

    if (req.user.role !== "admin") {
      return sendError(res, 403, "Admin access required");
    }

    next();
  } catch (error) {
    return sendError(res, 500, "Authorization error");
  }
};

// Legacy exports for backward compatibility
exports.protect = authenticate;
exports.isAdmin = isAdmin;
exports.authenticate = authenticate;
exports.authorize = authorize;

// Optional auth - doesn't fail if no token
exports.optionalAuth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (token) {
    try {
      const decoded = verifyToken(token);
      req.user = await User.findById(decoded.id);
    } catch (error) {
      // Continue without user
    }
  }

  next();
};
