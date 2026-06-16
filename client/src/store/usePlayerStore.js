import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';

const usePlayerStore = create(
  persist(
    (set, get) => ({
      currentTrack: null,
      isPlaying: false,
      queue: [],
      currentIndex: -1,
      mainView: 'home', // 'home', 'lyrics', 'queue'
      rightSidebarView: 'none', // 'none', 'now-playing', 'queue'
      isShuffle: false,
      repeatMode: 'off', // 'off', 'all', 'one'
      
      // Personal Library State
      likedSongs: [],
      playlists: [
        { id: '1', name: 'Chill Vibes', color: 'bg-indigo-500', tracks: [] },
        { id: '2', name: 'Late Night', color: 'bg-purple-600', tracks: [] },
      ],
      library: [], // general saved tracks
      
      lyrics: null, // can be { type: 'synced', lines: [...] } or { type: 'plain', text: "..." }
      searchHistory: [],
      addSearchHistory: (query) => set((state) => {
        const trimmed = query.trim();
        if (!trimmed) return state;
        const filtered = state.searchHistory.filter(q => q.toLowerCase() !== trimmed.toLowerCase());
        return { searchHistory: [trimmed, ...filtered].slice(0, 10) };
      }),
      clearSearchHistory: () => set({ searchHistory: [] }),
      
      fetchLyrics: async (track) => {
        try {
          const res = await fetch(`http://localhost:5001/api/music/lyrics?track=${encodeURIComponent(track.name)}&artist=${encodeURIComponent(track.artist)}`);
          if (res.ok) {
            const data = await res.json();
            set({ lyrics: data });
          } else {
            set({ lyrics: null });
          }
        } catch (err) {
          set({ lyrics: null });
        }
      },
      fetchRecommendations: async (track) => {
        try {
          const res = await fetch(`http://localhost:5001/api/music/recommendations?artist=${encodeURIComponent(track.artist)}`);
          if (res.ok) {
            const data = await res.json();
            // Automatically queue up recommendations (30-50 songs as requested)
            const currentQueue = get().queue;
            // Only add if not already in queue to prevent infinite duplicates
            const newTracks = data.filter(t => !currentQueue.find(q => q.id === t.id));
            if (newTracks.length > 0) {
              set({ queue: [...currentQueue, ...newTracks] });
            }
          }
        } catch (err) {
          console.error("Failed to fetch recommendations", err);
        }
      },
      
      playRadio: async (track) => {
        set({ currentTrack: track, isPlaying: true, queue: [track], currentIndex: 0 });
        get().fetchLyrics(track);
        get().fetchRecommendations(track);
      },

      setQueue: (tracks) => set({ queue: tracks }),
      setCurrentTrack: (track) => {
        const { queue } = get();
        const currentTrack = get().currentTrack;
        if (track.id !== currentTrack?.id) {
          const index = queue.findIndex(t => t.id === track.id);
          set({ 
            currentTrack: track, 
            isPlaying: true, 
            currentIndex: index,
            lyrics: null // Reset lyrics while loading new ones
          });
          get().fetchLyrics(track);
          // Fetch auto-sync queue
          get().fetchRecommendations(track);
        } else {
          set({ isPlaying: true });
        }
      },
      setIsPlaying: (playing) => set({ isPlaying: playing }),
      togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
      toggleShuffle: () => set((state) => ({ isShuffle: !state.isShuffle })),
      toggleRepeat: () => set((state) => {
        const modes = ['off', 'all', 'one'];
        const currentIdx = modes.indexOf(state.repeatMode);
        return { repeatMode: modes[(currentIdx + 1) % modes.length] };
      }),
      
      setMainView: (view) => set({ mainView: view }),
      toggleMainView: (view) => set((state) => ({ 
        mainView: state.mainView === view ? 'home' : view 
      })),

      setRightSidebarView: (view) => set({ rightSidebarView: view }),
      toggleRightSidebarView: (view) => set((state) => ({ 
        rightSidebarView: state.rightSidebarView === view ? 'none' : view 
      })),
      
      nextTrack: () => {
        const { queue, currentIndex, isShuffle, repeatMode } = get();
        if (queue.length === 0 || currentIndex === -1) return;
        
        if (repeatMode === 'one') {
          // Restart the same track by re-setting it (triggering a reload)
          set({ currentTrack: { ...queue[currentIndex] }, isPlaying: true });
          return;
        }
        
        let nextIndex;
        if (isShuffle) {
          if (queue.length <= 1) {
            nextIndex = currentIndex;
          } else {
            do {
              nextIndex = Math.floor(Math.random() * queue.length);
            } while (nextIndex === currentIndex);
          }
        } else {
          nextIndex = currentIndex + 1;
        }

        if (nextIndex >= queue.length) {
          if (repeatMode === 'all') {
            nextIndex = 0;
          } else {
            set({ isPlaying: false, currentIndex: 0, currentTrack: queue[0] });
            return;
          }
        }
        
        const next = queue[nextIndex];
        set({ currentTrack: next, currentIndex: nextIndex, isPlaying: true, lyrics: null });
        get().fetchLyrics(next);
        get().fetchRecommendations(next);
      },
      
      prevTrack: () => {
        const { queue, currentIndex, isShuffle, repeatMode } = get();
        if (queue.length === 0 || currentIndex === -1) return;
        
        if (repeatMode === 'one') {
          set({ currentTrack: { ...queue[currentIndex] }, isPlaying: true });
          return;
        }

        let prevIndex;
        if (isShuffle) {
          if (queue.length <= 1) {
            prevIndex = currentIndex;
          } else {
            do {
              prevIndex = Math.floor(Math.random() * queue.length);
            } while (prevIndex === currentIndex);
          }
        } else {
          prevIndex = currentIndex - 1;
        }

        if (prevIndex < 0) {
          if (repeatMode === 'all') {
            prevIndex = queue.length - 1;
          } else {
            prevIndex = 0;
          }
        }
        
        const prev = queue[prevIndex];
        set({ currentTrack: prev, currentIndex: prevIndex, isPlaying: true, lyrics: null });
        get().fetchLyrics(prev);
        get().fetchRecommendations(prev);
      },

      // Library Actions
      toggleLike: (track) => {
        const { likedSongs } = get();
        const exists = likedSongs.find(t => t.id === track.id);
        if (exists) {
          set({ likedSongs: likedSongs.filter(t => t.id !== track.id) });
          toast.success(`Removed "${track.name}" from Liked Songs`);
        } else {
          set({ likedSongs: [track, ...likedSongs] });
          toast.success(`Added "${track.name}" to Liked Songs`);
        }
        get().syncLibraryToBackend();
      },
      
      createPlaylist: (name) => {
        const colors = ['bg-indigo-500', 'bg-purple-600', 'bg-blue-500', 'bg-emerald-500', 'bg-rose-500', 'bg-amber-500'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        const newPlaylist = {
          id: Date.now().toString(),
          name,
          color: randomColor,
          tracks: []
        };
        set({ playlists: [...get().playlists, newPlaylist] });
        toast.success(`Created playlist "${name}"`);
        get().syncLibraryToBackend();
      },

      addTrackToPlaylist: (playlistId, track) => {
        let addedTo = '';
        set((state) => ({
          playlists: state.playlists.map(p => {
            if (p.id === playlistId) {
              if (!p.tracks.find(t => t.id === track.id)) {
                addedTo = p.name;
                return { ...p, tracks: [...p.tracks, track] };
              }
            }
            return p;
          })
        }));
        if (addedTo) toast.success(`Added "${track.name}" to ${addedTo}`);
        get().syncLibraryToBackend();
      },

      removeTrackFromPlaylist: (playlistId, trackId) => {
        let removedFrom = '';
        set((state) => ({
          playlists: state.playlists.map(p => {
            if (p.id === playlistId) {
              removedFrom = p.name;
              return { ...p, tracks: p.tracks.filter(t => t.id !== trackId) };
            }
            return p;
          })
        }));
        if (removedFrom) toast.success(`Removed track from ${removedFrom}`);
        get().syncLibraryToBackend();
      },

      deletePlaylist: (playlistId) => {
        set((state) => ({
          playlists: state.playlists.filter(p => p.id !== playlistId)
        }));
        toast.success(`Playlist deleted`);
        get().syncLibraryToBackend();
      },

      clearQueue: () => set({ queue: [] }),
      
      syncLibraryToBackend: async () => {
        const authStoreStr = localStorage.getItem('auth-storage');
        if (!authStoreStr) return;
        try {
          const authData = JSON.parse(authStoreStr);
          const user = authData?.state?.user;
          if (!user || !user.id) return;
          
          const { likedSongs, playlists } = get();
          await fetch('http://localhost:5001/api/auth/library', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: user.id, likedSongs, playlists })
          });
        } catch (err) {
          console.error("Failed to sync library", err);
        }
      },
      
      loadLibraryFromBackend: async () => {
        const authStoreStr = localStorage.getItem('auth-storage');
        if (!authStoreStr) return;
        try {
          const authData = JSON.parse(authStoreStr);
          const user = authData?.state?.user;
          if (!user || !user.id) return;
          
          const res = await fetch(`http://localhost:5001/api/auth/library/${user.id}`);
          const data = await res.json();
          if (data && data.likedSongs) {
            set({ likedSongs: data.likedSongs, playlists: data.playlists || [] });
          }
        } catch (err) {
          console.error("Failed to load library", err);
        }
      },
    }),
    {
      name: 'echo-player-storage',
      // We only persist personal library data, not the active session (currentTrack, etc)
      partialize: (state) => ({ 
        likedSongs: state.likedSongs,
        playlists: state.playlists,
        library: state.library,
        searchHistory: state.searchHistory,
        isShuffle: state.isShuffle,
        repeatMode: state.repeatMode
      }),
    }
  )
);

export default usePlayerStore;
