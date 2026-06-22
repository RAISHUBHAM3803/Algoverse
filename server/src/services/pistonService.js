/**
 * Piston Code Execution Service
 * Production code execution engine using the open-source Piston API.
 * Free, fast, and does not require API keys.
 */

const axios = require("axios");
const logger = require("../utils/logger");
const { VERDICTS } = require("../constants/enums");

// Piston language mappings. Piston uses standard names and "*" for latest version.
const PISTON_LANGUAGES = {
  python:     { language: "python",     version: "*" },
  cpp:        { language: "c++",        version: "*" },
  java:       { language: "java",       version: "*" },
  javascript: { language: "javascript", version: "*" },
};

class PistonService {
  constructor() {
    this.apiUrl = "https://emkc.org/api/v2/piston/execute";
  }

  /**
   * Execute a single code snippet via Piston API.
   *
   * @param {{ language: string, code: string, input?: string }} params
   * @returns {Promise<Object>} Execution result
   */
  async executeCode({ language, code, input = "" }) {
    const langConfig = PISTON_LANGUAGES[language];
    if (!langConfig) {
      return { success: false, error: `Unsupported language: ${language}`, status: "Rejected" };
    }

    try {
      const response = await axios.post(this.apiUrl, {
        language: langConfig.language,
        version: langConfig.version,
        files: [{ content: code }],
        stdin: input,
        compile_timeout: 10000,
        run_timeout: 3000,
      });

      const { compile, run, language: resLang, version } = response.data;

      // Handle Compilation Error (e.g., C++ or Java syntax error)
      if (compile && compile.code !== 0) {
        return {
          success: false,
          error: compile.stderr || compile.output || "Compilation Error",
          status: VERDICTS.COMPILATION_ERROR,
        };
      }

      // Handle Runtime Error (code execution failed)
      if (run.code !== 0 && run.signal !== null) {
        let errorMsg = run.stderr || run.output;
        if (run.signal === "SIGKILL") {
           errorMsg = "Time Limit Exceeded or Memory Limit Exceeded";
           return { success: false, error: errorMsg, status: VERDICTS.TIME_LIMIT_EXCEEDED };
        }
        return {
          success: false,
          error: errorMsg || "Runtime Error",
          status: VERDICTS.RUNTIME_ERROR,
        };
      }
      
      // Standard Runtime Error without SIGKILL
      if (run.code !== 0) {
        return {
          success: false,
          error: run.stderr || run.output || "Runtime Error",
          status: VERDICTS.RUNTIME_ERROR,
        };
      }

      return {
        success: true,
        output: run.stdout,
        runtime: 0, // Piston API does not return precise ms metrics by default in the basic response
        memory: 0, 
        status: VERDICTS.ACCEPTED,
      };
    } catch (error) {
      logger.error("[Piston] API request failed:", { message: error.message });
      return {
        success: false,
        error: "Execution engine failed to respond. Please try again.",
        status: "Execution Failure",
      };
    }
  }

  /**
   * Run code against multiple test cases (fail-fast on first failure).
   *
   * @param {{ language: string, code: string, testCases: Array }} params
   * @returns {Promise<Object>} Aggregated evaluation result
   */
  async runAgainstTestCases({ language, code, testCases }) {
    let testCasesPassed = 0;
    let finalVerdict = VERDICTS.ACCEPTED;
    let errorMessage = "";

    for (const tc of testCases) {
      const result = await this.executeCode({ language, code, input: tc.input || "" });

      if (!result.success) {
        finalVerdict = result.status || VERDICTS.RUNTIME_ERROR;
        errorMessage = result.error;
        break; // Fail fast — no point running further test cases
      }

      const actualOutput = (result.output || "").trim().replace(/\r\n/g, "\n");
      const expectedOutput = (tc.output || "").trim().replace(/\r\n/g, "\n");

      if (actualOutput === expectedOutput) {
        testCasesPassed++;
      } else {
        finalVerdict = VERDICTS.WRONG_ANSWER;
        break;
      }
    }

    return {
      verdict: finalVerdict,
      testCasesPassed,
      totalTestCases: testCases.length,
      runtime: 0, // Mocked until piston v2 metrics are handled
      memory: 0,
      errorMessage,
    };
  }
}

module.exports = new PistonService();
