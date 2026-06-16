const https = require('https');

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function testJioSaavn() {
  const detailsUrl = `https://www.jiosaavn.com/api.php?__call=song.getDetails&pids=BeXBcbVK&_format=json&_marker=0&ctx=web6dot0`;
  const detailsData = await fetchJson(detailsUrl);
  console.log(JSON.stringify(detailsData, null, 2));
}

testJioSaavn();
