/**
 * Slug Utility
 * Converts a string into a URL-safe slug
 * Extracted from Problem model and problemService to avoid duplication
 */

/**
 * Generates a URL-safe slug from a title string
 * @param {string} title - The title to slugify
 * @returns {string} URL-safe slug
 */
const slugify = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")   // Remove non-word chars except spaces and hyphens
    .replace(/[\s_-]+/g, "-")   // Replace spaces/underscores/hyphens with single hyphen
    .replace(/^-+|-+$/g, "");   // Remove leading/trailing hyphens
};

module.exports = { slugify };
