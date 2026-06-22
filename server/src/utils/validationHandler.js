/**
 * Centralized Validation Error Handler
 * Extracted from individual validator files to eliminate code duplication.
 * All validators (auth, problem, code, submission) import from here.
 */

const { validationResult } = require("express-validator");

/**
 * Express middleware that checks for validation errors from express-validator.
 * Returns a standardized 400 error response if validation fails.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param, // err.path is the v7 API; fallback for safety
      message: err.msg,
    }));

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: formattedErrors,
    });
  }

  next();
};

module.exports = { handleValidationErrors };
