/**
 * Submission Model
 * Stores every code submission made by users against problems
 */

const mongoose = require("mongoose");
const { VERDICTS } = require("../constants/enums");

const submissionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    problem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
      required: true,
    },

    code: {
      type: String,
      required: [true, "Submitted code is required"],
    },

    language: {
      type: String,
      required: [true, "Language is required"],
      enum: {
        values: ["python", "cpp", "java", "javascript"],
        message: "Unsupported language",
      },
    },

    // Overall verdict for the submission
    verdict: {
      type: String,
      enum: [
        VERDICTS.ACCEPTED,
        VERDICTS.WRONG_ANSWER,
        VERDICTS.TIME_LIMIT_EXCEEDED,
        VERDICTS.RUNTIME_ERROR,
        VERDICTS.COMPILATION_ERROR,
        VERDICTS.COMPILATION_WARNING,
        VERDICTS.SYSTEM_ERROR,
        VERDICTS.PENDING,
      ],
      default: VERDICTS.PENDING,
    },

    // Test case results
    testCasesPassed: {
      type: Number,
      default: 0,
    },

    totalTestCases: {
      type: Number,
      default: 0,
    },

    // Execution performance
    runtime: {
      type: Number, // in ms
      default: 0,
    },

    memory: {
      type: Number, // in KB
      default: 0,
    },

    // Error message (for compilation/runtime errors)
    errorMessage: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// ============================================
// INDEXES for Performance
// ============================================

// Individual field indexes
submissionSchema.index({ user: 1 });
submissionSchema.index({ problem: 1 });
submissionSchema.index({ verdict: 1 });
submissionSchema.index({ language: 1 });
submissionSchema.index({ createdAt: -1 });

// Fast lookup: user's submissions for a problem (most common query)
submissionSchema.index({ user: 1, problem: 1 });
// Fast lookup: all submissions by a user sorted by time
submissionSchema.index({ user: 1, createdAt: -1 });
// Fast lookup: submissions for a problem (leaderboard/stats)
submissionSchema.index({ problem: 1, verdict: 1 });

// Optimized composite indexes for dashboard analytics and aggregations
submissionSchema.index({ user: 1, verdict: 1 });
submissionSchema.index({ user: 1, language: 1 });

module.exports = mongoose.model("Submission", submissionSchema);
