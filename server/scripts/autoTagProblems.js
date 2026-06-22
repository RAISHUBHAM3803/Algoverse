/**
 * AlgoVerse - Auto Tag Problems
 *
 * Scans every problem in the DB that has no tags and assigns tags
 * derived from the problem title using keyword matching.
 *
 * Usage:
 *   node scripts/autoTagProblems.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Problem  = require('../src/models/Problem');

// ─── Keyword → Tag mapping ────────────────────────────────────────────────────
// Order matters: more specific patterns first.
const TAG_RULES = [
  // Data Structures
  { pattern: /trie/i,                                tag: 'Trie' },
  { pattern: /segment\s*tree/i,                      tag: 'Segment Tree' },
  { pattern: /fenwick|binary\s*indexed/i,            tag: 'Binary Indexed Tree' },
  { pattern: /union\s*find|disjoint/i,               tag: 'Union Find' },
  { pattern: /\bheap\b|priority\s*queue/i,           tag: 'Heap' },
  { pattern: /\bdeque\b/i,                           tag: 'Queue' },
  { pattern: /monotonic\s*(stack|queue)/i,           tag: 'Monotonic Stack' },
  { pattern: /\bstack\b/i,                           tag: 'Stack' },
  { pattern: /\bqueue\b/i,                           tag: 'Queue' },
  { pattern: /linked\s*list/i,                       tag: 'Linked List' },
  { pattern: /\btree\b|\bbst\b|binary\s*tree|binary\s*search\s*tree|avl|red.black/i, tag: 'Tree' },
  { pattern: /\bgraph\b|adjacen|topolog|shortest\s*path|dijkstra|bellman|floyd|network\s*flow|strongly\s*connected/i, tag: 'Graph' },
  { pattern: /\barray\b|subarray|contiguous/i,       tag: 'Array' },
  { pattern: /\bstring\b|substring|subsequence|palindrome|anagram|isomorphic|pattern\s*match/i, tag: 'String' },
  { pattern: /hash\s*map|hash\s*table|hash\s*set|frequency\s*map/i, tag: 'Hash Table' },
  { pattern: /matrix|grid|\b2d\b/i,                  tag: 'Matrix' },

  // Algorithms
  { pattern: /dynamic\s*prog|memoiz|tabulation|knapsack|coin\s*change|edit\s*distance|longest\s*common|longest\s*increasing/i, tag: 'Dynamic Programming' },
  { pattern: /greedy/i,                              tag: 'Greedy' },
  { pattern: /divide\s*and\s*conquer|merge\s*sort/i, tag: 'Divide and Conquer' },
  { pattern: /backtrack|n.queen|permutation|combination|subset/i, tag: 'Backtracking' },
  { pattern: /binary\s*search/i,                     tag: 'Binary Search' },
  { pattern: /two\s*pointer|sliding\s*window/i,      tag: 'Two Pointers' },
  { pattern: /sliding\s*window/i,                    tag: 'Sliding Window' },
  { pattern: /bfs|breadth.first/i,                   tag: 'BFS' },
  { pattern: /dfs|depth.first/i,                     tag: 'DFS' },
  { pattern: /recursion|recursive/i,                 tag: 'Recursion' },
  { pattern: /sort(?:ing)?/i,                        tag: 'Sorting' },
  { pattern: /\bmath\b|modular|gcd|lcm|prime|fibonacci|factorial/i, tag: 'Math' },
  { pattern: /bit\s*manipulation|bitwise|xor|bitmask/i, tag: 'Bit Manipulation' },
  { pattern: /\bprefix\b|\bsuffix\b/i,               tag: 'Prefix Sum' },

  // Problem-category fallbacks by common keywords
  { pattern: /maximum|minimum|max|min/i,             tag: 'Greedy' },
  { pattern: /\bcount\b/i,                           tag: 'Array' },
  { pattern: /\bpath\b|\btraversal\b/i,              tag: 'Graph' },
  { pattern: /\binterval\b|\bschedule\b|\bmeeting\b/i, tag: 'Intervals' },
  { pattern: /\bdesign\b|\bimplement\b/i,            tag: 'Design' },
  { pattern: /\bsearch\b/i,                          tag: 'Binary Search' },
  { pattern: /\bnumber\b|\bdigit\b|\binteger\b/i,    tag: 'Math' },
];

// Additional inferred tags based on difficulty + title
function inferTagsFromTitle(title) {
  const tags = new Set();

  for (const rule of TAG_RULES) {
    if (rule.pattern.test(title)) {
      tags.add(rule.tag);
    }
  }

  // If nothing matched, add a generic tag
  if (tags.size === 0) {
    tags.add('Array');
  }

  return [...tags].slice(0, 5); // Cap at 5 tags per problem
}

async function autoTagProblems() {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/algoverse';
    console.log('Connecting to DB at:', uri.substring(0, 50) + '...');
    await mongoose.connect(uri);
    console.log('Connected.\n');

    // Only process problems with empty tags
    const untagged = await Problem.find({ tags: { $size: 0 } })
      .select('_id title tags')
      .lean();

    console.log(`Found ${untagged.length} untagged problems. Processing...`);

    if (untagged.length === 0) {
      console.log('✅ All problems already have tags!');
      return;
    }

    const BATCH_SIZE = 100;
    let updated = 0;
    const tagFreq = {};

    for (let i = 0; i < untagged.length; i += BATCH_SIZE) {
      const batch = untagged.slice(i, i + BATCH_SIZE);

      const bulkOps = batch.map(problem => {
        const tags = inferTagsFromTitle(problem.title);
        tags.forEach(t => { tagFreq[t] = (tagFreq[t] || 0) + 1; });
        return {
          updateOne: {
            filter: { _id: problem._id },
            update: { $set: { tags } },
          },
        };
      });

      const result = await Problem.bulkWrite(bulkOps, { ordered: false });
      updated += result.modifiedCount;
      console.log(`  Batch ${Math.floor(i / BATCH_SIZE) + 1}: updated ${result.modifiedCount} problems (total: ${updated})`);
    }

    console.log(`\n✅ Tagged ${updated} / ${untagged.length} problems.`);
    console.log('\nTop 15 assigned tags:');
    Object.entries(tagFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .forEach(([tag, count]) => console.log(`  ${tag.padEnd(25)} ${count}`));

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    mongoose.connection.close();
    console.log('\nDone.');
  }
}

autoTagProblems();
