const CryptoJS = require('crypto-js');

// Helper to fetch from JioSaavn API
const fetchJioSaavn = async (endpoint, params = {}) => {
  const url = new URL(`https://www.jiosaavn.com/api.php`);
  url.searchParams.append('__call', endpoint);
  url.searchParams.append('_format', 'json');
  url.searchParams.append('_marker', '0');
  url.searchParams.append('ctx', 'web6dot0');
  
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.append(key, value);
  }

  try {
    const res = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      }
    });
    return await res.json();
  } catch (err) {
    console.error('JioSaavn API Error:', err);
    return null;
  }
};

// Map JioSaavn song object to our Track model
const mapTrack = (song) => {
  return {
    id: song.id,
    name: song.title || song.song || 'Unknown Title',
    artist: song.subtitle || song.singers || song.primary_artists || 'Unknown Artist',
    album: song.album || 'Unknown Album',
    imageUrl: song.image ? song.image.replace('150x150', '500x500') : 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&q=80',
    duration: song.duration ? parseInt(song.duration) : 200, // in seconds
    // src will be fetched when played
    src: `http://localhost:5001/api/music/stream/${song.id}`,
    isLocal: false
  };
};

exports.getLibrary = async (req, res) => {
  // To simulate a rich library, we'll fetch a popular trending query or mix
  const data = await fetchJioSaavn('search.getResults', { q: 'top hits', p: 1, n: 20 });
  if (data && data.results) {
    res.json(data.results.map(mapTrack));
  } else {
    res.json([]);
  }
};

exports.getHomeData = async (req, res) => {
  const data = await fetchJioSaavn('webapi.getLaunchData');
  if (data) {
    const trending = (data.new_trending || []).map(item => ({
      id: item.id,
      name: item.title,
      artist: item.subtitle,
      imageUrl: item.image ? item.image.replace('150x150', '500x500') : 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&q=80',
      type: item.type
    }));
    
    const charts = (data.charts || []).map(item => ({
      id: item.id,
      name: item.title,
      artist: item.subtitle,
      imageUrl: item.image ? item.image.replace('150x150', '500x500') : 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&q=80',
      type: item.type
    }));

    const albums = (data.new_albums || []).map(item => ({
      id: item.id,
      name: item.title,
      artist: item.subtitle,
      imageUrl: item.image ? item.image.replace('150x150', '500x500') : 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&q=80',
      type: item.type
    }));

    res.json({ trending, charts, albums });
  } else {
    res.json({ trending: [], charts: [], albums: [] });
  }
};

exports.getRecommendations = async (req, res) => {
  const songId = req.query.id;
  if (!songId) return res.json([]);
  
  const data = await fetchJioSaavn('webapi.getReco', { pid: songId });
  if (data) {
    const recos = (Array.isArray(data) ? data : []).map(mapTrack);
    res.json(recos);
  } else {
    res.json([]);
  }
};

exports.getArtist = async (req, res) => {
  const artistId = req.params.id;
  const data = await fetchJioSaavn('search.getResults', { q: artistId });
  if (data && data.results) {
    const tracks = data.results.map(mapTrack);
    res.json({ name: artistId, tracks });
  } else {
    res.json({ name: artistId, tracks: [] });
  }
};

exports.getAlbum = async (req, res) => {
  const albumId = req.params.id;
  const data = await fetchJioSaavn('content.getAlbumDetails', { albumid: albumId });
  if (data && data.list) {
    const tracks = data.list.map(mapTrack);
    res.json({ name: data.title, artist: data.primary_artists, imageUrl: data.image ? data.image.replace('150x150', '500x500') : '', tracks });
  } else {
    res.json({ name: "Unknown Album", tracks: [] });
  }
};

exports.search = async (req, res) => {
  const query = req.query.q;
  if (!query) return res.json([]);
  
  const data = await fetchJioSaavn('search.getResults', { q: query, p: 1, n: 30 });
  if (data && data.results) {
    res.json(data.results.map(mapTrack));
  } else {
    res.json([]);
  }
};

exports.getStream = async (req, res) => {
  const { id } = req.params;
  const data = await fetchJioSaavn('song.getDetails', { pids: id });
  
  if (data && data.songs && data.songs.length > 0) {
    const song = data.songs[0];
    const encryptedUrl = song.encrypted_media_url;
    if (encryptedUrl) {
      try {
        const key = CryptoJS.enc.Utf8.parse('38346591');
        const decrypted = CryptoJS.DES.decrypt(
          { ciphertext: CryptoJS.enc.Base64.parse(encryptedUrl) },
          key,
          { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }
        ).toString(CryptoJS.enc.Utf8);
        
        // Use the raw decrypted URL to guarantee it exists
        const audioUrl = decrypted;
        
        const axios = require('axios');
        try {
          const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          };
          
          if (req.headers.range) {
            headers.Range = req.headers.range;
          }

          const response = await axios({
            method: 'get',
            url: audioUrl,
            responseType: 'stream',
            headers: headers,
            validateStatus: status => status >= 200 && status < 400
          });

          res.status(response.status);
          
          ['content-length', 'content-range', 'accept-ranges', 'content-type'].forEach(header => {
            if (response.headers[header]) {
              res.setHeader(header, response.headers[header]);
            }
          });

          if (!res.getHeader('content-type')) {
            res.setHeader('Content-Type', 'audio/mp4');
          }
          
          return response.data.pipe(res);
        } catch (streamErr) {
          console.error("Stream Proxy failed, falling back to redirect", streamErr.message);
          return res.redirect(302, audioUrl);
        }
      } catch (err) {
        console.error('Decryption failed', err);
      }
    }
  }
  res.status(404).send('Not found');
};

exports.getRecommendations = async (req, res) => {
  const { artist } = req.query;
  // Fallback autoplay logic: search the artist and return 30 tracks
  if (!artist) return res.json([]);
  
  const data = await fetchJioSaavn('search.getResults', { q: artist, p: 1, n: 30 });
  if (data && data.results) {
    res.json(data.results.map(mapTrack));
  } else {
    res.json([]);
  }
};

exports.getLyrics = async (req, res) => {
  const { track, artist } = req.query;
  if (!track || !artist) return res.json(null);
  
  try {
    const lrclibRes = await fetch(`https://lrclib.net/api/search?track_name=${encodeURIComponent(track)}&artist_name=${encodeURIComponent(artist)}`);
    const data = await lrclibRes.json();
    
    if (data && data.length > 0) {
      const match = data[0];
      if (match.syncedLyrics) {
        // Parse LRC to JSON
        const lines = match.syncedLyrics.split('\n');
        const parsed = lines.map(line => {
          const match = line.match(/\[(\d{2}):(\d{2}\.\d{2})\](.*)/);
          if (match) {
            const minutes = parseInt(match[1]);
            const seconds = parseFloat(match[2]);
            return {
              time: (minutes * 60) + seconds,
              text: match[3].trim()
            };
          }
          return null;
        }).filter(Boolean);
        
        return res.json({ type: 'synced', lines: parsed });
      } else if (match.plainLyrics) {
        return res.json({ type: 'plain', text: match.plainLyrics });
      }
    }
    res.json(null);
  } catch (err) {
    res.json(null);
  }
};
