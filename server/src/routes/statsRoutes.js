const express = require("express");
const { getPlatformStats, getLeaderboard } = require("../controllers/statsController");

const router = express.Router();

/**
 * GET /api/v1/stats
 * Public endpoint — returns live platform-wide counts (cached 5 min)
 */
router.get("/", getPlatformStats);

/**
 * GET /api/v1/stats/leaderboard
 * Public endpoint — returns top users
 */
router.get("/leaderboard", getLeaderboard);

module.exports = router;
