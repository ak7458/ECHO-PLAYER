const YTMusic = require('ytmusic-api');
const ytmusic = new YTMusic();

async function test() {
  await ytmusic.initialize();
  const results = await ytmusic.searchSongs('huberman');
  console.log(results.slice(0, 5));
}

test();
