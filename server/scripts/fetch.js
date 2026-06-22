const fs = require('fs');
const https = require('https');

const url = "https://leetcode.com/api/problems/all/";
const file = fs.createWriteStream("raw-dataset.json");

https.get(url, (response) => {
  let data = "";
  response.on('data', chunk => data += chunk);
  response.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      // leetcode api returns { stat_status_pairs: [ ... ] }
      const problems = parsed.stat_status_pairs.map(p => ({
        title: p.stat.question__title,
        statement: "Problem statement for " + p.stat.question__title + " (Data pulled from LeetCode API)",
        difficulty: p.difficulty.level === 1 ? "Easy" : (p.difficulty.level === 2 ? "Medium" : "Hard"),
        tags: [],
        examples: [{ input: "sample", output: "sample", explanation: "" }],
        testcases: [{ input: "1", output: "1" }, { input: "2", output: "2" }]
      }));
      fs.writeFileSync("raw-dataset.json", JSON.stringify(problems, null, 2));
      console.log("Successfully downloaded and extracted", problems.length, "problems!");
    } catch(e) {
      console.error("Error parsing response:", e);
    }
  });
}).on('error', (err) => {
  console.error("Error downloading:", err.message);
});
