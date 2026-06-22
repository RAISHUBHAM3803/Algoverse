const axios = require("axios");
const fs = require("fs");

const ALFA_API_BASE = "https://alfa-leetcode-api.onrender.com";
const OUTPUT_FILE = "./dataset.json";

/**
 * Delays execution to prevent rate-limiting
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchLeetcodeProblems(limit = 100) {
  console.log(`Fetching top ${limit} problems from LeetCode...`);
  
  try {
    // Step 1: Get list of problems
    const response = await axios.get(`${ALFA_API_BASE}/problems?limit=${limit}`);
    const problemsList = response.data.problemsetQuestionList;
    
    if (!problemsList || problemsList.length === 0) {
      console.error("Failed to fetch problem list.");
      return;
    }

    const fullProblems = [];

    // Step 2: Fetch details for each problem sequentially to avoid rate limits
    for (let i = 0; i < problemsList.length; i++) {
      const problem = problemsList[i];
      console.log(`[${i + 1}/${limit}] Fetching details for: ${problem.titleSlug}`);
      
      try {
        const detailsRes = await axios.get(`${ALFA_API_BASE}/select?titleSlug=${problem.titleSlug}`);
        const details = detailsRes.data;

        // Map LeetCode format to AlgoVerse format
        const algoVerseProblem = {
          title: details.questionTitle,
          statement: details.question, // HTML string of the question
          difficulty: details.difficulty,
          tags: details.topicTags.map(t => t.name),
          // We don't have hidden test cases, so we use the example ones
          visibleTestCases: [{ input: details.exampleTestcases || "", output: "Varies" }],
          hiddenTestCases: [{ input: details.exampleTestcases || "", output: "Varies" }],
        };

        fullProblems.push(algoVerseProblem);
      } catch (err) {
        console.error(`Failed to fetch ${problem.titleSlug}: ${err.message}`);
      }
      
      // Sleep for 500ms to respect the API rate limit
      await sleep(500);
    }

    // Step 3: Save to JSON
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(fullProblems, null, 2));
    console.log(`\n✅ Successfully generated ${OUTPUT_FILE} with ${fullProblems.length} curated problems!`);
    console.log(`You can now run: node scripts/importDataset.js to import them into your database.`);
    
  } catch (error) {
    console.error("Fatal Error:", error.message);
  }
}

// Fetch the first 100 problems as a batch
fetchLeetcodeProblems(100);
