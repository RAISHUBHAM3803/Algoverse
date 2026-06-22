/**
 * seedTestCases.js — Fixed version
 *
 * Fetches real test cases (inputs + expected outputs) from LeetCode GraphQL
 * and generates proper driver code for all problems in the database.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const https = require('https');
const mongoose = require('mongoose');
const Problem = require('../src/models/Problem');
const { generateAllDrivers } = require('../src/utils/driverCodeGenerator');

const CONCURRENCY = 5;
const BATCH_SIZE  = 50;
const DELAY_MS    = 500; // ms between batches to avoid rate-limiting

// ── GraphQL Helper ────────────────────────────────────────────────────────────

function fetchGraphQL(query, variables) {
  return new Promise((resolve) => {
    const payload = JSON.stringify({ query, variables });
    const options = {
      hostname: 'leetcode.com',
      path: '/graphql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
    };
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (d) => (body += d));
      res.on('end', () => {
        try { resolve(JSON.parse(body)); }
        catch  { resolve(null); }
      });
    });
    req.setTimeout(10000, () => { req.destroy(); resolve(null); });
    req.on('error', () => resolve(null));
    req.write(payload);
    req.end();
  });
}

// ── Output Extraction from HTML ───────────────────────────────────────────────

function extractOutputsFromHtml(html) {
  if (!html) return [];
  const outputs = [];
  // Match patterns: <strong>Output:</strong> value or <strong class="example">Output:</strong> value
  const regex = /<strong(?:[^>]*)>Output:?<\/strong>:?\s*([^<\n]+)/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    outputs.push(match[1].trim());
  }
  return outputs;
}

// ── Per-Problem Processor ─────────────────────────────────────────────────────

const QUERY = `
query questionData($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    metaData
    exampleTestcaseList
    content
  }
}`;

async function processProblem(problem) {
  const result = await fetchGraphQL(QUERY, { titleSlug: problem.slug });
  if (!result?.data?.question) return false;

  const { metaData: rawMeta, exampleTestcaseList, content } = result.data.question;
  if (!rawMeta || !exampleTestcaseList?.length) return false;

  // Parse metaData
  let meta;
  try { meta = JSON.parse(rawMeta); }
  catch { return false; }

  // Skip design/manual problems (LRU Cache, etc.) — different format
  if (meta.manual) return false;

  // Generate driver code
  const drivers = generateAllDrivers(meta);
  if (!drivers) return false;

  // Extract expected outputs from HTML
  const outputs = extractOutputsFromHtml(content);

  // Build test cases pairing inputs with outputs
  const testCases = exampleTestcaseList.slice(0, 3).map((input, i) => ({
    input: input.trim(),
    output: (outputs[i] || '').trim(),
  })).filter(tc => tc.input); // remove empty inputs

  if (testCases.length === 0) return false;

  // Save to DB
  await Problem.updateOne(
    { _id: problem._id },
    {
      $set: {
        driverCode:        drivers,
        visibleTestCases:  testCases,
        hiddenTestCases:   testCases,
      },
    }
  );

  return true;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB.\n');

  const total = await Problem.countDocuments({});
  console.log(`📦 Total problems in DB: ${total}`);
  console.log(`🚀 Processing with concurrency=${CONCURRENCY}, batch=${BATCH_SIZE}...\n`);

  let processed = 0;
  let succeeded = 0;

  // Process in sorted batches
  for (let skip = 0; skip < total; skip += BATCH_SIZE) {
    const batch = await Problem.find({})
      .select('slug')
      .sort({ problemNumber: 1 })
      .skip(skip)
      .limit(BATCH_SIZE)
      .lean();

    if (!batch.length) break;

    // Process chunk by chunk within each batch
    for (let i = 0; i < batch.length; i += CONCURRENCY) {
      const chunk = batch.slice(i, i + CONCURRENCY);
      const results = await Promise.all(chunk.map(p => processProblem(p)));
      succeeded += results.filter(Boolean).length;
      processed += chunk.length;
      process.stdout.write(
        `\r  ✔ ${processed}/${total} processed | ✅ ${succeeded} updated`
      );
    }

    // Small delay between batches
    if (skip + BATCH_SIZE < total) {
      await new Promise(r => setTimeout(r, DELAY_MS));
    }
  }

  console.log(`\n\n🎉 Done! Successfully updated ${succeeded}/${total} problems.`);
  mongoose.connection.close();
}

main().catch(console.error);
