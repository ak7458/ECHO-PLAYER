import React, { useEffect, useState } from 'react';
import { X, Command } from 'lucide-react';

const ShortcutsModal = ({ isOpen, onClose }) => {
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(navigator.userAgent.toLowerCase().includes('mac'));
  }, []);

  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Space', desc: 'Play / Pause' },
    { key: '→', desc: 'Next Track' },
    { key: '←', desc: 'Previous Track' },
    { key: 'M', desc: 'Mute / Unmute' },
    { key: isMac ? '⌘ + F' : 'Ctrl + F', desc: 'Search' },
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-300 p-4">
      <div className="bg-[#121212] w-full max-w-sm rounded-2xl shadow-2xl relative animate-in zoom-in-95 duration-300 border border-white/10 overflow-hidden">
        
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-[#8B5CF6]/20 to-[#06B6D4]/20 blur-3xl pointer-events-none -z-10" />

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="p-8 pt-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-[#06B6D4]">
              <Command size={20} />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">Keyboard Shortcuts</h2>
          </div>

          <div className="flex flex-col gap-4">
            {shortcuts.map((s, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-white/70 font-medium text-sm">{s.desc}</span>
                <span className="bg-white/10 text-white font-mono text-xs px-2.5 py-1.5 rounded-md border border-white/5">{s.key}</span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ShortcutsModal;
