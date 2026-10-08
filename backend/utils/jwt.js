/**
 * JWT Authentication Utilities
 * Handle token generation and verification
 */

const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_jwt_token_for_pavira_signature_luxury_production";

/**
 * Generate JWT Token
 */
const generateToken = (userId, rememberMe = false) => {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: rememberMe ? "30d" : (process.env.JWT_EXPIRY || "1d"),
  });
};

/**
 * Verify JWT Token
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error("JWT Verify Error:", error);
    throw new Error("Invalid or expired token");
  }
};

/**
 * Decode JWT Token
 */
const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    throw new Error("Invalid token");
  }
};

module.exports = {
  generateToken,
  verifyToken,
  decodeToken,
};
