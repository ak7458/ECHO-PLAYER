const fs = require('fs');
const path = require('path');
const https = require('https');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');

ffmpeg.setFfmpegPath(ffmpegStatic);

const uploadsDir = path.join(__dirname, 'uploads');
const tempDir = path.join(uploadsDir, 'temp');
const hlsDir = path.join(uploadsDir, 'hls');

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
if (!fs.existsSync(hlsDir)) fs.mkdirSync(hlsDir);

const songs = [
  {
    id: 'song1',
    title: 'SoundHelix Song 1',
    artist: 'T. Schürger',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80'
  },
  {
    id: 'song2',
    title: 'SoundHelix Song 2',
    artist: 'T. Schürger',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80'
  },
  {
    id: 'song3',
    title: 'SoundHelix Song 3',
    artist: 'T. Schürger',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    imageUrl: 'https://images.unsplash.com/photo-1493225457124-a1a2a5f5f458?w=500&q=80'
  }
];

const downloadFile = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
};

const transcodeToHLS = (inputPath, outputDir) => {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
    const outputPath = path.join(outputDir, 'playlist.m3u8');
    
    ffmpeg(inputPath)
      .outputOptions([
        '-profile:v baseline', 
        '-level 3.0', 
        '-start_number 0',
        '-hls_time 10', 
        '-hls_list_size 0', 
        '-f hls'
      ])
      .output(outputPath)
      .on('end', resolve)
      .on('error', reject)
      .run();
  });
};

async function seed() {
  console.log('Starting seed process...');
  
  // Save song metadata to a JSON file to act as our database
  const dbPath = path.join(__dirname, 'db.json');
  fs.writeFileSync(dbPath, JSON.stringify(songs, null, 2));

  for (const song of songs) {
    const tempPath = path.join(tempDir, `${song.id}.mp3`);
    const outputDir = path.join(hlsDir, song.id);

    if (fs.existsSync(outputDir)) {
      console.log(`${song.title} is already transcoded, skipping.`);
      continue;
    }

    console.log(`Downloading ${song.title}...`);
    await downloadFile(song.url, tempPath);
    
    console.log(`Transcoding ${song.title} to HLS...`);
    await transcodeToHLS(tempPath, outputDir);
    
    console.log(`Finished ${song.title}`);
    // Clean up temp file
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
  }

  console.log('Seed complete! You now have full HLS tracks ready to stream.');
}

seed().catch(console.error);
