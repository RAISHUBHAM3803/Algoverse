const submissionService = require("../services/submissionService");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/responseHandler");
const submissionQueue = require("../workers/submissionQueue");
const redis = require("../config/redis");
const Problem = require("../models/Problem");
const AppError = require("../utils/AppError");

// SSE stream timeout — close connection if no result arrives within 90 seconds
const SSE_TIMEOUT_MS = 90 * 1000;

/**
 * Submit code for evaluation
 * @route POST /api/v1/submissions
 * @access Protected User
 */
const submitCode = asyncHandler(async (req, res) => {
  const { problemId, language, code } = req.body;
  const userId = req.userId;

  // Validate problem exists and has test cases BEFORE queuing
  const problem = await Problem.findById(problemId).select("_id hiddenTestCases").lean();
  if (!problem) {
    throw new AppError("Problem not found", 404);
  }
  if (!problem.hiddenTestCases || problem.hiddenTestCases.length === 0) {
    throw new AppError("Problem does not have test cases configured", 400);
  }

  const job = await submissionQueue.add("evaluate-submission", {
    userId,
    problemId,
    language,
    code,
  });

  return sendSuccess(res, 202, "Submission queued for evaluation", { jobId: job.id });
});

/**
 * Stream submission status via Server-Sent Events (SSE).
 *
 * A per-request Redis subscriber is created and destroyed when the connection
 * closes (or times out). This avoids the memory/connection leak that would
 * occur with a module-level subscriber that persists for the full process lifetime.
 *
 * @route GET /api/v1/submissions/stream/:jobId
 * @access Protected (authenticate middleware applied at router level)
 */
const streamSubmissionStatus = (req, res) => {
  const { jobId } = req.params;

  res.setHeader("Content-Type",  "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection",    "keep-alive");
  res.flushHeaders(); // Flush headers immediately so the client knows the stream opened

  res.write(`data: ${JSON.stringify({ status: "connected" })}\n\n`);

  // Create a dedicated subscriber for this specific SSE connection
  const subscriber = redis.duplicate();
  subscriber.on("error", (err) => console.error("Redis subscriber error:", err.message));
  subscriber.psubscribe(`job:${jobId}:complete`, `job:${jobId}:error`).catch(err => {
    console.error("psubscribe error", err.message);
  });

  let timeoutHandle;

  const cleanup = () => {
    clearTimeout(timeoutHandle);
    subscriber.punsubscribe().catch(err => console.error("punsubscribe error", err.message));
    subscriber.quit().catch(err => console.error("quit error", err.message));
  };

  const messageHandler = (pattern, channel, message) => {
    if (channel === `job:${jobId}:complete` || channel === `job:${jobId}:error`) {
      res.write(`data: ${message}\n\n`);
      res.end();
      cleanup();
    }
  };

  subscriber.on("pmessage", messageHandler);

  // Auto-close if no result arrives within SSE_TIMEOUT_MS
  timeoutHandle = setTimeout(() => {
    res.write(`data: ${JSON.stringify({ status: "timeout", message: "Evaluation timed out" })}\n\n`);
    res.end();
    cleanup();
  }, SSE_TIMEOUT_MS);

  // Clean up if client disconnects early
  req.on("close", cleanup);
};

/**
 * Get user's submission history with pagination
 * @route GET /api/v1/submissions/my
 * @access Protected User
 */
const getUserSubmissions = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { page = 1, limit = 10 } = req.query;

  const result = await submissionService.getUserSubmissions(userId, page, limit);

  return sendSuccess(res, 200, "Submissions retrieved successfully", result.submissions, result.pagination);
});

/**
 * Get single submission by ID
 * @route GET /api/v1/submissions/:id
 * @access Protected User
 */
const getSubmissionById = asyncHandler(async (req, res) => {
  const { id }   = req.params;
  const userId   = req.userId;

  const result = await submissionService.getSubmissionById(id, userId);

  return sendSuccess(res, 200, "Submission retrieved successfully", result.data);
});

module.exports = {
  submitCode,
  streamSubmissionStatus,
  getUserSubmissions,
  getSubmissionById,
};
