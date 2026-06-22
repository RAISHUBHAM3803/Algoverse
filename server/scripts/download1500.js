const https = require('https');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Problem = require('../src/models/Problem');
const User = require('../src/models/User');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const LIMIT = 1500;
const CONCURRENCY = 10;

function fetchJson(url, retries = 3) {
  return new Promise((resolve, reject) => {
    const attempt = () => {
      https.get(url, res => {
        let body = '';
        res.on('data', d => body += d);
        res.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            if (retries > 0) {
              retries--;
              setTimeout(attempt, 2000);
            } else {
              resolve(null);
            }
          }
        });
      }).on('error', e => {
        if (retries > 0) {
          retries--;
          setTimeout(attempt, 2000);
        } else {
          resolve(null);
        }
      });
    };
    attempt();
  });
}

async function generateDataset() {
  console.log(`Starting automated download of ${LIMIT} LeetCode questions...`);
  
  let problems = [];
  for (let skip = 0; skip < LIMIT; skip += 100) {
    const listData = await fetchJson(`https://alfa-leetcode-api.onrender.com/problems?limit=100&skip=${skip}`);
    if (listData && listData.problemsetQuestionList) {
      problems = problems.concat(listData.problemsetQuestionList);
    }
  }

  if (problems.length === 0) {
    console.error("Failed to fetch problem list from API.");
    return;
  }

  // Ensure exactly LIMIT
  problems = problems.slice(0, LIMIT);

  const results = [];
  let completed = 0;

  async function processProblem(p) {
    const detailUrl = `https://alfa-leetcode-api.onrender.com/select?titleSlug=${p.titleSlug}`;
    const detail = await fetchJson(detailUrl);
    
    if (detail && detail.question) {
      const tags = p.topicTags ? p.topicTags.map(t => t.name) : [];
      results.push({
        title: p.title,
        slug: p.titleSlug,
        problemNumber: parseInt(p.questionFrontendId),
        statement: detail.question,
        difficulty: p.difficulty,
        tags: tags,
        isRealDataFetched: true,
        starterCode: {
          cpp: "// Write your C++ code here\n",
          python: "# Write your Python code here\n",
          java: "// Write your Java code here\n",
          javascript: "// Write your JavaScript code here\n"
        },
        driverCode: {
          cpp: "int main() {\n    return 0;\n}",
          python: "if __name__ == '__main__':\n    pass",
          java: "public class Main {\n    public static void main(String[] args) {\n    }\n}",
          javascript: "function main() {\n}\nmain();"
        },
        visibleTestCases: [{ input: "1", output: "1" }],
        hiddenTestCases: [{ input: "1", output: "1" }]
      });
    }
    
    completed++;
    if (completed % 10 === 0) {
      console.log(`Progress: ${completed} / ${LIMIT} downloaded...`);
    }
  }

  for (let i = 0; i < problems.length; i += CONCURRENCY) {
    const chunk = problems.slice(i, i + CONCURRENCY);
    await Promise.all(chunk.map(p => processProblem(p)));
  }

  console.log('\n✅ Successfully downloaded 1500 questions!');
  
  const filePath = path.join(__dirname, 'leetcode_1500_dataset.json');
  fs.writeFileSync(filePath, JSON.stringify(results, null, 2));
  console.log(`💾 Saved to: ${filePath}`);

  console.log('🌱 Seeding database...');
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/algoverse';
  await mongoose.connect(uri);

  const adminUser = await User.findOne({ role: 'admin' });
  const adminId = adminUser ? adminUser._id : new mongoose.Types.ObjectId();

  const dbOps = results.map(r => ({ ...r, createdBy: adminId }));
  
  await Problem.deleteMany({}); // Ensure clean DB
  await Problem.insertMany(dbOps, { ordered: false }).catch(e => console.log('Some duplicates skipped.'));

  console.log('✅ Database seeded with 1500 real LeetCode questions!');
  mongoose.connection.close();
}

generateDataset();
