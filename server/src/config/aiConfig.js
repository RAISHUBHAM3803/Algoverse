/**
 * AI Configuration Module
 * Manages LLM Provider API keys, models, and fallback settings.
 */

const aiProvider = process.env.AI_PROVIDER || (process.env.AI_API_KEY ? 'gemini' : 'mock');
const apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || '';
const aiModel = process.env.AI_MODEL || (aiProvider === 'openai' ? 'gpt-4o-mini' : 'gemini-2.5-flash');

module.exports = {
  provider: aiProvider.toLowerCase(),
  apiKey,
  model: aiModel,
  isMock: aiProvider.toLowerCase() === 'mock' || !apiKey,
  timeoutMs: parseInt(process.env.AI_TIMEOUT_MS, 10) || 20000, // 20 seconds timeout
};
