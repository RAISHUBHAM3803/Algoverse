/**
 * AlgoVerse - Production Problem Seed Script
 *
 * Seeds 20 production-ready coding problems with LeetCode-style execution:
 * - starterCode: The function stub shown to the user in the Monaco editor.
 * - driverCode:  The hidden wrapper (with {{USER_CODE}} placeholder) that
 *                handles stdin I/O and calls the user's function.
 *
 * Usage:
 *   node scripts/seedProblems.js            → Inserts new problems (skips dupes)
 *   node scripts/seedProblems.js --clear    → Drops ALL problems, then re-inserts
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Problem  = require('../src/models/Problem');
const User     = require('../src/models/User');

// ─── Admin bootstrap ────────────────────────────────────────────────────────
// A seed-only admin is created if it does not already exist.
const ADMIN_EMAIL    = 'admin@algoverse.dev';
const ADMIN_PASSWORD = 'Admin@AlgoVerse123!';
const ADMIN_NAME     = 'AlgoVerse Admin';

// ============================================================
// PROBLEM DEFINITIONS
// ============================================================

const problems = [

  // ──────────────────────────────────────────────────────────
  // 1. TWO SUM  (Easy)
  // ──────────────────────────────────────────────────────────
  {
    title: 'Two Sum',
    statement: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
    difficulty: 'Easy',
    tags: ['Array', 'Hash Table'],
    constraints: '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nOnly one valid answer exists.',
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' },
      { input: 'nums = [3,2,4], target = 6',     output: '[1,2]', explanation: '' },
    ],
    starterCode: {
      cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {

    }
};`,
      java: `class Solution {
    public int[] twoSum(int[] nums, int target) {

    }
}`,
      python: `from typing import List

class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        pass`,
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
};`,
    },
    driverCode: {
      cpp: `#include <bits/stdc++.h>
using namespace std;

{{USER_CODE}}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int n; cin >> n;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    int target; cin >> target;
    Solution sol;
    vector<int> result = sol.twoSum(nums, target);
    sort(result.begin(), result.end());
    cout << result[0] << " " << result[1] << endl;
    return 0;
}`,
      java: `import java.util.*;

{{USER_CODE}}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
        int target = sc.nextInt();
        Solution sol = new Solution();
        int[] result = sol.twoSum(nums, target);
        Arrays.sort(result);
        System.out.println(result[0] + " " + result[1]);
    }
}`,
      python: `import sys
from typing import List

{{USER_CODE}}

def main():
    data = sys.stdin.read().split()
    idx = 0
    n = int(data[idx]); idx += 1
    nums = [int(data[idx + i]) for i in range(n)]; idx += n
    target = int(data[idx])
    sol = Solution()
    result = sol.twoSum(nums, target)
    result.sort()
    print(result[0], result[1])

main()`,
      javascript: `const readline = require('readline');

{{USER_CODE}}

const rl = readline.createInterface({ input: process.stdin });
const lines = [];
rl.on('line', l => lines.push(l.trim()));
rl.on('close', () => {
    const n = parseInt(lines[0]);
    const nums = lines[1].split(' ').map(Number);
    const target = parseInt(lines[2]);
    const result = twoSum(nums, target);
    result.sort((a, b) => a - b);
    console.log(result[0] + ' ' + result[1]);
});`,
    },
    visibleTestCases: [
      { input: '4\n2 7 11 15\n9',   output: '0 1' },
      { input: '3\n3 2 4\n6',        output: '1 2' },
    ],
    hiddenTestCases: [
      { input: '2\n3 3\n6',               output: '0 1' },
      { input: '5\n1 3 7 10 2\n9',        output: '2 4' },
      { input: '6\n-1 -2 -3 -4 -5 4\n-8', output: '2 4' },
    ],
  },

  // ──────────────────────────────────────────────────────────
  // 2. VALID PARENTHESES  (Easy)
  // ──────────────────────────────────────────────────────────
  {
    title: 'Valid Parentheses',
    statement: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    difficulty: 'Easy',
    tags: ['String', 'Stack'],
    constraints: "1 <= s.length <= 10^4\ns consists of parentheses only '()[]{}'.",
    examples: [
      { input: 's = "()"',      output: 'true',  explanation: '' },
      { input: 's = "()[]{}"', output: 'true',  explanation: '' },
      { input: 's = "(]"',      output: 'false', explanation: '' },
    ],
    starterCode: {
      cpp: `class Solution {
public:
    bool isValid(string s) {

    }
};`,
      java: `class Solution {
    public boolean isValid(String s) {

    }
}`,
      python: `class Solution:
    def isValid(self, s: str) -> bool:
        pass`,
      javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
var isValid = function(s) {
};`,
    },
    driverCode: {
      cpp: `#include <bits/stdc++.h>
using namespace std;

{{USER_CODE}}

int main() {
    string s; cin >> s;
    Solution sol;
    cout << (sol.isValid(s) ? "true" : "false") << endl;
    return 0;
}`,
      java: `import java.util.*;

{{USER_CODE}}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.next();
        Solution sol = new Solution();
        System.out.println(sol.isValid(s) ? "true" : "false");
    }
}`,
      python: `import sys

{{USER_CODE}}

def main():
    s = sys.stdin.read().strip()
    sol = Solution()
    print("true" if sol.isValid(s) else "false")

main()`,
      javascript: `const readline = require('readline');

{{USER_CODE}}

const rl = readline.createInterface({ input: process.stdin });
const lines = [];
rl.on('line', l => lines.push(l.trim()));
rl.on('close', () => {
    console.log(isValid(lines[0]) ? 'true' : 'false');
});`,
    },
    visibleTestCases: [
      { input: '()',       output: 'true'  },
      { input: '()[]{}', output: 'true'  },
    ],
    hiddenTestCases: [
      { input: '(]',    output: 'false' },
      { input: '([)]', output: 'false' },
      { input: '{[]}', output: 'true'  },
      { input: '(((',  output: 'false' },
    ],
  },

  // ──────────────────────────────────────────────────────────
  // 3. REVERSE STRING  (Easy)
  // ──────────────────────────────────────────────────────────
  {
    title: 'Reverse String',
    statement: `Write a function that reverses a string. The input string is given as an array of characters s.

You must do this by modifying the input array in-place with O(1) extra memory.`,
    difficulty: 'Easy',
    tags: ['Two Pointers', 'String'],
    constraints: '1 <= s.length <= 10^5\ns[i] is a printable ASCII character.',
    examples: [
      { input: 's = ["h","e","l","l","o"]', output: '["o","l","l","e","h"]', explanation: '' },
      { input: 's = ["H","a","n","n","a","h"]', output: '["h","a","n","n","a","H"]', explanation: '' },
    ],
    starterCode: {
      cpp: `class Solution {
public:
    void reverseString(vector<char>& s) {
    }
};`,
      java: `class Solution {
    public void reverseString(char[] s) {
    }
}`,
      python: `from typing import List

class Solution:
    def reverseString(self, s: List[str]) -> None:
        # Modify s in-place. Do not return anything.
        pass`,
      javascript: `/**
 * @param {character[]} s
 * @return {void}
 */
var reverseString = function(s) {
    // Modify s in-place. Do not return anything.
};`,
    },
    driverCode: {
      cpp: `#include <bits/stdc++.h>
using namespace std;

{{USER_CODE}}

int main() {
    int n; cin >> n;
    vector<char> s(n);
    for (int i = 0; i < n; i++) cin >> s[i];
    Solution sol;
    sol.reverseString(s);
    for (int i = 0; i < n; i++) {
        if (i > 0) cout << " ";
        cout << s[i];
    }
    cout << endl;
    return 0;
}`,
      java: `import java.util.*;

{{USER_CODE}}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        char[] s = new char[n];
        for (int i = 0; i < n; i++) s[i] = sc.next().charAt(0);
        Solution sol = new Solution();
        sol.reverseString(s);
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) {
            if (i > 0) sb.append(' ');
            sb.append(s[i]);
        }
        System.out.println(sb.toString());
    }
}`,
      python: `import sys
from typing import List

{{USER_CODE}}

def main():
    data = sys.stdin.read().split()
    n = int(data[0])
    s = list(data[1:n+1])
    sol = Solution()
    sol.reverseString(s)
    print(' '.join(s))

main()`,
      javascript: `const readline = require('readline');

{{USER_CODE}}

const rl = readline.createInterface({ input: process.stdin });
const lines = [];
rl.on('line', l => lines.push(l.trim()));
rl.on('close', () => {
    const n = parseInt(lines[0]);
    const s = lines[1].split(' ');
    reverseString(s);
    console.log(s.join(' '));
});`,
    },
    visibleTestCases: [
      { input: '5\nh e l l o',    output: 'o l l e h' },
      { input: '6\nH a n n a h',  output: 'h a n n a H' },
    ],
    hiddenTestCases: [
      { input: '1\na',     output: 'a' },
      { input: '4\na b c d', output: 'd c b a' },
    ],
  },

  // ──────────────────────────────────────────────────────────
  // 4. PALINDROME NUMBER  (Easy)
  // ──────────────────────────────────────────────────────────
  {
    title: 'Palindrome Number',
    statement: `Given an integer x, return true if x is a palindrome, and false otherwise.

An integer is a palindrome when it reads the same forward and backward.
For example, 121 is a palindrome while 123 is not.`,
    difficulty: 'Easy',
    tags: ['Math'],
    constraints: '-2^31 <= x <= 2^31 - 1\nFollow up: Could you solve it without converting the integer to a string?',
    examples: [
      { input: 'x = 121',  output: 'true',  explanation: '121 reads as 121 from left to right and from right to left.' },
      { input: 'x = -121', output: 'false', explanation: 'From left to right, it reads -121. From right to left, it reads 121-.' },
      { input: 'x = 10',   output: 'false', explanation: 'Reads 01 from right to left.' },
    ],
    starterCode: {
      cpp: `class Solution {
public:
    bool isPalindrome(int x) {

    }
};`,
      java: `class Solution {
    public boolean isPalindrome(int x) {

    }
}`,
      python: `class Solution:
    def isPalindrome(self, x: int) -> bool:
        pass`,
      javascript: `/**
 * @param {number} x
 * @return {boolean}
 */
var isPalindrome = function(x) {
};`,
    },
    driverCode: {
      cpp: `#include <bits/stdc++.h>
using namespace std;

{{USER_CODE}}

int main() {
    int x; cin >> x;
    Solution sol;
    cout << (sol.isPalindrome(x) ? "true" : "false") << endl;
    return 0;
}`,
      java: `import java.util.*;

{{USER_CODE}}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int x = sc.nextInt();
        Solution sol = new Solution();
        System.out.println(sol.isPalindrome(x) ? "true" : "false");
    }
}`,
      python: `import sys

{{USER_CODE}}

def main():
    x = int(sys.stdin.read().strip())
    sol = Solution()
    print("true" if sol.isPalindrome(x) else "false")

main()`,
      javascript: `const readline = require('readline');

{{USER_CODE}}

const rl = readline.createInterface({ input: process.stdin });
const lines = [];
rl.on('line', l => lines.push(l.trim()));
rl.on('close', () => {
    console.log(isPalindrome(parseInt(lines[0])) ? 'true' : 'false');
});`,
    },
    visibleTestCases: [
      { input: '121',  output: 'true'  },
      { input: '-121', output: 'false' },
    ],
    hiddenTestCases: [
      { input: '10',   output: 'false' },
      { input: '0',    output: 'true'  },
      { input: '11',   output: 'true'  },
      { input: '1221', output: 'true'  },
    ],
  },

  // ──────────────────────────────────────────────────────────
  // 5. FIBONACCI NUMBER  (Easy)
  // ──────────────────────────────────────────────────────────
  {
    title: 'Fibonacci Number',
    statement: `The Fibonacci numbers, commonly denoted F(n), form a sequence, called the Fibonacci sequence, such that each number is the sum of the two preceding ones, starting from 0 and 1.

F(0) = 0, F(1) = 1
F(n) = F(n - 1) + F(n - 2), for n > 1.

Given n, calculate F(n).`,
    difficulty: 'Easy',
    tags: ['Math', 'Dynamic Programming', 'Recursion'],
    constraints: '0 <= n <= 30',
    examples: [
      { input: 'n = 2', output: '1', explanation: 'F(2) = F(1) + F(0) = 1 + 0 = 1.' },
      { input: 'n = 4', output: '3', explanation: 'F(4) = F(3) + F(2) = 2 + 1 = 3.' },
    ],
    starterCode: {
      cpp: `class Solution {
public:
    int fib(int n) {

    }
};`,
      java: `class Solution {
    public int fib(int n) {

    }
}`,
      python: `class Solution:
    def fib(self, n: int) -> int:
        pass`,
      javascript: `/**
 * @param {number} n
 * @return {number}
 */
var fib = function(n) {
};`,
    },
    driverCode: {
      cpp: `#include <bits/stdc++.h>
using namespace std;

{{USER_CODE}}

int main() {
    int n; cin >> n;
    Solution sol;
    cout << sol.fib(n) << endl;
    return 0;
}`,
      java: `import java.util.*;

{{USER_CODE}}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        Solution sol = new Solution();
        System.out.println(sol.fib(n));
    }
}`,
      python: `import sys

{{USER_CODE}}

def main():
    n = int(sys.stdin.read().strip())
    sol = Solution()
    print(sol.fib(n))

main()`,
      javascript: `const readline = require('readline');

{{USER_CODE}}

const rl = readline.createInterface({ input: process.stdin });
const lines = [];
rl.on('line', l => lines.push(l.trim()));
rl.on('close', () => {
    console.log(fib(parseInt(lines[0])));
});`,
    },
    visibleTestCases: [
      { input: '2', output: '1' },
      { input: '4', output: '3' },
    ],
    hiddenTestCases: [
      { input: '0',  output: '0'  },
      { input: '1',  output: '1'  },
      { input: '7',  output: '13' },
      { input: '10', output: '55' },
    ],
  },

  // ──────────────────────────────────────────────────────────
  // 6. MISSING NUMBER  (Easy)
  // ──────────────────────────────────────────────────────────
  {
    title: 'Missing Number',
    statement: `Given an array nums containing n distinct numbers in the range [0, n], return the only number in the range that is missing from the array.`,
    difficulty: 'Easy',
    tags: ['Array', 'Math', 'Bit Manipulation'],
    constraints: 'n == nums.length\n1 <= n <= 10^4\n0 <= nums[i] <= n\nAll the numbers of nums are unique.',
    examples: [
      { input: 'nums = [3,0,1]',         output: '2', explanation: 'n = 3. The numbers in range [0,3] are [0,1,2,3]. 2 is missing.' },
      { input: 'nums = [9,6,4,2,3,5,7,0,1]', output: '8', explanation: 'n = 9. The number 8 is the missing one.' },
    ],
    starterCode: {
      cpp: `class Solution {
public:
    int missingNumber(vector<int>& nums) {

    }
};`,
      java: `class Solution {
    public int missingNumber(int[] nums) {

    }
}`,
      python: `from typing import List

class Solution:
    def missingNumber(self, nums: List[int]) -> int:
        pass`,
      javascript: `/**
 * @param {number[]} nums
 * @return {number}
 */
var missingNumber = function(nums) {
};`,
    },
    driverCode: {
      cpp: `#include <bits/stdc++.h>
using namespace std;

{{USER_CODE}}

int main() {
    int n; cin >> n;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    Solution sol;
    cout << sol.missingNumber(nums) << endl;
    return 0;
}`,
      java: `import java.util.*;

{{USER_CODE}}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
        Solution sol = new Solution();
        System.out.println(sol.missingNumber(nums));
    }
}`,
      python: `import sys
from typing import List

{{USER_CODE}}

def main():
    data = sys.stdin.read().split()
    n = int(data[0])
    nums = [int(data[i+1]) for i in range(n)]
    sol = Solution()
    print(sol.missingNumber(nums))

main()`,
      javascript: `const readline = require('readline');

{{USER_CODE}}

const rl = readline.createInterface({ input: process.stdin });
const lines = [];
rl.on('line', l => lines.push(l.trim()));
rl.on('close', () => {
    const n = parseInt(lines[0]);
    const nums = lines[1].split(' ').map(Number);
    console.log(missingNumber(nums));
});`,
    },
    visibleTestCases: [
      { input: '3\n3 0 1', output: '2' },
      { input: '2\n0 1',   output: '2' },
    ],
    hiddenTestCases: [
      { input: '9\n9 6 4 2 3 5 7 0 1', output: '8' },
      { input: '1\n0',                  output: '1' },
      { input: '4\n0 1 2 4',            output: '3' },
    ],
  },

  // ──────────────────────────────────────────────────────────
  // 7. CLIMBING STAIRS  (Easy)
  // ──────────────────────────────────────────────────────────
  {
    title: 'Climbing Stairs',
    statement: `You are climbing a staircase. It takes n steps to reach the top.

Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?`,
    difficulty: 'Easy',
    tags: ['Math', 'Dynamic Programming', 'Memoization'],
    constraints: '1 <= n <= 45',
    examples: [
      { input: 'n = 2', output: '2', explanation: 'Two ways to climb: (1 + 1) or (2).' },
      { input: 'n = 3', output: '3', explanation: 'Three ways: (1+1+1), (1+2), or (2+1).' },
    ],
    starterCode: {
      cpp: `class Solution {
public:
    int climbStairs(int n) {

    }
};`,
      java: `class Solution {
    public int climbStairs(int n) {

    }
}`,
      python: `class Solution:
    def climbStairs(self, n: int) -> int:
        pass`,
      javascript: `/**
 * @param {number} n
 * @return {number}
 */
var climbStairs = function(n) {
};`,
    },
    driverCode: {
      cpp: `#include <bits/stdc++.h>
using namespace std;

{{USER_CODE}}

int main() {
    int n; cin >> n;
    Solution sol;
    cout << sol.climbStairs(n) << endl;
    return 0;
}`,
      java: `import java.util.*;

{{USER_CODE}}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        Solution sol = new Solution();
        System.out.println(sol.climbStairs(n));
    }
}`,
      python: `import sys

{{USER_CODE}}

def main():
    n = int(sys.stdin.read().strip())
    sol = Solution()
    print(sol.climbStairs(n))

main()`,
      javascript: `const readline = require('readline');

{{USER_CODE}}

const rl = readline.createInterface({ input: process.stdin });
const lines = [];
rl.on('line', l => lines.push(l.trim()));
rl.on('close', () => {
    console.log(climbStairs(parseInt(lines[0])));
});`,
    },
    visibleTestCases: [
      { input: '2', output: '2' },
      { input: '3', output: '3' },
    ],
    hiddenTestCases: [
      { input: '1',  output: '1'  },
      { input: '5',  output: '8'  },
      { input: '10', output: '89' },
    ],
  },

  // ──────────────────────────────────────────────────────────
  // 8. BEST TIME TO BUY AND SELL STOCK  (Easy)
  // ──────────────────────────────────────────────────────────
  {
    title: 'Best Time to Buy and Sell Stock',
    statement: `You are given an array prices where prices[i] is the price of a given stock on the ith day.

You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.

Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.`,
    difficulty: 'Easy',
    tags: ['Array', 'Dynamic Programming'],
    constraints: '1 <= prices.length <= 10^5\n0 <= prices[i] <= 10^4',
    examples: [
      { input: 'prices = [7,1,5,3,6,4]', output: '5', explanation: 'Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.' },
      { input: 'prices = [7,6,4,3,1]',   output: '0', explanation: 'No transactions done, max profit = 0.' },
    ],
    starterCode: {
      cpp: `class Solution {
public:
    int maxProfit(vector<int>& prices) {

    }
};`,
      java: `class Solution {
    public int maxProfit(int[] prices) {

    }
}`,
      python: `from typing import List

class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        pass`,
      javascript: `/**
 * @param {number[]} prices
 * @return {number}
 */
var maxProfit = function(prices) {
};`,
    },
    driverCode: {
      cpp: `#include <bits/stdc++.h>
using namespace std;

{{USER_CODE}}

int main() {
    int n; cin >> n;
    vector<int> prices(n);
    for (int i = 0; i < n; i++) cin >> prices[i];
    Solution sol;
    cout << sol.maxProfit(prices) << endl;
    return 0;
}`,
      java: `import java.util.*;

{{USER_CODE}}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] prices = new int[n];
        for (int i = 0; i < n; i++) prices[i] = sc.nextInt();
        Solution sol = new Solution();
        System.out.println(sol.maxProfit(prices));
    }
}`,
      python: `import sys
from typing import List

{{USER_CODE}}

def main():
    data = sys.stdin.read().split()
    n = int(data[0])
    prices = [int(data[i+1]) for i in range(n)]
    sol = Solution()
    print(sol.maxProfit(prices))

main()`,
      javascript: `const readline = require('readline');

{{USER_CODE}}

const rl = readline.createInterface({ input: process.stdin });
const lines = [];
rl.on('line', l => lines.push(l.trim()));
rl.on('close', () => {
    const n = parseInt(lines[0]);
    const prices = lines[1].split(' ').map(Number);
    console.log(maxProfit(prices));
});`,
    },
    visibleTestCases: [
      { input: '6\n7 1 5 3 6 4', output: '5' },
      { input: '5\n7 6 4 3 1',   output: '0' },
    ],
    hiddenTestCases: [
      { input: '6\n1 2 3 4 5 6', output: '5' },
      { input: '4\n2 4 1 7',     output: '6' },
      { input: '1\n5',           output: '0' },
    ],
  },

  // ──────────────────────────────────────────────────────────
  // 9. LONGEST SUBSTRING WITHOUT REPEATING CHARACTERS  (Medium)
  // ──────────────────────────────────────────────────────────
  {
    title: 'Longest Substring Without Repeating Characters',
    statement: `Given a string s, find the length of the longest substring without duplicate characters.`,
    difficulty: 'Medium',
    tags: ['Hash Table', 'String', 'Sliding Window'],
    constraints: '0 <= s.length <= 5 * 10^4\ns consists of English letters, digits, symbols and spaces.',
    examples: [
      { input: 's = "abcabcbb"', output: '3', explanation: 'The answer is "abc", with the length of 3.' },
      { input: 's = "bbbbb"',    output: '1', explanation: 'The answer is "b", with the length of 1.' },
      { input: 's = "pwwkew"',   output: '3', explanation: 'The answer is "wke", with the length of 3.' },
    ],
    starterCode: {
      cpp: `class Solution {
public:
    int lengthOfLongestSubstring(string s) {

    }
};`,
      java: `class Solution {
    public int lengthOfLongestSubstring(String s) {

    }
}`,
      python: `class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        pass`,
      javascript: `/**
 * @param {string} s
 * @return {number}
 */
var lengthOfLongestSubstring = function(s) {
};`,
    },
    driverCode: {
      cpp: `#include <bits/stdc++.h>
using namespace std;

{{USER_CODE}}

int main() {
    string s; getline(cin, s);
    Solution sol;
    cout << sol.lengthOfLongestSubstring(s) << endl;
    return 0;
}`,
      java: `import java.util.*;

{{USER_CODE}}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.nextLine();
        Solution sol = new Solution();
        System.out.println(sol.lengthOfLongestSubstring(s));
    }
}`,
      python: `import sys

{{USER_CODE}}

def main():
    s = sys.stdin.read().strip()
    sol = Solution()
    print(sol.lengthOfLongestSubstring(s))

main()`,
      javascript: `const readline = require('readline');

{{USER_CODE}}

const rl = readline.createInterface({ input: process.stdin });
const lines = [];
rl.on('line', l => lines.push(l));
rl.on('close', () => {
    console.log(lengthOfLongestSubstring(lines[0] || ''));
});`,
    },
    visibleTestCases: [
      { input: 'abcabcbb', output: '3' },
      { input: 'bbbbb',    output: '1' },
    ],
    hiddenTestCases: [
      { input: 'pwwkew',   output: '3' },
      { input: 'abcdefgh', output: '8' },
      { input: 'dvdf',     output: '3' },
    ],
  },

  // ──────────────────────────────────────────────────────────
  // 10. CONTAINER WITH MOST WATER  (Medium)
  // ──────────────────────────────────────────────────────────
  {
    title: 'Container With Most Water',
    statement: `You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]).

Find two lines that together with the x-axis form a container, such that the container contains the most water.

Return the maximum amount of water a container can store.`,
    difficulty: 'Medium',
    tags: ['Array', 'Two Pointers', 'Greedy'],
    constraints: 'n == height.length\n2 <= n <= 10^5\n0 <= height[i] <= 10^4',
    examples: [
      { input: 'height = [1,8,6,2,5,4,8,3,7]', output: '49', explanation: 'The above vertical lines are represented by array [1,8,6,2,5,4,8,3,7]. Max area = min(8,7) * (8-1) = 49.' },
      { input: 'height = [1,1]', output: '1', explanation: '' },
    ],
    starterCode: {
      cpp: `class Solution {
public:
    int maxArea(vector<int>& height) {

    }
};`,
      java: `class Solution {
    public int maxArea(int[] height) {

    }
}`,
      python: `from typing import List

class Solution:
    def maxArea(self, height: List[int]) -> int:
        pass`,
      javascript: `/**
 * @param {number[]} height
 * @return {number}
 */
var maxArea = function(height) {
};`,
    },
    driverCode: {
      cpp: `#include <bits/stdc++.h>
using namespace std;

{{USER_CODE}}

int main() {
    int n; cin >> n;
    vector<int> h(n);
    for (int i = 0; i < n; i++) cin >> h[i];
    Solution sol;
    cout << sol.maxArea(h) << endl;
    return 0;
}`,
      java: `import java.util.*;

{{USER_CODE}}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] h = new int[n];
        for (int i = 0; i < n; i++) h[i] = sc.nextInt();
        Solution sol = new Solution();
        System.out.println(sol.maxArea(h));
    }
}`,
      python: `import sys
from typing import List

{{USER_CODE}}

def main():
    data = sys.stdin.read().split()
    n = int(data[0])
    h = [int(data[i+1]) for i in range(n)]
    sol = Solution()
    print(sol.maxArea(h))

main()`,
      javascript: `const readline = require('readline');

{{USER_CODE}}

const rl = readline.createInterface({ input: process.stdin });
const lines = [];
rl.on('line', l => lines.push(l.trim()));
rl.on('close', () => {
    const n = parseInt(lines[0]);
    const height = lines[1].split(' ').map(Number);
    console.log(maxArea(height));
});`,
    },
    visibleTestCases: [
      { input: '9\n1 8 6 2 5 4 8 3 7', output: '49' },
      { input: '2\n1 1',               output: '1'  },
    ],
    hiddenTestCases: [
      { input: '4\n4 3 2 1',       output: '4'  },
      { input: '6\n1 2 4 3 5 6',   output: '12' },
    ],
  },

  // ──────────────────────────────────────────────────────────
  // 11. MAXIMUM SUBARRAY  (Medium)
  // ──────────────────────────────────────────────────────────
  {
    title: 'Maximum Subarray',
    statement: `Given an integer array nums, find the subarray with the largest sum, and return its sum.`,
    difficulty: 'Medium',
    tags: ['Array', 'Divide and Conquer', 'Dynamic Programming'],
    constraints: '1 <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4',
    examples: [
      { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: 'The subarray [4,-1,2,1] has the largest sum 6.' },
      { input: 'nums = [1]',                       output: '1', explanation: '' },
      { input: 'nums = [5,4,-1,7,8]',              output: '23', explanation: 'The subarray [5,4,-1,7,8] has the largest sum 23.' },
    ],
    starterCode: {
      cpp: `class Solution {
public:
    int maxSubArray(vector<int>& nums) {

    }
};`,
      java: `class Solution {
    public int maxSubArray(int[] nums) {

    }
}`,
      python: `from typing import List

class Solution:
    def maxSubArray(self, nums: List[int]) -> int:
        pass`,
      javascript: `/**
 * @param {number[]} nums
 * @return {number}
 */
var maxSubArray = function(nums) {
};`,
    },
    driverCode: {
      cpp: `#include <bits/stdc++.h>
using namespace std;

{{USER_CODE}}

int main() {
    int n; cin >> n;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    Solution sol;
    cout << sol.maxSubArray(nums) << endl;
    return 0;
}`,
      java: `import java.util.*;

{{USER_CODE}}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
        Solution sol = new Solution();
        System.out.println(sol.maxSubArray(nums));
    }
}`,
      python: `import sys
from typing import List

{{USER_CODE}}

def main():
    data = sys.stdin.read().split()
    n = int(data[0])
    nums = [int(data[i+1]) for i in range(n)]
    sol = Solution()
    print(sol.maxSubArray(nums))

main()`,
      javascript: `const readline = require('readline');

{{USER_CODE}}

const rl = readline.createInterface({ input: process.stdin });
const lines = [];
rl.on('line', l => lines.push(l.trim()));
rl.on('close', () => {
    const n = parseInt(lines[0]);
    const nums = lines[1].split(' ').map(Number);
    console.log(maxSubArray(nums));
});`,
    },
    visibleTestCases: [
      { input: '9\n-2 1 -3 4 -1 2 1 -5 4', output: '6'  },
      { input: '1\n1',                       output: '1'  },
    ],
    hiddenTestCases: [
      { input: '5\n5 4 -1 7 8',  output: '23' },
      { input: '4\n-1 -2 -3 -4', output: '-1' },
      { input: '3\n-2 -1 -3',    output: '-1' },
    ],
  },

  // ──────────────────────────────────────────────────────────
  // 12. PRODUCT OF ARRAY EXCEPT SELF  (Medium)
  // ──────────────────────────────────────────────────────────
  {
    title: 'Product of Array Except Self',
    statement: `Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i].

The product of any prefix or suffix of nums is guaranteed to fit in a 32-bit integer.

You must write an algorithm that runs in O(n) time and without using the division operation.`,
    difficulty: 'Medium',
    tags: ['Array', 'Prefix Sum'],
    constraints: '2 <= nums.length <= 10^5\n-30 <= nums[i] <= 30\nThe product of any prefix or suffix of nums is guaranteed to fit in a 32-bit integer.',
    examples: [
      { input: 'nums = [1,2,3,4]',       output: '[24,12,8,6]', explanation: '' },
      { input: 'nums = [-1,1,0,-3,3]',   output: '[0,0,9,0,0]', explanation: '' },
    ],
    starterCode: {
      cpp: `class Solution {
public:
    vector<int> productExceptSelf(vector<int>& nums) {

    }
};`,
      java: `class Solution {
    public int[] productExceptSelf(int[] nums) {

    }
}`,
      python: `from typing import List

class Solution:
    def productExceptSelf(self, nums: List[int]) -> List[int]:
        pass`,
      javascript: `/**
 * @param {number[]} nums
 * @return {number[]}
 */
var productExceptSelf = function(nums) {
};`,
    },
    driverCode: {
      cpp: `#include <bits/stdc++.h>
using namespace std;

{{USER_CODE}}

int main() {
    int n; cin >> n;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    Solution sol;
    vector<int> result = sol.productExceptSelf(nums);
    for (int i = 0; i < (int)result.size(); i++) {
        if (i > 0) cout << " ";
        cout << result[i];
    }
    cout << endl;
    return 0;
}`,
      java: `import java.util.*;

{{USER_CODE}}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
        Solution sol = new Solution();
        int[] result = sol.productExceptSelf(nums);
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < result.length; i++) {
            if (i > 0) sb.append(' ');
            sb.append(result[i]);
        }
        System.out.println(sb.toString());
    }
}`,
      python: `import sys
from typing import List

{{USER_CODE}}

def main():
    data = sys.stdin.read().split()
    n = int(data[0])
    nums = [int(data[i+1]) for i in range(n)]
    sol = Solution()
    print(' '.join(map(str, sol.productExceptSelf(nums))))

main()`,
      javascript: `const readline = require('readline');

{{USER_CODE}}

const rl = readline.createInterface({ input: process.stdin });
const lines = [];
rl.on('line', l => lines.push(l.trim()));
rl.on('close', () => {
    const n = parseInt(lines[0]);
    const nums = lines[1].split(' ').map(Number);
    console.log(productExceptSelf(nums).join(' '));
});`,
    },
    visibleTestCases: [
      { input: '4\n1 2 3 4',       output: '24 12 8 6' },
      { input: '5\n-1 1 0 -3 3',   output: '0 0 9 0 0' },
    ],
    hiddenTestCases: [
      { input: '3\n2 3 4', output: '12 8 6' },
      { input: '2\n1 0',   output: '0 1'    },
    ],
  },

  // ──────────────────────────────────────────────────────────
  // 13. FIND MINIMUM IN ROTATED SORTED ARRAY  (Medium)
  // ──────────────────────────────────────────────────────────
  {
    title: 'Find Minimum in Rotated Sorted Array',
    statement: `Suppose an array of length n sorted in ascending order is rotated between 1 and n times. For example, the array nums = [0,1,2,4,5,6,7] might become [4,5,6,7,0,1,2] if it was rotated 4 times.

Given the sorted rotated array nums of unique elements, return the minimum element of this array.

You must write an algorithm that runs in O(log n) time.`,
    difficulty: 'Medium',
    tags: ['Array', 'Binary Search'],
    constraints: 'n == nums.length\n1 <= n <= 5000\n-5000 <= nums[i] <= 5000\nAll the integers of nums are unique.\nnums is sorted and rotated between 1 and n times.',
    examples: [
      { input: 'nums = [3,4,5,1,2]',             output: '1', explanation: 'The original array was [1,2,3,4,5] rotated 3 times.' },
      { input: 'nums = [4,5,6,7,0,1,2]',         output: '0', explanation: 'The original array was [0,1,2,4,5,6,7] rotated 4 times.' },
      { input: 'nums = [11,13,15,17]',            output: '11', explanation: 'The original array was [11,13,15,17] rotated 4 times.' },
    ],
    starterCode: {
      cpp: `class Solution {
public:
    int findMin(vector<int>& nums) {

    }
};`,
      java: `class Solution {
    public int findMin(int[] nums) {

    }
}`,
      python: `from typing import List

class Solution:
    def findMin(self, nums: List[int]) -> int:
        pass`,
      javascript: `/**
 * @param {number[]} nums
 * @return {number}
 */
var findMin = function(nums) {
};`,
    },
    driverCode: {
      cpp: `#include <bits/stdc++.h>
using namespace std;

{{USER_CODE}}

int main() {
    int n; cin >> n;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    Solution sol;
    cout << sol.findMin(nums) << endl;
    return 0;
}`,
      java: `import java.util.*;

{{USER_CODE}}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
        Solution sol = new Solution();
        System.out.println(sol.findMin(nums));
    }
}`,
      python: `import sys
from typing import List

{{USER_CODE}}

def main():
    data = sys.stdin.read().split()
    n = int(data[0])
    nums = [int(data[i+1]) for i in range(n)]
    sol = Solution()
    print(sol.findMin(nums))

main()`,
      javascript: `const readline = require('readline');

{{USER_CODE}}

const rl = readline.createInterface({ input: process.stdin });
const lines = [];
rl.on('line', l => lines.push(l.trim()));
rl.on('close', () => {
    const n = parseInt(lines[0]);
    const nums = lines[1].split(' ').map(Number);
    console.log(findMin(nums));
});`,
    },
    visibleTestCases: [
      { input: '5\n3 4 5 1 2',         output: '1'  },
      { input: '7\n4 5 6 7 0 1 2',     output: '0'  },
    ],
    hiddenTestCases: [
      { input: '1\n11',                 output: '11' },
      { input: '6\n6 1 2 3 4 5',       output: '1'  },
      { input: '4\n2 3 4 1',           output: '1'  },
    ],
  },

  // ──────────────────────────────────────────────────────────
  // 14. SEARCH IN ROTATED SORTED ARRAY  (Medium)
  // ──────────────────────────────────────────────────────────
  {
    title: 'Search in Rotated Sorted Array',
    statement: `There is an integer array nums sorted in ascending order (with distinct values).

Prior to being passed to your function, nums is possibly rotated at an unknown pivot index k (1 <= k < nums.length).

Given the array nums after the possible rotation and an integer target, return the index of target if it is in nums, or -1 if it is not in nums.

You must write an algorithm with O(log n) runtime complexity.`,
    difficulty: 'Medium',
    tags: ['Array', 'Binary Search'],
    constraints: '1 <= nums.length <= 5000\n-10^4 <= nums[i] <= 10^4\nAll values of nums are unique.\nnums is an ascending array that is possibly rotated.\n-10^4 <= target <= 10^4',
    examples: [
      { input: 'nums = [4,5,6,7,0,1,2], target = 0', output: '4', explanation: '' },
      { input: 'nums = [4,5,6,7,0,1,2], target = 3', output: '-1', explanation: '' },
      { input: 'nums = [1], target = 0',              output: '-1', explanation: '' },
    ],
    starterCode: {
      cpp: `class Solution {
public:
    int search(vector<int>& nums, int target) {

    }
};`,
      java: `class Solution {
    public int search(int[] nums, int target) {

    }
}`,
      python: `from typing import List

class Solution:
    def search(self, nums: List[int], target: int) -> int:
        pass`,
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
var search = function(nums, target) {
};`,
    },
    driverCode: {
      cpp: `#include <bits/stdc++.h>
using namespace std;

{{USER_CODE}}

int main() {
    int n; cin >> n;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    int target; cin >> target;
    Solution sol;
    cout << sol.search(nums, target) << endl;
    return 0;
}`,
      java: `import java.util.*;

{{USER_CODE}}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
        int target = sc.nextInt();
        Solution sol = new Solution();
        System.out.println(sol.search(nums, target));
    }
}`,
      python: `import sys
from typing import List

{{USER_CODE}}

def main():
    data = sys.stdin.read().split()
    n = int(data[0])
    nums = [int(data[i+1]) for i in range(n)]
    target = int(data[n+1])
    sol = Solution()
    print(sol.search(nums, target))

main()`,
      javascript: `const readline = require('readline');

{{USER_CODE}}

const rl = readline.createInterface({ input: process.stdin });
const lines = [];
rl.on('line', l => lines.push(l.trim()));
rl.on('close', () => {
    const n = parseInt(lines[0]);
    const nums = lines[1].split(' ').map(Number);
    const target = parseInt(lines[2]);
    console.log(search(nums, target));
});`,
    },
    visibleTestCases: [
      { input: '7\n4 5 6 7 0 1 2\n0', output: '4'  },
      { input: '7\n4 5 6 7 0 1 2\n3', output: '-1' },
    ],
    hiddenTestCases: [
      { input: '1\n1\n0',           output: '-1' },
      { input: '5\n1 3 5 7 9\n7',  output: '3'  },
      { input: '6\n6 1 2 3 4 5\n4', output: '4' },
    ],
  },

  // ──────────────────────────────────────────────────────────
  // 15. COIN CHANGE  (Medium)
  // ──────────────────────────────────────────────────────────
  {
    title: 'Coin Change',
    statement: `You are given an integer array coins representing coins of various denominations and an integer amount representing a total amount of money.

Return the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return -1.

You may assume that you have an infinite number of each kind of coin.`,
    difficulty: 'Medium',
    tags: ['Array', 'Dynamic Programming', 'Breadth-First Search'],
    constraints: '1 <= coins.length <= 12\n1 <= coins[i] <= 2^31 - 1\n0 <= amount <= 10^4',
    examples: [
      { input: 'coins = [1,2,5], amount = 11', output: '3', explanation: '11 = 5 + 5 + 1' },
      { input: 'coins = [2], amount = 3',       output: '-1', explanation: '' },
      { input: 'coins = [1], amount = 0',        output: '0', explanation: '' },
    ],
    starterCode: {
      cpp: `class Solution {
public:
    int coinChange(vector<int>& coins, int amount) {

    }
};`,
      java: `class Solution {
    public int coinChange(int[] coins, int amount) {

    }
}`,
      python: `from typing import List

class Solution:
    def coinChange(self, coins: List[int], amount: int) -> int:
        pass`,
      javascript: `/**
 * @param {number[]} coins
 * @param {number} amount
 * @return {number}
 */
var coinChange = function(coins, amount) {
};`,
    },
    driverCode: {
      cpp: `#include <bits/stdc++.h>
using namespace std;

{{USER_CODE}}

int main() {
    int n; cin >> n;
    vector<int> coins(n);
    for (int i = 0; i < n; i++) cin >> coins[i];
    int amount; cin >> amount;
    Solution sol;
    cout << sol.coinChange(coins, amount) << endl;
    return 0;
}`,
      java: `import java.util.*;

{{USER_CODE}}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] coins = new int[n];
        for (int i = 0; i < n; i++) coins[i] = sc.nextInt();
        int amount = sc.nextInt();
        Solution sol = new Solution();
        System.out.println(sol.coinChange(coins, amount));
    }
}`,
      python: `import sys
from typing import List

{{USER_CODE}}

def main():
    data = sys.stdin.read().split()
    n = int(data[0])
    coins = [int(data[i+1]) for i in range(n)]
    amount = int(data[n+1])
    sol = Solution()
    print(sol.coinChange(coins, amount))

main()`,
      javascript: `const readline = require('readline');

{{USER_CODE}}

const rl = readline.createInterface({ input: process.stdin });
const lines = [];
rl.on('line', l => lines.push(l.trim()));
rl.on('close', () => {
    const n = parseInt(lines[0]);
    const coins = lines[1].split(' ').map(Number);
    const amount = parseInt(lines[2]);
    console.log(coinChange(coins, amount));
});`,
    },
    visibleTestCases: [
      { input: '3\n1 5 11\n15', output: '3'  },
      { input: '3\n1 2 5\n11',  output: '3'  },
    ],
    hiddenTestCases: [
      { input: '2\n2 5\n3',   output: '-1' },
      { input: '1\n1\n0',    output: '0'  },
      { input: '3\n2 3 6\n12', output: '2' },
    ],
  },

  // ──────────────────────────────────────────────────────────
  // 16. LONGEST COMMON SUBSEQUENCE  (Medium)
  // ──────────────────────────────────────────────────────────
  {
    title: 'Longest Common Subsequence',
    statement: `Given two strings text1 and text2, return the length of their longest common subsequence. If there is no common subsequence, return 0.

A subsequence of a string is a new string generated from the original string with some characters (can be none) deleted without changing the relative order of the remaining characters.

A common subsequence of two strings is a subsequence that is common to both strings.`,
    difficulty: 'Medium',
    tags: ['String', 'Dynamic Programming'],
    constraints: '1 <= text1.length, text2.length <= 1000\ntext1 and text2 consist of only lowercase English characters.',
    examples: [
      { input: 'text1 = "abcde", text2 = "ace"', output: '3', explanation: 'The longest common subsequence is "ace" with length 3.' },
      { input: 'text1 = "abc", text2 = "abc"',   output: '3', explanation: 'The longest common subsequence is "abc" with length 3.' },
      { input: 'text1 = "abc", text2 = "def"',   output: '0', explanation: 'There is no common subsequence.' },
    ],
    starterCode: {
      cpp: `class Solution {
public:
    int longestCommonSubsequence(string text1, string text2) {

    }
};`,
      java: `class Solution {
    public int longestCommonSubsequence(String text1, String text2) {

    }
}`,
      python: `class Solution:
    def longestCommonSubsequence(self, text1: str, text2: str) -> int:
        pass`,
      javascript: `/**
 * @param {string} text1
 * @param {string} text2
 * @return {number}
 */
var longestCommonSubsequence = function(text1, text2) {
};`,
    },
    driverCode: {
      cpp: `#include <bits/stdc++.h>
using namespace std;

{{USER_CODE}}

int main() {
    string t1, t2;
    cin >> t1 >> t2;
    Solution sol;
    cout << sol.longestCommonSubsequence(t1, t2) << endl;
    return 0;
}`,
      java: `import java.util.*;

{{USER_CODE}}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String t1 = sc.next();
        String t2 = sc.next();
        Solution sol = new Solution();
        System.out.println(sol.longestCommonSubsequence(t1, t2));
    }
}`,
      python: `import sys

{{USER_CODE}}

def main():
    data = sys.stdin.read().split()
    t1 = data[0]
    t2 = data[1]
    sol = Solution()
    print(sol.longestCommonSubsequence(t1, t2))

main()`,
      javascript: `const readline = require('readline');

{{USER_CODE}}

const rl = readline.createInterface({ input: process.stdin });
const lines = [];
rl.on('line', l => lines.push(l.trim()));
rl.on('close', () => {
    console.log(longestCommonSubsequence(lines[0], lines[1]));
});`,
    },
    visibleTestCases: [
      { input: 'abcde\nace', output: '3' },
      { input: 'abc\nabc',   output: '3' },
    ],
    hiddenTestCases: [
      { input: 'abc\ndef',       output: '0' },
      { input: 'ezupkr\nubmrapg', output: '2' },
      { input: 'bl\nyby',        output: '1' },
    ],
  },

  // ──────────────────────────────────────────────────────────
  // 17. JUMP GAME  (Medium)
  // ──────────────────────────────────────────────────────────
  {
    title: 'Jump Game',
    statement: `You are given an integer array nums. You are initially positioned at the array's first index, and each element in the array represents your maximum jump length at that position.

Return true if you can reach the last index, or false otherwise.`,
    difficulty: 'Medium',
    tags: ['Array', 'Dynamic Programming', 'Greedy'],
    constraints: '1 <= nums.length <= 10^4\n0 <= nums[i] <= 10^5',
    examples: [
      { input: 'nums = [2,3,1,1,4]', output: 'true',  explanation: 'Jump 1 step from index 0 to 1, then 3 steps to the last index.' },
      { input: 'nums = [3,2,1,0,4]', output: 'false', explanation: 'You will always arrive at index 3 no matter what. Its maximum jump length is 0, which makes it impossible.' },
    ],
    starterCode: {
      cpp: `class Solution {
public:
    bool canJump(vector<int>& nums) {

    }
};`,
      java: `class Solution {
    public boolean canJump(int[] nums) {

    }
}`,
      python: `from typing import List

class Solution:
    def canJump(self, nums: List[int]) -> bool:
        pass`,
      javascript: `/**
 * @param {number[]} nums
 * @return {boolean}
 */
var canJump = function(nums) {
};`,
    },
    driverCode: {
      cpp: `#include <bits/stdc++.h>
using namespace std;

{{USER_CODE}}

int main() {
    int n; cin >> n;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    Solution sol;
    cout << (sol.canJump(nums) ? "true" : "false") << endl;
    return 0;
}`,
      java: `import java.util.*;

{{USER_CODE}}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
        Solution sol = new Solution();
        System.out.println(sol.canJump(nums) ? "true" : "false");
    }
}`,
      python: `import sys
from typing import List

{{USER_CODE}}

def main():
    data = sys.stdin.read().split()
    n = int(data[0])
    nums = [int(data[i+1]) for i in range(n)]
    sol = Solution()
    print("true" if sol.canJump(nums) else "false")

main()`,
      javascript: `const readline = require('readline');

{{USER_CODE}}

const rl = readline.createInterface({ input: process.stdin });
const lines = [];
rl.on('line', l => lines.push(l.trim()));
rl.on('close', () => {
    const n = parseInt(lines[0]);
    const nums = lines[1].split(' ').map(Number);
    console.log(canJump(nums) ? 'true' : 'false');
});`,
    },
    visibleTestCases: [
      { input: '5\n2 3 1 1 4', output: 'true'  },
      { input: '5\n3 2 1 0 4', output: 'false' },
    ],
    hiddenTestCases: [
      { input: '4\n0 2 3 4', output: 'false' },
      { input: '3\n3 2 1',   output: 'true'  },
      { input: '1\n0',       output: 'true'  },
    ],
  },

  // ──────────────────────────────────────────────────────────
  // 18. MAJORITY ELEMENT  (Easy)
  // ──────────────────────────────────────────────────────────
  {
    title: 'Majority Element',
    statement: `Given an array nums of size n, return the majority element.

The majority element is the element that appears more than n / 2 times. You may assume that the majority element always exists in the array.`,
    difficulty: 'Easy',
    tags: ['Array', 'Hash Table', 'Divide and Conquer', 'Sorting'],
    constraints: 'n == nums.length\n1 <= n <= 5 * 10^4\n-10^9 <= nums[i] <= 10^9',
    examples: [
      { input: 'nums = [3,2,3]',               output: '3', explanation: '' },
      { input: 'nums = [2,2,1,1,1,2,2]',       output: '2', explanation: '' },
    ],
    starterCode: {
      cpp: `class Solution {
public:
    int majorityElement(vector<int>& nums) {

    }
};`,
      java: `class Solution {
    public int majorityElement(int[] nums) {

    }
}`,
      python: `from typing import List

class Solution:
    def majorityElement(self, nums: List[int]) -> int:
        pass`,
      javascript: `/**
 * @param {number[]} nums
 * @return {number}
 */
var majorityElement = function(nums) {
};`,
    },
    driverCode: {
      cpp: `#include <bits/stdc++.h>
using namespace std;

{{USER_CODE}}

int main() {
    int n; cin >> n;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    Solution sol;
    cout << sol.majorityElement(nums) << endl;
    return 0;
}`,
      java: `import java.util.*;

{{USER_CODE}}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
        Solution sol = new Solution();
        System.out.println(sol.majorityElement(nums));
    }
}`,
      python: `import sys
from typing import List

{{USER_CODE}}

def main():
    data = sys.stdin.read().split()
    n = int(data[0])
    nums = [int(data[i+1]) for i in range(n)]
    sol = Solution()
    print(sol.majorityElement(nums))

main()`,
      javascript: `const readline = require('readline');

{{USER_CODE}}

const rl = readline.createInterface({ input: process.stdin });
const lines = [];
rl.on('line', l => lines.push(l.trim()));
rl.on('close', () => {
    const n = parseInt(lines[0]);
    const nums = lines[1].split(' ').map(Number);
    console.log(majorityElement(nums));
});`,
    },
    visibleTestCases: [
      { input: '3\n3 2 3',         output: '3' },
      { input: '7\n2 2 1 1 1 2 2', output: '2' },
    ],
    hiddenTestCases: [
      { input: '1\n1',             output: '1' },
      { input: '5\n5 5 5 1 2',     output: '5' },
    ],
  },

  // ──────────────────────────────────────────────────────────
  // 19. TRAPPING RAIN WATER  (Hard)
  // ──────────────────────────────────────────────────────────
  {
    title: 'Trapping Rain Water',
    statement: `Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.`,
    difficulty: 'Hard',
    tags: ['Array', 'Two Pointers', 'Dynamic Programming', 'Stack'],
    constraints: 'n == height.length\n1 <= n <= 2 * 10^4\n0 <= height[i] <= 10^5',
    examples: [
      { input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]', output: '6', explanation: 'The elevation map is represented by [0,1,0,2,1,0,1,3,2,1,2,1] and 6 units of rain water are trapped.' },
      { input: 'height = [4,2,0,3,2,5]',              output: '9', explanation: '' },
    ],
    starterCode: {
      cpp: `class Solution {
public:
    int trap(vector<int>& height) {

    }
};`,
      java: `class Solution {
    public int trap(int[] height) {

    }
}`,
      python: `from typing import List

class Solution:
    def trap(self, height: List[int]) -> int:
        pass`,
      javascript: `/**
 * @param {number[]} height
 * @return {number}
 */
var trap = function(height) {
};`,
    },
    driverCode: {
      cpp: `#include <bits/stdc++.h>
using namespace std;

{{USER_CODE}}

int main() {
    int n; cin >> n;
    vector<int> height(n);
    for (int i = 0; i < n; i++) cin >> height[i];
    Solution sol;
    cout << sol.trap(height) << endl;
    return 0;
}`,
      java: `import java.util.*;

{{USER_CODE}}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] height = new int[n];
        for (int i = 0; i < n; i++) height[i] = sc.nextInt();
        Solution sol = new Solution();
        System.out.println(sol.trap(height));
    }
}`,
      python: `import sys
from typing import List

{{USER_CODE}}

def main():
    data = sys.stdin.read().split()
    n = int(data[0])
    height = [int(data[i+1]) for i in range(n)]
    sol = Solution()
    print(sol.trap(height))

main()`,
      javascript: `const readline = require('readline');

{{USER_CODE}}

const rl = readline.createInterface({ input: process.stdin });
const lines = [];
rl.on('line', l => lines.push(l.trim()));
rl.on('close', () => {
    const n = parseInt(lines[0]);
    const height = lines[1].split(' ').map(Number);
    console.log(trap(height));
});`,
    },
    visibleTestCases: [
      { input: '12\n0 1 0 2 1 0 1 3 2 1 2 1', output: '6' },
      { input: '6\n4 2 0 3 2 5',              output: '9' },
    ],
    hiddenTestCases: [
      { input: '4\n3 0 2 0', output: '2' },
      { input: '3\n1 0 1',   output: '1' },
      { input: '4\n0 0 0 0', output: '0' },
    ],
  },

  // ──────────────────────────────────────────────────────────
  // 20. FIRST MISSING POSITIVE  (Hard)
  // ──────────────────────────────────────────────────────────
  {
    title: 'First Missing Positive',
    statement: `Given an unsorted integer array nums, return the smallest missing positive integer.

You must implement an algorithm that runs in O(n) time and uses O(1) auxiliary space.`,
    difficulty: 'Hard',
    tags: ['Array', 'Hash Table'],
    constraints: '1 <= nums.length <= 10^5\n-2^31 <= nums[i] <= 2^31 - 1',
    examples: [
      { input: 'nums = [1,2,0]',        output: '3', explanation: 'The numbers in the range [1,2] are all in the array. The smallest missing positive integer is 3.' },
      { input: 'nums = [3,4,-1,1]',     output: '2', explanation: '1 is in the array but 2 is missing.' },
      { input: 'nums = [7,8,9,11,12]',  output: '1', explanation: 'The smallest positive integer 1 is missing.' },
    ],
    starterCode: {
      cpp: `class Solution {
public:
    int firstMissingPositive(vector<int>& nums) {

    }
};`,
      java: `class Solution {
    public int firstMissingPositive(int[] nums) {

    }
}`,
      python: `from typing import List

class Solution:
    def firstMissingPositive(self, nums: List[int]) -> int:
        pass`,
      javascript: `/**
 * @param {number[]} nums
 * @return {number}
 */
var firstMissingPositive = function(nums) {
};`,
    },
    driverCode: {
      cpp: `#include <bits/stdc++.h>
using namespace std;

{{USER_CODE}}

int main() {
    int n; cin >> n;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    Solution sol;
    cout << sol.firstMissingPositive(nums) << endl;
    return 0;
}`,
      java: `import java.util.*;

{{USER_CODE}}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
        Solution sol = new Solution();
        System.out.println(sol.firstMissingPositive(nums));
    }
}`,
      python: `import sys
from typing import List

{{USER_CODE}}

def main():
    data = sys.stdin.read().split()
    n = int(data[0])
    nums = [int(data[i+1]) for i in range(n)]
    sol = Solution()
    print(sol.firstMissingPositive(nums))

main()`,
      javascript: `const readline = require('readline');

{{USER_CODE}}

const rl = readline.createInterface({ input: process.stdin });
const lines = [];
rl.on('line', l => lines.push(l.trim()));
rl.on('close', () => {
    const n = parseInt(lines[0]);
    const nums = lines[1].split(' ').map(Number);
    console.log(firstMissingPositive(nums));
});`,
    },
    visibleTestCases: [
      { input: '3\n1 2 0',        output: '3' },
      { input: '4\n3 4 -1 1',     output: '2' },
    ],
    hiddenTestCases: [
      { input: '5\n7 8 9 11 12',   output: '1' },
      { input: '1\n1',             output: '2' },
      { input: '4\n1 2 3 4',       output: '5' },
    ],
  },
];

// ============================================================
// SEED RUNNER
// ============================================================

async function seed() {
  try {
    console.log('\n🚀 AlgoVerse Problem Seed Script\n' + '─'.repeat(40));
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // ── 1. Find or create seed admin ──────────────────────────
    let admin = await User.findOne({ email: ADMIN_EMAIL });
    if (!admin) {
      admin = await User.create({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD, // hashed by pre-save hook
        role: 'admin',
      });
      console.log(`✅ Admin created  →  ${ADMIN_EMAIL}`);
    } else {
      console.log(`✅ Admin found    →  ${ADMIN_EMAIL}`);
    }

    // ── 2. Optional clear ─────────────────────────────────────
    if (process.argv.includes('--clear')) {
      const { deletedCount } = await Problem.deleteMany({});
      console.log(`🗑️  Cleared ${deletedCount} existing problem(s)\n`);
    }

    // ── 3. Insert problems (skip existing by title) ───────────
    let inserted = 0;
    let skipped  = 0;

    for (const p of problems) {
      const exists = await Problem.findOne({ title: p.title }).lean();
      if (exists) {
        console.log(`⏭️  Skip  →  ${p.title}`);
        skipped++;
        continue;
      }
      await Problem.create({ ...p, createdBy: admin._id });
      console.log(`✅ Added →  [${p.difficulty}] ${p.title}`);
      inserted++;
    }

    console.log('\n' + '─'.repeat(40));
    console.log(`🎉 Done!  Inserted: ${inserted}  |  Skipped: ${skipped}`);
    console.log('─'.repeat(40) + '\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Seed failed:', err.message);
    if (err.stack) console.error(err.stack);
    process.exit(1);
  }
}

seed();
