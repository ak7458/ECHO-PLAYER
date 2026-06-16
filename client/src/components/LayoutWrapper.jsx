"use client";

import React from 'react';
import Sidebar from "@/components/Sidebar";
import usePlayerStore from "@/store/usePlayerStore";
import useAuthStore from '@/store/useAuthStore';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LayoutWrapper({ children }) {
  const rightSidebarView = usePlayerStore(state => state.rightSidebarView);
  const mainView = usePlayerStore(state => state.mainView);
  const pathname = usePathname();
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [mounted, setMounted] = useState(false);
  
  const isAuthPage = pathname === '/login' || pathname === '/register';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated && !isAuthPage) {
      router.push('/login');
    }
  }, [isAuthenticated, isAuthPage, mounted, router]);

  if (!mounted) return <div className="h-full bg-echo-base flex-1" />;

  // Don't render sidebar for auth pages
  if (isAuthPage || (!isAuthenticated && !isAuthPage)) {
    return <main className="flex-1 overflow-y-auto">{children}</main>;
  }

  return (
    <div className="flex flex-1 overflow-hidden p-3 gap-3">
      {/* Sidebar Area */}
      <div className="w-[260px] flex flex-col gap-2 flex-shrink-0">
        <Sidebar />
      </div>
      
      {/* Main Content Area */}
      <div className={`flex-1 bg-echo-elevated rounded-2xl relative overflow-y-auto flex flex-col border border-white/5 ${mainView !== 'home' ? 'hidden' : ''}`}>
        {children}
      </div>

      {/* Main View Placeholder (for Lyrics) */}
      {mainView !== 'home' && (
        <div id="main-view-placeholder" className="flex-1 relative rounded-2xl overflow-hidden" />
      )}

      {/* Right Sidebar Placeholder */}
      {rightSidebarView !== 'none' && (
        <div id="right-sidebar-placeholder" className="w-[350px] flex-shrink-0 relative transition-all duration-300 animate-in slide-in-from-right-8" />
      )}
    </div>
  );
}
