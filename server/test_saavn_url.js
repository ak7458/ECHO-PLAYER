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
  const searchUrl = 'https://www.jiosaavn.com/api.php?__call=search.getResults&q=believer&n=1&_format=json&_marker=0&ctx=web6dot0';
  const searchData = await fetchJson(searchUrl);
  if (searchData && searchData.results && searchData.results.length > 0) {
    const songId = searchData.results[0].id;
    console.log('Found song:', searchData.results[0].title, 'ID:', songId);
    
    const detailsUrl = `https://www.jiosaavn.com/api.php?__call=song.getDetails&pids=${songId}&_format=json&_marker=0&ctx=web6dot0`;
    const detailsData = await fetchJson(detailsUrl);
    
    // detailsData is an object with { songs: [...] } sometimes or just { [songId]: { ... } }
    let songDetails;
    if (detailsData.songs) {
      songDetails = detailsData.songs[0];
    } else {
      songDetails = detailsData[songId];
    }
    
    if (songDetails) {
        console.log('Preview URL:', songDetails.media_preview_url);
        // Try to generate 320kbps URL
        let streamUrl = songDetails.media_preview_url.replace('preview.saavncdn.com', 'aac.saavncdn.com').replace('_96_p.mp4', '_320.mp4');
        console.log('Stream URL:', streamUrl);
    }
  } else {
    console.log('No results found.');
  }
}

testJioSaavn();
