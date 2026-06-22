const fs = require("fs");
const axios = require("axios");

// Configuration
const API_BASE = "http://localhost:5008/api/v1";
const DATASET_PATH = "./dataset.json"; // Path to your 500+ problems JSON file

async function importDataset() {
  console.log("Starting bulk import...");

  if (!fs.existsSync(DATASET_PATH)) {
    console.error(`Error: Dataset file not found at ${DATASET_PATH}`);
    console.log("Please download a dataset (e.g., from Kaggle) and save it as dataset.json");
    process.exit(1);
  }

  try {
    // Step 1: Login to get admin token automatically
    console.log("Logging in as admin...");
    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: "admin@algoverse.dev",
      password: "Admin@AlgoVerse123!",
    });
    
    // Check where the token is returned (it might be in a cookie or response body)
    // Looking at auth flow, typically it returns it in cookies, but let's grab it from headers
    // If we use standard axios, we need to extract the Set-Cookie header
    const cookies = loginRes.headers['set-cookie'];
    let token = "";
    
    if (cookies) {
      const accessTokenCookie = cookies.find(c => c.startsWith('accessToken='));
      if (accessTokenCookie) {
        token = accessTokenCookie.split(';')[0].split('=')[1];
      }
    }
    
    if (!token && loginRes.data && loginRes.data.accessToken) {
        token = loginRes.data.accessToken;
    }

    const rawData = fs.readFileSync(DATASET_PATH, "utf8");
    const problems = JSON.parse(rawData);

    if (!Array.isArray(problems)) {
      console.error("Error: Dataset must be a JSON array of problem objects.");
      process.exit(1);
    }

    console.log(`Found ${problems.length} problems in dataset. Preparing to upload...`);

    // For very large datasets, we should chunk the uploads
    const CHUNK_SIZE = 50;
    let totalInserted = 0;

    for (let i = 0; i < problems.length; i += CHUNK_SIZE) {
      const chunk = problems.slice(i, i + CHUNK_SIZE);
      console.log(`Uploading chunk ${Math.floor(i / CHUNK_SIZE) + 1} (${chunk.length} problems)...`);

      const response = await axios.post(`${API_BASE}/problems/bulk`, chunk, {
        headers: {
          Cookie: `accessToken=${token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true
      });

      totalInserted += response.data.data.insertedCount;
      
      // Add a slight delay to prevent hitting API rate limits on large datasets
      if (i + CHUNK_SIZE < problems.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    console.log(`\n✅ Success! Bulk import completed.`);
    console.log(`Total problems successfully inserted: ${totalInserted}`);

  } catch (error) {
    console.error("\n❌ Error during bulk import:");
    if (error.response) {
      console.error(`Status: ${error.response.status} ${error.response.statusText}`);
      console.error("Data:", error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

importDataset();
