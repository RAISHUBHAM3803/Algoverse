/**
 * Authentication Routes
 * Handles all authentication-related endpoints
 */

const express = require("express");
const rateLimit = require("express-rate-limit");
const {
  register,
  login,
  refresh,
  getCurrentUser,
  logout,
  updateProfile,
  changePassword,
} = require("../controllers/authController");
const { authenticate } = require("../middleware/authMiddleware");
const { registerValidator, loginValidator } = require("../validators/authValidator");

const router = express.Router();

// ============================================
// AUTH RATE LIMITER (STRICT)
// 5 attempts per 15 minutes per IP (relaxed in test environment)
// ============================================
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "test" ? 1000 : 5,
  standardHeaders: true,
  legacyHeaders:   false,
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again later.",
  },
});

// ============================================
// PUBLIC ROUTES
// ============================================

/** POST /api/v1/auth/register */
router.post("/register", authRateLimiter, registerValidator, register);

/** POST /api/v1/auth/login */
router.post("/login", authRateLimiter, loginValidator, login);

/** POST /api/v1/auth/refresh */
router.post("/refresh", refresh);

// ============================================
// PROTECTED ROUTES
// ============================================

/** GET /api/v1/auth/me */
router.get("/me", authenticate, getCurrentUser);

/** POST /api/v1/auth/logout */
router.post("/logout", authenticate, logout);

/** PUT /api/v1/auth/profile */
router.put("/profile", authenticate, updateProfile);

/** POST /api/v1/auth/change-password */
router.post("/change-password", authenticate, changePassword);

module.exports = router;
