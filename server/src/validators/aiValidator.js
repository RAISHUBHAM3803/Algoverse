/**
 * AI Feature Validators
 * Validates request bodies for all AI routes using express-validator.
 * Language/difficulty/verdict constants are imported from the shared enums
 * module to ensure a single source of truth.
 */

const { body } = require("express-validator");
const { handleValidationErrors } = require("../utils/validationHandler");
const {
  AI_SUPPORTED_LANGUAGES,
  AI_SUPPORTED_DIFFICULTIES,
  AI_SUPPORTED_VERDICTS,
} = require("../constants/enums");

// ============================================
// VALIDATE CODE REVIEW REQUEST
// POST /api/v1/ai/review
// ============================================
const validateReview = [
  body("language")
    .trim()
    .notEmpty().withMessage("Programming language is required.")
    .isString().withMessage("Language must be a string.")
    .toLowerCase()
    .isIn(AI_SUPPORTED_LANGUAGES).withMessage(
      `Language must be one of: ${AI_SUPPORTED_LANGUAGES.join(", ")}`
    ),

  body("code")
    .notEmpty().withMessage("Code is required.")
    .isString().withMessage("Code must be a string.")
    .isLength({ min: 5, max: 20000 }).withMessage("Code must be between 5 and 20,000 characters."),

  handleValidationErrors,
];

// ============================================
// VALIDATE COMPLEXITY ANALYSIS REQUEST
// POST /api/v1/ai/complexity
// ============================================
const validateComplexity = [
  body("language")
    .trim()
    .notEmpty().withMessage("Programming language is required.")
    .isString().withMessage("Language must be a string.")
    .toLowerCase()
    .isIn(AI_SUPPORTED_LANGUAGES).withMessage(
      `Language must be one of: ${AI_SUPPORTED_LANGUAGES.join(", ")}`
    ),

  body("code")
    .notEmpty().withMessage("Code is required.")
    .isString().withMessage("Code must be a string.")
    .isLength({ min: 5, max: 20000 }).withMessage("Code must be between 5 and 20,000 characters."),

  handleValidationErrors,
];

// ============================================
// VALIDATE HINT GENERATION REQUEST
// POST /api/v1/ai/hint
// ============================================
const validateHint = [
  body("problemTitle")
    .trim()
    .notEmpty().withMessage("Problem title is required.")
    .isString().withMessage("Problem title must be a string.")
    .isLength({ min: 3, max: 200 }).withMessage("Problem title must be between 3 and 200 characters."),

  body("problemDescription")
    .trim()
    .notEmpty().withMessage("Problem description is required.")
    .isString().withMessage("Problem description must be a string.")
    .isLength({ min: 10, max: 10000 }).withMessage("Problem description must be between 10 and 10,000 characters."),

  body("difficulty")
    .trim()
    .notEmpty().withMessage("Problem difficulty is required.")
    .isIn(AI_SUPPORTED_DIFFICULTIES).withMessage(
      `Difficulty must be one of: ${AI_SUPPORTED_DIFFICULTIES.join(", ")}`
    ),

  handleValidationErrors,
];

// ============================================
// VALIDATE INTERVIEW FEEDBACK REQUEST
// POST /api/v1/ai/interview-feedback
// ============================================
const validateInterviewFeedback = [
  body("language")
    .trim()
    .notEmpty().withMessage("Programming language is required.")
    .isString().withMessage("Language must be a string.")
    .toLowerCase()
    .isIn(AI_SUPPORTED_LANGUAGES).withMessage(
      `Language must be one of: ${AI_SUPPORTED_LANGUAGES.join(", ")}`
    ),

  body("code")
    .notEmpty().withMessage("Code is required.")
    .isString().withMessage("Code must be a string.")
    .isLength({ min: 5, max: 20000 }).withMessage("Code must be between 5 and 20,000 characters."),

  body("problemTitle")
    .trim()
    .notEmpty().withMessage("Problem title is required.")
    .isString().withMessage("Problem title must be a string.")
    .isLength({ min: 3, max: 200 }).withMessage("Problem title must be between 3 and 200 characters."),

  body("verdict")
    .trim()
    .notEmpty().withMessage("Submission verdict is required.")
    .isIn(AI_SUPPORTED_VERDICTS).withMessage(
      `Verdict must be one of: ${AI_SUPPORTED_VERDICTS.join(", ")}`
    ),

  handleValidationErrors,
];

module.exports = {
  validateReview,
  validateComplexity,
  validateHint,
  validateInterviewFeedback,
};
