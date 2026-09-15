const Redis = require("ioredis");

// Initialize Redis client using REDIS_URL from env
// If not present, gracefully fallback to in-memory map
let redisClient = null;
const memoryCache = new Map();
let isRedisConnected = false;

try {
  const redisUrl = process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL;
  if (redisUrl) {
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      retryStrategy(times) {
        if (times > 2) return null; // stop retrying
        return Math.min(times * 50, 2000);
      }
    });

    redisClient.on("connect", () => {
      console.log("Redis connected successfully");
      isRedisConnected = true;
    });

    redisClient.on("error", (err) => {
      console.warn("Redis connection error, falling back to in-memory cache");
      isRedisConnected = false;
    });
  } else {
    console.log("No REDIS_URL provided. Using in-memory cache fallback.");
  }
} catch (error) {
  console.warn("Could not initialize Redis:", error.message);
}

const getCache = async (key) => {
  if (isRedisConnected && redisClient) {
    try {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error("Redis get error:", e.message);
    }
  }
  // Fallback
  const cached = memoryCache.get(key);
  if (cached && cached.expiry > Date.now()) {
    return cached.data;
  }
  if (cached && cached.expiry <= Date.now()) {
    memoryCache.delete(key);
  }
  return null;
};

const setCache = async (key, data, ttlSeconds = 300) => {
  if (isRedisConnected && redisClient) {
    try {
      await redisClient.setex(key, ttlSeconds, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error("Redis set error:", e.message);
    }
  }
  // Fallback
  memoryCache.set(key, {
    data,
    expiry: Date.now() + (ttlSeconds * 1000)
  });
  return true;
};

const clearCache = async (pattern = "*") => {
  if (isRedisConnected && redisClient) {
    try {
      if (pattern === "*") {
        await redisClient.flushdb();
      } else {
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
          await redisClient.del(...keys);
        }
      }
    } catch (e) {
      console.error("Redis clear error:", e.message);
    }
  }
  // Fallback
  if (pattern === "*") {
    memoryCache.clear();
  } else {
    for (const key of memoryCache.keys()) {
      if (key.includes(pattern.replace('*', ''))) {
        memoryCache.delete(key);
      }
    }
  }
};

module.exports = {
  getCache,
  setCache,
  clearCache
};
