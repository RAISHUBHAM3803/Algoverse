/**
 * Problem Model
 * Defines the schema for coding problems in the AlgoVerse platform
 */

const mongoose = require("mongoose");
const { DIFFICULTIES } = require("../constants/enums");
const { slugify } = require("../utils/slugify");

const problemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Problem title is required"],
      trim: true,
      unique: true,
      maxlength: [150, "Title cannot exceed 150 characters"],
    },

    // Permanent LeetCode-style sequential number (1, 2, 3 … N).
    // Unique sparse index is declared at schema level below.
    problemNumber: {
      type: Number,
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },

    statement: {
      type: String,
      required: [true, "Problem statement is required"],
    },

    difficulty: {
      type: String,
      required: [true, "Difficulty is required"],
      enum: {
        values: [DIFFICULTIES.EASY, DIFFICULTIES.MEDIUM, DIFFICULTIES.HARD],
        message: "Difficulty must be Easy, Medium, or Hard",
      },
      index: true,
    },

    tags: {
      type: [String],
      default: [],
      index: true,
    },

    constraints: {
      type: String,
      default: "",
    },

    hints: {
      type: [String],
      default: [],
    },

    examples: [
      {
        input: { type: String, required: true },
        output: { type: String, required: true },
        explanation: { type: String, default: "" },
      },
    ],

    visibleTestCases: [
      {
        input: { type: String, required: true },
        output: { type: String, required: true },
      },
    ],

    hiddenTestCases: {
      type: [
        {
          input: { type: String, required: true },
          output: { type: String, required: true },
        },
      ],
      select: false, // Prevents hidden test cases from being selected by default
    },

    starterCode: {
      cpp: { type: String, default: "" },
      python: { type: String, default: "" },
      java: { type: String, default: "" },
      javascript: { type: String, default: "" },
    },

    driverCode: {
      cpp: { type: String, default: "" },
      python: { type: String, default: "" },
      java: { type: String, default: "" },
      javascript: { type: String, default: "" },
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ── Cached Acceptance Stats (updated on each submission verdict) ──────────
    totalSubmissions: {
      type: Number,
      default: 0,
      index: true,
    },

    acceptedSubmissions: {
      type: Number,
      default: 0,
    },

    // Stored as 0–100 (e.g. 57.3). Recomputed whenever totalSubmissions changes.
    acceptanceRate: {
      type: Number,
      default: null,
    },

    isRealDataFetched: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// ============================================
// PRE-SAVE MIDDLEWARE
// ============================================

/**
 * Automatically slugify title before save using shared utility
 */
problemSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = slugify(this.title);
  }
  next();
});

// ============================================
// INDEXES
// ============================================

// Compound index for fast filtering by difficulty and tags
problemSchema.index({ difficulty: 1, tags: 1 });
// Compound text index for fast text searches
problemSchema.index({ title: "text", tags: "text" });
// Unique problem number (sparse allows null during migration)
problemSchema.index({ problemNumber: 1 }, { unique: true, sparse: true });


module.exports = mongoose.model("Problem", problemSchema);
