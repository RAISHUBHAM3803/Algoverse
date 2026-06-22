/**
 * Code Execution Routes
 * Mounts the run-code validator and controller
 */

const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");
const { runCodeValidator } = require("../validators/codeValidator");
const { runCode } = require("../controllers/codeController");

const router = express.Router();

/**
 * Execute a code snippet with custom stdin input
 * POST /api/v1/code/run
 * Protected — prevents anonymous abuse of the sandbox
 */
router.post("/run", authenticate, runCodeValidator, runCode);

module.exports = router;
