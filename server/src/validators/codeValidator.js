/**
 * Code Execution Validator
 * Validates request body for the code run endpoint.
 */

const { body } = require("express-validator");
const { handleValidationErrors } = require("../utils/validationHandler");
const { LANGUAGES } = require("../constants/enums");

const runCodeValidator = [
  body("language")
    .notEmpty()
    .withMessage("Language is required")
    .bail()
    .isIn(LANGUAGES)
    .withMessage(`Unsupported language. Supported languages: ${LANGUAGES.join(", ")}`),

  body("code")
    .trim()               // strip whitespace BEFORE checking empty
    .notEmpty()
    .withMessage("Code is required")
    .bail()
    .isString()
    .withMessage("Code must be a string")
    .isLength({ max: 20000 })
    .withMessage("Code cannot exceed 20,000 characters"),

  body("input")
    .optional()
    .isString()
    .withMessage("Input must be a string")
    .isLength({ max: 5000 })
    .withMessage("Input cannot exceed 5,000 characters"),

  handleValidationErrors,
];

module.exports = { runCodeValidator };
