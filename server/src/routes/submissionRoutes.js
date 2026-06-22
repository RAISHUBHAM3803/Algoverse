/**
 * Submission Routes
 * Defines all submission evaluation API endpoints
 */

const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");
const {
  submitCode,
  streamSubmissionStatus,
  getUserSubmissions,
  getSubmissionById,
} = require("../controllers/submissionController");
const {
  submitCodeValidator,
  getSubmissionsValidator,
  getSubmissionByIdValidator,
} = require("../validators/submissionValidator");

const router = express.Router();

// All submission routes require authentication
router.use(authenticate);

/**
 * Submit code for evaluation
 * POST /api/v1/submissions
 */
router.post("/", submitCodeValidator, submitCode);

/**
 * Stream submission status
 * GET /api/v1/submissions/stream/:jobId
 */
router.get("/stream/:jobId", streamSubmissionStatus);

/**
 * Get user's submission history (paginated)
 * GET /api/v1/submissions/my
 */
router.get("/my", getSubmissionsValidator, getUserSubmissions);

/**
 * Get single submission by ID
 * GET /api/v1/submissions/:id
 */
router.get("/:id", getSubmissionByIdValidator, getSubmissionById);

module.exports = router;
