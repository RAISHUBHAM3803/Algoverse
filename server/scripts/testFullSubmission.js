/**
 * Final end-to-end submission test.
 * Simulates exactly what happens when a user clicks "Submit" on Two Sum.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Problem  = require('../src/models/Problem');
const axios    = require('axios');

const CLIENT_ID     = process.env.JDOODLE_CLIENT_ID;
const CLIENT_SECRET = process.env.JDOODLE_CLIENT_SECRET;

const JDOODLE_LANGS = {
  cpp:        { code: 'cpp17',   versionIndex: '0' },
  python:     { code: 'python3', versionIndex: '3' },
  javascript: { code: 'nodejs',  versionIndex: '4' },
};

// ── Correct solution ──────────────────────────────────────────────────────────
const CORRECT_CPP = `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int,int> mp;
        for(int i=0;i<nums.size();i++){
            int c=target-nums[i];
            if(mp.count(c)) return {mp[c],i};
            mp[nums[i]]=i;
        }
        return {};
    }
};`;

// ── Wrong solution ────────────────────────────────────────────────────────────
const WRONG_CPP = `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        return {0, 0}; // Always wrong
    }
};`;

async function runJDoodle(language, code, input) {
  const lang = JDOODLE_LANGS[language];
  const res = await axios.post('https://api.jdoodle.com/v1/execute', {
    clientId: CLIENT_ID, clientSecret: CLIENT_SECRET,
    script: code, stdin: input,
    language: lang.code, versionIndex: lang.versionIndex,
  });
  return res.data;
}

async function evaluateSubmission(language, userCode, testCases, driverCode) {
  const driver = driverCode[language];
  if (!driver || !driver.includes('{{USER_CODE}}')) {
    return { verdict: 'NO_DRIVER', passed: 0, total: testCases.length };
  }
  const runnableCode = driver.replace('{{USER_CODE}}', userCode);

  let passed = 0;
  for (const tc of testCases) {
    const result = await runJDoodle(language, runnableCode, tc.input);
    const actual   = (result.output || '').trim().replace(/\r\n/g, '\n');
    const expected = (tc.output  || '').trim();
    const ok = actual === expected;
    console.log(`  TC: input="${tc.input.replace(/\n/g,'\\n')}" | expected="${expected}" | got="${actual}" | ${ok ? '✅' : '❌'}`);
    if (ok) passed++;
    else break; // fail-fast like LeetCode
  }
  const verdict = passed === testCases.length ? 'ACCEPTED' : 'WRONG_ANSWER';
  return { verdict, passed, total: testCases.length };
}

async function main() {
  await mongoose.connect(process.env.MONGO_URI);

  const p = await Problem.findOne({ slug: 'two-sum' }).select('+hiddenTestCases').lean();
  console.log(`\n=== TWO SUM (${p.hiddenTestCases.length} test cases) ===\n`);

  // ── Test 1: Correct C++ solution ─────────────────────────────────────────
  console.log('--- Correct C++ Solution ---');
  const r1 = await evaluateSubmission('cpp', CORRECT_CPP, p.hiddenTestCases, p.driverCode);
  console.log(`→ Verdict: ${r1.verdict} | ${r1.passed}/${r1.total} passed\n`);

  // ── Test 2: Wrong C++ solution ────────────────────────────────────────────
  console.log('--- Wrong C++ Solution ---');
  const r2 = await evaluateSubmission('cpp', WRONG_CPP, p.hiddenTestCases, p.driverCode);
  console.log(`→ Verdict: ${r2.verdict} | ${r2.passed}/${r2.total} passed\n`);

  const allPassed = r1.verdict === 'ACCEPTED' && r2.verdict === 'WRONG_ANSWER';
  console.log(allPassed
    ? '🎉 FULL END-TO-END TEST PASSED! Submit & Run buttons will work correctly.'
    : '⚠️  Something needs fixing.'
  );

  mongoose.connection.close();
}

main().catch(console.error);
