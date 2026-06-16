const YTMusic = require('ytmusic-api');
const ytmusic = new YTMusic();

async function test() {
  await ytmusic.initialize();
  const songs = await ytmusic.searchSongs('Never gonna give you up');
  if (songs.length > 0) {
    const videoId = songs[0].videoId;
    const upNext = await ytmusic.getUpNexts(videoId);
    if (upNext.length > 0) {
      console.log(JSON.stringify(upNext[0], null, 2));
    }
  }
}

test().catch(console.error);
