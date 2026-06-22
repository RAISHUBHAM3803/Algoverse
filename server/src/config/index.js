/**
 * Centralized Configuration Manager
 * Parses, validates, and manages environment variables
 */

// [SEC1 FIX] JWT_REFRESH_SECRET is now required to prevent predictable fallback
const requiredEnvVars = ["JWT_SECRET", "JWT_REFRESH_SECRET", "MONGO_URI"];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`CRITICAL: Environment variable ${envVar} is missing.`);
  }
}

const isProduction = process.env.NODE_ENV === "production";

module.exports = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction,
  mongoUri: process.env.MONGO_URI,
  // [DB5 FIX] Mongoose pool size configurable for load tuning
  mongoPoolSize: parseInt(process.env.MONGO_POOL_SIZE, 10) || (isProduction ? 20 : 5),
  // [DB5 FIX] Disable autoIndex in production — use pre-built migration indexes
  mongoAutoIndex: !isProduction,
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
  jwt: {
    secret: process.env.JWT_SECRET,
    expire: process.env.JWT_EXPIRE || "15m",
    // [SEC1 FIX] JWT_REFRESH_SECRET is now required (validated above)
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpire: process.env.JWT_REFRESH_EXPIRE || "7d",
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: isProduction ? 300 : (process.env.NODE_ENV === "test" ? 2000 : 1000),
  },
  // Separate rate limit for submission endpoint
  submissionRateLimit: {
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: isProduction ? 30 : 100, // 30 submissions per 10 min in prod
  },
  jdoodle: {
    clientId: process.env.JDOODLE_CLIENT_ID || "",
    clientSecret: process.env.JDOODLE_CLIENT_SECRET || "",
    mockMode: process.env.JDOODLE_MOCK === "true",
  },
};



