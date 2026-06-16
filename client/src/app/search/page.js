"use client";

import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, Play, Loader2 } from 'lucide-react';
import usePlayerStore from '@/store/usePlayerStore';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const setCurrentTrack = usePlayerStore((state) => state.setCurrentTrack);
  const setQueue = usePlayerStore((state) => state.setQueue);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      searchYouTube(query);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const searchYouTube = async (searchQuery) => {
    setLoading(true);
    try {
      // Use trending track if query is empty
      const q = searchQuery.trim() || 'trending music 2026';
      
      const response = await fetch(`http://localhost:5001/api/music/search?q=${encodeURIComponent(q)}`);
      const data = await response.json();
      
      const tracks = Array.isArray(data) ? data : [];
      
      setResults(tracks);
      setQueue(tracks);
    } catch (err) {
      console.error("Search failed:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleGenreClick = (genre) => {
    let newQuery = 'trending music';
    if (genre === 'Songs') newQuery = 'trending songs';
    if (genre === 'Audio Podcasts') newQuery = 'top podcasts';
    setQuery(newQuery);
  };

  return (
    <div className="h-full overflow-y-auto relative flex flex-col bg-echo-base">
      
      {/* Top Header */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-echo-base/90 backdrop-blur-md">
        <div className="relative w-full max-w-md">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-echo-text-base" size={18} />
          <input 
            type="text" 
            placeholder="Search songs, artists, albums..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-echo-elevated text-white rounded-full py-2.5 pl-10 pr-4 outline-none border border-white/5 focus:border-echo-primary/50 transition-colors text-sm font-medium"
          />
        </div>
        
        <div className="flex items-center gap-4 ml-4">
          <button className="text-echo-text-base hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-orange-400 overflow-hidden cursor-pointer">
            <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="User" className="w-full h-full object-cover mix-blend-overlay" />
          </div>
        </div>
      </div>

      <div className="px-6 pb-24 flex-1">
        
        {/* Hero Banner */}
        <div className="relative w-full h-[280px] rounded-2xl overflow-hidden mb-8 mt-2 flex items-center">
          <img 
            src="https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?q=80&w=2000&auto=format&fit=crop" 
            alt="Hero Background" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-echo-base via-echo-base/80 to-transparent"></div>
          
          <div className="relative z-10 px-10 max-w-lg">
            <p className="text-echo-text-base font-medium mb-1">Good evening, Arjun</p>
            <h1 className="text-5xl font-bold text-white mb-6 leading-tight tracking-tight">
              Music that <br/><span className="text-echo-primary">feels</span> like you
            </h1>
            
            <div className="flex items-center gap-4">
              <button className="bg-echo-primary hover:bg-echo-primary/90 text-white px-8 py-3 rounded-full font-semibold flex items-center gap-2 transition-all transform hover:scale-105">
                <Play size={20} fill="currentColor" />
                Play
              </button>
              <button className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-full font-semibold flex items-center gap-2 backdrop-blur-sm transition-all border border-white/5">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22"/><path d="m18 2 4 4-4 4"/><path d="M2 6h1.9c1.5 0 2.9.9 3.6 2.2"/><path d="M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8"/><path d="m18 14 4 4-4 4"/></svg>
                Shuffle
              </button>
            </div>
          </div>
        </div>

        {/* Genre Filters */}
        <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-4 hide-scrollbar">
          {['All', 'Songs', 'Audio Podcasts'].map((genre, i) => {
            let isActive = false;
            if (genre === 'All' && (query === '' || query === 'trending music')) isActive = true;
            if (genre === 'Songs' && query === 'trending songs') isActive = true;
            if (genre === 'Audio Podcasts' && query === 'top podcasts') isActive = true;

            return (
              <button 
                key={genre} 
                onClick={() => handleGenreClick(genre)}
                className={`px-5 py-2 rounded-full whitespace-nowrap font-medium text-sm transition-colors border ${
                  isActive
                    ? 'bg-echo-primary text-white border-echo-primary' 
                    : 'bg-echo-elevated text-echo-text-base border-white/5 hover:bg-white/10 hover:text-white'
                }`}
              >
                {genre}
              </button>
            );
          })}
        </div>

        {/* Trending Now */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white tracking-tight">Trending Now</h2>
          <span className="text-sm font-medium text-echo-text-base hover:text-white cursor-pointer transition-colors">See all</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-echo-primary" size={40} />
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-5">
            {results.map((track) => (
              <div 
                key={track.id} 
                className="group flex flex-col p-3 rounded-md hover:bg-white/5 cursor-pointer transition-colors relative"
                onClick={() => setCurrentTrack(track)}
              >
                <div className="relative w-full aspect-square rounded-md shadow-[0_8px_24px_rgba(0,0,0,0.5)] mb-3">
                  <img src={track.imageUrl} alt={track.name} className="w-full h-full object-cover rounded-md" />
                  
                  {/* Play Button - Bottom Right */}
                  <div className="absolute bottom-2 right-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-10">
                    <div className="w-12 h-12 rounded-full bg-echo-primary text-white flex items-center justify-center shadow-xl hover:scale-105 transition-transform">
                      <Play size={24} fill="currentColor" className="ml-1" />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col px-1">
                  <span className="text-white font-semibold text-sm truncate">{track.name}</span>
                  <span className="text-echo-text-base text-sm truncate mt-1">{track.artist}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
