const YTMusic = require('ytmusic-api');
const ytmusic = new YTMusic();

async function test() {
  await ytmusic.initialize();
  const songs = await ytmusic.searchSongs('Never gonna give you up');
  if (songs.length > 0) {
    const videoId = songs[0].videoId;
    console.log("Found videoId:", videoId);
    
    const upNext = await ytmusic.getUpNexts(videoId);
    console.log(`Got ${upNext.length} up next songs`);
    if (upNext.length > 0) {
      console.log(upNext[0]);
    }
  }
}

test().catch(console.error);
