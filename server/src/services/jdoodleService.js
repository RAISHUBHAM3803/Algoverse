/**
 * JDoodle Code Execution Service
 * Production code execution engine using the JDoodle API.
 * Offers 200 free executions/day — suitable for final-year project demos.
 */

const axios = require("axios");
const config = require("../config");
const logger = require("../utils/logger");
const { VERDICTS } = require("../constants/enums");

// JDoodle language mappings and version indexes
const JDOODLE_LANGUAGES = {
  python:     { code: "python3", versionIndex: "3" }, // Python 3.9
  cpp:        { code: "cpp17",   versionIndex: "0" }, // C++17
  java:       { code: "java",    versionIndex: "3" }, // JDK 11
  javascript: { code: "nodejs",  versionIndex: "3" }, // Node 14
};

class JDoodleService {
  constructor() {
    this.apiUrl       = "https://api.jdoodle.com/v1/execute";
    // Use centralized config (not raw process.env) for consistency
    this.clientId     = config.jdoodle.clientId;
    this.clientSecret = config.jdoodle.clientSecret;
  }

  /**
   * Execute a single code snippet via JDoodle API.
   * Falls back to mock mode when `config.jdoodle.mockMode` is true.
   *
   * @param {{ language: string, code: string, input?: string }} params
   * @returns {Promise<Object>} Execution result
   */
  async executeCode({ language, code, input = "" }) {
    if (config.jdoodle.mockMode || (!this.clientId || !this.clientSecret)) {
      return this._mockExecute(language, code, input);
    }

    const langConfig = JDOODLE_LANGUAGES[language];
    if (!langConfig) {
      return { success: false, error: `Unsupported language: ${language}`, status: "Rejected" };
    }

    try {
      const response = await axios.post(this.apiUrl, {
        clientId:     this.clientId,
        clientSecret: this.clientSecret,
        script:       code,
        stdin:        input,
        language:     langConfig.code,
        versionIndex: langConfig.versionIndex,
      });

      const { output, memory, cpuTime, error } = response.data;

      if (error) {
        return {
          success: false,
          error:   error || "Compilation/Execution Error",
          status:  VERDICTS.COMPILATION_ERROR,
        };
      }

      // ── Detect Compilation Errors in stdout ──────────────────────────────
      // JDoodle returns compile errors inside `output` (not `error`), so we
      // must scan the text and override the status accordingly.
      const isCompileError = (
        output.includes(": error:") ||           // GCC/Clang C++ errors
        output.includes("error: ") ||
        output.includes("was not declared in this scope") ||
        output.includes("SyntaxError") ||        // Python/JS syntax errors
        output.includes("IndentationError") ||   // Python
        output.includes("cannot find symbol") || // Java
        output.includes("error: cannot") ||
        (output.includes("warning: ") && output.includes(": error:"))
      );

      if (isCompileError) {
        return {
          success:  false,
          error:    output,
          output,
          runtime:  0,
          memory:   0,
          status:   VERDICTS.COMPILATION_ERROR,
        };
      }

      // ── Detect Critical Compiler Warnings (Undefined Behavior) ────────────
      // These compile successfully but produce undefined/wrong behavior.
      // GCC emits these as warnings — we treat them as errors for correctness.
      const isCriticalWarning = (
        output.includes("warning: no return statement in function returning non-void") ||
        output.includes("control reaches end of non-void function") ||
        output.includes("warning: control reaches end") ||
        output.includes("warning: unused variable") && output.trim().split("\n").every(l => l.includes("warning:") || l.includes("|") || l.trim() === "")
      );

      // Also catch the case where output is ONLY compiler warning lines (no real program output)
      const isWarningOnlyOutput = (
        output.includes("warning:") &&
        output.trim().split("\n").every(line =>
          line.includes("warning:") ||
          line.includes("|") ||
          line.startsWith("   ") ||  // GCC indented source lines
          line.trim() === "" ||
          line.match(/^\d+\s*\|/)    // GCC line-number markers
        )
      );

      if (isCriticalWarning || isWarningOnlyOutput) {
        return {
          success:  false,
          error:    output,
          output,
          runtime:  0,
          memory:   0,
          status:   VERDICTS.COMPILATION_WARNING,
        };
      }

      // ── Detect Runtime Errors in stdout ──────────────────────────────────
      const isRuntimeError = (
        output.includes("Exception in thread") ||
        output.includes("Traceback (most recent call last)") ||
        output.includes("ReferenceError") ||
        output.includes("TypeError:") ||
        output.includes("NameError:") ||
        output.includes("AttributeError:") ||
        output.includes("RuntimeError:") ||
        output.includes("Segmentation fault") ||
        output.includes("SIGSEGV")
      );

      if (isRuntimeError) {
        return { success: false, error: output, output, runtime: 0, memory: 0, status: VERDICTS.RUNTIME_ERROR };
      }

      return {
        success: true,
        output,
        runtime: cpuTime ? parseFloat(cpuTime) * 1000 : 0, // seconds → ms
        memory:  memory  ? parseFloat(memory)              : 0, // KB
        status:  VERDICTS.ACCEPTED,
      };
    } catch (error) {
      logger.error("[JDoodle] API request failed:", { message: error.message });

      if (error.response?.status === 401 || error.response?.status === 429) {
        return {
          success: false,
          error:   "Code execution daily limit reached or invalid API keys.",
          status:  VERDICTS.SYSTEM_ERROR,
        };
      }

      return {
        success: false,
        error:   "Execution engine failed to respond. Please try again.",
        status:  VERDICTS.SYSTEM_ERROR,
      };
    }
  }

  /**
   * Run code against multiple test cases (fail-fast on first failure).
   * Sequential execution is intentional — JDoodle API rate limits make
   * parallel requests risky and we want ordered, deterministic results.
   *
   * @param {{ language: string, code: string, testCases: Array }} params
   * @returns {Promise<Object>} Aggregated evaluation result
   */
  async runAgainstTestCases({ language, code, testCases }) {
    let testCasesPassed = 0;
    let totalRuntime    = 0;
    let totalMemory     = 0;
    let finalVerdict    = VERDICTS.ACCEPTED;
    let errorMessage    = "";

    for (const tc of testCases) {
      const result = await this.executeCode({ language, code, input: tc.input || "" });

      totalRuntime += result.runtime || 0;
      totalMemory  += result.memory  || 0;

      if (!result.success) {
        finalVerdict = result.status || VERDICTS.RUNTIME_ERROR;
        errorMessage = result.error;
        break; // Fail fast — no point running further test cases
      }

      // Normalize outputs for robust comparison
      // 1. Convert CRLF to LF
      // 2. Decode HTML entities (LeetCode test cases often have &quot;)
      // 3. Strip wrapping quotes (C++ cout prints strings without quotes)
      const normalizeOutput = (str) => {
        if (!str) return "";
        let norm = str.trim().replace(/\r\n/g, "\n");
        norm = norm.replace(/&quot;/g, '"')
                   .replace(/&amp;/g, '&')
                   .replace(/&lt;/g, '<')
                   .replace(/&gt;/g, '>')
                   .replace(/&#39;/g, "'");
        if (norm.startsWith('"') && norm.endsWith('"') && norm.length >= 2) {
          norm = norm.substring(1, norm.length - 1);
        } else if (norm.startsWith("'") && norm.endsWith("'") && norm.length >= 2) {
          norm = norm.substring(1, norm.length - 1);
        }
        return norm;
      };

      const actualOutput   = normalizeOutput(result.output);
      const expectedOutput = normalizeOutput(tc.output);

      if (actualOutput === expectedOutput) {
        testCasesPassed++;
      } else {
        finalVerdict = VERDICTS.WRONG_ANSWER;
        break;
      }
    }

    const tcCount = Math.max(testCases.length, 1);
    return {
      verdict:         finalVerdict,
      testCasesPassed,
      totalTestCases:  testCases.length,
      runtime:         Math.round(totalRuntime / tcCount),
      memory:          Math.round(totalMemory  / tcCount),
      errorMessage,
    };
  }

  /**
   * Mock execution response for development (no API keys required).
   * @private
   */
  _mockExecute(language, code, input) {
    const mockOutput = input
      ? `[Mock Mode] Program ran with input: "${input}"\nOutput: (real output requires API keys)`
      : `[Mock Mode] Code compiled and ran successfully.\nProvide JDOODLE_CLIENT_ID and SECRET in .env for real execution.`;

    return {
      success: true,
      output:  mockOutput + "\n",
      runtime: 12,
      memory:  1024,
      status:  VERDICTS.ACCEPTED,
    };
  }
}

module.exports = new JDoodleService();
