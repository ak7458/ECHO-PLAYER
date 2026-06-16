"use client";

import React, { useState } from 'react';
import useAuthStore from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Activity, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const login = useAuthStore((state) => state.login);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const res = await login(email, password);
    if (res.success) {
      router.push('/');
    } else {
      setError(res.error || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-echo-base relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#8854ff]/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#ff7a00]/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md p-8 bg-[#121212]/80 backdrop-blur-xl rounded-3xl border border-white/5 shadow-2xl z-10 mx-4 flex flex-col items-center">
        
        <div className="flex flex-col items-center text-center mb-10">
          <Activity size={48} className="text-[#8854ff] mb-4" strokeWidth={2.5} />
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">Welcome Back</h1>
          <p className="text-echo-text-base text-sm">Log in to continue listening to Echo.</p>
        </div>

        {error && <div className="w-full p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm mb-6 text-center">{error}</div>}

        <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-white uppercase tracking-wider ml-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#242424] hover:bg-[#2a2a2a] text-white rounded-xl py-3 px-4 outline-none border border-transparent focus:border-[#8854ff]/50 focus:bg-[#2a2a2a] transition-all text-sm font-medium"
              placeholder="Email address"
              required
            />
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-white uppercase tracking-wider ml-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#242424] hover:bg-[#2a2a2a] text-white rounded-xl py-3 px-4 outline-none border border-transparent focus:border-[#8854ff]/50 focus:bg-[#2a2a2a] transition-all text-sm font-medium"
              placeholder="Password"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-4 bg-gradient-to-r from-[#8854ff] to-[#4b35c3] hover:from-[#9b6eff] hover:to-[#5d44db] text-white rounded-xl py-3.5 font-bold tracking-wide transition-all shadow-lg hover:shadow-[#8854ff]/25 active:scale-95 flex items-center justify-center disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : 'Log In'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-echo-text-base">
          Don't have an account? <Link href="/register" className="text-white font-bold hover:underline">Sign up for Echo</Link>
        </div>
      </div>
    </div>
  );
}
