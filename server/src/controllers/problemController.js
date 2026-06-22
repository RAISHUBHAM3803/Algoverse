const problemService = require("../services/problemService");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/responseHandler");

/**
 * Create a new problem (Admin Only)
 */
const createProblem = asyncHandler(async (req, res) => {
  const problem = await problemService.createProblem(req.body, req.userId);
  return sendSuccess(res, 201, "Problem created successfully", problem);
});

/**
 * Bulk import problems (Admin Only)
 */
const bulkImportProblems = asyncHandler(async (req, res) => {
  if (!Array.isArray(req.body) || req.body.length === 0) {
    return res.status(400).json({ success: false, message: "Request body must be a non-empty array of problems." });
  }
  
  const inserted = await problemService.bulkCreateProblems(req.body, req.userId);
  return sendSuccess(res, 201, `Bulk import completed. Inserted ${inserted.length} problems.`, { insertedCount: inserted.length });
});

/**
 * Get all problems (with search, pagination, and filtering)
 */
const getProblems = asyncHandler(async (req, res) => {
  const { page, limit, difficulty, tag, search } = req.query;
  const result = await problemService.getProblems({
    page,
    limit,
    difficulty,
    tag,
    search,
    userId: req.userId,
  });

  return res.status(200).json({
    success: true,
    message: "Problems retrieved successfully",
    data: result.problems,
    pagination: {
      totalCount: result.totalResults,
      totalPages: result.totalPages,
      page: result.page,
      limit: result.limit,
    }
  });
});

/**
 * Get a single problem by ID or Slug
 */
const getProblemById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const isAdmin = req.user && req.user.role === "admin";
  const problem = await problemService.getProblemById(id, isAdmin);

  return sendSuccess(res, 200, "Problem retrieved successfully", problem);
});

/**
 * Update problem details (Admin Only)
 */
const updateProblem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const problem = await problemService.updateProblem(id, req.body);

  return sendSuccess(res, 200, "Problem updated successfully", problem);
});

/**
 * Delete a problem (Admin Only)
 */
const deleteProblem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await problemService.deleteProblem(id);

  return sendSuccess(res, 200, "Problem deleted successfully");
});

module.exports = {
  createProblem,
  bulkImportProblems,
  getProblems,
  getProblemById,
  updateProblem,
  deleteProblem,
};
