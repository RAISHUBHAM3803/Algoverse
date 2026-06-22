/**
 * Dashboard & Analytics Controller
 * Thin controller — delegates to DashboardService, returns standardized responses.
 */

const dashboardService = require("../services/dashboardService");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/responseHandler");

/**
 * Get dashboard summary metrics (solved counts, streaks, acceptance rate)
 * GET /api/v1/dashboard/summary
 */
const getDashboardSummary = asyncHandler(async (req, res) => {
  const data = await dashboardService.getSummary(req.userId);
  return sendSuccess(res, 200, "Dashboard summary retrieved successfully", data);
});

/**
 * Get difficulty breakdown of accepted problems (Easy, Medium, Hard)
 * GET /api/v1/dashboard/difficulty
 */
const getDifficultyAnalytics = asyncHandler(async (req, res) => {
  const data = await dashboardService.getDifficultyAnalytics(req.userId);
  return sendSuccess(res, 200, "Difficulty analytics retrieved successfully", data);
});

/**
 * Get submission counts/percentages grouped by language
 * GET /api/v1/dashboard/languages
 */
const getLanguageAnalytics = asyncHandler(async (req, res) => {
  const data = await dashboardService.getLanguageAnalytics(req.userId);
  return sendSuccess(res, 200, "Language analytics retrieved successfully", data);
});

/**
 * Get submission distribution grouped by verdict
 * GET /api/v1/dashboard/submissions
 */
const getSubmissionAnalytics = asyncHandler(async (req, res) => {
  const data = await dashboardService.getSubmissionAnalytics(req.userId);
  return sendSuccess(res, 200, "Submission analytics retrieved successfully", data);
});

/**
 * Get daily submissions activity heatmap
 * GET /api/v1/dashboard/activity
 */
const getActivityHeatmap = asyncHandler(async (req, res) => {
  const data = await dashboardService.getActivityHeatmap(req.userId);
  return sendSuccess(res, 200, "Activity heatmap retrieved successfully", data);
});

module.exports = {
  getDashboardSummary,
  getDifficultyAnalytics,
  getLanguageAnalytics,
  getSubmissionAnalytics,
  getActivityHeatmap,
};
