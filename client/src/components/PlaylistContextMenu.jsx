import React, { useEffect, useRef } from 'react';
import usePlayerStore from '@/store/usePlayerStore';
import { Plus } from 'lucide-react';

const PlaylistContextMenu = ({ track, position, onClose }) => {
  const playlists = usePlayerStore((state) => state.playlists) || [];
  const addTrackToPlaylist = usePlayerStore((state) => state.addTrackToPlaylist);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };
    // Use capture phase to ensure it runs before other click handlers might stop propagation
    document.addEventListener('click', handleClickOutside, true);
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, [onClose]);

  if (!track || !position) return null;

  // Adjust position so it doesn't overflow the screen
  const menuStyle = {
    top: `${position.y}px`,
    left: `${position.x}px`,
  };

  return (
    <div 
      ref={menuRef}
      className="fixed z-[100] w-56 bg-[#282828] border border-white/10 rounded-lg shadow-2xl py-1 flex flex-col animate-in fade-in zoom-in-95 duration-150"
      style={menuStyle}
    >
      <div className="px-3 py-2 text-xs font-bold text-white/50 uppercase tracking-wider border-b border-white/10 mb-1">
        Add to Playlist
      </div>
      
      <div className="max-h-60 overflow-y-auto hide-scrollbar">
        {playlists.length === 0 ? (
          <div className="px-4 py-3 text-sm text-white/50 text-center">No playlists yet</div>
        ) : (
          playlists.map((playlist) => (
            <button
              key={playlist.id}
              className="w-full text-left px-4 py-2.5 text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 transition-colors truncate flex items-center gap-3"
              onClick={(e) => {
                e.stopPropagation();
                addTrackToPlaylist(playlist.id, track);
                onClose();
              }}
            >
              <div className={`w-6 h-6 rounded-sm ${playlist.color || 'bg-blue-500'} flex-shrink-0 shadow-sm flex items-center justify-center`}>
                <Plus size={14} className="text-white opacity-80" />
              </div>
              <span className="truncate">{playlist.name}</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default PlaylistContextMenu;
