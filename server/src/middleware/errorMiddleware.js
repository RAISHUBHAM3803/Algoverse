/**
 * Global Error Handling Middleware
 * Standardizes API error responses and prevents data leaks in production.
 * Uses err.isOperational to distinguish expected AppErrors from unexpected bugs.
 */

const config = require("../config");
const logger = require("../utils/logger");

const errorMiddleware = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message    = err.message    || "Internal Server Error";

  // ── Mongoose: validation errors ──────────────────────────────────────────
  if (err.name === "ValidationError") {
    err.statusCode = 400;
    err.message    = Object.values(err.errors).map((val) => val.message).join(", ");
    err.isOperational = true;
  }

  // ── Mongoose: duplicate key ───────────────────────────────────────────────
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    err.statusCode = 400;
    err.message    = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    err.isOperational = true;
  }

  // ── Mongoose: invalid ObjectId ────────────────────────────────────────────
  if (err.name === "CastError") {
    err.statusCode = 400;
    err.message    = `Invalid ${err.path}: ${err.value}`;
    err.isOperational = true;
  }

  // ── JWT errors ────────────────────────────────────────────────────────────
  if (err.name === "JsonWebTokenError") {
    err.statusCode = 401;
    err.message    = "Invalid authentication token";
    err.isOperational = true;
  }

  if (err.name === "TokenExpiredError") {
    err.statusCode = 401;
    err.message    = "Authentication token expired";
    err.isOperational = true;
  }

  const isDev = !config.isProduction;

  // Always log errors server-side
  if (isDev) {
    logger.error("💥 SYSTEM ERROR DETAILS:", { error: err });
  } else {
    // In production, only log non-operational (unexpected) errors at error level
    if (!err.isOperational) {
      logger.error("💥 UNEXPECTED ERROR:", { message: err.message, stack: err.stack });
    }
  }

  // In production, hide details of unexpected programmer errors from clients
  const isOperational = err.isOperational === true;
  const responseMessage =
    config.isProduction && !isOperational
      ? "Something went wrong. Please try again later."
      : err.message;

  res.status(err.statusCode).json({
    success: false,
    message: responseMessage,
    ...(isDev && {
      stack:        err.stack,
      errorDetails: err,
    }),
  });
};

module.exports = errorMiddleware;
