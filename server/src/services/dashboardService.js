/**
 * Dashboard & Analytics Service
 * Provides performant aggregation pipelines for user statistics and submissions.
 */

const mongoose = require("mongoose");
const Submission = require("../models/Submission");
const User = require("../models/User");
const Problem = require("../models/Problem");
const redis = require("../config/redis");
const AppError = require("../utils/AppError");
const { calculateStreaks } = require("../utils/analyticsHelper");
const { VERDICTS } = require("../constants/enums");

class DashboardService {
  /**
   * Get overall dashboard summary
   * @param {string} userId
   * @returns {Promise<Object>} Dashboard summary statistics
   */
  async getSummary(userId) {
    // Cache per-user summary for 60 seconds to avoid heavy aggregations on every page load
    const cacheKey = `dashboard:summary:${userId}`;
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const user = await User.findById(userId).select("stats").lean();
    if (!user) {
      throw new AppError("User not found", 404);
    }
    
    const stats = user.stats || {};
    const totalSubmissions = stats.totalSubmissions || 0;
    const acceptedSubmissions = stats.acceptedSubmissions || 0;
    
    const acceptanceRate = totalSubmissions === 0 
      ? 0 
      : Math.round((acceptedSubmissions / totalSubmissions) * 100);

    // Fetch unique accepted-submission dates for streak calculation
    const acceptedDates = await Submission.aggregate([
      { $match: { user: userObjectId, verdict: VERDICTS.ACCEPTED } },
      {
        $project: {
          dateStr: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "+05:30" },
          },
        },
      },
      { $group: { _id: "$dateStr" } },
      { $sort: { _id: 1 } },
    ]);

    const dates = acceptedDates.map((item) => item._id);
    const { currentStreak, longestStreak } = calculateStreaks(dates);

    const totalProblems = await Problem.countDocuments();

    const result = {
      totalSolved:      stats.solvedCount || 0,
      totalProblems:    totalProblems,
      totalSubmissions: totalSubmissions,
      acceptanceRate:   acceptanceRate,
      currentStreak,
      longestStreak,
    };

    await redis.set(cacheKey, JSON.stringify(result), "EX", 60); // Cache 60 seconds
    return result;
  }

  /**
   * Get difficulty breakdown of accepted/solved problems
   * @param {string} userId
   * @returns {Promise<Object>} Easy, Medium, Hard breakdown
   */
  async getDifficultyAnalytics(userId) {
    // Cache per-user difficulty breakdown for 5 minutes
    const cacheKey = `dashboard:difficulty:${userId}`;
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const user = await User.findById(userId).select("stats").lean();
    const stats = user?.stats || {};
    
    // Use a single aggregation pipeline instead of 3 separate countDocuments calls
    const difficultyCounts = await Problem.aggregate([
      { $group: { _id: "$difficulty", total: { $sum: 1 } } },
    ]);
    const countMap = {};
    difficultyCounts.forEach((d) => { countMap[d._id] = d.total; });

    const result = [
      { difficulty: "Easy",   solved: stats.easySolved   || 0, total: countMap["Easy"]   || 0 },
      { difficulty: "Medium", solved: stats.mediumSolved || 0, total: countMap["Medium"] || 0 },
      { difficulty: "Hard",   solved: stats.hardSolved   || 0, total: countMap["Hard"]   || 0 },
    ];

    await redis.set(cacheKey, JSON.stringify(result), "EX", 300); // Cache 5 minutes
    return result;
  }

  /**
   * Get submission statistics grouped by programming language.
   * Uses a single $facet aggregation to avoid two separate DB round-trips.
   *
   * @param {string} userId
   * @returns {Promise<Object>} Percentages by language
   */
  async getLanguageAnalytics(userId) {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const [facetResult] = await Submission.aggregate([
      { $match: { user: userObjectId } },
      {
        $facet: {
          total:     [{ $count: "count" }],
          byLanguage: [{ $group: { _id: "$language", count: { $sum: 1 } } }],
        },
      },
    ]);

    const totalSubmissions = facetResult.total[0]?.count ?? 0;

    if (totalSubmissions === 0) return [];

    return facetResult.byLanguage.map((stat) => ({
      language: stat._id,
      count: stat.count
    }));
  }

  /**
   * Get submission history analytics grouped by verdict
   * @param {string} userId
   * @returns {Promise<Object>} Counts by verdict
   */
  async getSubmissionAnalytics(userId) {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const submissionStats = await Submission.aggregate([
      { $match: { user: userObjectId } },
      { $group: { _id: "$verdict", count: { $sum: 1 } } },
    ]);

    const result = {
      accepted:          0,
      wrongAnswer:       0,
      runtimeError:      0,
      compilationError:  0,
      timeLimitExceeded: 0,
    };

    const verdictMap = {
      [VERDICTS.ACCEPTED]:            "accepted",
      [VERDICTS.WRONG_ANSWER]:        "wrongAnswer",
      [VERDICTS.RUNTIME_ERROR]:       "runtimeError",
      [VERDICTS.COMPILATION_ERROR]:   "compilationError",
      [VERDICTS.TIME_LIMIT_EXCEEDED]: "timeLimitExceeded",
    };

    submissionStats.forEach((stat) => {
      const key = verdictMap[stat._id];
      if (key) result[key] = stat.count;
    });

    return result;
  }

  /**
   * Get daily submission activity data for heatmap visualization
   * @param {string} userId
   * @returns {Promise<Array<Object>>} Daily activity counters
   */
  async getActivityHeatmap(userId) {
    const cacheKey = `dashboard:heatmap:${userId}`;
    
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
  
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const heatmap = await Submission.aggregate([
      { $match: { user: userObjectId } },
      {
        $project: {
          dateStr: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "+05:30" },
          },
        },
      },
      { $group: { _id: "$dateStr", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: "$_id", count: 1 } },
    ]);
    
    await redis.set(cacheKey, JSON.stringify(heatmap), "EX", 15 * 60); // Cache for 15 minutes
    
    return heatmap;
  }
}

module.exports = new DashboardService();
