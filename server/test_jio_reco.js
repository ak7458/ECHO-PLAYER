const https = require('https');

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function test() {
  try {
    const searchUrl = `https://www.jiosaavn.com/api.php?__call=search.getResults&q=shape+of+you&n=1&_format=json&_marker=0&ctx=web6dot0`;
    const searchData = await fetchJson(searchUrl);
    const pid = searchData.results[0].id;
    console.log("Found PID:", pid);

    const stationUrl = `https://www.jiosaavn.com/api.php?__call=webradio.createEntityStation&entity_id=${pid}&entity_type=queue&_format=json&_marker=0&ctx=web6dot0`;
    const stationData = await fetchJson(stationUrl);
    const stationId = stationData.stationid;
    console.log("Station ID:", stationId);

    if (stationId) {
      const getSongsUrl = `https://www.jiosaavn.com/api.php?__call=webradio.getSong&stationid=${stationId}&k=10&next=1&_format=json&_marker=0&ctx=web6dot0`;
      const songsData = await fetchJson(getSongsUrl);
      console.log("Got station songs:", Object.keys(songsData));
      if (songsData.stationid) {
         // Some endpoints return a JSON object with a songs/results key
         console.log(Object.keys(songsData));
      }
    }
  } catch (err) {
    console.error(err);
  }
}

test();
