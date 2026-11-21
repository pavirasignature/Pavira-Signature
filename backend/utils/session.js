/**
 * Session Utilities
 * Generates unique session identifiers allotted to users after login.
 */

const crypto = require("crypto");

/**
 * Generate a UUID v4 session ID (e.g. 3cad2acc-ccb6-452d-a599-3bd5a4e84adb)
 */
const generateSessionId = () => {
  if (typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  // Fallback for older Node runtimes without crypto.randomUUID
  const bytes = crypto.randomBytes(16);
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // Version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // Variant 10
  const hex = bytes.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};

module.exports = { generateSessionId };
