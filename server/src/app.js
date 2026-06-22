/**
 * Express Application Setup
 * Configures middleware, security, logging, and routes
 */

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const xss = require("xss-clean");
const hpp = require("hpp");
const rateLimit = require("express-rate-limit");
const mongoose = require("mongoose");

const mongoSanitize = require("express-mongo-sanitize");

const authRoutes = require("./routes/authRoutes");
const problemRoutes = require("./routes/problemRoutes");
const codeRoutes = require("./routes/codeRoutes");
const submissionRoutes = require("./routes/submissionRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const aiRoutes = require("./routes/aiRoutes");
const errorMiddleware = require("./middleware/errorMiddleware");
const AppError = require("./utils/AppError");
const logger = require("./utils/logger");

const config = require("./config");


const app = express();

// Trust reverse proxy (important for rate limiting behind load balancers like Render/Vercel/Heroku)
app.set("trust proxy", 1);


// ============================================
// SECURITY MIDDLEWARE
// ============================================

// Helmet - Secure HTTP headers
app.use(helmet());

// Sanitize query keys/values to prevent MongoDB Operator Injection attacks
app.use(mongoSanitize());

// XSS Protection - Clean user data
app.use(xss());

// HPP - Prevent HTTP Parameter Pollution
app.use(hpp());

// Global Rate limiting - Prevent brute force attacks
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,  // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false,   // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
});
app.use(limiter);

// Rate limiting for code execution endpoint (sandbox abuse prevention)
// Disabled in test mode — tests hit the endpoint many times and don't need limiting
const codeExecutionLimiter = process.env.NODE_ENV === "test"
  ? (req, res, next) => next()  // no-op in test
  : rateLimit({
      windowMs: 1 * 60 * 1000, // 1 minute
      max: 15, // limit each IP to 15 executions per minute
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        message: "Too many code execution attempts. Please wait a minute.",
      },
    });

// [SEC6 FIX] Dedicated rate limiter for submission endpoint
// Each submission triggers a full Piston API evaluation — must be protected
const submissionLimiter = rateLimit({
  windowMs: config.submissionRateLimit.windowMs,
  max: config.submissionRateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many submissions. Please wait before submitting again.",
  }
});

// ============================================
// BODY PARSER MIDDLEWARE
// ============================================

app.use(express.json({ limit: "50kb" }));      // Increased to support AI code payloads
app.use(express.urlencoded({ limit: "50kb", extended: true }));
app.use(cookieParser());

// ============================================
// CORS MIDDLEWARE
// ============================================

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


// ============================================
// COMPRESSION & LOGGING
// ============================================

// Enable compression for response payloads
app.use(compression());

// [NODE2 FIX] Environment-aware Morgan format — "dev" for local, "short" for production
// Route Morgan output through Winston so all logs go to the same sink
if (process.env.NODE_ENV !== "test") {
  app.use(
    morgan(config.isProduction ? "short" : "dev", {
      stream: {
        write: (message) => logger.http(message.trim()),
      },
    })
  );
}

// ============================================
// HEALTH CHECK ROUTES
// ============================================

// Shallow ping health check (load balancer / uptime monitor)
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// [S5 FIX] Deep health check — includes DB connection state
app.get("/api/v1/health", (req, res) => {
  const dbState = mongoose.connection.readyState;
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  const dbStatus = ["disconnected", "connected", "connecting", "disconnecting"][dbState] || "unknown";
  const isHealthy = dbState === 1;

  res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    message: isHealthy ? "API is operational" : "Service degraded",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    services: {
      database: {
        status: dbStatus,
        healthy: isHealthy,
      },
      server: {
        status: "running",
        healthy: true,
        uptime: Math.floor(process.uptime()),
        memoryMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      },
    },
  });
});

// ============================================
// API ROUTES (Versioning Applied: /api/v1)
// ============================================

// Authentication routes
app.use("/api/v1/auth", authRoutes);

// Problem routes
app.use("/api/v1/problems", problemRoutes);

// Code execution routes (rate limited per execution)
app.use("/api/v1/code", codeExecutionLimiter, codeRoutes);

// [SEC6 FIX] Submission routes now have their own rate limiter
app.use("/api/v1/submissions", submissionLimiter, submissionRoutes);

// Dashboard & Analytics routes
app.use("/api/v1/dashboard", dashboardRoutes);

// Public Platform Stats routes
app.use("/api/v1/stats", require("./routes/statsRoutes"));


// AI Coding Interview Assistant routes (Layer 7)
app.use("/api/v1/ai", aiRoutes);


// ============================================
// 404 HANDLER
// ============================================

app.use("*", (req, res, next) => {
  const error = new AppError(`Cannot find ${req.originalUrl} on this server`, 404);
  next(error);
});

// ============================================
// GLOBAL ERROR MIDDLEWARE (MUST BE LAST)
// ============================================

app.use(errorMiddleware);

module.exports = app;

