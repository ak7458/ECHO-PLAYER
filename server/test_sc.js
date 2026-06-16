const SoundCloud = require('soundcloud-scraper');
const client = new SoundCloud.Client();

async function test() {
  try {
    const result = await client.search('believer', 'track');
    console.log('Search Results:', result.length);
    if (result.length > 0) {
      console.log('First result:', result[0]);
      const song = await client.getSongInfo(result[0].url);
      console.log('Song info:', song.title, song.streamURL);
    }
  } catch(e) {
    console.error(e);
  }
}
test();
