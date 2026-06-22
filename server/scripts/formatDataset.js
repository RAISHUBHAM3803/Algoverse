const fs = require("fs");
const path = require("path");

const RAW_DATASET_PATH = path.join(__dirname, "raw-dataset.json");
const OUTPUT_DATASET_PATH = path.join(__dirname, "dataset.json");

async function formatDataset() {
  console.log("Starting dataset formatting...");

  if (!fs.existsSync(RAW_DATASET_PATH)) {
    console.error(`Error: Raw dataset not found at ${RAW_DATASET_PATH}`);
    console.log("Please download the raw dataset and save it as raw-dataset.json");
    process.exit(1);
  }

  try {
    const rawData = fs.readFileSync(RAW_DATASET_PATH, "utf8");
    const rawProblems = JSON.parse(rawData);

    if (!Array.isArray(rawProblems)) {
      console.error("Error: Raw dataset must be a JSON array.");
      process.exit(1);
    }

    const formattedProblems = rawProblems.map((p, index) => {
      // Map title and statement
      const title = p.title || `Problem ${index + 1}`;
      const statement = p.statement || p.description || p.content || "Problem statement goes here.";

      // Map difficulty
      let difficulty = "Medium";
      if (p.difficulty && ["Easy", "Medium", "Hard"].includes(p.difficulty)) {
        difficulty = p.difficulty;
      } else if (p.difficulty && typeof p.difficulty === "string") {
        // Capitalize first letter if it's "easy", "medium", "hard"
        difficulty = p.difficulty.charAt(0).toUpperCase() + p.difficulty.slice(1).toLowerCase();
        if (!["Easy", "Medium", "Hard"].includes(difficulty)) difficulty = "Medium";
      }

      // Map tags
      const tags = Array.isArray(p.tags) ? p.tags : [];

      // Format examples
      let examples = [];
      if (Array.isArray(p.examples)) {
        examples = p.examples.map((ex) => ({
          input: ex.input || "Example Input",
          output: ex.output || "Example Output",
          explanation: ex.explanation || "",
        }));
      } else {
        examples = [{ input: "Sample Input", output: "Sample Output", explanation: "Sample Explanation" }];
      }

      // Format test cases
      let visibleTestCases = [];
      let hiddenTestCases = [];
      const testcases = p.testcases || p.testCases || [];

      if (Array.isArray(testcases) && testcases.length > 0) {
        const formattedTc = testcases.map((tc) => ({
          input: String(tc.input || ""),
          output: String(tc.output || ""),
        }));
        
        // Split half to visible, half to hidden
        const mid = Math.max(1, Math.floor(formattedTc.length / 2));
        visibleTestCases = formattedTc.slice(0, mid);
        hiddenTestCases = formattedTc.slice(mid);
      } else {
        visibleTestCases = [{ input: "1", output: "1" }];
        hiddenTestCases = [{ input: "2", output: "2" }];
      }

      // Initialize default starter and driver code if not provided
      const starterCode = p.starterCode || {
        cpp: "// Write your C++ code here\n",
        python: "# Write your Python code here\n",
        java: "// Write your Java code here\n",
        javascript: "// Write your JavaScript code here\n",
      };

      const driverCode = p.driverCode || {
        cpp: "int main() {\n    // Driver code\n    return 0;\n}",
        python: "if __name__ == '__main__':\n    # Driver code\n    pass",
        java: "public class Main {\n    public static void main(String[] args) {\n        // Driver code\n    }\n}",
        javascript: "function main() {\n    // Driver code\n}\nmain();",
      };

      return {
        title,
        statement,
        difficulty,
        tags,
        examples,
        visibleTestCases,
        hiddenTestCases,
        starterCode,
        driverCode,
      };
    });

    fs.writeFileSync(OUTPUT_DATASET_PATH, JSON.stringify(formattedProblems, null, 2));
    console.log(`✅ Successfully formatted ${formattedProblems.length} problems into ${OUTPUT_DATASET_PATH}`);
  } catch (error) {
    console.error("❌ Error formatting dataset:", error.message);
  }
}

formatDataset();
