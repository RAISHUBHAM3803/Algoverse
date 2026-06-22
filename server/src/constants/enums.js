/**
 * Shared Application Enums & Constants
 * Single source of truth for all enumerated values used across
 * models, services, validators, and controllers.
 */

const VERDICTS = {
  ACCEPTED:            "Accepted",
  WRONG_ANSWER:        "Wrong Answer",
  RUNTIME_ERROR:       "Runtime Error",
  COMPILATION_ERROR:   "Compilation Error",
  COMPILATION_WARNING: "Compilation Warning",
  TIME_LIMIT_EXCEEDED: "Time Limit Exceeded",
  SYSTEM_ERROR:        "System Error",
  PENDING:             "Pending",
};

const DIFFICULTIES = {
  EASY:   "Easy",
  MEDIUM: "Medium",
  HARD:   "Hard",
};

const ROLES = {
  USER:  "user",
  ADMIN: "admin",
};

// Languages supported by the code execution engine (JDoodle)
const LANGUAGES = ["python", "cpp", "java", "javascript"];

// Languages supported by the AI feature validators (broader set — AI reviews any language)
const AI_SUPPORTED_LANGUAGES = [
  "javascript", "typescript", "python", "java", "cpp", "c",
  "csharp", "go", "rust", "kotlin", "swift", "ruby", "php",
  "scala", "r", "bash", "sql",
];

const AI_SUPPORTED_DIFFICULTIES = ["Easy", "Medium", "Hard"];

const AI_SUPPORTED_VERDICTS = [
  "Accepted", "Wrong Answer", "Time Limit Exceeded",
  "Runtime Error", "Compilation Error", "Memory Limit Exceeded",
];

module.exports = {
  VERDICTS,
  DIFFICULTIES,
  ROLES,
  LANGUAGES,
  AI_SUPPORTED_LANGUAGES,
  AI_SUPPORTED_DIFFICULTIES,
  AI_SUPPORTED_VERDICTS,
};
