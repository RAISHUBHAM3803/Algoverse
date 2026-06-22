const Redis = require("ioredis");
const logger = require("../utils/logger");

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

// Upstash requires TLS — detect by checking for rediss:// or upstash.io in URL
const isUpstash = redisUrl.includes("upstash.io") || redisUrl.startsWith("rediss://");

const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  tls: isUpstash ? { rejectUnauthorized: false } : undefined,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on("connect", () => {
  logger.info("✅ Redis connected successfully.");
});

redis.on("error", (err) => {
  logger.error("Redis connection error:", { message: err.message });
});

module.exports = redis;
