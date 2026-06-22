const https = require('https');

function fetchQuestion(titleSlug) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      query: 'query questionData($titleSlug: String!) { question(titleSlug: $titleSlug) { content } }',
      variables: { titleSlug }
    });

    const req = https.request({
      hostname: 'leetcode.com',
      port: 443,
      path: '/graphql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    }, res => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => resolve(JSON.parse(body)));
    });

    req.on('error', e => reject(e));
    req.write(data);
    req.end();
  });
}

fetchQuestion('two-sum').then(data => {
  console.log(data.data.question.content);
}).catch(console.error);
