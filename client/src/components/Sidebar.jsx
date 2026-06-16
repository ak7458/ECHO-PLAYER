"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Home, Search, Library, Podcast, Radio, Heart, Plus, Activity } from 'lucide-react';
import { usePathname } from 'next/navigation';
import usePlayerStore from '@/store/usePlayerStore';
import useAuthStore from '@/store/useAuthStore';
import PlaylistModal from './PlaylistModal';
import AuthModal from './AuthModal';

const Sidebar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const pathname = usePathname();
  const playlists = usePlayerStore((state) => state.playlists);
  const createPlaylist = usePlayerStore((state) => state.createPlaylist);
  const user = useAuthStore((state) => state.user);

  const setMainView = usePlayerStore((state) => state.setMainView);
  const setRightSidebarView = usePlayerStore((state) => state.setRightSidebarView);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);

  const handleNewPlaylist = () => {
    setIsModalOpen(true);
  };

  const handleNavClick = () => {
    setMainView('home');
    setRightSidebarView('none');
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => console.log(err));
    }
  };

  const playlistImages = [
    "https://images.unsplash.com/photo-1493225457124-a1a2a53b53f6?w=100&h=100&fit=crop&q=80",
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100&h=100&fit=crop&q=80",
    "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=100&h=100&fit=crop&q=80",
    "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&h=100&fit=crop&q=80",
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&h=100&fit=crop&q=80"
  ];

  return (
    <div className="flex flex-col gap-4 h-full px-2 py-4 pb-0">
      {/* Logo */}
      <div className="flex flex-col mb-6 px-2 items-center text-center mt-2">
        <Activity size={40} className="text-[#8854ff] mb-3" strokeWidth={2.5} />
        <span className="text-2xl font-semibold tracking-[0.3em] text-white">E C H O</span>
        <p className="text-xs text-echo-text-base mt-1 tracking-wide">Feel Every Beat</p>
      </div>

      {/* Main Navigation */}
      <div className="flex flex-col gap-1 px-2">
        <Link href="/" onClick={handleNavClick} className={`flex items-center gap-4 px-4 py-3 rounded-xl font-medium transition-all ${pathname === '/' ? 'text-white bg-gradient-to-r from-[#4b35c3] to-[#2c1b54] shadow-md' : 'text-echo-text-base hover:text-white'}`}>
          <Home size={22} fill={pathname === '/' ? "currentColor" : "none"} />
          <span>Home</span>
        </Link>
        <Link href="/search" onClick={handleNavClick} className={`flex items-center gap-4 px-4 py-3 rounded-xl font-medium transition-all ${pathname === '/search' ? 'text-white bg-gradient-to-r from-[#4b35c3] to-[#2c1b54] shadow-md' : 'text-[#9b9b9b] hover:text-white'}`}>
          <Search size={22} />
          <span>Explore</span>
        </Link>
        <Link href="/?view=library" onClick={handleNavClick} className="flex items-center gap-4 px-4 py-3 font-medium text-[#9b9b9b] hover:text-white transition-all rounded-xl">
          <Library size={22} />
          <span>Library</span>
        </Link>
        <Link href="/" onClick={handleNavClick} className="flex items-center gap-4 px-4 py-3 font-medium text-[#9b9b9b] hover:text-white transition-all rounded-xl">
          <Podcast size={22} />
          <span>Podcasts</span>
        </Link>
        <Link href="/" onClick={handleNavClick} className="flex items-center gap-4 px-4 py-3 font-medium text-[#9b9b9b] hover:text-white transition-all rounded-xl">
          <Radio size={22} />
          <span>Radio</span>
        </Link>
      </div>
      
      <hr className="border-white/5 my-2 mx-4" />
      
      {/* Playlists Section */}
      <div className="flex-1 flex flex-col min-h-0 mt-2">
        <div className="flex items-center justify-between px-5 mb-4">
          <span className="text-[13px] font-medium tracking-wide text-echo-text-base">Your Playlists</span>
          <Plus size={18} onClick={handleNewPlaylist} className="text-echo-text-base hover:text-white cursor-pointer transition-colors" />
        </div>
        
        <div className="flex-1 overflow-y-auto px-2 hide-scrollbar">
          {playlists.map((playlist, idx) => (
            <Link key={playlist.id} href={`/?view=playlist&id=${playlist.id}`} onClick={handleNavClick} className="flex items-center gap-4 p-2.5 rounded-xl hover:bg-white/5 cursor-pointer transition-colors">
              <img src={playlistImages[idx % playlistImages.length]} alt={playlist.name} className="w-[42px] h-[42px] rounded-lg shadow-sm object-cover flex-shrink-0" />
              <div className="flex flex-col overflow-hidden">
                <span className="text-[14px] text-white/90 font-medium truncate mb-0.5">{playlist.name}</span>
                <span className="text-[12px] text-echo-text-base font-normal truncate">{playlist.tracks.length} songs</span>
              </div>
            </Link>
          ))}
          <div onClick={handleNewPlaylist} className="flex items-center gap-4 p-2.5 mt-1 rounded-xl hover:bg-white/5 cursor-pointer transition-colors text-echo-text-base hover:text-white">
            <div className="w-[42px] h-[42px] rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
              <Plus size={20} />
            </div>
            <span className="text-[14px] font-medium">New Playlist</span>
          </div>
        </div>
      </div>

      {/* User Profile / Auth */}
      <div className="mt-auto px-2">
        {isAuthenticated ? (
          <div className="flex items-center justify-between bg-echo-elevated p-3 rounded-xl border border-white/5 cursor-pointer hover:bg-echo-elevated-highlight transition-colors relative group">
            <Link href="/profile" onClick={handleNavClick} className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#8B5CF6] to-[#06B6D4] overflow-hidden shadow-lg border-[2px] border-[#242424]">
                <img src={user?.avatar || "https://i.pravatar.cc/150"} alt="User" className="w-full h-full object-cover mix-blend-overlay" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white">{user?.name || 'User'}</span>
                <span className="text-[11px] font-bold tracking-wider text-[#8B5CF6] uppercase">Premium</span>
              </div>
            </Link>
            <button 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); logout(); }}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold text-white/60 hover:text-red-400 absolute right-3"
            >
              Logout
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setIsAuthModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-colors border border-white/10"
          >
            <Activity size={18} />
            Log In / Sign Up
          </button>
        )}
      </div>

      <PlaylistModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
};

export default Sidebar;
