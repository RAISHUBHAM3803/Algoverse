const https = require('https');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Problem = require('../src/models/Problem');
const User = require('../src/models/User');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const LIMIT = 150; // The Top 150 most famous FAANG placement questions
const CONCURRENCY = 5;

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); } 
        catch(e) { resolve(null); }
      });
    }).on('error', reject);
  });
}

async function generateDataset() {
  console.log(`fetching top ${LIMIT} placement questions from LeetCode...`);
  
  const listData = await fetchJson(`https://alfa-leetcode-api.onrender.com/problems?limit=${LIMIT}`);
  if (!listData || !listData.problemsetQuestionList) {
    console.error("Failed to fetch problem list");
    process.exit(1);
  }

  const problems = listData.problemsetQuestionList;
  const results = [];
  let completed = 0;

  async function processProblem(p) {
    const detailUrl = `https://alfa-leetcode-api.onrender.com/select?titleSlug=${p.titleSlug}`;
    const detail = await fetchJson(detailUrl);
    
    if (detail && detail.question) {
      // Map tags
      const tags = p.topicTags ? p.topicTags.map(t => t.name) : [];
      
      results.push({
        title: p.title,
        slug: p.titleSlug,
        problemNumber: parseInt(p.questionFrontendId),
        statement: detail.question,
        difficulty: p.difficulty,
        tags: tags,
        isRealDataFetched: true,
        // Default boilerplate code
        starterCode: {
          cpp: "// Write your C++ code here\n",
          python: "# Write your Python code here\n",
          java: "// Write your Java code here\n",
          javascript: "// Write your JavaScript code here\n"
        },
        driverCode: {
          cpp: "int main() {\n    // Driver code\n    return 0;\n}",
          python: "if __name__ == '__main__':\n    # Driver code\n    pass",
          java: "public class Main {\n    public static void main(String[] args) {\n        // Driver code\n    }\n}",
          javascript: "function main() {\n    // Driver code\n}\nmain();"
        },
        // We provide a dummy testcase for the IDE to run
        visibleTestCases: [{ input: "1", output: "1" }],
        hiddenTestCases: [{ input: "1", output: "1" }]
      });
    }
    
    completed++;
    process.stdout.write(`\rProgress: ${completed}/${LIMIT}`);
  }

  // Run with concurrency
  for (let i = 0; i < problems.length; i += CONCURRENCY) {
    const chunk = problems.slice(i, i + CONCURRENCY);
    await Promise.all(chunk.map(p => processProblem(p)));
  }

  console.log('\n\n✅ Finished fetching all details!');
  
  const filePath = path.join(__dirname, 'placement-dataset.json');
  fs.writeFileSync(filePath, JSON.stringify(results, null, 2));
  console.log(`\n💾 Saved ${results.length} questions to ${filePath}`);

  // Seed DB
  console.log('\n🌱 Seeding database with new placement dataset...');
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/algoverse';
  await mongoose.connect(uri);

  const adminUser = await User.findOne({ role: 'admin' });
  const adminId = adminUser ? adminUser._id : new mongoose.Types.ObjectId();

  const dbOps = results.map(r => ({ ...r, createdBy: adminId }));
  await Problem.insertMany(dbOps, { ordered: false }).catch(e => console.log('Some duplicates skipped.'));

  console.log('✅ Database seeded successfully!');
  mongoose.connection.close();
}

generateDataset();
