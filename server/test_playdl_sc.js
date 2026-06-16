const play = require('play-dl');

async function testSC() {
  try {
    const results = await play.search('believer', { source: { soundcloud: 'tracks' }});
    if (results.length > 0) {
      console.log('Found:', results[0].name);
      console.log('URL:', results[0].url);
      const stream = await play.stream(results[0].url);
      console.log('Stream URL:', stream.url);
    } else {
      console.log('No results');
    }
  } catch(e) {
    console.error(e);
  }
}
testSC();
