/**
 * Authentication Controller
 * Thin controller — validates input, delegates to AuthService, returns response.
 */

const authService = require("../services/authService");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const config = require("../config");
const { sendSuccess } = require("../utils/responseHandler");
const Submission = require("../models/Submission");
const mongoose = require("mongoose");
const { calculateStreaks } = require("../utils/analyticsHelper");
const { VERDICTS } = require("../constants/enums");
const redis = require("../config/redis");

// ============================================
// PRIVATE HELPERS
// ============================================

/**
 * Build cookie options based on a JWT expiry string and environment.
 * @param {string} expireString - e.g. "15m", "7d"
 * @returns {Object} Express cookie options
 */
const getCookieOptions = (expireString) => {
  const isProd = config.isProduction;

  let maxAge = 15 * 60 * 1000; // default: 15 minutes
  if (expireString.endsWith("d")) {
    maxAge = parseInt(expireString, 10) * 24 * 60 * 60 * 1000;
  } else if (expireString.endsWith("m")) {
    maxAge = parseInt(expireString, 10) * 60 * 1000;
  }

  return {
    httpOnly: true,
    secure:   isProd,
    sameSite: "Lax",
    maxAge,
    expires:  new Date(Date.now() + maxAge),
  };
};

/**
 * Build cookie clearing options.
 * clearCookie() requires the SAME httpOnly/secure/sameSite options that were
 * used when setting the cookie, otherwise some browsers silently ignore the clear.
 * @returns {Object} Express cookie options (without maxAge)
 */
const getClearCookieOptions = () => {
  const isProd = config.isProduction;
  return {
    httpOnly: true,
    secure:   isProd,
    sameSite: "Lax",
  };
};

/**
 * Set auth cookies and return standardized JSON response.
 */
const sendAuthResponse = (res, statusCode, message, user, accessToken, refreshToken) => {
  res.cookie("accessToken",  accessToken,  getCookieOptions(config.jwt.expire));
  res.cookie("refreshToken", refreshToken, getCookieOptions(config.jwt.refreshExpire));

  return res.status(statusCode).json({
    success: true,
    message,
    accessToken,
    refreshToken,
    user: {
      id:      user._id,
      name:    user.name,
      email:   user.email,
      role:    user.role,
      profile: user.profile,
      stats:   user.stats,
    },
  });
};

// ============================================
// ROUTE HANDLERS
// ============================================

/**
 * Register a new user
 * POST /api/v1/auth/register
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const { user, accessToken, refreshToken } = await authService.register({ name, email, password });
  sendAuthResponse(res, 201, "Registration successful", user, accessToken, refreshToken);
});

/**
 * Login user
 * POST /api/v1/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { user, accessToken, refreshToken } = await authService.login({ email, password });
  // Bust any stale Redis cache for this user so the dashboard always loads fresh data on login
  const userId = user._id.toString();
  await Promise.allSettled([
    redis.del(`dashboard:summary:${userId}`),
    redis.del(`dashboard:difficulty:${userId}`),
    redis.del(`dashboard:languages:${userId}`),
    redis.del(`dashboard:submissions:${userId}`),
    redis.del(`dashboard:activity:${userId}`),
  ]);
  sendAuthResponse(res, 200, "Login successful", user, accessToken, refreshToken);
});

/**
 * Refresh access token
 * POST /api/v1/auth/refresh
 */
const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken || req.body.refreshToken;
  if (!token) {
    throw new AppError("No refresh token provided", 400);
  }

  const { accessToken, refreshToken } = await authService.refresh(token);

  res.cookie("accessToken",  accessToken,  getCookieOptions(config.jwt.expire));
  res.cookie("refreshToken", refreshToken, getCookieOptions(config.jwt.refreshExpire));

  return sendSuccess(res, 200, "Token refreshed successfully", { accessToken });
});

/**
 * Get current authenticated user
 * GET /api/v1/auth/me
 */
const getCurrentUser = asyncHandler(async (req, res) => {
  const user = req.user;

  // Compute current streak live so the navbar always shows accurate data
  const acceptedDates = await Submission.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(user._id), verdict: VERDICTS.ACCEPTED } },
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
  const dates = acceptedDates.map((d) => d._id);
  const { currentStreak } = calculateStreaks(dates);

  return sendSuccess(res, 200, "Current user retrieved successfully", {
    user: {
      id:             user._id,
      name:           user.name,
      email:          user.email,
      role:           user.role,
      profile:        user.profile,
      stats:          user.stats,
      currentStreak,
      createdAt:      user.createdAt,
      lastLogin:      user.lastLogin,
    },
  });
});

/**
 * Logout user
 * POST /api/v1/auth/logout
 */
const logout = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken || req.body.refreshToken;
  if (token && req.userId) {
    await authService.logout(req.userId, token);
  }

  // Pass matching security options so browsers reliably clear the cookies
  const clearOpts = getClearCookieOptions();
  res.clearCookie("accessToken",  clearOpts);
  res.clearCookie("refreshToken", clearOpts);

  return sendSuccess(res, 200, "Logout successful");
});

/**
 * Update user profile
 * PUT /api/v1/auth/profile
 */
const updateProfile = asyncHandler(async (req, res) => {
  const updatedUser = await authService.updateProfile(req.userId, req.body);
  return sendSuccess(res, 200, "Profile updated successfully", {
    user: {
      id:      updatedUser._id,
      name:    updatedUser.name,
      email:   updatedUser.email,
      role:    updatedUser.role,
      profile: updatedUser.profile,
      stats:   updatedUser.stats,
    },
  });
});

/**
 * Change user password
 * POST /api/v1/auth/change-password
 */
const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  await authService.changePassword(req.userId, oldPassword, newPassword);
  return sendSuccess(res, 200, "Password changed successfully");
});

module.exports = {
  register,
  login,
  refresh,
  getCurrentUser,
  logout,
  updateProfile,
  changePassword,
};
