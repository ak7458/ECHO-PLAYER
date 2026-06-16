const YTMusic = require('ytmusic-api').default || require('ytmusic-api');

async function test() {
  const ytmusic = new YTMusic();
  await ytmusic.initialize();
  
  const query = "Shape of You Ed Sheeran audio";
  console.log("Searching for:", query);
  
  const results = await ytmusic.searchSongs(query);
  if (results && results.length > 0) {
    const videoId = results[0].videoId;
    console.log("Found video ID:", videoId, "Name:", results[0].name);
    
    // Test ytdl-core stream metadata
    try {
      const info = await ytdl.getInfo(videoId);
      const audioFormat = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });
      console.log("Found audio format URL length:", audioFormat.url.length);
    } catch (e) {
      console.error("YTDL Error:", e.message);
    }
  } else {
    console.log("No results found on YT Music");
  }
}

test();
