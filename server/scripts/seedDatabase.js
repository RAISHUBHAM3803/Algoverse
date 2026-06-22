const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

// Load env
dotenv.config({ path: path.join(__dirname, "../.env") });

const Problem = require("../src/models/Problem");
const User = require("../src/models/User");

const DATASET_PATH = path.join(__dirname, "dataset.json");

async function seedDatabase() {
  try {
    const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/algoverse";
    console.log("Connecting to DB at:", uri);
    await mongoose.connect(uri);
    console.log("Connected to DB.");

    // Find admin user to assign as creator
    const adminUser = await User.findOne({ email: "admin@algoverse.dev" });
    if (!adminUser) {
      console.error("Admin user not found. Please ensure resetAdmin.js ran successfully.");
      process.exit(1);
    }

    const rawData = fs.readFileSync(DATASET_PATH, "utf8");
    const problems = JSON.parse(rawData);

    console.log(`Found ${problems.length} problems. Preparing to insert...`);

    const { slugify } = require("../src/utils/slugify");

    // Add createdBy and slug fields to all problems
    const problemsToInsert = problems.map((p) => ({
      ...p,
      createdBy: adminUser._id,
      slug: slugify(p.title)
    }));

    // Clean up any incorrectly inserted problems from the previous failed run
    await Problem.deleteMany({ slug: null });

    // We will insert in chunks to avoid blowing up memory/BSON limits
    const CHUNK_SIZE = 100;
    let totalInserted = 0;

    for (let i = 0; i < problemsToInsert.length; i += CHUNK_SIZE) {
      const chunk = problemsToInsert.slice(i, i + CHUNK_SIZE);
      
      // Use ordered: false so if one fails (e.g. duplicate slug), the rest continue
      const result = await Problem.insertMany(chunk, { ordered: false }).catch(err => {
        // If it's a duplicate key error, we can ignore and log how many succeeded
        if (err.code === 11000) {
           console.log(`Some problems in chunk ${Math.floor(i / CHUNK_SIZE) + 1} were duplicates and skipped.`);
           return err.insertedDocs; // get docs that succeeded
        }
        throw err;
      });

      const count = Array.isArray(result) ? result.length : 0;
      totalInserted += count;
      console.log(`Chunk ${Math.floor(i / CHUNK_SIZE) + 1} uploaded. Total inserted: ${totalInserted}`);
    }

    console.log(`\n✅ Success! Bulk import completed directly to MongoDB.`);
    console.log(`Total new problems successfully inserted: ${totalInserted}`);

  } catch (error) {
    console.error("❌ Error during direct bulk import:", error.message);
  } finally {
    mongoose.connection.close();
  }
}

seedDatabase();
