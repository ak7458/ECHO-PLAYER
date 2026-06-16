"use client";

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, User, Bell } from 'lucide-react';

const Topbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = (e) => {
      if (e.target.scrollTop > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    // We listen to the parent scrolling container.
    // In layout.js, the parent is the div wrapping children.
    const scrollContainer = document.getElementById('main-scroll-container');
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  return (
    <div className={`sticky top-0 z-10 flex items-center justify-between px-6 py-4 transition-colors duration-300 ${scrolled ? 'bg-spotify-base/90 backdrop-blur-md shadow-md' : 'bg-transparent'}`}>
      <div className="flex gap-2">
        <button className="w-8 h-8 rounded-full bg-black/70 flex items-center justify-center text-white hover:scale-105 transition-transform">
          <ChevronLeft size={24} />
        </button>
        <button className="w-8 h-8 rounded-full bg-black/70 flex items-center justify-center text-spotify-text-base hover:scale-105 transition-transform">
          <ChevronRight size={24} />
        </button>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="bg-white text-black font-bold text-sm px-4 py-1.5 rounded-full hover:scale-105 transition-transform">
          Explore Premium
        </button>
        <button className="w-8 h-8 rounded-full bg-black/70 flex items-center justify-center text-white hover:scale-105 transition-transform">
          <Bell size={18} />
        </button>
        <button className="w-8 h-8 rounded-full bg-black/70 flex items-center justify-center text-white hover:scale-105 transition-transform">
          <User size={18} />
        </button>
      </div>
    </div>
  );
};

export default Topbar;
