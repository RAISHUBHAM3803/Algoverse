/**
 * Authentication Service
 * Houses business logic for registration, login, token management, and profiling.
 */

const mongoose = require("mongoose");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const config = require("../config");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../utils/generateToken");

/**
 * Parse a JWT expiry string (e.g. "7d", "15m") into a future Date.
 * @param {string} expireString
 * @returns {Date}
 */
const parseExpiry = (expireString) => {
  const expiry = new Date();
  if (expireString.endsWith("d")) {
    expiry.setDate(expiry.getDate() + parseInt(expireString, 10));
  } else if (expireString.endsWith("h")) {
    expiry.setHours(expiry.getHours() + parseInt(expireString, 10));
  } else if (expireString.endsWith("m")) {
    expiry.setMinutes(expiry.getMinutes() + parseInt(expireString, 10));
  } else {
    expiry.setSeconds(expiry.getSeconds() + parseInt(expireString, 10));
  }
  return expiry;
};

class AuthService {
  /**
   * Register a new user.
   * Generates _id ahead of time so tokens can be issued before the DB write.
   */
  async register({ name, email, password }) {
    const existingUser = await User.exists({ email: email.toLowerCase() });
    if (existingUser) {
      throw new AppError("Email already registered", 400);
    }

    const userId = new mongoose.Types.ObjectId();

    const accessToken  = generateAccessToken(userId, "user");
    const refreshToken = generateRefreshToken(userId);
    const expiresAt    = parseExpiry(config.jwt.refreshExpire);

    const user = new User({
      _id: userId,
      name,
      email: email.toLowerCase(),
      password,
      refreshTokens: [{ token: refreshToken, expiresAt }],
    });

    await user.save();

    return { user, accessToken, refreshToken };
  }

  /**
   * Login a user.
   * Uses a single atomic findOneAndUpdate to set lastLogin AND push the new
   * refresh token — eliminating the previous two-write pattern (updateOne + save).
   */
  async login({ email, password }) {
    // Fetch password and refreshTokens for verification
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password +refreshTokens");
    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    if (!user.isActive) {
      throw new AppError("Your account has been deactivated", 403);
    }

    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      throw new AppError("Invalid email or password", 401);
    }

    const accessToken  = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);
    const expiresAt    = parseExpiry(config.jwt.refreshExpire);

    // Single atomic write: update lastLogin + push refresh token
    await User.updateOne(
      { _id: user._id },
      {
        $set:  { lastLogin: new Date() },
        $push: { refreshTokens: { token: refreshToken, expiresAt } },
      }
    );

    return { user, accessToken, refreshToken };
  }

  /**
   * Rotate refresh token (token refresh flow).
   * Removes the used token and purges expired ones in a single save.
   */
  async refresh(token) {
    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch (err) {
      throw new AppError("Invalid or expired refresh token", 401);
    }

    const user = await User.findOne({
      _id: decoded.id,
      "refreshTokens.token": token,
    }).select("+refreshTokens");

    if (!user || !user.isActive) {
      throw new AppError("Access denied or user inactive", 401);
    }

    // Remove current token + purge expired tokens (cleanup on refresh)
    user.refreshTokens = user.refreshTokens.filter(
      (rt) => rt.token !== token && rt.expiresAt > new Date()
    );

    const newAccessToken  = generateAccessToken(user._id, user.role);
    const newRefreshToken = generateRefreshToken(user._id);
    const expiresAt       = parseExpiry(config.jwt.refreshExpire);

    user.refreshTokens.push({ token: newRefreshToken, expiresAt });
    await user.save();

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  /**
   * Logout user — removes the specified refresh token atomically.
   */
  async logout(userId, refreshToken) {
    await User.updateOne(
      { _id: userId },
      { $pull: { refreshTokens: { token: refreshToken } } }
    );
  }

  /**
   * Update allowed profile fields.
   * Uses a whitelist to prevent mass-assignment of sensitive fields.
   */
  async updateProfile(userId, updateData) {
    const allowedUpdates = [
      "name",
      "profile.bio",
      "profile.avatar",
      "profile.github",
      "profile.linkedin",
      "profile.website",
    ];

    const updates = {};
    for (const key of Object.keys(updateData)) {
      if (allowedUpdates.includes(key)) {
        updates[key] = updateData[key];
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true, lean: true }
    );

    if (!updatedUser) {
      throw new AppError("User not found", 404);
    }

    return updatedUser;
  }

  /**
   * Change user password.
   * Verifies old password before setting the new one.
   */
  async changePassword(userId, oldPassword, newPassword) {
    const user = await User.findById(userId).select("+password");
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const isPasswordValid = await user.matchPassword(oldPassword);
    if (!isPasswordValid) {
      throw new AppError("Current password is incorrect", 401);
    }

    user.password = newPassword;
    await user.save();
  }
}

module.exports = new AuthService();
