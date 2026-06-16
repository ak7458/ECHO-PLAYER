const YTMusic = require('ytmusic-api');
const ytmusic = new YTMusic();

async function test() {
  await ytmusic.initialize();
  const results = await ytmusic.search('huberman lab podcast');
  console.log(results.map(r => ({ type: r.type, name: r.name })).slice(0, 10));
}

test();
