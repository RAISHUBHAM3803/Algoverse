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
  } else {
    resultPrint = `    print(result)`;
  }

  return `{{USER_CODE}}

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
  } else {
    resultPrint = `    console.log(result);`;
  }

  return `{{USER_CODE}}

const lines = require('fs').readFileSync(0,'utf8').split('\\n');
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
  } else {
    resultPrint = `        System.out.println(result);`;
  }

  return `{{USER_CODE}}

class Main {
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
