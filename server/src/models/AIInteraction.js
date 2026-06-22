/**
 * AI Interaction Model
 * Stores history of AI requests made by users for analytics and limits.
 */

const mongoose = require("mongoose");

const aiInteractionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    featureUsed: {
      type: String,
      required: true,
      enum: ["review", "complexity", "hint", "interview-feedback"],
      index: true,
    },
    requestSummary: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    responseSummary: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Index for auditing user usage and analytics aggregation
aiInteractionSchema.index({ user: 1, featureUsed: 1, createdAt: -1 });

module.exports = mongoose.model("AIInteraction", aiInteractionSchema);
