const https = require('https');

const query = `
query questionData($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    metaData
  }
}
`;

const data = JSON.stringify({
  query: query,
  variables: { titleSlug: 'two-sum' }
});

const options = {
  hostname: 'leetcode.com',
  path: '/graphql',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length,
    'User-Agent': 'Mozilla/5.0'
  }
};

const req = https.request(options, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log(body));
});

req.on('error', console.error);
req.write(data);
req.end();
