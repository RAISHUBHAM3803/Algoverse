/**
 * Dynamic Driver Code Generator
 * Generates LeetCode-style hidden driver code for each language
 * by reading the problem's metaData (function name, param types, return type).
 * 
 * Supports: integer, integer[], string, string[], boolean, boolean[], 
 *           long, double, character, character[], ListNode, TreeNode
 */

// ─── TYPE MAPPINGS ──────────────────────────────────────────────────────────

const CPP_TYPES = {
  'integer':     'int',
  'long':        'long long',
  'double':      'double',
  'float':       'float',
  'boolean':     'bool',
  'character':   'char',
  'string':      'string',
  'integer[]':   'vector<int>',
  'long[]':      'vector<long long>',
  'double[]':    'vector<double>',
  'boolean[]':   'vector<bool>',
  'character[]': 'vector<char>',
  'string[]':    'vector<string>',
  'integer[][]': 'vector<vector<int>>',
  'string[][]':  'vector<vector<string>>',
  'ListNode*':   'ListNode*',
  'TreeNode*':   'TreeNode*',
};

const JAVA_TYPES = {
  'integer':     'int',
  'long':        'long',
  'double':      'double',
  'float':       'float',
  'boolean':     'boolean',
  'character':   'char',
  'string':      'String',
  'integer[]':   'int[]',
  'long[]':      'long[]',
  'double[]':    'double[]',
  'boolean[]':   'boolean[]',
  'character[]': 'char[]',
  'string[]':    'String[]',
  'integer[][]': 'int[][]',
  'string[][]':  'String[][]',
};

// ─── C++ DRIVER GENERATOR ───────────────────────────────────────────────────

function generateCppDriver(meta) {
  const { name, params, return: ret } = meta;
  
  const includes = [
    '#include <bits/stdc++.h>',
    'using namespace std;',
    '',
  ];

  // Parse helpers
  const parseHelpers = `
// ── Input Parsers ──
vector<int> parseIntArray(const string& s) {
    vector<int> v;
    string t = s;
    t.erase(remove(t.begin(), t.end(), '['), t.end());
    t.erase(remove(t.begin(), t.end(), ']'), t.end());
    stringstream ss(t);
    string item;
    while (getline(ss, item, ',')) {
        item.erase(remove_if(item.begin(), item.end(), ::isspace), item.end());
        if (!item.empty()) v.push_back(stoi(item));
    }
    return v;
}
vector<long long> parseLongArray(const string& s) {
    vector<long long> v;
    string t = s;
    t.erase(remove(t.begin(), t.end(), '['), t.end());
    t.erase(remove(t.begin(), t.end(), ']'), t.end());
    stringstream ss(t);
    string item;
    while (getline(ss, item, ',')) {
        item.erase(remove_if(item.begin(), item.end(), ::isspace), item.end());
        if (!item.empty()) v.push_back(stoll(item));
    }
    return v;
}
vector<string> parseStringArray(const string& s) {
    vector<string> v;
    string t = s.substr(1, s.size()-2);
    int depth = 0; string cur = "";
    bool inq = false;
    for (char c : t) {
        if (c == '"' && depth == 0) { inq = !inq; continue; }
        if (!inq && c == ',') { v.push_back(cur); cur = ""; }
        else cur += c;
    }
    if (!cur.empty()) v.push_back(cur);
    return v;
}
vector<vector<int>> parseInt2DArray(const string& s) {
    vector<vector<int>> result;
    // find inner arrays
    int i = 0, n = s.size();
    while (i < n) {
        if (s[i] == '[') {
            int j = s.find(']', i);
            if (j != string::npos) {
                result.push_back(parseIntArray(s.substr(i, j-i+1)));
                i = j+1;
            } else break;
        } else i++;
    }
    return result;
}
string parseString(const string& s) {
    if (s.size() >= 2 && s.front() == '"' && s.back() == '"')
        return s.substr(1, s.size()-2);
    return s;
}

// ── Output Printers ──
template<typename T>
void printVector(const vector<T>& v) {
    cout << "[";
    for (int i = 0; i < v.size(); i++) {
        if (i) cout << ",";
        cout << v[i];
    }
    cout << "]" << endl;
}
void print2DVector(const vector<vector<int>>& v) {
    cout << "[";
    for (int i = 0; i < v.size(); i++) {
        if (i) cout << ",";
        cout << "[";
        for (int j = 0; j < v[i].size(); j++) {
            if (j) cout << ",";
            cout << v[i][j];
        }
        cout << "]";
    }
    cout << "]" << endl;
}
// ── Custom Data Structures ──
struct ListNode {
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode *next) : val(x), next(next) {}
};
struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode() : val(0), left(nullptr), right(nullptr) {}
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
    TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
};
ListNode* buildList(const vector<int>& v) {
    ListNode dummy(0);
    ListNode* curr = &dummy;
    for (int x : v) { curr->next = new ListNode(x); curr = curr->next; }
    return dummy.next;
}
void printList(ListNode* head) {
    cout << "[";
    while (head) { cout << head->val; if (head->next) cout << ","; head = head->next; }
    cout << "]" << endl;
}
vector<string> parseTreeArray(const string& s) {
    vector<string> v;
    string t = s;
    t.erase(remove(t.begin(), t.end(), '['), t.end());
    t.erase(remove(t.begin(), t.end(), ']'), t.end());
    stringstream ss(t);
    string item;
    while (getline(ss, item, ',')) {
        item.erase(remove_if(item.begin(), item.end(), ::isspace), item.end());
        if (!item.empty()) v.push_back(item);
    }
    return v;
}
TreeNode* buildTree(const vector<string>& v) {
    if (v.empty() || v[0] == "null") return nullptr;
    TreeNode* root = new TreeNode(stoi(v[0]));
    queue<TreeNode*> q;
    q.push(root);
    int i = 1;
    while (!q.empty() && i < v.size()) {
        TreeNode* curr = q.front(); q.pop();
        if (v[i] != "null") { curr->left = new TreeNode(stoi(v[i])); q.push(curr->left); }
        i++;
        if (i < v.size() && v[i] != "null") { curr->right = new TreeNode(stoi(v[i])); q.push(curr->right); }
        i++;
    }
    return root;
}
void printTree(TreeNode* root) {
    if (!root) { cout << "[]" << endl; return; }
    vector<string> res;
    queue<TreeNode*> q;
    q.push(root);
    while (!q.empty()) {
        TreeNode* curr = q.front(); q.pop();
        if (curr) { res.push_back(to_string(curr->val)); q.push(curr->left); q.push(curr->right); }
        else { res.push_back("null"); }
    }
    while (!res.empty() && res.back() == "null") res.pop_back();
    cout << "[";
    for (int i = 0; i < res.size(); i++) { if (i) cout << ","; cout << res[i]; }
    cout << "]" << endl;
}
void printBool(bool b) { cout << (b ? "true" : "false") << endl; }
`;

  // Generate param reading
  const paramReads = params.map((p, i) => {
    const type = p.type.toLowerCase();
    const varName = `arg${i}`;
    const lines = [`    string raw${i}; getline(cin, raw${i});`];
    
    if (type === 'integer' || type === 'int') {
      lines.push(`    int ${varName} = stoi(raw${i});`);
    } else if (type === 'long') {
      lines.push(`    long long ${varName} = stoll(raw${i});`);
    } else if (type === 'double' || type === 'float') {
      lines.push(`    double ${varName} = stod(raw${i});`);
    } else if (type === 'boolean') {
      lines.push(`    bool ${varName} = (raw${i} == "true");`);
    } else if (type === 'character') {
      lines.push(`    char ${varName} = raw${i}[0];`);
    } else if (type === 'string') {
      lines.push(`    string ${varName} = parseString(raw${i});`);
    } else if (type === 'integer[]') {
      lines.push(`    vector<int> ${varName} = parseIntArray(raw${i});`);
    } else if (type === 'long[]') {
      lines.push(`    vector<long long> ${varName} = parseLongArray(raw${i});`);
    } else if (type === 'string[]') {
      lines.push(`    vector<string> ${varName} = parseStringArray(raw${i});`);
    } else if (type === 'integer[][]') {
      lines.push(`    vector<vector<int>> ${varName} = parseInt2DArray(raw${i});`);
    } else if (type === 'listnode') {
      lines.push(`    ListNode* ${varName} = buildList(parseIntArray(raw${i}));`);
    } else if (type === 'treenode') {
      lines.push(`    TreeNode* ${varName} = buildTree(parseTreeArray(raw${i}));`);
    } else {
      // Fallback: treat as string
      lines.push(`    string ${varName} = raw${i};`);
    }
    return lines.join('\n');
  });

  const callArgs = params.map((_, i) => `arg${i}`).join(', ');
  
  // Generate result printing
  const retType = (ret?.type || 'void').toLowerCase();
  let resultPrint = '';
  if (retType === 'integer' || retType === 'int') {
    resultPrint = `    cout << result << endl;`;
  } else if (retType === 'long') {
    resultPrint = `    cout << result << endl;`;
  } else if (retType === 'double' || retType === 'float') {
    resultPrint = `    cout << fixed << setprecision(5) << result << endl;`;
  } else if (retType === 'boolean') {
    resultPrint = `    printBool(result);`;
  } else if (retType === 'string') {
    resultPrint = `    cout << result << endl;`;
  } else if (retType.includes('[][]') || retType.startsWith('list<list<')) {
    resultPrint = `    print2DVector(result);`;
  } else if (retType.includes('[]') || retType.startsWith('list<')) {
    resultPrint = `    printVector(result);`;
  } else if (retType === 'listnode') {
    resultPrint = `    printList(result);`;
  } else if (retType === 'treenode') {
    resultPrint = `    printTree(result);`;
  } else if (retType === 'void') {
    resultPrint = `    // void return`;
  } else {
    resultPrint = `    cout << result << endl;`;
  }

  const main = `
{{USER_CODE}}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    Solution sol;
${paramReads.join('\n')}
    auto result = sol.${name}(${callArgs});
${resultPrint}
    return 0;
}`;

  return includes.join('\n') + parseHelpers + main;
}

// ─── PYTHON DRIVER GENERATOR ────────────────────────────────────────────────

function generatePythonDriver(meta) {
  const { name, params, return: ret } = meta;

  const parseStatements = params.map((p, i) => {
    const type = p.type.toLowerCase();
    const varName = `arg${i}`;
    const lines = [`    raw${i} = input().strip()`];
    
    if (type === 'integer' || type === 'int') {
      lines.push(`    ${varName} = int(raw${i})`);
    } else if (type === 'long') {
      lines.push(`    ${varName} = int(raw${i})`);
    } else if (type === 'double' || type === 'float') {
      lines.push(`    ${varName} = float(raw${i})`);
    } else if (type === 'boolean') {
      lines.push(`    ${varName} = raw${i}.lower() == 'true'`);
    } else if (type === 'string') {
      lines.push(`    ${varName} = raw${i}.strip('"')`);
    } else if (type === 'character') {
      lines.push(`    ${varName} = raw${i}[0]`);
    } else if (type === 'integer[]') {
      lines.push(`    ${varName} = list(map(int, raw${i}.strip('[]').split(','))) if raw${i}.strip('[]') else []`);
    } else if (type === 'long[]') {
      lines.push(`    ${varName} = list(map(int, raw${i}.strip('[]').split(','))) if raw${i}.strip('[]') else []`);
    } else if (type === 'double[]') {
      lines.push(`    ${varName} = list(map(float, raw${i}.strip('[]').split(','))) if raw${i}.strip('[]') else []`);
    } else if (type === 'boolean[]') {
      lines.push(`    ${varName} = [x.strip().lower() == 'true' for x in raw${i}.strip('[]').split(',')]`);
    } else if (type === 'string[]') {
      lines.push(`    import json`);
      lines.push(`    ${varName} = json.loads(raw${i})`);
    } else if (type === 'integer[][]') {
      lines.push(`    import json`);
      lines.push(`    ${varName} = json.loads(raw${i})`);
    } else if (type === 'string[][]') {
      lines.push(`    import json`);
      lines.push(`    ${varName} = json.loads(raw${i})`);
    } else if (type === 'listnode') {
      lines.push(`    import json`);
      lines.push(`    ${varName} = build_list(json.loads(raw${i}))`);
    } else if (type === 'treenode') {
      lines.push(`    import json`);
      lines.push(`    ${varName} = build_tree(json.loads(raw${i}))`);
    } else {
      lines.push(`    ${varName} = raw${i}`);
    }
    return lines.join('\n');
  });

  const callArgs = params.map((_, i) => `arg${i}`).join(', ');
  
  const retType = (ret?.type || 'void').toLowerCase();
  let resultPrint = '';
  if (retType === 'boolean') {
    resultPrint = `    print(str(result).lower())`;
  } else if (retType.endsWith('[]') || retType.endsWith('[][]')) {
    resultPrint = `    print(result)`;
  } else if (retType === 'listnode') {
    resultPrint = `    print_list(result)`;
  } else if (retType === 'treenode') {
    resultPrint = `    print_tree(result)`;
  } else {
    resultPrint = `    print(result)`;
  }

  return `
import json
from typing import List, Optional

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def build_list(arr):
    if not arr: return None
    head = ListNode(arr[0])
    curr = head
    for val in arr[1:]:
        curr.next = ListNode(val)
        curr = curr.next
    return head

def print_list(head):
    res = []
    while head:
        res.append(head.val)
        head = head.next
    # print strictly json array format for stdout matching
    print(json.dumps(res))

def build_tree(arr):
    if not arr or arr[0] is None: return None
    root = TreeNode(arr[0])
    q = [root]
    i = 1
    while q and i < len(arr):
        curr = q.pop(0)
        if i < len(arr) and arr[i] is not None:
            curr.left = TreeNode(arr[i])
            q.append(curr.left)
        i += 1
        if i < len(arr) and arr[i] is not None:
            curr.right = TreeNode(arr[i])
            q.append(curr.right)
        i += 1
    return root

def print_tree(root):
    if not root:
        print("[]")
        return
    res = []
    q = [root]
    while q:
        curr = q.pop(0)
        if curr:
            res.append(curr.val)
            q.append(curr.left)
            q.append(curr.right)
        else:
            res.append(None)
    while res and res[-1] is None:
        res.pop()
    print(json.dumps(res))

{{USER_CODE}}

if __name__ == '__main__':
    import sys
    from typing import List, Optional
    sol = Solution()
${parseStatements.join('\n')}
    result = sol.${name}(${callArgs})
${resultPrint}`;
}

// ─── JAVASCRIPT DRIVER GENERATOR ────────────────────────────────────────────

function generateJavaScriptDriver(meta) {
  const { name, params, return: ret } = meta;

  const parseStatements = params.map((p, i) => {
    const type = p.type.toLowerCase();
    const varName = `arg${i}`;
    const lines = [`    const raw${i} = lines[${i}] ? lines[${i}].trim() : '';`];
    
    if (type === 'integer' || type === 'int') {
      lines.push(`    const ${varName} = parseInt(raw${i});`);
    } else if (type === 'long') {
      lines.push(`    const ${varName} = parseInt(raw${i});`);
    } else if (type === 'double' || type === 'float') {
      lines.push(`    const ${varName} = parseFloat(raw${i});`);
    } else if (type === 'boolean') {
      lines.push(`    const ${varName} = raw${i}.toLowerCase() === 'true';`);
    } else if (type === 'string') {
      lines.push(`    const ${varName} = raw${i}.replace(/^"|"$/g, '');`);
    } else if (type === 'character') {
      lines.push(`    const ${varName} = raw${i}[0];`);
    } else if (type === 'integer[]') {
      lines.push(`    const ${varName} = raw${i} === '[]' ? [] : raw${i}.replace(/[\\[\\]]/g,'').split(',').map(Number);`);
    } else if (type === 'string[]') {
      lines.push(`    const ${varName} = JSON.parse(raw${i});`);
    } else if (type === 'integer[][]') {
      lines.push(`    const ${varName} = JSON.parse(raw${i});`);
    } else if (type === 'listnode') {
      lines.push(`    const ${varName} = buildList(JSON.parse(raw${i}));`);
    } else if (type === 'treenode') {
      lines.push(`    const ${varName} = buildTree(JSON.parse(raw${i}));`);
    } else {
      lines.push(`    const ${varName} = JSON.parse(raw${i});`);
    }
    return lines.join('\n');
  });

  const callArgs = params.map((_, i) => `arg${i}`).join(', ');

  const retType = (ret?.type || 'void').toLowerCase();
  let resultPrint = '';
  if (retType === 'boolean') {
    resultPrint = `    console.log(result.toString());`;
  } else if (retType.endsWith('[]') || retType.endsWith('[][]')) {
    resultPrint = `    console.log(JSON.stringify(result));`;
  } else if (retType === 'listnode') {
    resultPrint = `    printList(result);`;
  } else if (retType === 'treenode') {
    resultPrint = `    printTree(result);`;
  } else {
    resultPrint = `    console.log(result);`;
  }

  return `{{USER_CODE}}

function ListNode(val, next) {
    this.val = (val===undefined ? 0 : val)
    this.next = (next===undefined ? null : next)
}
function TreeNode(val, left, right) {
    this.val = (val===undefined ? 0 : val)
    this.left = (left===undefined ? null : left)
    this.right = (right===undefined ? null : right)
}
function buildList(arr) {
    if (!arr || !arr.length) return null;
    let head = new ListNode(arr[0]);
    let curr = head;
    for (let i = 1; i < arr.length; i++) {
        curr.next = new ListNode(arr[i]);
        curr = curr.next;
    }
    return head;
}
function printList(head) {
    let res = [];
    while (head) { res.push(head.val); head = head.next; }
    console.log(JSON.stringify(res));
}
function buildTree(arr) {
    if (!arr || !arr.length || arr[0] === null) return null;
    let root = new TreeNode(arr[0]);
    let q = [root];
    let i = 1;
    while (q.length > 0 && i < arr.length) {
        let curr = q.shift();
        if (i < arr.length && arr[i] !== null) { curr.left = new TreeNode(arr[i]); q.push(curr.left); }
        i++;
        if (i < arr.length && arr[i] !== null) { curr.right = new TreeNode(arr[i]); q.push(curr.right); }
        i++;
    }
    return root;
}
function printTree(root) {
    if (!root) { console.log("[]"); return; }
    let res = [];
    let q = [root];
    while (q.length > 0) {
        let curr = q.shift();
        if (curr) { res.push(curr.val); q.push(curr.left); q.push(curr.right); }
        else { res.push(null); }
    }
    while (res.length > 0 && res[res.length - 1] === null) res.pop();
    console.log(JSON.stringify(res));
}

const lines = require('fs').readFileSync(0,'utf8').split('\n');
(function main() {
${parseStatements.join('\n')}
    const result = ${name}(${callArgs});
${resultPrint}
})();`;
}

// ─── JAVA DRIVER GENERATOR ──────────────────────────────────────────────────

function generateJavaDriver(meta) {
  const { name, params, return: ret } = meta;
  
  const parseStatements = params.map((p, i) => {
    const type = p.type.toLowerCase();
    const varName = `arg${i}`;
    const lines = [`        String raw${i} = scanner.nextLine().trim();`];
    
    if (type === 'integer' || type === 'int') {
      lines.push(`        int ${varName} = Integer.parseInt(raw${i});`);
    } else if (type === 'long') {
      lines.push(`        long ${varName} = Long.parseLong(raw${i});`);
    } else if (type === 'double' || type === 'float') {
      lines.push(`        double ${varName} = Double.parseDouble(raw${i});`);
    } else if (type === 'boolean') {
      lines.push(`        boolean ${varName} = Boolean.parseBoolean(raw${i});`);
    } else if (type === 'string') {
      lines.push(`        String ${varName} = raw${i}.replaceAll("^\\"|\\"$", "");`);
    } else if (type === 'character') {
      lines.push(`        char ${varName} = raw${i}.charAt(0);`);
    } else if (type === 'integer[]') {
      lines.push(`        int[] ${varName} = parseIntArray(raw${i});`);
    } else if (type === 'string[]') {
      lines.push(`        String[] ${varName} = parseStringArray(raw${i});`);
    } else if (type === 'integer[][]') {
      lines.push(`        int[][] ${varName} = parseInt2DArray(raw${i});`);
    } else if (type === 'listnode') {
      lines.push(`        ListNode ${varName} = buildList(raw${i});`);
    } else if (type === 'treenode') {
      lines.push(`        TreeNode ${varName} = buildTree(raw${i});`);
    } else {
      lines.push(`        String ${varName} = raw${i};`);
    }
    return lines.join('\n');
  });

  const callArgs = params.map((_, i) => `arg${i}`).join(', ');
  
  const retType = (ret?.type || 'void').toLowerCase();
  let resultPrint = '';
  if (retType === 'integer' || retType === 'int' || retType === 'long' || 
      retType === 'double' || retType === 'float') {
    resultPrint = `        System.out.println(result);`;
  } else if (retType === 'boolean') {
    resultPrint = `        System.out.println(result);`;
  } else if (retType === 'string') {
    resultPrint = `        System.out.println(result);`;
  } else if (retType === 'integer[]') {
    resultPrint = `        System.out.println(java.util.Arrays.toString(result).replace(", ", ",").replace("[", "[").replace("]", "]"));`;
  } else if (retType === 'string[]') {
    resultPrint = `        System.out.println(java.util.Arrays.toString(result));`;
  } else if (retType === 'integer[][]') {
    resultPrint = `        System.out.println(java.util.Arrays.deepToString(result).replace(", ", ","));`;
  } else if (retType === 'listnode') {
    resultPrint = `        printList(result);`;
  } else if (retType === 'treenode') {
    resultPrint = `        printTree(result);`;
  } else {
    resultPrint = `        System.out.println(result);`;
  }

  return `{{USER_CODE}}

class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}

class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode() {}
    TreeNode(int val) { this.val = val; }
    TreeNode(int val, TreeNode left, TreeNode right) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}

class Main {
    static ListNode buildList(String s) {
        int[] arr = parseIntArray(s);
        if (arr.length == 0) return null;
        ListNode head = new ListNode(arr[0]);
        ListNode curr = head;
        for (int i = 1; i < arr.length; i++) {
            curr.next = new ListNode(arr[i]);
            curr = curr.next;
        }
        return head;
    }

    static void printList(ListNode head) {
        java.util.List<Integer> res = new java.util.ArrayList<>();
        while (head != null) { res.add(head.val); head = head.next; }
        System.out.println(res.toString().replace(" ", ""));
    }

    static String[] parseTreeArray(String s) {
        s = s.trim().replaceAll("^\\\\[|\\\\]$", "").replaceAll("\\"", "");
        if (s.isEmpty()) return new String[0];
        return s.split(",");
    }

    static TreeNode buildTree(String s) {
        String[] arr = parseTreeArray(s);
        if (arr.length == 0 || arr[0].equals("null")) return null;
        TreeNode root = new TreeNode(Integer.parseInt(arr[0].trim()));
        java.util.Queue<TreeNode> q = new java.util.LinkedList<>();
        q.offer(root);
        int i = 1;
        while (!q.isEmpty() && i < arr.length) {
            TreeNode curr = q.poll();
            if (i < arr.length && !arr[i].trim().equals("null")) {
                curr.left = new TreeNode(Integer.parseInt(arr[i].trim()));
                q.offer(curr.left);
            }
            i++;
            if (i < arr.length && !arr[i].trim().equals("null")) {
                curr.right = new TreeNode(Integer.parseInt(arr[i].trim()));
                q.offer(curr.right);
            }
            i++;
        }
        return root;
    }

    static void printTree(TreeNode root) {
        if (root == null) { System.out.println("[]"); return; }
        java.util.List<String> res = new java.util.ArrayList<>();
        java.util.Queue<TreeNode> q = new java.util.LinkedList<>();
        q.offer(root);
        while (!q.isEmpty()) {
            TreeNode curr = q.poll();
            if (curr != null) {
                res.add(String.valueOf(curr.val));
                q.offer(curr.left);
                q.offer(curr.right);
            } else {
                res.add("null");
            }
        }
        while (!res.isEmpty() && res.get(res.size() - 1).equals("null")) res.remove(res.size() - 1);
        System.out.println("[" + String.join(",", res) + "]");
    }

    static int[] parseIntArray(String s) {
        s = s.trim().replaceAll("[\\\\[\\\\]]", "");
        if (s.isEmpty()) return new int[0];
        String[] parts = s.split(",");
        int[] arr = new int[parts.length];
        for (int i = 0; i < parts.length; i++) arr[i] = Integer.parseInt(parts[i].trim());
        return arr;
    }
    static String[] parseStringArray(String s) {
        s = s.trim().replaceAll("^\\\\[|\\\\]$", "").replaceAll("\\"", "");
        if (s.isEmpty()) return new String[0];
        return s.split(",");
    }
    static int[][] parseInt2DArray(String s) {
        // simplified: handles [[1,2],[3,4]]
        java.util.List<int[]> rows = new java.util.ArrayList<>();
        int i = 0;
        while (i < s.length()) {
            if (s.charAt(i) == '[') {
                int j = s.indexOf(']', i);
                if (j > i) { rows.add(parseIntArray(s.substring(i, j+1))); i = j+1; }
                else break;
            } else i++;
        }
        return rows.toArray(new int[0][]);
    }
    public static void main(String[] args) {
        java.util.Scanner scanner = new java.util.Scanner(System.in);
        Solution sol = new Solution();
${parseStatements.join('\n')}
        var result = sol.${name}(${callArgs});
${resultPrint}
    }
}`;
}

// ─── PUBLIC API ─────────────────────────────────────────────────────────────

/**
 * Generate driver code for all 4 languages given LeetCode metaData.
 * @param {Object} meta - Parsed metaData JSON from LeetCode GraphQL
 * @returns {{ cpp, python, java, javascript }} Driver code strings per language
 */
function generateAllDrivers(meta) {
  try {
    return {
      cpp:        generateCppDriver(meta),
      python:     generatePythonDriver(meta),
      java:       generateJavaDriver(meta),
      javascript: generateJavaScriptDriver(meta),
    };
  } catch (err) {
    console.error('[driverGenerator] Failed to generate driver:', err.message);
    return null;
  }
}

module.exports = { generateAllDrivers };
