const https = require('https');
const jobId = 88098789521;
const options = {
  hostname: 'api.github.com',
  path: `/repos/Monishkumar55/music_melody/actions/jobs/${jobId}/logs`,
  headers: { 'User-Agent': 'Node.js' }
};

https.get(options, (res) => {
  if (res.statusCode === 301 || res.statusCode === 302) {
    https.get(res.headers.location, (res2) => {
      let data = '';
      res2.on('data', chunk => data += chunk);
      res2.on('end', () => {
        const lines = data.split('\n');
        console.log(lines.slice(Math.max(lines.length - 50, 0)).join('\n'));
      });
    });
  }
}).on('error', console.error);
