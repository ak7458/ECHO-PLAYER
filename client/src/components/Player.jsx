"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1, Mic2, LayoutList, MonitorSpeaker, Volume2, VolumeX, Maximize2, Minimize2, ChevronDown, MoreVertical, Heart, Share, MoreHorizontal, Music } from 'lucide-react';
import usePlayerStore from '@/store/usePlayerStore';
import anyAscii from 'any-ascii';
import ShortcutsModal from './ShortcutsModal';

// anyAscii will be used in the trackLyrics useMemo to transliterate lyrics on the fly

const Player = () => {
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const setIsPlaying = usePlayerStore((state) => state.setIsPlaying);
  const togglePlay = usePlayerStore((state) => state.togglePlay);
  const nextTrack = usePlayerStore((state) => state.nextTrack);
  const prevTrack = usePlayerStore((state) => state.prevTrack);
  const isShuffle = usePlayerStore((state) => state.isShuffle);
  const repeatMode = usePlayerStore((state) => state.repeatMode);
  const toggleShuffle = usePlayerStore((state) => state.toggleShuffle);
  const toggleRepeat = usePlayerStore((state) => state.toggleRepeat);
  const likedSongs = usePlayerStore((state) => state.likedSongs) || [];
  const toggleLike = usePlayerStore((state) => state.toggleLike);
  const queue = usePlayerStore((state) => state.queue) || [];
  const clearQueue = usePlayerStore((state) => state.clearQueue);
  const setCurrentTrack = usePlayerStore((state) => state.setCurrentTrack);
  const rightSidebarView = usePlayerStore((state) => state.rightSidebarView);
  const toggleRightSidebarView = usePlayerStore((state) => state.toggleRightSidebarView);
  const setRightSidebarView = usePlayerStore((state) => state.setRightSidebarView);
  const mainView = usePlayerStore((state) => state.mainView);
  const setMainView = usePlayerStore((state) => state.setMainView);

  const handleLyricsToggle = () => {
    if (!currentTrack) return;
    if (mainView === 'lyrics') {
      setMainView('home');
      setRightSidebarView('none');
    } else {
      setMainView('lyrics');
      setRightSidebarView('now-playing');
    }
  };

  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const fetchedLyrics = usePlayerStore((state) => state.lyrics);
  const isFetchingLyrics = fetchedLyrics === null;
  const [showDevices, setShowDevices] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const audioRef = useRef(null);
  const lyricsContainerRef = useRef(null);
  const previousVolume = useRef(0.7);

  const getTrackColor = (track) => {
    if (!track) return '#1e3a30';
    if (track.color) return track.color;
    
    const colors = [
      '#1e3a30', '#164c7e', '#4a1c40', '#4a2c1c', 
      '#301934', '#412b15', '#1a1c29', '#2a3b2c', '#4c1a2c',
      '#1f3d47', '#3d251e', '#232b2b'
    ];
    
    const str = track.name + track.artist;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  // Lyrics are now fetched via usePlayerStore.js on track change

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.log(err));
    } else {
      document.exitFullscreen().catch(err => console.log(err));
    }
  };

  const toggleMute = () => {
    if (volume > 0) {
      previousVolume.current = volume;
      setVolume(0);
    } else {
      setVolume(previousVolume.current || 0.7);
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in an input field
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (currentTrack) togglePlay();
      } else if (e.code === 'ArrowRight') {
        if (currentTrack) nextTrack();
      } else if (e.code === 'ArrowLeft') {
        if (currentTrack) prevTrack();
      } else if (e.key.toLowerCase() === 'm') {
        toggleMute();
      } else if (e.key === '?') {
        setIsShortcutsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTrack, togglePlay, nextTrack, prevTrack, toggleMute]);

  // When track changes, update source and play
  useEffect(() => {
    const src = currentTrack?.src || currentTrack?.streamUrl;
    if (!currentTrack || !src) return;
    const audio = audioRef.current;
    if (!audio) return;

    audio.src = src;
    audio.load();
    if (isPlaying) {
      audio.play().catch(e => console.log("Autoplay prevented:", e));
    }
  }, [currentTrack]);

  // Handle play/pause commands from global state
  useEffect(() => {
    const audio = audioRef.current;
    if (audio && audio.src) {
      if (isPlaying) {
        audio.play().catch(e => {
          console.log("Playback failed:", e);
          setIsPlaying(false);
        });
      } else {
        audio.pause();
      }
    }
  }, [isPlaying]);

  // Handle Volume & Playback Rate Change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.playbackRate = playbackRate;
    }
  }, [volume, playbackRate]);

  // Audio Event Listeners
  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    setCurrentTime(audio.currentTime);
    if (audio.duration && !isNaN(audio.duration)) {
      setProgress((audio.currentTime / audio.duration) * 100);
      setDuration(audio.duration);
    }
  };

  const handleLoadedMetadata = () => {
    const audio = audioRef.current;
    if (audio && audio.duration && !isNaN(audio.duration)) {
      setDuration(audio.duration);
    }
  };

  const handleEnded = () => {
    nextTrack();
  };

  const handleSeek = (e) => {
    if (!audioRef.current || !currentTrack) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newPercentage = Math.max(0, Math.min(1, clickX / rect.width));
    
    const newTime = newPercentage * duration;
    audioRef.current.currentTime = newTime;
    setProgress(newPercentage * 100);
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newVolume = Math.max(0, Math.min(1, clickX / rect.width));
    setVolume(newVolume);
    if (newVolume > 0) previousVolume.current = newVolume;
  };



  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
    localStorage.setItem('echo-volume', volume.toString());
  }, [volume]);

  // Load initial volume
  useEffect(() => {
    const saved = localStorage.getItem('echo-volume');
    if (saved !== null) {
      const vol = parseFloat(saved);
      setVolume(vol);
      previousVolume.current = vol;
    }
  }, []);

  const handleLyricClick = (time) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const trackLyrics = useMemo(() => {
    if (!currentTrack) return [];
    
    if (fetchedLyrics && fetchedLyrics.type === 'synced' && fetchedLyrics.lines && fetchedLyrics.lines.length > 0) {
      return fetchedLyrics.lines.map(lyric => {
        const transliterated = anyAscii(lyric.text);
        const isOriginalDifferent = transliterated !== lyric.text;
        return {
          ...lyric,
          text: transliterated,
          subtext: isOriginalDifferent ? lyric.text : ""
        };
      });
    }
    
    if (fetchedLyrics && fetchedLyrics.type === 'plain') {
      // Create a dummy time-based lyric array for plain text
      const lines = fetchedLyrics.text.split('\n').filter(l => l.trim().length > 0);
      return lines.map((line, i) => {
        const transliterated = anyAscii(line);
        const isOriginalDifferent = transliterated !== line;
        return { 
          time: i * 5, 
          text: transliterated, 
          subtext: isOriginalDifferent ? line : "" 
        };
      });
    }
    
    // Generic fallback when real lyrics are not found
    return [
      { time: 0, text: currentTrack.name || currentTrack.title },
      { time: 5, text: `By ${currentTrack.artist}` },
      { time: 10, text: "Lyrics not available for this track." },
      { time: 100000, text: "" } // Pad end to prevent over-scrolling
    ];
  }, [currentTrack, fetchedLyrics]);
    
  const activeLyricIndex = trackLyrics.findLastIndex(lyric => currentTime >= lyric.time);

  useEffect(() => {
    if (lyricsContainerRef.current && activeLyricIndex !== -1 && mainView === 'lyrics') {
      const container = lyricsContainerRef.current;
      const innerDiv = container.firstChild;
      if (innerDiv && innerDiv.children) {
        const activeElement = innerDiv.children[activeLyricIndex];
        if (activeElement) {
          const scrollPos = activeElement.offsetTop - (container.clientHeight / 2) + (activeElement.clientHeight / 2);
          container.scrollTo({ top: scrollPos, behavior: 'smooth' });
        }
      }
    }
  }, [activeLyricIndex, mainView]);

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds) || seconds === Infinity) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="h-full flex items-center justify-between px-6 relative w-full">
      
      {/* Native HTML5 Audio Element */}
      <audio 
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        style={{ display: 'none' }}
      />

      {/* Global Modals/Drawers go here */}
      <ShortcutsModal isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />

      {/* Track Info & Visualizer */}
      <div className="flex items-center gap-4 w-[30%] min-w-[180px] z-10 relative">
        {currentTrack ? (
          <>
            <div className="relative group cursor-pointer" onClick={() => toggleRightSidebarView('now-playing')}>
              <img src={currentTrack.imageUrl} alt={currentTrack.name} className="w-14 h-14 object-cover rounded-md shadow-lg" />
              <div className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronDown size={14} className="text-white" />
              </div>
            </div>
            <div className="flex flex-col truncate">
              <span className="text-sm font-bold text-white truncate hover:underline cursor-pointer" onClick={() => toggleRightSidebarView('now-playing')}>{currentTrack.name}</span>
              <span className="text-xs text-echo-text-base truncate hover:underline cursor-pointer">{currentTrack.artist}</span>
            </div>
            {isPlaying && (
              <div className="flex items-end gap-[2px] h-4 ml-2">
                <div className="w-[3px] bg-echo-primary animate-[bounce_1s_infinite_ease-in-out]"></div>
                <div className="w-[3px] bg-echo-primary animate-[bounce_0.8s_infinite_ease-in-out] animation-delay-200"></div>
                <div className="w-[3px] bg-echo-primary animate-[bounce_1.2s_infinite_ease-in-out] animation-delay-400"></div>
              </div>
            )}
            <button onClick={() => toggleLike(currentTrack)} className="ml-2 hover:scale-110 transition-transform">
              <Heart size={18} className={likedSongs.some(t => t.id === currentTrack.id) ? "text-[#8B5CF6]" : "text-echo-text-base hover:text-white"} fill={likedSongs.some(t => t.id === currentTrack.id) ? "currentColor" : "none"} />
            </button>
          </>
        ) : (
          <div className="flex flex-col justify-center">
            <div className="text-sm text-echo-text-base">No track selected</div>
          </div>
        )}
      </div>

      {/* Main Controls */}
      <div className="flex flex-col items-center justify-center w-[40%] max-w-[722px] gap-2 z-10">
        <div className="flex items-center gap-6">
          <button onClick={toggleShuffle} className={`transition-colors ${isShuffle ? 'text-echo-primary' : 'text-echo-text-base hover:text-white'}`}><Shuffle size={18} /></button>
          <button onClick={prevTrack} className="text-echo-text-base hover:text-white transition-colors"><SkipBack size={22} fill="currentColor" /></button>
          
          <button 
            onClick={togglePlay} 
            disabled={!currentTrack}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-black hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 disabled:hover:scale-100 shadow-md shadow-white/10"
          >
            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
          </button>

          <button onClick={nextTrack} className="text-echo-text-base hover:text-white transition-colors"><SkipForward size={22} fill="currentColor" /></button>
          <button onClick={toggleRepeat} className={`transition-colors ${repeatMode !== 'off' ? 'text-echo-primary' : 'text-echo-text-base hover:text-white'}`}>
            {repeatMode === 'one' ? <Repeat1 size={18} /> : <Repeat size={18} />}
          </button>
        </div>
        <div className="flex items-center gap-3 w-full">
          <span className="text-xs font-medium text-echo-text-base min-w-[40px] text-right">{formatTime(currentTime)}</span>
          
          <div className="h-1.5 flex-1 bg-white/10 rounded-full group cursor-pointer flex items-center" onClick={handleSeek}>
            <div className="h-full bg-echo-primary rounded-full relative flex items-center justify-end" style={{ width: `${progress}%` }}>
              <div className="w-3.5 h-3.5 bg-white rounded-full absolute -right-1.5 opacity-0 group-hover:opacity-100 shadow-md"></div>
            </div>
          </div>

          <span className="text-xs font-medium text-echo-text-base min-w-[40px]">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Extra Controls */}
      <div className="flex items-center justify-end gap-5 w-[30%] min-w-[180px] z-10 text-echo-text-base relative">
        <button onClick={handleLyricsToggle} className={`hover:text-white transition-colors ${mainView === 'lyrics' ? 'text-echo-primary' : ''}`} title="Lyrics">
          <Mic2 size={18} />
        </button>
        
        <button onClick={() => { toggleRightSidebarView('queue'); setShowDevices(false); }} className={`hover:text-white transition-colors ${rightSidebarView === 'queue' ? 'text-echo-primary' : ''}`} title="Queue">
          <LayoutList size={18} />
        </button>

        {/* Speed Control */}
        <button 
          onClick={() => {
            const speeds = [1, 1.25, 1.5, 2, 0.5, 0.75];
            const currentIdx = speeds.indexOf(playbackRate);
            setPlaybackRate(speeds[(currentIdx + 1) % speeds.length]);
          }} 
          className="text-xs font-bold hover:text-white transition-colors min-w-[28px]" 
          title="Playback Speed"
        >
          {playbackRate}x
        </button>

        <div className="relative flex items-center justify-center">
          <button onClick={() => { setShowDevices(!showDevices); setShowQueue(false); }} className={`hover:text-white transition-colors ${showDevices ? 'text-echo-primary' : ''}`} title="Connect to a device">
            <MonitorSpeaker size={18} />
          </button>
          
          {showDevices && (
            <div className="absolute bottom-full right-0 mb-6 w-72 bg-[#282828] rounded-xl shadow-2xl border border-white/10 p-4 z-[200]">
              <h3 className="text-white font-bold text-lg mb-4">Connect to a device</h3>
              <div className="flex items-center gap-4 p-3 bg-echo-primary/20 rounded-lg border border-echo-primary/50">
                <MonitorSpeaker size={24} className="text-echo-primary" />
                <div className="flex flex-col">
                  <span className="text-white font-semibold text-sm">Current Browser</span>
                  <span className="text-echo-primary text-xs">Listening On</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={toggleMute} className="hover:text-white transition-colors" title="Mute">
            {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <div className="w-24 h-1.5 bg-white/10 rounded-full group cursor-pointer flex items-center" onClick={handleVolumeChange}>
            <div className="h-full bg-white group-hover:bg-echo-primary rounded-full relative flex items-center justify-end" style={{ width: `${volume * 100}%` }}>
              <div className="w-3.5 h-3.5 bg-white rounded-full absolute -right-1.5 opacity-0 group-hover:opacity-100 shadow-md transition-opacity"></div>
            </div>
          </div>
        </div>
        <button onClick={() => { if(currentTrack) toggleFullScreen(); }} className="hover:text-white transition-colors" title="Full screen">
          <Maximize2 size={18} />
        </button>
      </div>

      {/* Main Content Overlay (Lyrics) */}
      {mainView === 'lyrics' && currentTrack && (
        <div 
          className={`fixed top-3 bottom-[108px] left-[284px] ${rightSidebarView !== 'none' ? 'right-[374px]' : 'right-3'} rounded-2xl overflow-hidden z-20 flex flex-col transition-all duration-300 shadow-xl`}
          style={{ backgroundColor: getTrackColor(currentTrack) }}
        >
          {/* Blurred Background Hint */}
          <div className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none opacity-40 mix-blend-overlay">
            <div 
              className="absolute inset-0 w-full h-full scale-110 blur-[80px]" 
              style={{ backgroundImage: `url(${currentTrack.imageUrl || 'https://via.placeholder.com/500'})`, backgroundPosition: 'center', backgroundSize: 'cover' }}
            />
          </div>

          <div className="p-8 pb-4 flex items-center justify-between flex-shrink-0 relative z-10">
            <h3 className="text-2xl font-black text-white tracking-tight">Lyrics</h3>
            <div className="flex items-center gap-3">
              {fetchedLyrics && fetchedLyrics.type === 'synced' && <span className="text-xs font-bold text-white bg-black/20 px-3 py-1.5 rounded-full">Synced</span>}
              {fetchedLyrics && fetchedLyrics.type === 'plain' && <span className="text-xs font-bold text-white bg-black/20 px-3 py-1.5 rounded-full">Plain Text</span>}
              <button onClick={handleLyricsToggle} className="p-2 rounded-full hover:bg-black/20 transition-colors text-white">
                <Maximize2 size={18} />
              </button>
            </div>
          </div>

          <div 
            ref={lyricsContainerRef}
            className="flex-1 overflow-y-auto px-10 py-6 space-y-8 relative z-10 w-full max-w-4xl [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {trackLyrics.map((lyric, index) => {
              const isActive = index === activeLyricIndex;
              const isPast = index < activeLyricIndex;
              return (
                <div 
                  key={index}
                  onClick={() => handleLyricClick(lyric.time)}
                  className={`transition-all duration-500 cursor-pointer origin-left flex flex-col gap-2 ${
                    isActive ? 'scale-[1.02]' : ''
                  }`}
                >
                  <p className={`text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight transition-colors duration-500 ${
                    isActive ? 'text-white' : isPast ? 'text-black/40 hover:text-black/60' : 'text-black/30 hover:text-black/50'
                  }`}>
                    {lyric.text}
                  </p>
                  {lyric.subtext && (
                    <p className={`text-2xl md:text-3xl font-bold transition-colors duration-500 ${
                      isActive ? 'text-white/80' : isPast ? 'text-black/30 hover:text-black/50' : 'text-black/20 hover:text-black/40'
                    }`}>
                      {lyric.subtext}
                    </p>
                  )}
                </div>
              );
            })}
            <div className="h-[40vh] flex-shrink-0" />
          </div>
        </div>
      )}

      {/* Right Sidebar Overlay */}
      {rightSidebarView !== 'none' && (
        <div className="fixed top-3 right-3 bottom-[108px] w-[350px] bg-[#121212] rounded-2xl border border-white/5 z-40 flex flex-col overflow-hidden animate-in slide-in-from-right-8 duration-300 shadow-2xl">
          
          {rightSidebarView === 'now-playing' && currentTrack && (
            <div className="flex flex-col h-full relative overflow-y-auto hide-scrollbar p-4">
              
              <div className="flex items-center justify-between mb-4">
                <div />
                <div className="flex items-center gap-4 text-white/60">
                  <MoreHorizontal size={18} className="cursor-pointer hover:text-white transition-colors" />
                  <button onClick={toggleFullScreen} className="hover:text-white transition-colors">
                    <Maximize2 size={16} />
                  </button>
                </div>
              </div>

              <div className="w-full aspect-square rounded-xl overflow-hidden mb-4 shadow-xl">
                <img src={currentTrack.imageUrl || 'https://via.placeholder.com/500'} className="w-full h-full object-cover" alt="" />
              </div>

              <div className="flex items-start justify-between mb-8">
                <div className="flex flex-col flex-1 pr-4 truncate">
                  <h2 className="text-2xl font-black text-white hover:underline cursor-pointer tracking-tight mb-1 truncate">{currentTrack.name}</h2>
                  <p className="text-base text-white/60 hover:underline cursor-pointer truncate">{currentTrack.artist}</p>
                </div>
                <div className="flex items-center gap-5 mt-2">
                  <Share size={20} className="text-white/60 hover:text-white cursor-pointer transition-colors" />
                  <button onClick={() => toggleLike(currentTrack)} className="flex-shrink-0">
                  {likedSongs.find(t => t.id === currentTrack.id) ? (
                    <div className="w-7 h-7 rounded-full bg-[#1ed760] flex items-center justify-center hover:scale-105 transition-transform">
                       <svg viewBox="0 0 24 24" className="w-4 h-4 text-black"><path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full border-2 border-white/60 flex items-center justify-center hover:border-white transition-all hover:scale-105 group">
                       <svg viewBox="0 0 24 24" className="w-4 h-4 text-white/60 group-hover:text-white transition-colors"><path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                    </div>
                  )}
                </button>
                </div>
              </div>

              <div className="relative w-full h-[320px] rounded-xl overflow-hidden group cursor-pointer shadow-lg">
                <img src={currentTrack.imageUrl || 'https://via.placeholder.com/500'} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/90"></div>
                <div className="absolute top-4 left-4 z-10">
                  <span className="text-white font-bold text-[15px] tracking-wide">About the artist</span>
                </div>
                <div className="absolute bottom-5 left-5 right-5 flex flex-col z-10">
                  <span className="text-white font-bold text-xl mb-1.5">{currentTrack.artist}</span>
                  <span className="text-white/80 text-sm line-clamp-2">This is a dynamic section about the artist featured in {currentTrack.name}. They have millions of monthly listeners and top charts globally.</span>
                </div>
              </div>
              
              <div className="h-10 flex-shrink-0" />
            </div>
          )}

          {rightSidebarView === 'queue' && (
            <div className="flex flex-col h-full bg-[#121212]">
              <div className="p-6 border-b border-white/5 flex-shrink-0 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white tracking-tight">Queue</h3>
                {queue.length > 0 && (
                  <button onClick={clearQueue} className="text-xs font-semibold text-echo-text-base hover:text-white transition-colors px-3 py-1 bg-white/5 hover:bg-white/10 rounded-full">Clear</button>
                )}
              </div>
              <div className="flex-1 overflow-y-auto hide-scrollbar p-4 flex flex-col gap-2">
                {queue.length > 0 ? queue.map((track, idx) => (
                  <div key={idx} onClick={() => setCurrentTrack(track)} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-white/10 transition-colors ${currentTrack?.id === track.id ? 'bg-white/5' : ''}`}>
                    <img src={track.imageUrl || 'https://via.placeholder.com/50'} className="w-12 h-12 rounded-md object-cover flex-shrink-0" alt="" />
                    <div className="flex flex-col truncate flex-1">
                      <span className={`text-sm font-semibold truncate ${currentTrack?.id === track.id ? 'text-echo-primary' : 'text-white'}`}>{track.name}</span>
                      <span className="text-xs text-white/60 truncate">{track.artist}</span>
                    </div>
                  </div>
                )) : (
                  <div className="p-4 text-center text-white/50 text-sm">Queue is empty</div>
                )}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Custom Fullscreen View */}
      {isFullscreen && currentTrack && (
        <div 
          className="fixed top-0 left-0 right-0 bottom-[96px] z-[9999] flex flex-col items-center justify-center animate-in fade-in duration-500"
          style={{ backgroundColor: getTrackColor(currentTrack) }}
        >
          <div className="absolute top-10 left-10 flex items-center gap-2">
          </div>
          
          <div className="absolute top-10 right-10 flex items-center gap-6 text-white/80">
            <button onClick={toggleFullScreen} className="hover:text-white transition-colors p-3 bg-black/20 rounded-full backdrop-blur-md">
              <Minimize2 size={24} />
            </button>
          </div>

          <div className="w-[65vh] max-w-[700px] aspect-square rounded-2xl overflow-hidden shadow-2xl shadow-black/50 hover:scale-105 transition-transform duration-700">
            <img src={currentTrack.imageUrl || 'https://via.placeholder.com/500'} className="w-full h-full object-cover" alt="" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Player;
