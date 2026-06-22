/**
 * Admin Middleware
 * Restricts routes to admin users only
 */

const AppError = require("../utils/AppError");

/**
 * Role-based access control middleware factory
 * Must be used AFTER the authenticate middleware (req.user must be set)
 *
 * Usage: router.delete("/route", authenticate, authorize("admin"), handler)
 *
 * @param {string} requiredRole - Role required to access the route
 * @returns {import('express').RequestHandler}
 */
const authorize = (requiredRole = "admin") => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("Please login first", 401));
    }

    if (req.user.role !== requiredRole) {
      return next(new AppError(`Only ${requiredRole}s can access this resource`, 403));
    }

    next();
  };
};

/**
 * Pre-bound admin-only middleware (alias for authorize("admin"))
 */
const adminOnly = authorize("admin");

module.exports = { authorize, adminOnly };
