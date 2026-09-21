/**
 * Submission Cache Utility
 * Detects duplicate form submissions within a time window to prevent spam flooding
 * Uses in-memory cache with automatic expiration (no Redis dependency required)
 */

const crypto = require("crypto");

// In-memory cache: Map<hash, timestamp>
const submissionCache = new Map();

// Configuration
const DUPLICATE_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const CACHE_CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // Cleanup every 5 minutes

/**
 * Generate hash from submission data
 * @param {string} email - Sender email
 * @param {string} message - Message content
 * @returns {string} - SHA256 hash
 */
const generateSubmissionHash = (email, message) => {
  const normalized = `${email.toLowerCase().trim()}::${message.trim().substring(0, 500)}`;
  return crypto.createHash("sha256").update(normalized).digest("hex");
};

/**
 * Check if submission is a duplicate within the time window
 * @param {string} email - Sender email
 * @param {string} message - Message content
 * @returns {boolean} - True if duplicate detected
 */
const isDuplicateSubmission = (email, message) => {
  const hash = generateSubmissionHash(email, message);
  const now = Date.now();
  
  // Check if hash exists in cache
  if (submissionCache.has(hash)) {
    const lastSubmission = submissionCache.get(hash);
    const timeSinceLastSubmission = now - lastSubmission;
    
    // If within duplicate window, it's a duplicate
    if (timeSinceLastSubmission < DUPLICATE_WINDOW_MS) {
      const minutesRemaining = Math.ceil((DUPLICATE_WINDOW_MS - timeSinceLastSubmission) / 60000);
      console.log(`[SPAM DETECTED] Duplicate submission blocked. Hash: ${hash.substring(0, 12)}... (${minutesRemaining} min cooldown)`);
      return true;
    }
  }
  
  return false;
};

/**
 * Record a new submission in the cache
 * @param {string} email - Sender email
 * @param {string} message - Message content
 */
const recordSubmission = (email, message) => {
  const hash = generateSubmissionHash(email, message);
  const now = Date.now();
  submissionCache.set(hash, now);
  console.log(`[SUBMISSION CACHED] Hash: ${hash.substring(0, 12)}... Entries: ${submissionCache.size}`);
};

/**
 * Clean up expired entries from cache
 * Removes submissions older than the duplicate window
 */
const cleanupExpiredEntries = () => {
  const now = Date.now();
  let removedCount = 0;
  
  for (const [hash, timestamp] of submissionCache.entries()) {
    if (now - timestamp > DUPLICATE_WINDOW_MS) {
      submissionCache.delete(hash);
      removedCount++;
    }
  }
  
  if (removedCount > 0) {
    console.log(`[CACHE CLEANUP] Removed ${removedCount} expired entries. Current size: ${submissionCache.size}`);
  }
};

/**
 * Get current cache statistics
 * @returns {object} - Cache stats
 */
const getCacheStats = () => {
  return {
    size: submissionCache.size,
    duplicateWindowMinutes: DUPLICATE_WINDOW_MS / 60000,
    oldestEntry: submissionCache.size > 0 ? Math.min(...submissionCache.values()) : null,
  };
};

/**
 * Clear all cache entries (for testing or maintenance)
 */
const clearCache = () => {
  const previousSize = submissionCache.size;
  submissionCache.clear();
  console.log(`[CACHE CLEARED] Removed ${previousSize} entries`);
};

// Start automatic cleanup interval
const cleanupInterval = setInterval(cleanupExpiredEntries, CACHE_CLEANUP_INTERVAL_MS);

// Ensure cleanup interval is cleared when process exits
process.on("beforeExit", () => {
  clearInterval(cleanupInterval);
  console.log("[SUBMISSION CACHE] Cleanup interval stopped");
});

module.exports = {
  isDuplicateSubmission,
  recordSubmission,
  getCacheStats,
  clearCache,
  DUPLICATE_WINDOW_MS,
};
