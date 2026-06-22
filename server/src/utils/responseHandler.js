/**
 * Centralized Response Handler
 * Provides standardized success and error response helpers
 * to ensure consistent API response shape across all controllers.
 */

/**
 * Send a standardized success response
 *
 * @param {import('express').Response} res
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Human-readable message
 * @param {Object|Array} [data] - Response payload
 * @param {Object} [meta] - Pagination or additional metadata
 */
const sendSuccess = (res, statusCode, message, data = null, meta = null) => {
  const response = {
    success: true,
    message,
  };

  if (data !== null) {
    response.data = data;
  }

  if (meta !== null) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send a standardized error response (for non-middleware use)
 *
 * @param {import('express').Response} res
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {Array} [errors] - Validation error array
 */
const sendError = (res, statusCode, message, errors = null) => {
  const response = {
    success: false,
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

module.exports = { sendSuccess, sendError };
