const YTMusic = require('ytmusic-api');
const ytmusic = new YTMusic();

async function test() {
  await ytmusic.initialize();
  const results = await ytmusic.search('huberman');
  console.log(JSON.stringify(results.slice(0, 5), null, 2));
}

test();
