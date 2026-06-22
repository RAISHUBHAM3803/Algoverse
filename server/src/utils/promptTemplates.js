/**
 * Prompt Templates for AI Features
 * Encapsulates prompt building logic and enforces strict JSON output formats.
 */

/**
 * AI Code Review Prompt
 * @param {string} language
 * @param {code} code
 * @returns {string}
 */
const reviewPrompt = (language, code) => {
  return `You are an expert code reviewer. Perform a comprehensive code review on the following code written in ${language}.
Focus on:
1. Readability and clarity
2. Variable and function naming conventions
3. Logic quality and potential bugs
4. Standard programming practices for ${language}
5. Optimization opportunities

Your response MUST be a valid JSON object strictly matching this schema. Do not output any markdown formatting (like \`\`\`json) outside of the raw JSON if JSON mode is active.
{
  "strengths": ["list of code strengths"],
  "weaknesses": ["list of areas of weakness or potential bugs"],
  "optimizations": ["specific suggestions to improve time/space efficiency"],
  "bestPractices": ["recommendations for standard conventions and naming"]
}

Code to review:
\`\`\`${language}
${code}
\`\`\``;
};

/**
 * AI Complexity Analysis Prompt
 * @param {string} language
 * @param {string} code
 * @returns {string}
 */
const complexityPrompt = (language, code) => {
  return `Analyze the time and space complexity of the following code written in ${language}.
Focus on:
1. Time complexity in Big-O notation
2. Space complexity in Big-O notation
3. Identification of efficiency bottlenecks (e.g. nested loops, excessive recursion, memory allocations)

Your response MUST be a valid JSON object strictly matching this schema:
{
  "timeComplexity": "O(...) standard Big-O notation",
  "spaceComplexity": "O(...) standard Big-O notation",
  "reasoning": "A concise explanation detailing why the code has these complexities and pointing out bottlenecks"
}

Code to analyze:
\`\`\`${language}
${code}
\`\`\``;
};

/**
 * AI Hint Generator Prompt
 * @param {string} problemTitle
 * @param {string} problemDescription
 * @param {string} difficulty
 * @returns {string}
 */
const hintPrompt = (problemTitle, problemDescription, difficulty) => {
  return `You are an encouraging, senior coding coach. Generate 3 progressive hints for the problem "${problemTitle}".
Difficulty: ${difficulty}
Problem Description:
${problemDescription}

Rules:
1. NEVER reveal the complete solution, code snippets, or direct answers.
2. Format each hint using rich **Markdown**. Use bold text for key algorithms/data structures, and inline code formatting (\`likeThis\`) for variables or syntax.
3. Provide progressive hints:
   - Hint 1 should be a high-level conceptual hint or approach direction (start with a 💡 emoji).
   - Hint 2 should be a algorithmic structure suggestion (e.g., data structures, two-pointer concept) (start with a 🧠 emoji).
   - Hint 3 should be a subtle edge case warning or optimization suggestion (start with a ⚠️ emoji).
4. Be encouraging and promote problem-solving.

Your response MUST be a valid JSON object strictly matching this schema:
{
  "hint1": "First conceptual hint in markdown",
  "hint2": "Second algorithmic hint in markdown",
  "hint3": "Third optimization or edge case hint in markdown"
}`;
};

/**
 * AI Interview Feedback Prompt
 * @param {string} language
 * @param {string} code
 * @param {string} problemTitle
 * @param {string} verdict
 * @returns {string}
 */
const interviewPrompt = (language, code, problemTitle, verdict) => {
  return `You are a Technical Interviewer at a top-tier tech firm (like Google or Meta). Provide structured interview feedback on a candidate's submission.
Problem: "${problemTitle}"
Submission Language: ${language}
Submission Verdict: ${verdict}

Analyze:
1. Problem Solving: how well does the code address the problem requirements.
2. Code Quality: readability, structures, style.
3. Optimization: efficiency, Big-O awareness.
4. Communication Readiness: how easily understandable is the logic.

Rate each category on a scale of 1 to 10. 
Also provide \`overallFeedback\`. This MUST be formatted as beautiful, highly readable **Markdown**. 
Structure the \`overallFeedback\` with headings (e.g., "### 🌟 Strengths", "### 🛠 Areas for Improvement", "### 💡 Expert Tip"). Use bullet points, bolding for emphasis, and markdown code blocks (\`\`\`) to show specific examples of how to improve their code.

Your response MUST be a valid JSON object strictly matching this schema:
{
  "problemSolving": 8,
  "codeQuality": 7,
  "optimization": 6,
  "communicationReadiness": 8,
  "overallFeedback": "Extensive, beautifully formatted Markdown string..."
}

Candidate's Code:
\`\`\`${language}
${code}
\`\`\``;
};

module.exports = {
  reviewPrompt,
  complexityPrompt,
  hintPrompt,
  interviewPrompt,
};
