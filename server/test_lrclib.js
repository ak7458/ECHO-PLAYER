async function test() {
  const trackQ = encodeURIComponent("Kesariya");
  const artistQ = encodeURIComponent(""); 
  const res = await fetch(`https://lrclib.net/api/search?track_name=${trackQ}&artist_name=${artistQ}`);
  const data = await res.json();
  const bestMatch = data.find(d => d.syncedLyrics);
  console.log(bestMatch.syncedLyrics.substring(0, 100));
}
test();
