/**
 * Problem Management Service
 * Houses database interactions, pagination, search, and projection logic.
 */

const Problem = require("../models/Problem");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const { slugify } = require("../utils/slugify");
const axios = require("axios");
const https = require("https");
const { generateAllDrivers } = require("../utils/driverCodeGenerator");


class ProblemService {
  /**
   * Create a new problem (Admin only).
   * @param {Object} problemData
   * @param {string} adminId
   */
  async createProblem(problemData, adminId) {
    const problem = new Problem({ ...problemData, createdBy: adminId });
    await problem.save();
    return problem;
  }

  /**
   * Bulk create problems (Admin only).
   * Uses ordered: false to skip duplicates and continue inserting.
   * @param {Array<Object>} problemsData
   * @param {string} adminId
   */
  async bulkCreateProblems(problemsData, adminId) {
    const problemsToInsert = problemsData.map(p => ({
      ...p,
      slug: p.slug || slugify(p.title),
      createdBy: adminId
    }));
    
    try {
      const result = await Problem.insertMany(problemsToInsert, { ordered: false });
      return result;
    } catch (err) {
      if (err.name === 'BulkWriteError') {
        // Return whatever was successfully inserted
        return err.insertedDocs || [];
      }
      throw err;
    }
  }

  /**
   * Get all problems with pagination, filters, and full-text search.
   * - Uses $text index for search (faster than regex).
   * - Limit capped at 50 to prevent large payload attacks.
   * - Returns only list-appropriate fields (excludes heavy statement body).
   *
   * @param {{ page, limit, difficulty, tag, search }} params
   */
  async getProblems({ page = 1, limit = 10, difficulty, tag, search, userId }) {
    const query = {};

    if (difficulty)  query.difficulty = difficulty;
    if (tag)         query.tags       = tag;
    if (search)      query.$text      = { $search: search };

    const parsedPage  = parseInt(page, 10) || 1;
    const parsedLimit = Math.min(parseInt(limit, 10) || 10, 50); // Cap at 50

    // Validate pagination params
    if (parsedPage < 1) throw new AppError("Page must be a positive integer", 400);
    if (parsedLimit < 1) throw new AppError("Limit must be a positive integer", 400);

    const skip = (parsedPage - 1) * parsedLimit;

    // List view only returns summary fields — NOT the full problem statement
    const listProjection = "title slug problemNumber difficulty tags acceptanceRate totalSubmissions acceptedSubmissions createdAt createdBy";

    const [problems, totalResults] = await Promise.all([
      Problem.find(query)
        .select(listProjection)
        .skip(skip)
        .limit(parsedLimit)
        .sort({ problemNumber: 1 })   // Always sorted by permanent global number
        .lean(),
      Problem.countDocuments(query),
    ]);

    let solvedProblemIds = new Set();
    if (userId) {
      const user = await User.findById(userId).select("solvedProblems").lean();
      if (user && user.solvedProblems) {
        user.solvedProblems.forEach(id => solvedProblemIds.add(id.toString()));
      }
    }

    const mappedProblems = problems.map(p => ({
      ...p,
      isSolved: solvedProblemIds.has(p._id.toString())
    }));

    return {
      problems: mappedProblems,
      totalResults,
      totalPages: Math.ceil(totalResults / parsedLimit),
      page:       parsedPage,
      limit:      parsedLimit,
    };
  }

  /**
   * Get a single problem by MongoDB ID or slug.
   * Admins additionally receive the hiddenTestCases field.
   *
   * @param {string} idOrSlug
   * @param {boolean} isAdmin
   */
  async getProblemById(idOrSlug, isAdmin = false) {
    const looksLikeObjectId = /^[0-9a-fA-F]+$/.test(idOrSlug) && idOrSlug.length !== 24;
    const isValidObjectId   = /^[0-9a-fA-F]{24}$/.test(idOrSlug);

    // A hex string that isn't exactly 24 chars is clearly a malformed ObjectId
    if (looksLikeObjectId) {
      throw new AppError("Invalid problem ID format", 400);
    }

    const query = isValidObjectId
      ? { _id: idOrSlug }
      : { slug: idOrSlug };

    // Always exclude hiddenTestCases from the public endpoint.
    // Hidden test cases are only exposed via a dedicated /admin/problems/:id route.
    const selection = "-hiddenTestCases";

    let problem = await Problem.findOne(query)
      .select(selection)
      .populate("createdBy", "name email")
      .lean();

    if (!problem) {
      throw new AppError("Problem not found", 404);
    }

    // Lazy-fetch REAL LeetCode description dynamically if not fetched yet
    if (!problem.isRealDataFetched) {
      try {
        const response = await axios.get(`https://alfa-leetcode-api.onrender.com/select?titleSlug=${problem.slug}`);
        if (response.data && response.data.question) {
          const realContent = response.data.question;
          
          await Problem.updateOne(
            { _id: problem._id },
            { 
              $set: { 
                statement: realContent,
                isRealDataFetched: true 
              } 
            }
          );
          problem.statement = realContent;
          problem.isRealDataFetched = true;
        }
      } catch (err) {
        console.error(`Failed to fetch real data for ${problem.slug}:`, err.message);
      }
    }

    // Lazy-fetch true LeetCode code snippets if we only have the boilerplate
    if (problem.starterCode && problem.starterCode.cpp && problem.starterCode.cpp.includes("// Write your C++ code here")) {
      try {
        const query = `
        query questionData($titleSlug: String!) {
          question(titleSlug: $titleSlug) {
            codeSnippets {
              langSlug
              code
            }
          }
        }`;
        
        const data = JSON.stringify({ query, variables: { titleSlug: problem.slug } });
        const options = {
          hostname: 'leetcode.com',
          path: '/graphql',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length,
            'User-Agent': 'Mozilla/5.0'
          }
        };

        const snippets = await new Promise((resolve, reject) => {
          const req = https.request(options, res => {
            let body = '';
            res.on('data', d => body += d);
            res.on('end', () => {
              try { resolve(JSON.parse(body)); } catch(e) { resolve(null); }
            });
          });
          req.on('error', reject);
          req.write(data);
          req.end();
        });

        if (snippets?.data?.question?.codeSnippets) {
          const snippetArray = snippets.data.question.codeSnippets;
          const newStarterCode = { ...problem.starterCode };
          
          snippetArray.forEach(s => {
            if (s.langSlug === 'cpp') newStarterCode.cpp = s.code;
            if (s.langSlug === 'java') newStarterCode.java = s.code;
            if (s.langSlug === 'python3') newStarterCode.python = s.code;
            if (s.langSlug === 'javascript') newStarterCode.javascript = s.code;
          });

          await Problem.updateOne(
            { _id: problem._id },
            { $set: { starterCode: newStarterCode } }
          );
          problem.starterCode = newStarterCode;
        }
      } catch (err) {
        console.error(`Failed to fetch code snippets for ${problem.slug}:`, err.message);
      }
    }

    // ── Lazy-fetch LeetCode metaData to generate real driver code ─────────────
    // The generated driver always contains {{USER_CODE}} as a placeholder.
    // If the DB has old boilerplate (no placeholder), we fetch and regenerate.
    const needsDriver = !problem.driverCode?.cpp || 
                        !problem.driverCode.cpp.includes('{{USER_CODE}}');

    if (needsDriver) {
      try {
        const metaQuery = `
        query questionData($titleSlug: String!) {
          question(titleSlug: $titleSlug) {
            metaData
          }
        }`;
        
        const metaPayload = JSON.stringify({ query: metaQuery, variables: { titleSlug: problem.slug } });
        const metaOptions = {
          hostname: 'leetcode.com',
          path: '/graphql',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': metaPayload.length,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        };

        const metaResult = await new Promise((resolve, reject) => {
          const req = https.request(metaOptions, res => {
            let body = '';
            res.on('data', d => body += d);
            res.on('end', () => {
              try { resolve(JSON.parse(body)); } catch(e) { resolve(null); }
            });
          });
          req.on('error', reject);
          req.write(metaPayload);
          req.end();
        });

        const rawMeta = metaResult?.data?.question?.metaData;
        if (rawMeta) {
          const meta = JSON.parse(rawMeta);
          // Only auto-generate if not a "manual" problem (like design problems)
          if (!meta.manual) {
            const drivers = generateAllDrivers(meta);
            if (drivers) {
              await Problem.updateOne(
                { _id: problem._id },
                { $set: { driverCode: drivers } }
              );
              problem.driverCode = drivers;
              console.log(`[Driver] Generated real driver code for: ${problem.slug}`);
            }
          }
        }
      } catch (err) {
        console.error(`[Driver] Failed to fetch metaData for ${problem.slug}:`, err.message);
      }
    }

    return problem;
  }

  /**
   * Retrieve driver code for a given problem and language.
   * Used by the code execution controller to stitch user code with boilerplate.
   * Centralizes the DB access so the controller stays thin.
   *
   * @param {string} problemId
   * @param {string} language
   * @returns {Promise<string|null>} Driver code template or null
   */
  async getDriverCode(problemId, language) {
    const problem = await Problem.findById(problemId)
      .select("driverCode")
      .lean();

    if (!problem) return null;

    const driver = problem.driverCode?.[language]?.trim();
    return driver || null;
  }

  /**
   * Update problem details (Admin only).
   * Regenerates the slug if the title changes.
   *
   * @param {string} id
   * @param {Object} updateData
   */
  async updateProblem(id, updateData) {
    if (updateData.title) {
      updateData.slug = slugify(updateData.title);
    }

    const problem = await Problem.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true, lean: true }
    );

    if (!problem) {
      throw new AppError("Problem not found", 404);
    }

    return problem;
  }

  /**
   * Delete a problem (Admin only).
   * @param {string} id
   */
  async deleteProblem(id) {
    const problem = await Problem.findByIdAndDelete(id).lean();
    if (!problem) {
      throw new AppError("Problem not found", 404);
    }
    return problem;
  }
}

module.exports = new ProblemService();
