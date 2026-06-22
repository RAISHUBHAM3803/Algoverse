/**
 * JWT Token Utility
 * Handles generation and verification of JWT access and refresh tokens.
 * algorithm is explicitly set to 'HS256' to prevent algorithm-confusion attacks
 * (e.g., a forged token declaring alg: none or RS256 with a public key).
 */

const jwt = require("jsonwebtoken");
const config = require("../config");

const ALGORITHM = "HS256";

/**
 * Generate Access Token
 * @param {string|ObjectId} userId - User ID
 * @param {string} role - User role
 * @returns {string} Signed JWT access token
 */
const generateAccessToken = (userId, role) => {
  const id = userId ? userId.toString() : userId;
  return jwt.sign(
    { id, role },
    config.jwt.secret,
    { expiresIn: config.jwt.expire, algorithm: ALGORITHM }
  );
};

/**
 * Generate Refresh Token
 * @param {string|ObjectId} userId - User ID
 * @returns {string} Signed JWT refresh token
 */
const generateRefreshToken = (userId) => {
  const id = userId ? userId.toString() : userId;
  return jwt.sign(
    { id },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpire, algorithm: ALGORITHM }
  );
};

/**
 * Verify Access Token
 * @param {string} token - Access token string
 * @returns {object} Decoded payload
 * @throws {Error} AccessTokenExpired | Invalid token
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret, { algorithms: [ALGORITHM] });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new Error("AccessTokenExpired");
    }
    throw new Error("Invalid token");
  }
};

/**
 * Verify Refresh Token
 * @param {string} token - Refresh token string
 * @returns {object} Decoded payload
 * @throws {Error} RefreshTokenExpired | Invalid refresh token
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.refreshSecret, { algorithms: [ALGORITHM] });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new Error("RefreshTokenExpired");
    }
    throw new Error("Invalid refresh token");
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
