"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { Search as SearchIcon, Play, Loader2, Heart, Plus, Trash, User, Music } from 'lucide-react';
import usePlayerStore from '@/store/usePlayerStore';
import useAuthStore from '@/store/useAuthStore';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import PlaylistContextMenu from '@/components/PlaylistContextMenu';
import { toast } from 'sonner';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';
  const view = searchParams.get('view') || 'search';
  const playlistId = searchParams.get('id');
  
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [homeData, setHomeData] = useState({ trending: [], charts: [], albums: [] });
  const [artistData, setArtistData] = useState(null);
  const [albumData, setAlbumData] = useState(null);
  const [contextMenu, setContextMenu] = useState({ track: null, x: 0, y: 0 });
  
  const setCurrentTrack = usePlayerStore((state) => state.setCurrentTrack);
  const playRadio = usePlayerStore((state) => state.playRadio);
  const setQueue = usePlayerStore((state) => state.setQueue);
  const likedSongs = usePlayerStore((state) => state.likedSongs) || [];
  const playlists = usePlayerStore((state) => state.playlists) || [];
  const searchHistory = usePlayerStore((state) => state.searchHistory) || [];
  const toggleLike = usePlayerStore((state) => state.toggleLike);
  const addTrackToPlaylist = usePlayerStore((state) => state.addTrackToPlaylist);
  const addSearchHistory = usePlayerStore((state) => state.addSearchHistory);
  const clearSearchHistory = usePlayerStore((state) => state.clearSearchHistory);
  const removeTrackFromPlaylist = usePlayerStore((state) => state.removeTrackFromPlaylist);
  const deletePlaylist = usePlayerStore((state) => state.deletePlaylist);
  const user = useAuthStore((state) => state.user);

  // Determine what tracks to show based on the view
  let displayTracks = results;
  let viewTitle = "Jump back in";
  
  if (view === 'liked') {
    displayTracks = likedSongs;
    viewTitle = "Liked Songs";
  } else if (view === 'playlist' && playlistId) {
    const playlist = playlists.find(p => p.id === playlistId);
    if (playlist) {
      displayTracks = playlist.tracks || [];
      viewTitle = playlist.name;
    }
  } else if (view === 'library') {
    displayTracks = likedSongs; // Fallback library to liked songs for now
    viewTitle = "Your Library";
  }

  // Update query if URL param changes
  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null && q !== query) {
      setQuery(q);
    }
  }, [searchParams]);

  // Fetch Home Data
  useEffect(() => {
    if (view === 'search' && query === '') {
      fetch('http://localhost:5001/api/music/home')
        .then(res => res.json())
        .then(data => setHomeData(data))
        .catch(err => console.error("Home fetch error:", err));
    }
  }, [view, query]);

  // Load backend library when user state changes
  useEffect(() => {
    if (user?.id) {
      usePlayerStore.getState().loadLibraryFromBackend();
    }
  }, [user]);

  useEffect(() => {
    if (view !== 'search') return; // Don't search if we are in a custom view
    
    const delayDebounceFn = setTimeout(() => {
      searchYouTube(query);
      if (query !== searchParams.get('q')) {
        router.replace(`/?q=${encodeURIComponent(query)}`);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query, view, router, searchParams]);

  // Fetch Artist or Album Data
  useEffect(() => {
    const id = searchParams.get('id');
    if (view === 'artist' && id) {
      setLoading(true);
      fetch(`http://localhost:5001/api/music/artist/${encodeURIComponent(id)}`)
        .then(res => res.json())
        .then(data => { setArtistData(data); setLoading(false); })
        .catch(err => { console.error(err); setLoading(false); });
    }
    if (view === 'album' && id) {
      setLoading(true);
      fetch(`http://localhost:5001/api/music/album/${encodeURIComponent(id)}`)
        .then(res => res.json())
        .then(data => { setAlbumData(data); setLoading(false); })
        .catch(err => { console.error(err); setLoading(false); });
    }
  }, [view, searchParams]);

  const searchYouTube = async (searchQuery) => {
    setLoading(true);
    try {
      const q = searchQuery.trim() || 'trending music 2026';
      if (searchQuery.trim()) {
        addSearchHistory(searchQuery.trim());
      }
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

  const handleHeroPlay = () => {
    if (displayTracks.length > 0) {
      playRadio(displayTracks[0]);
    }
  };

  const handleHeroShuffle = () => {
    if (displayTracks.length > 0) {
      const randomIndex = Math.floor(Math.random() * displayTracks.length);
      playRadio(displayTracks[randomIndex]);
    }
  };

  const handleGenreClick = (genre) => {
    let newQuery = 'trending music';
    if (genre === 'Music') newQuery = 'trending songs';
    if (genre === 'Podcasts') newQuery = 'top podcasts';
    if (genre === 'Artists') newQuery = 'top artists hits';
    if (genre === 'Albums') newQuery = 'popular albums tracks';
    if (genre === 'Playlists') newQuery = 'curated playlists music';
    setQuery(newQuery);
    router.push(`/?q=${encodeURIComponent(newQuery)}`);
  };

  const handleAddToPlaylist = (e, track) => {
    e.stopPropagation();
    if (playlists.length === 0) {
      toast.error("Please create a playlist first from the sidebar!");
      return;
    }
    setContextMenu({
      track,
      x: e.clientX,
      y: e.clientY
    });
  };

  if (view === 'artist') {
    displayTracks = artistData ? artistData.tracks : [];
    viewTitle = artistData ? `Top Tracks by ${artistData.name}` : 'Loading...';
  } else if (view === 'album') {
    displayTracks = albumData ? albumData.tracks : [];
    viewTitle = albumData ? `Album: ${albumData.name}` : 'Loading...';
  }

  return (
    <div className="h-full overflow-y-auto relative flex flex-col bg-echo-base">
      
      {/* Top Header */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-transparent min-h-[72px]">
        
        {/* Navigation Arrows Placeholder */}
        <div className="flex items-center gap-2">
          {/* Can add chevron left/right here if needed */}
        </div>

        {/* Central Search Bar */}
        <div className="relative w-full max-w-md mx-4">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-echo-text-base hover:text-white transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="What do you want to play?" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-[#242424] hover:bg-[#2a2a2a] text-white rounded-full py-3 pl-12 pr-4 outline-none border border-transparent focus:border-white/20 focus:bg-[#2a2a2a] transition-all text-sm font-medium"
          />
        </div>

        <div className="flex items-center gap-4">
          <button className="text-echo-text-base hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
          </button>
          <Link href="/profile" className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-500 to-orange-400 overflow-hidden cursor-pointer shadow-md shadow-black/20 hover:scale-105 transition-transform border-[3px] border-[#181818]">
            <img src={user?.avatar || "https://i.pravatar.cc/150"} alt="User" className="w-full h-full object-cover mix-blend-overlay" />
          </Link>
        </div>
      </div>

      <div className="px-6 pb-24 flex-1 relative">
        
        {/* Background Gradient matching Spotify's subtle top color splash */}
        <div className="absolute top-0 left-0 right-0 h-[400px] bg-gradient-to-b from-[#5c1c1c] via-[#2a1313] to-transparent pointer-events-none opacity-80 -z-10 -mt-[72px]"></div>

        {/* Genre Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-6 mb-2 hide-scrollbar">
          {['All', 'Music', 'Podcasts', 'Artists', 'Albums', 'Playlists'].map((genre, i) => {
            let isActive = false;
            if (genre === 'All' && (query === '' || query === 'trending music')) isActive = true;
            if (genre === 'Music' && query === 'trending songs') isActive = true;
            if (genre === 'Podcasts' && query === 'top podcasts') isActive = true;
            if (genre === 'Artists' && query === 'top artists hits') isActive = true;
            if (genre === 'Albums' && query === 'popular albums tracks') isActive = true;
            if (genre === 'Playlists' && query === 'curated playlists music') isActive = true;

            return (
              <button 
                key={genre} 
                onClick={() => handleGenreClick(genre)}
                className={`px-4 py-1.5 rounded-full whitespace-nowrap font-medium text-sm transition-colors ${
                  isActive
                    ? 'bg-white text-black' 
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {genre}
              </button>
            );
          })}
        </div>

        {/* Recent Searches */}
        {view === 'search' && searchHistory.length > 0 && query === '' && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4 mt-2">
              <h2 className="text-xl font-bold text-white tracking-tight">Recent Searches</h2>
              <button onClick={clearSearchHistory} className="text-xs font-semibold text-echo-text-base hover:text-white transition-colors">Clear</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {searchHistory.map((historyItem, idx) => (
                <div 
                  key={idx} 
                  onClick={() => { setQuery(historyItem); router.push(`/?q=${encodeURIComponent(historyItem)}`); }}
                  className="px-4 py-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white rounded-full text-sm font-medium cursor-pointer transition-colors shadow-sm"
                >
                  {historyItem}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Access Horizontal Grid */}
        {view === 'search' && displayTracks.length > 0 && query !== '' && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
            {displayTracks.slice(0, 8).map((track) => (
              <div 
                key={`quick-${track.id}`}
                onClick={() => playRadio(track)}
                className="group flex items-center bg-white/10 hover:bg-white/20 transition-colors rounded-md overflow-hidden cursor-pointer relative shadow-sm"
              >
                <img src={track.imageUrl} alt={track.name} className="w-14 h-14 object-cover shadow-[0_8px_24px_rgba(0,0,0,0.5)]" />
                <span className="text-white font-bold text-[13px] px-4 truncate flex-1 leading-tight">{track.name}</span>
                
                <div className="absolute right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
                  <div className="w-10 h-10 rounded-full bg-echo-primary text-black flex items-center justify-center shadow-xl hover:scale-105 transition-transform">
                    <Play size={20} fill="currentColor" className="ml-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Dynamic Home Carousels */}
        {view === 'search' && query === '' && (
          <div className="flex flex-col gap-10">
            {/* Trending Section */}
            {homeData.trending.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">Trending Now</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {homeData.trending.slice(0, 10).map((item) => (
                    <div 
                      key={item.id} 
                      onClick={() => handleGenreClick(item.name)}
                      className="group flex flex-col gap-3 p-4 bg-[#181818] hover:bg-[#282828] transition-colors rounded-xl cursor-pointer relative"
                    >
                      <div className="w-full aspect-square rounded-md overflow-hidden relative shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-10">
                          <div className="w-12 h-12 rounded-full bg-echo-primary text-black flex items-center justify-center shadow-xl hover:scale-105 transition-transform hover:bg-[#1fdf64]">
                            <Play size={24} fill="currentColor" className="ml-1" />
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-white font-bold truncate text-[15px]">{item.name}</span>
                        <span className="text-echo-text-base text-[14px] font-medium truncate mt-1">{item.artist || item.type}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Top Charts Section */}
            {homeData.charts.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">Top Charts</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {homeData.charts.slice(0, 5).map((item) => (
                    <div 
                      key={item.id} 
                      onClick={() => handleGenreClick(item.name)}
                      className="group flex flex-col gap-3 p-4 bg-[#181818] hover:bg-[#282828] transition-colors rounded-xl cursor-pointer relative"
                    >
                      <div className="w-full aspect-square rounded-md overflow-hidden relative shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-10">
                          <div className="w-12 h-12 rounded-full bg-echo-primary text-black flex items-center justify-center shadow-xl hover:scale-105 transition-transform hover:bg-[#1fdf64]">
                            <Play size={24} fill="currentColor" className="ml-1" />
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-white font-bold truncate text-[15px]">{item.name}</span>
                        <span className="text-echo-text-base text-[14px] font-medium truncate mt-1">{item.artist || item.type}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
            
            {/* New Albums Section */}
            {homeData.albums.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">New Releases</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {homeData.albums.slice(0, 5).map((item) => (
                    <div 
                      key={item.id} 
                      onClick={() => router.push(`/?view=album&id=${item.id}`)}
                      className="group flex flex-col gap-3 p-4 bg-[#181818] hover:bg-[#282828] transition-colors rounded-xl cursor-pointer relative"
                    >
                      <div className="w-full aspect-square rounded-md overflow-hidden relative shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-10">
                          <div className="w-12 h-12 rounded-full bg-echo-primary text-black flex items-center justify-center shadow-xl hover:scale-105 transition-transform hover:bg-[#1fdf64]">
                            <Play size={24} fill="currentColor" className="ml-1" />
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-white font-bold truncate text-[15px]">{item.name}</span>
                        <span className="text-echo-text-base text-[14px] font-medium truncate mt-1">{item.artist || item.type}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Playlists in Library View */}
        {view === 'library' && playlists.length > 0 && (
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-white tracking-tight mb-6 mt-2">Your Playlists</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {playlists.map((playlist) => (
                <div 
                  key={playlist.id} 
                  onClick={() => router.push(`/?view=playlist&id=${playlist.id}`)}
                  className="group flex flex-col gap-3 p-4 bg-[#181818] hover:bg-[#282828] transition-colors rounded-xl cursor-pointer relative"
                >
                  <div className={`w-full aspect-square rounded-md overflow-hidden relative shadow-[0_8px_24px_rgba(0,0,0,0.5)] ${playlist.color || 'bg-blue-500'} flex items-center justify-center`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white opacity-50"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
                    
                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-10">
                      <div className="w-12 h-12 rounded-full bg-echo-primary text-black flex items-center justify-center shadow-xl hover:scale-105 transition-transform hover:bg-[#1fdf64]" onClick={(e) => { e.stopPropagation(); if (playlist.tracks.length > 0) playRadio(playlist.tracks[0]); }}>
                        <Play size={24} fill="currentColor" className="ml-1" />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white font-bold truncate text-[15px]">{playlist.name}</span>
                    <span className="text-echo-text-base text-[14px] font-medium truncate mt-1">{playlist.tracks.length} songs</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hero Banner for Artist/Album */}
        {view === 'artist' && artistData && (
          <div className="flex items-end gap-6 mb-8 mt-2">
            <div className="w-48 h-48 rounded-full shadow-2xl bg-echo-primary flex items-center justify-center text-black overflow-hidden flex-shrink-0">
               {artistData.tracks[0]?.imageUrl ? <img src={artistData.tracks[0].imageUrl} className="w-full h-full object-cover" /> : <User size={80} />}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white/80 mb-2 uppercase tracking-widest">Artist</span>
              <h1 className="text-6xl font-black text-white tracking-tighter mb-4">{artistData.name}</h1>
              <span className="text-sm text-echo-text-base">{artistData.tracks.length} Top Tracks</span>
            </div>
          </div>
        )}
        
        {view === 'album' && albumData && (
          <div className="flex items-end gap-6 mb-8 mt-2">
            <div className="w-48 h-48 rounded-md shadow-2xl bg-[#282828] overflow-hidden flex-shrink-0">
              {albumData.imageUrl ? <img src={albumData.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white/20"><Music size={60} /></div>}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white/80 mb-2 uppercase tracking-widest">Album</span>
              <h1 className="text-5xl font-black text-white tracking-tighter mb-4 line-clamp-2">{albumData.name}</h1>
              <span className="text-sm text-echo-text-base font-bold">{albumData.artist} • {albumData.tracks.length} songs</span>
            </div>
          </div>
        )}

        {/* Dynamic List Title */}
        <div className="mb-6 flex items-center justify-between mt-2">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {view === 'library' ? 'Liked Songs' : viewTitle}
          </h2>
          <div className="flex items-center gap-4">
            {view === 'playlist' && playlistId && (
              <button 
                onClick={() => {
                  if (window.confirm("Are you sure you want to delete this playlist?")) {
                    deletePlaylist(playlistId);
                    router.push('/');
                  }
                }}
                className="text-sm font-medium text-red-400 hover:text-red-300 transition-colors bg-white/5 px-3 py-1.5 rounded-full hover:bg-white/10"
              >
                Delete Playlist
              </button>
            )}
            <span className="text-sm font-bold text-echo-text-base hover:text-white cursor-pointer transition-colors">Show all</span>
          </div>
        </div>

        {loading && view === 'search' ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-echo-primary" size={40} />
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-5">
            {displayTracks.length === 0 && (
              <div className="col-span-full py-10 text-center text-echo-text-base">
                No tracks found.
              </div>
            )}
            {displayTracks.map((track) => (
              <div 
                key={track.id} 
                className="group flex flex-col p-3 rounded-md hover:bg-white/5 cursor-pointer transition-colors relative"
                onClick={() => playRadio(track)}
              >
                <div className="relative w-full aspect-square rounded-md shadow-[0_8px_24px_rgba(0,0,0,0.5)] mb-3">
                  <img src={track.imageUrl} alt={track.name} className="w-full h-full object-cover rounded-md" />
                  
                  {/* Play Button - Bottom Right */}
                  <div className="absolute bottom-2 right-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-10">
                    <div className="w-12 h-12 rounded-full bg-echo-primary text-white flex items-center justify-center shadow-xl hover:scale-105 transition-transform">
                      <Play size={24} fill="currentColor" className="ml-1" />
                    </div>
                  </div>
                  
                  {/* Hover Actions (Like & Add) */}
                  <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleLike(track); }}
                      className={`p-2 rounded-full bg-black/50 backdrop-blur-md hover:scale-110 transition-transform ${likedSongs.find(t => t.id === track.id) ? 'text-echo-primary' : 'text-white'}`}
                    >
                      <Heart size={16} fill={likedSongs.find(t => t.id === track.id) ? "currentColor" : "none"} />
                    </button>
                    {view === 'playlist' && playlistId ? (
                      <button 
                        onClick={(e) => { e.stopPropagation(); removeTrackFromPlaylist(playlistId, track.id); }}
                        className="p-2 rounded-full bg-black/50 backdrop-blur-md hover:scale-110 transition-transform text-white hover:text-red-400"
                        title="Remove from playlist"
                      >
                        <Trash size={16} />
                      </button>
                    ) : (
                      <button 
                        onClick={(e) => handleAddToPlaylist(e, track)}
                        className="p-2 rounded-full bg-black/50 backdrop-blur-md hover:scale-110 transition-transform text-white"
                        title="Add to playlist"
                      >
                        <Plus size={16} />
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex flex-col px-1">
                  <span className="text-white font-semibold text-sm truncate">{track.name}</span>
                  <span 
                    className="text-echo-text-base text-sm truncate mt-1 hover:underline hover:text-white cursor-pointer"
                    onClick={(e) => { e.stopPropagation(); router.push(`/?view=artist&id=${encodeURIComponent(track.artist)}`); }}
                  >
                    {track.artist}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Context Menu Overlay */}
      {contextMenu.track && (
        <PlaylistContextMenu 
          track={contextMenu.track} 
          position={{ x: contextMenu.x, y: contextMenu.y }} 
          onClose={() => setContextMenu({ track: null, x: 0, y: 0 })} 
        />
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex h-full items-center justify-center bg-echo-base text-white"><Loader2 className="animate-spin text-echo-primary" size={40} /></div>}>
      <SearchPageContent />
    </Suspense>
  );
}
