/**
 * Problem Routes
 * Defines all problem-related API endpoints
 */

const express = require("express");
const {
  createProblem,
  bulkImportProblems,
  getProblems,
  getProblemById,
  updateProblem,
  deleteProblem,
} = require("../controllers/problemController");

const { authenticate, optionalAuth } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");
const { problemValidator, problemUpdateValidator } = require("../validators/problemValidator");

const router = express.Router();

// ============================================
// PUBLIC ROUTES
// ============================================

/**
 * Get all problems (paginated & filtered)
 */
router.get("/", optionalAuth, getProblems);

/**
 * Get single problem by ID or slug
 */
router.get("/:id", optionalAuth, getProblemById);

// ============================================
// ADMIN-ONLY ROUTES
// ============================================

/**
 * Create a new problem
 */
router.post("/", authenticate, adminOnly, problemValidator, createProblem);

/**
 * Bulk import problems
 */
router.post("/bulk", authenticate, adminOnly, bulkImportProblems);

/**
 * Update problem details
 */
router.put("/:id", authenticate, adminOnly, problemUpdateValidator, updateProblem);

/**
 * Delete a problem
 */
router.delete("/:id", authenticate, adminOnly, deleteProblem);

module.exports = router;
