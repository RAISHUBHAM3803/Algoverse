const axios = require("axios");
const config = require("../config/aiConfig");
const AppError = require("../utils/AppError");
const logger = require("../utils/logger");

/**
 * Clean Markdown JSON formatting wrappers if returned by the LLM
 * @param {string} text 
 * @returns {string}
 */
const cleanJsonText = (text) => {
  if (!text) return "";
  let clean = text.trim();
  if (clean.startsWith("```json")) {
    clean = clean.substring(7);
  } else if (clean.startsWith("```")) {
    clean = clean.substring(3);
  }
  if (clean.endsWith("```")) {
    clean = clean.substring(0, clean.length - 3);
  }
  return clean.trim();
};

/**
 * Call the configured AI provider or fallback to mock
 * @param {string} prompt 
 * @param {string} feature 
 * @returns {Promise<Object>} parsed JSON response
 */
const generateStructuredJSON = async (prompt, feature, retries = 2) => {
  if (config.isMock) {
    logger.info(`[AI Provider] Running in MOCK mode for feature: ${feature}`);
    return getMockResponse(feature);
  }

  try {
    let responseText = "";

    if (config.provider === "openai") {
      logger.info(`[AI Provider] Sending request to OpenAI using model: ${config.model}`);
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: config.model,
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
          temperature: 0.2,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${config.apiKey}`,
          },
          timeout: config.timeoutMs,
          maxContentLength: 500000, // 500KB limit
          maxBodyLength: 500000,
        }
      );

      if (response.data?.choices?.[0]?.message?.content) {
        responseText = response.data.choices[0].message.content;
      } else {
        throw new AppError("Invalid response structure from OpenAI API", 502);
      }
    } else {
      // Default to Gemini API
      logger.info(`[AI Provider] Sending request to Gemini using model: ${config.model}`);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`;
      const response = await axios.post(
        url,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2,
          },
        },
        {
          headers: { "Content-Type": "application/json" },
          timeout: config.timeoutMs,
          maxContentLength: 500000, // 500KB limit
          maxBodyLength: 500000,
        }
      );

      if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        responseText = response.data.candidates[0].content.parts[0].text;
      } else {
        throw new AppError("Invalid response structure from Gemini API", 502);
      }
    }

    try {
      const cleaned = cleanJsonText(responseText);
      return JSON.parse(cleaned);
    } catch (parseErr) {
      logger.error("[AI Provider] Failed to parse response as JSON", { raw: responseText, error: parseErr.message });
      throw new AppError("AI response was not valid JSON. Please try again.", 502);
    }

  } catch (error) {
    logger.error("[AI Provider] Request failed", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });

    if (error.code === "ECONNABORTED") {
      throw new AppError("AI provider request timed out. Please try again.", 504);
    }

    if (error.response) {
      const status = error.response.status;
      if (status === 401 || status === 403) {
        throw new AppError("AI Provider authentication failed. Check API configuration.", 500);
      }
      if (status === 429) {
        throw new AppError("AI service rate limit exceeded. Please try again later.", 429);
      }
      // 503 = model overloaded — retry automatically with backoff
      if (status === 503 && retries > 0) {
        const delayMs = (3 - retries) * 2000 + 1000; // 1s, then 3s
        logger.warn(`[AI Provider] Model overloaded (503), retrying in ${delayMs}ms... (${retries} retries left)`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        return generateStructuredJSON(prompt, feature, retries - 1);
      }
      if (status === 503) {
        throw new AppError("AI model is currently experiencing high demand. Please wait a moment and try again.", 503);
      }
      throw new AppError(`AI Provider error: ${error.response.data?.error?.message || error.message}`, status);
    }

    throw error instanceof AppError ? error : new AppError(error.message || "Failed to communicate with AI Provider", 500);
  }
};

/**
 * Standard Mock responses for development and fallback
 */
const getMockResponse = (feature) => {
  switch (feature) {
    case "review":
      return {
        strengths: [
          "Excellent modular function breakdown.",
          "Efficient search logic using appropriate standard structures."
        ],
        weaknesses: [
          "Lacks validation for empty input arrays, which could lead to out-of-bounds access.",
          "Redundant storage allocation for intermediate state variables."
        ],
        optimizations: [
          "Pre-allocate memory for vector array if bounds are known beforehand.",
          "Pass larger objects by const reference rather than copy value."
        ],
        bestPractices: [
          "Use consistent snake_case or camelCase naming throughout.",
          "Document edge cases like null or empty arrays in comments."
        ]
      };

    case "complexity":
      return {
        timeComplexity: "O(n log n)",
        spaceComplexity: "O(n)",
        reasoning: "The time complexity is O(n log n) because the array is sorted before iterating. The space complexity is O(n) because a hash set is used to track seen items in the worst case."
      };

    case "hint":
      return {
        hint1: "Think about the properties of a sorted array. Can we search efficiently?",
        hint2: "Try utilizing the two-pointer approach, starting from both ends of the collection.",
        hint3: "Consider avoiding extra map storage by using indices to meet O(1) space complexity constraints."
      };

    case "interview-feedback":
      return {
        problemSolving: 8,
        codeQuality: 7,
        optimization: 8,
        communicationReadiness: 7,
        overallFeedback: "The candidate shows strong grasp of optimal patterns and correctly identified the edge cases. Improving code modularity and consistent naming style would make it standard-compliant."
      };

    default:
      return {};
  }
};

module.exports = {
  generateStructuredJSON,
};
