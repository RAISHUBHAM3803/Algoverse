/**
 * User Model
 * Defines the schema for users in the AlgoVerse platform
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { ROLES } = require("../constants/enums");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide your name"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },

    email: {
      type: String,
      required: [true, "Please provide your email"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // Don't include password in queries by default
    },

    role: {
      type: String,
      enum: {
        values: [ROLES.USER, ROLES.ADMIN],
        message: "Role must be either user or admin",
      },
      default: ROLES.USER,
    },

    profile: {
      bio: { type: String, default: "" },
      avatar: { type: String, default: "" },
      github: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      website: { type: String, default: "" },
    },

    stats: {
      solvedCount: { type: Number, default: 0 },
      easySolved:  { type: Number, default: 0 },
      mediumSolved: { type: Number, default: 0 },
      hardSolved:  { type: Number, default: 0 },
      totalSubmissions: { type: Number, default: 0 },
      acceptedSubmissions: { type: Number, default: 0 },
      lastActive:  { type: Date, default: null },
    },

    solvedProblems: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Problem",
      },
    ],

    refreshTokens: {
      type: [
        {
          token: { type: String, required: true },
          expiresAt: { type: Date, required: true },
        },
      ],
      select: false,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ============================================
// PASSWORD HASHING MIDDLEWARE
// ============================================

/**
 * Hash password before saving
 * Only hashes if password is modified
 */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ============================================
// INSTANCE METHODS
// ============================================

/**
 * Compare password with hashed password
 * Used during login
 *
 * @param {string} enteredPassword - Password entered by user
 * @returns {Promise<boolean>} - True if passwords match
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ============================================
// INDEXES
// ============================================

// Composite index for fast token validation queries
userSchema.index({ _id: 1, "refreshTokens.token": 1 });

// Composite index for fast Leaderboard ranking retrieval
userSchema.index({ "stats.solvedCount": -1, "stats.totalSubmissions": 1 });

module.exports = mongoose.model("User", userSchema);
