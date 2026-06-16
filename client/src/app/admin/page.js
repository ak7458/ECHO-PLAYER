"use client";

import React, { useState } from 'react';

export default function AdminPage() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [status, setStatus] = useState('');

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setStatus('Uploading and Transcoding to HLS... This may take a minute.');

    const formData = new FormData();
    formData.append('song', file);
    formData.append('title', title);
    formData.append('artist', artist);

    try {
      const response = await fetch('http://localhost:5001/api/music/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setStatus('Upload and HLS Transcoding Successful!');
        setFile(null);
        setTitle('');
        setArtist('');
      } else {
        setStatus('Upload failed. Check backend logs.');
      }
    } catch (err) {
      console.error(err);
      setStatus('Upload Error: ' + err.message);
    }
  };

  return (
    <div className="p-8 text-white h-full flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard - Upload Music</h1>
      
      <form onSubmit={handleUpload} className="bg-[#181818] p-8 rounded-lg flex flex-col gap-4 w-[400px]">
        <div>
          <label className="block text-sm mb-2 text-spotify-text-base">Song Title</label>
          <input 
            type="text" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            className="w-full bg-[#242424] text-white p-3 rounded"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm mb-2 text-spotify-text-base">Artist</label>
          <input 
            type="text" 
            value={artist} 
            onChange={e => setArtist(e.target.value)} 
            className="w-full bg-[#242424] text-white p-3 rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-2 text-spotify-text-base">MP3 File</label>
          <input 
            type="file" 
            accept="audio/mp3, audio/wav" 
            onChange={e => setFile(e.target.files[0])} 
            className="w-full text-spotify-text-base"
            required
          />
        </div>

        <button 
          type="submit" 
          className="mt-4 bg-spotify-green text-black font-bold py-3 rounded-full hover:scale-105 transition-transform"
        >
          Upload to HLS Engine
        </button>

        {status && (
          <div className="mt-4 text-center text-sm text-spotify-text-highlight">
            {status}
          </div>
        )}
      </form>
    </div>
  );
}
