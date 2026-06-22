/**
 * Authentication Middleware
 * Protects routes by verifying JWT access tokens via Header or Cookie
 */

const { verifyAccessToken } = require("../utils/generateToken");
const AppError = require("../utils/AppError");
const User = require("../models/User");

/**
 * Extract JWT token from Authorization header or cookie
 * @param {import('express').Request} req
 * @returns {string|null}
 */
const extractToken = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }
  if (req.cookies && req.cookies.accessToken) {
    return req.cookies.accessToken;
  }
  // Allow token via query string for SSE connections (EventSource cannot send headers)
  if (req.query && req.query.token) {
    return req.query.token;
  }
  return null;
};

/**
 * Verify JWT and attach user to request
 * Blocks access if token is missing or invalid
 */
const authenticate = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      throw new AppError("No token provided. Please login first", 401);
    }

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (error) {
      if (error.message === "AccessTokenExpired") {
        throw new AppError("Token has expired. Please refresh your session", 401);
      }
      throw new AppError("Invalid token", 401);
    }

    // Exclude heavy arrays from the user query
    const user = await User.findById(decoded.id).select("-solvedProblems -refreshTokens").lean();

    if (!user) {
      throw new AppError("User not found", 401);
    }

    if (!user.isActive) {
      throw new AppError("User account is deactivated", 403);
    }

    req.user   = user;
    req.userId = decoded.id;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional authentication middleware
 * Attaches user if token is valid, but does not block requests without a token
 */
const optionalAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      return next();
    }

    try {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.id).select("-solvedProblems -refreshTokens").lean();

      if (user && user.isActive) {
        req.user   = user;
        req.userId = decoded.id;
      }
    } catch (_) {
      // Silent catch — client continues unauthenticated
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { authenticate, optionalAuth };
