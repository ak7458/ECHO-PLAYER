const https = require('https');

https.get('https://api.jamendo.com/v3.0/tracks/?client_id=56d30c95&format=json&limit=1&search=believer', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const result = JSON.parse(data);
    console.log(result.results[0]);
  });
});
