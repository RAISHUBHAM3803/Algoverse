const https = require('https');

// Check what fields are available for outputs
const query = `
query questionData($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    metaData
    exampleTestcaseList
    sampleTestCase
    content
  }
}
`;

const payload = JSON.stringify({ query, variables: { titleSlug: 'two-sum' } });
const options = {
  hostname: 'leetcode.com',
  path: '/graphql',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload),
    'User-Agent': 'Mozilla/5.0',
  },
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    const data = JSON.parse(body);
    const q = data.data?.question;
    // Extract example outputs from HTML content
    const content = q?.content || '';
    // Find all <strong>Output:</strong> patterns
    const outputMatches = content.match(/<strong>Output:<\/strong>\s*([^<]+)/g) || [];
    console.log('exampleTestcaseList:', JSON.stringify(q?.exampleTestcaseList, null, 2));
    console.log('\nOutputs from HTML:');
    outputMatches.forEach((m, i) => {
      const val = m.replace(/<strong>Output:<\/strong>\s*/, '').trim();
      console.log(`  [${i}] ${val}`);
    });
  });
});
req.on('error', console.error);
req.write(payload);
req.end();
