/**
 * AI Controller
 * Thin controller layer — delegates to aiService, logs interactions asynchronously,
 * and returns structured responses.
 */

const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/responseHandler");
const AppError = require("../utils/AppError");
const logger = require("../utils/logger");

const {
  getCodeReview,
  analyzeComplexity,
  generateHints,
  getInterviewFeedback,
} = require("../services/aiService");
const AIInteraction = require("../models/AIInteraction");
const aiConfig = require("../config/aiConfig");

// ============================================
// PRIVATE HELPERS
// ============================================

/**
 * Persist an AI interaction log asynchronously (fire-and-forget).
 * A logging failure must NEVER block or fail the API response.
 */
const logInteraction = async (userId, feature, requestSummary, responseSummary) => {
  try {
    await AIInteraction.create({ user: userId, featureUsed: feature, requestSummary, responseSummary });
  } catch (err) {
    logger.warn(`[AI Controller] Failed to save AI interaction log: ${err.message}`);
  }
};

/**
 * Assert that an AI service result is a valid non-null object.
 * Throws AppError 502 if invalid — asyncHandler propagates it to errorMiddleware.
 * @param {*} result
 * @throws {AppError}
 */
const assertAIResult = (result) => {
  if (!result || typeof result !== "object") {
    throw new AppError("AI service returned an invalid response. Please try again.", 502);
  }
};

// ============================================
// FEATURE 1 — AI CODE REVIEW
// POST /api/v1/ai/review
// ============================================
const reviewCode = asyncHandler(async (req, res) => {
  const { language, code } = req.body;

  logger.info(`[AI Review] User ${req.userId} | Lang: ${language} | Provider: ${aiConfig.provider}`);

  const result = await getCodeReview(language, code);
  assertAIResult(result);

  logInteraction(req.userId, "review",
    { language, codeLength: code.length },
    { strengthCount: result.strengths?.length, weaknessCount: result.weaknesses?.length }
  );

  logger.info(`[AI Review] Completed for user ${req.userId}`);
  return sendSuccess(res, 200, "Code review generated successfully.", result);
});

// ============================================
// FEATURE 2 — AI COMPLEXITY ANALYSIS
// POST /api/v1/ai/complexity
// ============================================
const analyzeCode = asyncHandler(async (req, res) => {
  const { language, code } = req.body;

  logger.info(`[AI Complexity] User ${req.userId} | Lang: ${language}`);

  const result = await analyzeComplexity(language, code);
  assertAIResult(result);

  logInteraction(req.userId, "complexity",
    { language, codeLength: code.length },
    { timeComplexity: result.timeComplexity, spaceComplexity: result.spaceComplexity }
  );

  logger.info(`[AI Complexity] Time=${result.timeComplexity}, Space=${result.spaceComplexity}`);
  return sendSuccess(res, 200, "Complexity analysis completed.", result);
});

// ============================================
// FEATURE 3 — AI HINT GENERATOR
// POST /api/v1/ai/hint
// ============================================
const getHints = asyncHandler(async (req, res) => {
  const { problemTitle, problemDescription, difficulty } = req.body;

  logger.info(`[AI Hint] User ${req.userId} | Problem: "${problemTitle}" | Difficulty: ${difficulty}`);

  const result = await generateHints(problemTitle, problemDescription, difficulty);
  assertAIResult(result);

  logInteraction(req.userId, "hint",
    { problemTitle, difficulty },
    { hasHint1: !!result.hint1, hasHint2: !!result.hint2, hasHint3: !!result.hint3 }
  );

  logger.info(`[AI Hint] Generated for "${problemTitle}" | User ${req.userId}`);
  return sendSuccess(res, 200, "Hints generated successfully.", result);
});

// ============================================
// FEATURE 4 — AI INTERVIEW FEEDBACK
// POST /api/v1/ai/interview-feedback
// ============================================
const generateInterviewFeedback = asyncHandler(async (req, res) => {
  const { language, code, problemTitle, verdict } = req.body;

  logger.info(`[AI Interview] User ${req.userId} | Problem: "${problemTitle}" | Verdict: ${verdict}`);

  const result = await getInterviewFeedback(language, code, problemTitle, verdict);
  assertAIResult(result);

  logInteraction(req.userId, "interview-feedback",
    { language, problemTitle, verdict, codeLength: code.length },
    {
      problemSolving:         result.problemSolving,
      codeQuality:            result.codeQuality,
      optimization:           result.optimization,
      communicationReadiness: result.communicationReadiness,
    }
  );

  logger.info(`[AI Interview] Feedback generated for user ${req.userId}`);
  return sendSuccess(res, 200, "Interview feedback generated successfully.", result);
});

module.exports = {
  reviewCode,
  analyzeCode,
  getHints,
  generateInterviewFeedback,
};
