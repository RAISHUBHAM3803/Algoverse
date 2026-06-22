/**
 * AlgoVerse – Assign Global Problem Numbers
 *
 * Stamps a permanent, sequential problemNumber (1, 2, 3 … N) on every
 * problem in the database, ordered by MongoDB's _id (insertion order).
 * This gives each problem a stable LeetCode-style number that never
 * changes regardless of page, filter, or future inserts (new problems
 * append at the end).
 *
 * Usage:
 *   node scripts/assignProblemNumbers.js
 *
 * It is safe to re-run — it will only touch documents that don't yet
 * have a problemNumber, unless you pass --reset to re-number everything.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Problem  = require('../src/models/Problem');

const RESET = process.argv.includes('--reset');

async function assignNumbers() {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/algoverse';
    console.log('Connecting to:', uri.substring(0, 50) + '...');
    await mongoose.connect(uri);
    console.log('Connected.\n');

    // Fetch ALL problems sorted by _id ascending (stable insertion order)
    const query = RESET ? {} : { problemNumber: { $exists: false } };
    const problems = await Problem.find(query)
      .sort({ _id: 1 })
      .select('_id problemNumber')
      .lean();

    if (problems.length === 0) {
      console.log('✅ All problems already have a problemNumber. Use --reset to re-number.');
      return;
    }

    // When not resetting, find the current max to continue from there
    let startFrom = 1;
    if (!RESET) {
      const maxDoc = await Problem.findOne({ problemNumber: { $exists: true } })
        .sort({ problemNumber: -1 })
        .select('problemNumber')
        .lean();
      startFrom = maxDoc ? maxDoc.problemNumber + 1 : 1;
    }

    console.log(`Numbering ${problems.length} problems starting from #${startFrom}...`);

    const BATCH = 200;
    let count = 0;

    for (let i = 0; i < problems.length; i += BATCH) {
      const batch = problems.slice(i, i + BATCH);
      const ops = batch.map((p, j) => ({
        updateOne: {
          filter: { _id: p._id },
          update: { $set: { problemNumber: startFrom + i + j } },
        },
      }));
      const result = await Problem.bulkWrite(ops, { ordered: false });
      count += result.modifiedCount;
      console.log(`  Batch ${Math.floor(i / BATCH) + 1}: assigned #${startFrom + i} – #${startFrom + i + batch.length - 1} (${count} total)`);
    }

    console.log(`\n✅ Done! Assigned problem numbers to ${count} problems.`);

    // Quick sanity check
    const sample = await Problem.find({})
      .sort({ problemNumber: 1 })
      .limit(5)
      .select('problemNumber title')
      .lean();
    console.log('\nFirst 5 problems in order:');
    sample.forEach(p => console.log(`  #${p.problemNumber}  ${p.title}`));

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    mongoose.connection.close();
    console.log('\nConnection closed.');
  }
}

assignNumbers();
