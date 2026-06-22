/**
 * AI Service
 * Unified service for all AI-powered features.
 * Merges: aiReviewService, complexityService, hintService, interviewFeedbackService
 */

const { generateStructuredJSON } = require("./aiProviderService");
const redis = require("../config/redis");
const {
  reviewPrompt,
  complexityPrompt,
  hintPrompt,
  interviewPrompt,
} = require("../utils/promptTemplates");

/**
 * AI Code Review
 * Evaluates code quality, bugs, style, and optimizations.
 *
 * @param {string} language
 * @param {string} code
 * @returns {Promise<Object>} code review findings
 */
const getCodeReview = async (language, code) => {
  const prompt = reviewPrompt(language, code);
  return generateStructuredJSON(prompt, "review");
};

/**
 * AI Complexity Analysis
 * Calculates Time/Space complexities and identifies bottlenecks.
 *
 * @param {string} language
 * @param {string} code
 * @returns {Promise<Object>} complexity details
 */
const analyzeComplexity = async (language, code) => {
  const prompt = complexityPrompt(language, code);
  return generateStructuredJSON(prompt, "complexity");
};

/**
 * AI Hint Generator
 * Creates progressive hints without spoiling the solution.
 *
 * @param {string} problemTitle
 * @param {string} problemDescription
 * @param {string} difficulty
 * @returns {Promise<Object>} progressive hints
 */
const generateHints = async (problemTitle, problemDescription, difficulty) => {
  const cacheKey = `ai:hints:${problemTitle.toLowerCase().replace(/\s+/g, '-')}`;
  
  // Try to get from cache first
  const cachedHints = await redis.get(cacheKey);
  if (cachedHints) {
    return JSON.parse(cachedHints);
  }

  const prompt = hintPrompt(problemTitle, problemDescription, difficulty);
  const result = await generateStructuredJSON(prompt, "hint");
  
  // Cache permanently (or for a very long time) since problem hints don't change
  if (result) {
    await redis.set(cacheKey, JSON.stringify(result), "EX", 30 * 24 * 60 * 60); // Cache for 30 days
  }
  
  return result;
};

/**
 * AI Interview Feedback
 * Provides multi-dimensional scoring and professional interview-style feedback.
 *
 * @param {string} language
 * @param {string} code
 * @param {string} problemTitle
 * @param {string} verdict
 * @returns {Promise<Object>} interview feedback with scores
 */
const getInterviewFeedback = async (language, code, problemTitle, verdict) => {
  const prompt = interviewPrompt(language, code, problemTitle, verdict);
  return generateStructuredJSON(prompt, "interview-feedback");
};

module.exports = {
  getCodeReview,
  analyzeComplexity,
  generateHints,
  getInterviewFeedback,
};
