"use client";

import React, { useState, useEffect } from 'react';
import { Play, MoreHorizontal, Settings, Clock, Music, Trophy, Star, ShieldCheck, ChevronLeft, Edit2, LogOut, Loader2 } from 'lucide-react';
import usePlayerStore from '@/store/usePlayerStore';
import useAuthStore from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const likedSongs = usePlayerStore((state) => state.likedSongs) || [];
  const playRadio = usePlayerStore((state) => state.playRadio);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const uploadAvatar = useAuthStore((state) => state.uploadAvatar);
  
  const [mounted, setMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    if (user) {
      setEditName(user.name);
      setEditAvatar(user.avatar);
    }
  }, [user]);

  if (!mounted || !user) return null;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleSave = async () => {
    setSaving(true);
    await updateProfile(user.id, editName, editAvatar);
    setSaving(false);
    setIsEditing(false);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingAvatar(true);
    const res = await uploadAvatar(file);
    if (res.success) {
      setEditAvatar(res.avatarUrl);
    } else {
      alert("Failed to upload avatar: " + (res.error || "Unknown"));
      console.error(res);
    }
    setUploadingAvatar(false);
  };

  return (
    <div className="h-full overflow-y-auto relative flex flex-col bg-echo-base">
      {/* Background Premium Splash */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-[#8854ff] via-[#2c1b54] to-transparent pointer-events-none opacity-40 -z-10"></div>
      
      {/* Top Header */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-black/20 backdrop-blur-md min-h-[72px] border-b border-white/5">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center text-white hover:scale-105 transition-transform"
        >
          <ChevronLeft size={24} />
        </button>
        <span className="text-sm font-bold text-white tracking-widest uppercase">Profile</span>
        <button 
          onClick={handleLogout}
          className="w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors"
          title="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>

      <div className="px-8 pb-24 pt-8">
        {/* Profile Hero */}
        <div className="flex flex-col md:flex-row items-end gap-8 mb-12">
          <div className="relative group">
            <div className="w-48 h-48 md:w-60 md:h-60 rounded-full bg-gradient-to-tr from-[#8854ff] to-orange-400 overflow-hidden shadow-2xl shadow-[#8854ff]/20 p-1">
              <div className="w-full h-full rounded-full overflow-hidden border-4 border-black relative">
                <img src={(isEditing ? editAvatar : user.avatar) || "https://i.pravatar.cc/150"} alt={user.name} className={`w-full h-full object-cover ${uploadingAvatar ? 'opacity-50' : ''}`} />
                {isEditing && (
                  <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center cursor-pointer opacity-0 hover:opacity-100 transition-opacity">
                    {uploadingAvatar ? <Loader2 className="animate-spin text-white mb-1" size={24} /> : <Settings className="text-white mb-1" size={24} />}
                    <span className="text-white text-xs font-bold uppercase tracking-wider">{uploadingAvatar ? 'Uploading' : 'Change'}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
                  </label>
                )}
              </div>
            </div>
            {user.isPremium && (
              <div className="absolute bottom-2 right-6 bg-white text-black text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                <ShieldCheck size={14} className="text-[#8854ff]" /> Premium
              </div>
            )}
          </div>
          
          <div className="flex flex-col pb-4 flex-1">
            <span className="text-sm font-semibold text-white/70 uppercase tracking-widest mb-2">Member</span>
            
            {isEditing ? (
              <div className="flex flex-col gap-3 mb-6 bg-[#242424] p-4 rounded-xl border border-white/10">
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[#181818] text-white rounded-lg py-2 px-3 outline-none text-xl font-bold"
                  placeholder="Display Name"
                />
                <input 
                  type="text" 
                  value={editAvatar}
                  onChange={(e) => setEditAvatar(e.target.value)}
                  className="w-full bg-[#181818] text-white rounded-lg py-2 px-3 outline-none text-sm"
                  placeholder="Avatar URL"
                />
                <div className="flex items-center gap-2 mt-2">
                  <button onClick={handleSave} disabled={saving} className="bg-white text-black font-bold px-4 py-2 rounded-full hover:scale-105 transition-transform flex items-center gap-2">
                    {saving ? <Loader2 size={16} className="animate-spin" /> : 'Save'}
                  </button>
                  <button onClick={() => setIsEditing(false)} className="bg-white/10 text-white font-bold px-4 py-2 rounded-full hover:bg-white/20 transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4 mb-6">
                <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter hover:underline cursor-pointer">{user.name}</h1>
                <button onClick={() => setIsEditing(true)} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
                  <Edit2 size={18} />
                </button>
              </div>
            )}
            
            <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-white/80">
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-lg">24</span> Public Playlists
              </div>
              <div className="w-1 h-1 rounded-full bg-white/30"></div>
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-lg">{(user.followers || 0).toLocaleString()}</span> Followers
              </div>
              <div className="w-1 h-1 rounded-full bg-white/30"></div>
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-lg">{(user.following || 0).toLocaleString()}</span> Following
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-white/5 rounded-2xl p-6 border border-white/5 hover:bg-white/10 transition-colors">
            <Clock className="text-[#8854ff] mb-3" size={28} />
            <div className="text-2xl font-bold text-white mb-1">{(user.listeningTime || 0).toLocaleString()} hrs</div>
            <div className="text-xs text-echo-text-base uppercase tracking-wider font-semibold">Listening Time</div>
          </div>
          <div className="bg-white/5 rounded-2xl p-6 border border-white/5 hover:bg-white/10 transition-colors">
            <Music className="text-orange-400 mb-3" size={28} />
            <div className="text-2xl font-bold text-white mb-1">Pop & RnB</div>
            <div className="text-xs text-echo-text-base uppercase tracking-wider font-semibold">Top Genre</div>
          </div>
          <div className="bg-white/5 rounded-2xl p-6 border border-white/5 hover:bg-white/10 transition-colors">
            <Trophy className="text-yellow-400 mb-3" size={28} />
            <div className="text-2xl font-bold text-white mb-1">Top 1%</div>
            <div className="text-xs text-echo-text-base uppercase tracking-wider font-semibold">Listener Tier</div>
          </div>
          <div className="bg-white/5 rounded-2xl p-6 border border-white/5 hover:bg-white/10 transition-colors">
            <Star className="text-emerald-400 mb-3" size={28} />
            <div className="text-2xl font-bold text-white mb-1">Echo Ex</div>
            <div className="text-xs text-echo-text-base uppercase tracking-wider font-semibold">Subscription</div>
          </div>
        </div>

        {/* Top Tracks */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white tracking-tight">Top tracks this month</h2>
            <span className="text-sm font-bold text-echo-text-base hover:text-white cursor-pointer transition-colors">Show all</span>
          </div>
          
          <div className="flex flex-col">
            {likedSongs.length > 0 ? (
              likedSongs.slice(0, 5).map((track, idx) => (
                <div 
                  key={track.id} 
                  onClick={() => playRadio(track)}
                  className="group flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors relative"
                >
                  <div className="w-8 text-center text-echo-text-base font-semibold group-hover:hidden">{idx + 1}</div>
                  <div className="w-8 hidden items-center justify-center text-white group-hover:flex">
                    <Play size={16} fill="currentColor" />
                  </div>
                  <img src={track.imageUrl} alt={track.name} className="w-12 h-12 rounded object-cover shadow-md" />
                  <div className="flex flex-col flex-1 pr-4 truncate">
                    <span className="text-white font-semibold text-[15px] truncate group-hover:text-echo-primary transition-colors">{track.name}</span>
                    <span className="text-echo-text-base text-[13px] truncate">{track.artist}</span>
                  </div>
                  <div className="text-echo-text-base text-sm hidden md:block w-1/4 truncate">{track.album}</div>
                  <div className="text-echo-text-base text-sm w-16 text-right group-hover:hidden">
                    {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                  </div>
                  <div className="w-16 hidden justify-end group-hover:flex">
                    <MoreHorizontal size={20} className="text-white" />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-echo-text-base p-4 bg-white/5 rounded-xl border border-white/5 text-center">
                Play and like some songs to see your top tracks here!
              </div>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}
