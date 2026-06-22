/**
 * Problem Validators
 * Validates request body inputs for problem endpoints
 */

const { body } = require("express-validator");
const { handleValidationErrors } = require("../utils/validationHandler");

const problemValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Problem title is required")
    .isLength({ max: 150 })
    .withMessage("Title cannot exceed 150 characters"),

  body("statement")
    .trim()
    .notEmpty()
    .withMessage("Problem statement is required"),

  body("difficulty")
    .trim()
    .notEmpty()
    .withMessage("Difficulty level is required")
    .isIn(["Easy", "Medium", "Hard"])
    .withMessage("Difficulty must be Easy, Medium, or Hard"),

  body("tags")
    .optional()
    .isArray()
    .withMessage("Tags must be an array of strings"),

  body("tags.*")
    .isString()
    .withMessage("Each tag must be a string"),

  body("constraints")
    .optional()
    .isString()
    .withMessage("Constraints must be a string"),

  body("examples")
    .isArray({ min: 1 })
    .withMessage("At least one example is required"),

  body("examples.*.input")
    .notEmpty()
    .withMessage("Example input is required"),

  body("examples.*.output")
    .notEmpty()
    .withMessage("Example output is required"),

  body("examples.*.explanation")
    .optional()
    .isString()
    .withMessage("Example explanation must be a string"),

  body("visibleTestCases")
    .isArray({ min: 1 })
    .withMessage("At least one visible test case is required"),

  body("visibleTestCases.*.input")
    .notEmpty()
    .withMessage("Visible test case input is required"),

  body("visibleTestCases.*.output")
    .notEmpty()
    .withMessage("Visible test case output is required"),

  body("hiddenTestCases")
    .isArray({ min: 1 })
    .withMessage("At least one hidden test case is required"),

  body("hiddenTestCases.*.input")
    .notEmpty()
    .withMessage("Hidden test case input is required"),

  body("hiddenTestCases.*.output")
    .notEmpty()
    .withMessage("Hidden test case output is required"),

  body("starterCode")
    .optional()
    .isObject()
    .withMessage("Starter code must be an object"),

  body("starterCode.cpp").optional().isString(),
  body("starterCode.python").optional().isString(),
  body("starterCode.java").optional().isString(),
  body("starterCode.javascript").optional().isString(),

  handleValidationErrors,
];

const problemUpdateValidator = [
  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Problem title cannot be empty")
    .isLength({ max: 150 })
    .withMessage("Title cannot exceed 150 characters"),

  body("statement")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Problem statement cannot be empty"),

  body("difficulty")
    .optional()
    .trim()
    .isIn(["Easy", "Medium", "Hard"])
    .withMessage("Difficulty must be Easy, Medium, or Hard"),

  body("tags")
    .optional()
    .isArray()
    .withMessage("Tags must be an array of strings"),

  body("tags.*")
    .optional()
    .isString()
    .withMessage("Each tag must be a string"),

  body("examples")
    .optional()
    .isArray({ min: 1 })
    .withMessage("At least one example is required"),

  body("visibleTestCases")
    .optional()
    .isArray({ min: 1 })
    .withMessage("At least one visible test case is required"),

  body("hiddenTestCases")
    .optional()
    .isArray({ min: 1 })
    .withMessage("At least one hidden test case is required"),

  body("starterCode")
    .optional()
    .isObject()
    .withMessage("Starter code must be an object"),

  handleValidationErrors,
];

module.exports = {
  problemValidator,
  problemUpdateValidator,
};
