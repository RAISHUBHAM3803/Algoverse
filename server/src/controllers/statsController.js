/**
 * Stats Controller
 * Returns live platform-wide statistics for the public home page.
 * Intentionally lightweight — no auth required, results are cached.
 */

const Problem    = require("../models/Problem");
const User       = require("../models/User");
const Submission = require("../models/Submission");
const redis      = require("../config/redis");

// Simple in-process cache: recompute at most once every 5 minutes
let cache = null;
let cacheAt = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 min

const getPlatformStats = async (req, res) => {
  const now = Date.now();
  if (cache && now - cacheAt < CACHE_TTL) {
    return res.status(200).json({ success: true, data: cache });
  }

  const [totalProblems, totalUsers, totalSubmissions] = await Promise.all([
    Problem.countDocuments(),
    User.countDocuments(),
    Submission.countDocuments(),
  ]);

  cache  = { totalProblems, totalUsers, totalSubmissions };
  cacheAt = now;

  return res.status(200).json({ success: true, data: cache });
};

/**
 * GET /api/v1/stats/leaderboard
 * Returns top 50 users sorted by problems solved.
 */
const getLeaderboard = async (req, res) => {
  const cacheKey = "leaderboard:top50";
  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json({ success: true, data: JSON.parse(cached) });
    }

    const topUsers = await User.find({ "stats.solvedCount": { $gt: 0 } })
      .sort({ "stats.solvedCount": -1, "stats.totalSubmissions": 1 })
      .limit(50)
      .select("_id name profile.avatar stats.solvedCount stats.totalSubmissions stats.lastActive")
      .lean();

    await redis.set(cacheKey, JSON.stringify(topUsers), "EX", 300); // 5 min cache

    return res.status(200).json({ success: true, data: topUsers });
  } catch (error) {
    console.error("Leaderboard fetch error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch leaderboard" });
  }
};

module.exports = { getPlatformStats, getLeaderboard };
