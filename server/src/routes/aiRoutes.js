/**
 * AI Routes
 * All AI-powered endpoints — protected by JWT authentication + dedicated rate limiter.
 */

const express = require("express");
const rateLimit = require("express-rate-limit");

const { authenticate } = require("../middleware/authMiddleware");
const {
  reviewCode,
  analyzeCode,
  getHints,
  generateInterviewFeedback,
} = require("../controllers/aiController");
const {
  validateReview,
  validateComplexity,
  validateHint,
  validateInterviewFeedback,
} = require("../validators/aiValidator");

const router = express.Router();

// ============================================
// AI-SPECIFIC RATE LIMITER
// Prevents abuse of expensive LLM API calls — 10 requests per 15 minutes per IP.
// Test environments get a high limit instead of bypassing entirely.
// ============================================
const aiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "test" ? 1000 : 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many AI requests. Please wait before making more requests.",
  },
});

// Apply rate limiter and authentication to all AI routes
router.use(aiRateLimiter);
router.use(authenticate);

// ============================================
// ROUTES
// ============================================

/**
 * @route   POST /api/v1/ai/review
 * @desc    AI Code Review — strengths, weaknesses, optimizations, best practices
 * @access  Private
 */
router.post("/review", validateReview, reviewCode);

/**
 * @route   POST /api/v1/ai/complexity
 * @desc    AI Complexity Analysis — time/space Big-O + reasoning
 * @access  Private
 */
router.post("/complexity", validateComplexity, analyzeCode);

/**
 * @route   POST /api/v1/ai/hint
 * @desc    AI Hint Generator — 3 progressive hints without spoiling solution
 * @access  Private
 */
router.post("/hint", validateHint, getHints);

/**
 * @route   POST /api/v1/ai/interview-feedback
 * @desc    AI Interview Feedback — multi-dimensional scores + overall feedback
 * @access  Private
 */
router.post("/interview-feedback", validateInterviewFeedback, generateInterviewFeedback);

module.exports = router;
