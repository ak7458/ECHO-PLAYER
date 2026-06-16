import React, { useState } from 'react';
import { X, Music } from 'lucide-react';
import usePlayerStore from '@/store/usePlayerStore';

const PlaylistModal = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const createPlaylist = usePlayerStore((state) => state.createPlaylist);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      createPlaylist(name.trim());
      setName('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#282828] w-full max-w-md rounded-xl shadow-2xl p-6 relative animate-in zoom-in-95 duration-200 border border-white/10">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold text-white mb-6">Create Playlist</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <div className="w-32 h-32 bg-[#181818] rounded-md flex items-center justify-center shadow-inner group relative cursor-pointer flex-shrink-0">
              <Music size={40} className="text-white/20 group-hover:text-white/40 transition-colors" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md">
                 <span className="text-white text-xs font-semibold">Choose image</span>
              </div>
            </div>
            
            <div className="flex-1 flex flex-col gap-2">
              <label htmlFor="playlistName" className="text-sm font-semibold text-white/80">Name</label>
              <input
                id="playlistName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Awesome Playlist"
                className="w-full bg-[#3e3e3e] text-white rounded-md py-3 px-4 outline-none border border-transparent focus:border-white/30 focus:bg-[#4a4a4a] transition-all font-medium placeholder:text-white/40 shadow-inner"
                autoFocus
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-2">
            <button 
              type="button" 
              onClick={onClose}
              className="px-6 py-2.5 rounded-full font-bold text-white hover:scale-105 active:scale-95 transition-transform"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={!name.trim()}
              className="px-6 py-2.5 rounded-full bg-white text-black font-bold hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
            >
              Save
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default PlaylistModal;
