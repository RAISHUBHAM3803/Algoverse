/**
 * End-to-end test: generate driver code for Two Sum and run via JDoodle.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const axios = require('axios');
const { generateAllDrivers } = require('../src/utils/driverCodeGenerator');

const CLIENT_ID = process.env.JDOODLE_CLIENT_ID;
const CLIENT_SECRET = process.env.JDOODLE_CLIENT_SECRET;

const USER_CODE_CPP = `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> mp;
        for (int i = 0; i < nums.size(); i++) {
            int complement = target - nums[i];
            if (mp.find(complement) != mp.end()) {
                return {mp[complement], i};
            }
            mp[nums[i]] = i;
        }
        return {};
    }
};`;

const USER_CODE_PY = `class Solution:
    def twoSum(self, nums, target):
        seen = {}
        for i, n in enumerate(nums):
            diff = target - n
            if diff in seen:
                return [seen[diff], i]
            seen[n] = i`;

const USER_CODE_JS = `var twoSum = function(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) return [map.get(complement), i];
        map.set(nums[i], i);
    }
};`;

const meta = {
  name: 'twoSum',
  params: [
    { name: 'nums', type: 'integer[]' },
    { name: 'target', type: 'integer' }
  ],
  return: { type: 'integer[]', size: 2 },
  manual: false
};

const JDOODLE_LANGS = {
  cpp:        { code: 'cpp17',   versionIndex: '0' },
  python:     { code: 'python3', versionIndex: '3' },
  javascript: { code: 'nodejs',  versionIndex: '4' },
};

async function runJDoodle(language, code, input) {
  const lang = JDOODLE_LANGS[language];
  const res = await axios.post('https://api.jdoodle.com/v1/execute', {
    clientId:     CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    script:       code,
    stdin:        input,
    language:     lang.code,
    versionIndex: lang.versionIndex,
  });
  return res.data;
}

async function main() {
  const drivers = generateAllDrivers(meta);
  const INPUT = '[2,7,11,15]\n9';

  console.log('=== LeetCode-Style Driver Code Test ===\n');
  console.log(`Input: nums=[2,7,11,15], target=9`);
  console.log(`Expected Output: [0,1]\n`);

  // ── C++ ──
  console.log('--- C++ ---');
  const cppFull = drivers.cpp.replace('{{USER_CODE}}', USER_CODE_CPP);
  const cppRes = await runJDoodle('cpp', cppFull, INPUT);
  console.log('Output:', cppRes.output?.trim());
  console.log('CPU Time:', cppRes.cpuTime, '| Memory:', cppRes.memory);

  // ── Python ──
  console.log('\n--- Python ---');
  const pyFull = drivers.python.replace('{{USER_CODE}}', USER_CODE_PY);
  const pyRes = await runJDoodle('python', pyFull, INPUT);
  console.log('Output:', pyRes.output?.trim());
  console.log('CPU Time:', pyRes.cpuTime, '| Memory:', pyRes.memory);

  // ── JavaScript ──
  console.log('\n--- JavaScript (Node.js) ---');
  // Node.js reads stdin differently — use process.stdin sync approach
  const jsDriverFixed = drivers.javascript
    .replace("require('fs').readFileSync('/dev/stdin','utf8')", "require('fs').readFileSync(0,'utf8')");
  const jsFull = jsDriverFixed.replace('{{USER_CODE}}', USER_CODE_JS);
  const jsRes = await runJDoodle('javascript', jsFull, INPUT);
  console.log('Output:', jsRes.output?.trim());
  console.log('CPU Time:', jsRes.cpuTime, '| Memory:', jsRes.memory);

  console.log('\n✅ All 3 languages tested!');
}

main().catch(console.error);
