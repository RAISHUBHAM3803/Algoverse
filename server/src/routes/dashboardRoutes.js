/**
 * Dashboard & Analytics Routes
 * Exposes API endpoints for retrieving user statistics and heatmaps.
 */

const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");
const {
  getDashboardSummary,
  getDifficultyAnalytics,
  getLanguageAnalytics,
  getSubmissionAnalytics,
  getActivityHeatmap,
} = require("../controllers/dashboardController");

const router = express.Router();

// Enforce authentication on all dashboard routes
router.use(authenticate);

/**
 * Get dashboard overview summary (totals, acceptance rate, streaks)
 * GET /api/dashboard/summary
 */
router.get("/summary", getDashboardSummary);

/**
 * Get difficulty-wise metrics (easy, medium, hard accepted counts)
 * GET /api/dashboard/difficulty
 */
router.get("/difficulty", getDifficultyAnalytics);

/**
 * Get language usage breakdown
 * GET /api/dashboard/languages
 */
router.get("/languages", getLanguageAnalytics);

/**
 * Get submission counts by verdict
 * GET /api/dashboard/submissions
 */
router.get("/submissions", getSubmissionAnalytics);

/**
 * Get daily submissions activity log for heatmap visualization
 * GET /api/dashboard/activity
 */
router.get("/activity", getActivityHeatmap);

module.exports = router;
