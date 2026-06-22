/**
 * Custom AppError Class
 * Used for creating standardized operational error responses.
 * isOperational = true distinguishes expected errors (4xx/5xx) from
 * unexpected programmer bugs — the global error handler uses this
 * to decide how much detail to expose in production.
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Mark as expected operational error

    // Capturing stack trace for better debugging
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
