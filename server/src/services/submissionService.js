/**
 * Submission Evaluation Service
 * Core logic for evaluating code submissions against hidden test cases.
 */

const Submission = require("../models/Submission");
const Problem = require("../models/Problem");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const jdoodleService = require("./jdoodleService"); // JDoodle: 200 free executions/day, confirmed working
const { VERDICTS, DIFFICULTIES } = require("../constants/enums");

class SubmissionService {
  /**
   * Submit and evaluate code against hidden test cases.
   * @param {string} userId
   * @param {string} problemId
   * @param {string} language
   * @param {string} code
   * @returns {Promise<Object>} Submission result
   */
  async submitCode(userId, problemId, language, code) {
    // Step 1: Fetch problem with hidden test cases (lean — plain object for evaluation)
    const problem = await Problem.findById(problemId).select("+hiddenTestCases").lean();

    if (!problem) {
      throw new AppError("Problem not found", 404);
    }

    if (!problem.hiddenTestCases || problem.hiddenTestCases.length === 0) {
      throw new AppError("Problem does not have test cases configured", 400);
    }

    // Step 2: Code stitching (LeetCode-style execution with driver code)
    // The driver code wraps user's Solution class with a main() that reads stdin
    // and calls the function, then prints output — exactly like LeetCode internally.
    let runnableCode = code;
    const driver = problem.driverCode?.[language]?.trim();
    if (driver) {
      if (driver.includes('{{USER_CODE}}')) {
        // Replace placeholder with the user's solution code
        runnableCode = driver.replace('{{USER_CODE}}', code);
      } else {
        // Legacy: driver appended after user code
        runnableCode = `${code}\n\n${driver}`;
      }
    }

    // Step 3: Execute code against all hidden test cases via JDoodle
    const evaluationResult = await jdoodleService.runAgainstTestCases({
      code: runnableCode,
      language,
      testCases: problem.hiddenTestCases,
    });

    // Step 4: Persist the submission record
    const submission = await Submission.create({
      user:            userId,
      problem:         problemId,
      language,
      code,
      verdict:         evaluationResult.verdict,
      testCasesPassed: evaluationResult.testCasesPassed,
      totalTestCases:  problem.hiddenTestCases.length,
      runtime:         evaluationResult.runtime,
      memory:          evaluationResult.memory,
      errorMessage:    evaluationResult.errorMessage || "",
    });

    // Step 5a: Update Problem acceptance stats atomically (totalSubmissions, acceptedSubmissions, acceptanceRate)
    const isAccepted = submission.verdict === VERDICTS.ACCEPTED;
    const problemUpdate = {
      $inc: {
        totalSubmissions: 1,
        ...(isAccepted ? { acceptedSubmissions: 1 } : {}),
      },
    };
    // Recompute acceptanceRate after increment using a pipeline update
    await Problem.findByIdAndUpdate(problemId, [
      {
        $set: {
          totalSubmissions: { $add: ["$totalSubmissions", 1] },
          acceptedSubmissions: isAccepted
            ? { $add: ["$acceptedSubmissions", 1] }
            : "$acceptedSubmissions",
        },
      },
      {
        $set: {
          acceptanceRate: {
            $cond: [
              { $gt: ["$totalSubmissions", 0] },
              {
                $round: [
                  { $multiply: [{ $divide: ["$acceptedSubmissions", "$totalSubmissions"] }, 100] },
                  1,
                ],
              },
              null,
            ],
          },
        },
      },
    ]);

    // Step 5b: Update user statistics atomically
    // Always increment totalSubmissions.
    // If accepted: also increment acceptedSubmissions + call updateUserStats for
    // difficulty counters and solvedProblems (both handled in a single atomic write).
    await User.updateOne(
      { _id: userId },
      { $inc: { "stats.totalSubmissions": 1 } }
    );

    if (isAccepted) {
      await this.updateUserStats(userId, problem);
    }

    return {
      success:        true,
      submissionId:   submission._id,
      verdict:        submission.verdict,
      passedTestCases: submission.testCasesPassed,
      totalTestCases:  submission.totalTestCases,
      runtime:         submission.runtime,
      memory:          submission.memory,
      message:         this.getVerdictMessage(submission.verdict),
    };
  }

  /**
   * Update user statistics after an accepted submission using atomic MongoDB ops.
   *
   * Uses $addToSet + $inc in a single updateOne with a filter that prevents
   * double-counting already-solved problems (idempotent, race-safe).
   *
   * @param {string} userId
   * @param {Object} problem - Lean problem document
   * @returns {Promise<boolean>} true if this was a first-time solve
   */
  async updateUserStats(userId, problem) {
    const difficultyField = {
      [DIFFICULTIES.EASY]:   "stats.easySolved",
      [DIFFICULTIES.MEDIUM]: "stats.mediumSolved",
      [DIFFICULTIES.HARD]:   "stats.hardSolved",
    }[problem.difficulty];

    const result = await User.updateOne(
      {
        _id:            userId,
        solvedProblems: { $ne: problem._id }, // Only update on first solve
      },
      {
        $addToSet: { solvedProblems: problem._id },
        $inc: {
          "stats.acceptedSubmissions": 1,
          "stats.solvedCount": 1,
          ...(difficultyField ? { [difficultyField]: 1 } : {}),
        },
        $set: { "stats.lastActive": new Date() },
      }
    );

    // result.modifiedCount === 0 → problem was already solved → counters not changed
    return result.modifiedCount > 0;
  }

  /**
   * Get user's submission history with pagination.
   * @param {string} userId
   * @param {number} page
   * @param {number} limit
   */
  async getUserSubmissions(userId, page = 1, limit = 10) {
    const parsedPage  = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.min(Math.max(1, parseInt(limit, 10) || 10), 100);
    const skip        = (parsedPage - 1) * parsedLimit;

    const [submissions, totalCount] = await Promise.all([
      Submission.find({ user: userId })
        .populate("problem", "title difficulty slug")
        .select("-code") // Exclude full code from list view
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parsedLimit)
        .lean(),
      Submission.countDocuments({ user: userId }),
    ]);

    return {
      success: true,
      submissions,
      pagination: {
        page:       parsedPage,
        limit:      parsedLimit,
        totalCount,
        totalPages: Math.ceil(totalCount / parsedLimit),
      },
    };
  }

  /**
   * Get a single submission by ID.
   * Verifies ownership — users can only view their own submissions.
   * @param {string} submissionId
   * @param {string} userId
   */
  async getSubmissionById(submissionId, userId) {
    const submission = await Submission.findById(submissionId)
      .populate("problem", "title difficulty slug")
      .populate("user", "name email")
      .lean();

    if (!submission) {
      throw new AppError("Submission not found", 404);
    }

    // After .lean(), populated user is a plain object — _id is an ObjectId
    if (submission.user._id.toString() !== userId.toString()) {
      throw new AppError("You can only view your own submissions", 403);
    }

    return { success: true, data: submission };
  }

  /**
   * Return a user-friendly message for a given verdict.
   * @param {string} verdict
   * @returns {string}
   */
  getVerdictMessage(verdict) {
    const messages = {
      [VERDICTS.ACCEPTED]:            "✓ Congratulations! All test cases passed!",
      [VERDICTS.WRONG_ANSWER]:        "✗ Output does not match expected result",
      [VERDICTS.RUNTIME_ERROR]:       "✗ Runtime error occurred during execution",
      [VERDICTS.COMPILATION_ERROR]:   "✗ Code has compilation errors",
      [VERDICTS.TIME_LIMIT_EXCEEDED]: "✗ Execution exceeded time limit",
      [VERDICTS.PENDING]:             "⏳ Evaluating submission...",
    };

    return messages[verdict] || "Unknown verdict";
  }
}

module.exports = new SubmissionService();
