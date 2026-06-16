const YTMusic = require('ytmusic-api');
const ytmusic = new YTMusic();

async function test() {
  await ytmusic.initialize();
  console.log(Object.keys(ytmusic));
  console.log(Object.getPrototypeOf(ytmusic));
}

test();
