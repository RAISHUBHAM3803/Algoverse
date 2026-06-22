/**
 * Code Execution Controller
 * Thin controller — delegates driver-code lookup to problemService,
 * execution to jdoodleService, and returns a standardized response.
 */

const pistonService  = require("../services/jdoodleService");
const problemService = require("../services/problemService");
const asyncHandler   = require("../utils/asyncHandler");
const { sendSuccess, sendError } = require("../utils/responseHandler");

/**
 * Execute a code snippet with optional custom input.
 * If a problemId is provided, the driver code is fetched from the problem
 * via problemService (not via a direct model query) and stitched with user code.
 *
 * @route POST /api/v1/code/run
 * @access Protected
 */
const runCode = asyncHandler(async (req, res) => {
  const { language, code, input, problemId } = req.body;

  let runnableCode = code;

  if (problemId) {
    const driverTemplate = await problemService.getDriverCode(problemId, language);
    if (driverTemplate) {
      runnableCode = driverTemplate.replace("{{USER_CODE}}", code);
    }
  }

  const result = await pistonService.executeCode({ language, code: runnableCode, input });

  if (!result.success) {
    return sendError(res, 400, result.error, result.status ? [result.status] : null);
  }

  return sendSuccess(res, 200, "Code executed successfully", {
    output:  result.output,
    runtime: `${result.runtime}ms`,
    memory:  `${(result.memory / 1024).toFixed(2)}MB`,
    status:  result.status,
  });
});

module.exports = { runCode };
