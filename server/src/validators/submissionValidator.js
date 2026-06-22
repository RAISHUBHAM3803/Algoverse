/**
 * Submission Validator
 * Validates incoming submission requests
 */

const { body, param, query } = require("express-validator");
const { handleValidationErrors } = require("../utils/validationHandler");
const { LANGUAGES } = require("../constants/enums");

/**
 * Validator for submission creation
 */
const submitCodeValidator = [
  body("problemId")
    .notEmpty()
    .withMessage("Problem ID is required")
    .bail()
    .isMongoId()
    .withMessage("Invalid problem ID format"),

  body("language")
    .notEmpty()
    .withMessage("Language is required")
    .bail()
    .isIn(LANGUAGES)
    .withMessage(`Unsupported language. Supported languages: ${LANGUAGES.join(", ")}`),

  body("code")
    .notEmpty()
    .withMessage("Code is required")
    .bail()
    .isString()
    .withMessage("Code must be a string")
    .trim(),

  handleValidationErrors,
];

/**
 * Validator for fetching submissions with pagination
 */
const getSubmissionsValidator = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  handleValidationErrors,
];

/**
 * Validator for getting single submission by ID
 */
const getSubmissionByIdValidator = [
  param("id")
    .isMongoId()
    .withMessage("Invalid submission ID format"),

  handleValidationErrors,
];

module.exports = {
  submitCodeValidator,
  getSubmissionsValidator,
  getSubmissionByIdValidator,
};
