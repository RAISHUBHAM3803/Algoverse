const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });
const Problem = require("../src/models/Problem");

const keywordTags = {
  "tree": ["Tree", "Binary Tree"],
  "sum": ["Math", "Array"],
  "string": ["String"],
  "array": ["Array"],
  "graph": ["Graph"],
  "list": ["Linked List"],
  "sort": ["Sorting"],
  "search": ["Binary Search"],
  "path": ["DFS", "BFS"],
  "maximum": ["Greedy"],
  "minimum": ["Greedy"],
  "matrix": ["Matrix"],
  "word": ["String"],
  "number": ["Math"],
  "combination": ["Backtracking"],
  "permutation": ["Backtracking"],
  "game": ["Game Theory"],
  "coin": ["Dynamic Programming"],
  "schedule": ["Greedy", "Sorting"],
  "interval": ["Array", "Sorting"]
};

async function updateTags() {
  try {
    const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/algoverse";
    await mongoose.connect(uri);
    console.log("Connected to DB to update tags...");

    const problems = await Problem.find({});
    console.log(`Found ${problems.length} problems to update.`);

    let updatedCount = 0;

    for (const problem of problems) {
      const titleLower = problem.title.toLowerCase();
      const tagsSet = new Set(problem.tags || []);

      for (const [keyword, tags] of Object.entries(keywordTags)) {
        if (titleLower.includes(keyword)) {
          tags.forEach(t => tagsSet.add(t));
        }
      }

      // If no tags matched, give it some defaults based on difficulty
      if (tagsSet.size === 0) {
        if (problem.difficulty === "Easy") tagsSet.add("Array");
        if (problem.difficulty === "Medium") tagsSet.add("Dynamic Programming");
        if (problem.difficulty === "Hard") tagsSet.add("Graph");
      }

      const newTags = Array.from(tagsSet);
      
      // Only update if changed
      if (JSON.stringify(problem.tags) !== JSON.stringify(newTags)) {
        problem.tags = newTags;
        await problem.save();
        updatedCount++;
      }
    }

    console.log(`✅ Successfully updated tags for ${updatedCount} problems!`);

  } catch (error) {
    console.error("Error updating tags:", error);
  } finally {
    mongoose.connection.close();
  }
}

updateTags();
