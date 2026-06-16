import React, { useState } from 'react';
import { X, Mail, Lock, User, Loader2 } from 'lucide-react';
import useAuthStore from '@/store/useAuthStore';
import { toast } from 'sonner';

const AuthModal = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, register } = useAuthStore();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isLogin) {
        const res = await login(email, password);
        if (res.success) {
          toast.success('Successfully logged in!');
          onClose();
        } else {
          toast.error(res.error || 'Failed to login');
        }
      } else {
        const res = await register(name, email, password);
        if (res.success) {
          toast.success('Account created successfully!');
          onClose();
        } else {
          toast.error(res.error || 'Failed to register');
        }
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setName('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-300 p-4">
      <div className="bg-[#121212] w-full max-w-md rounded-2xl shadow-2xl relative animate-in zoom-in-95 duration-300 border border-white/10 overflow-hidden">
        
        {/* Decorative Background Blob */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-[#8B5CF6]/30 to-[#06B6D4]/30 blur-3xl pointer-events-none -z-10" />

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="p-8 pt-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-white tracking-tight mb-2">
              {isLogin ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="text-echo-text-base text-sm font-medium">
              {isLogin ? 'Log in to continue listening to Echo' : 'Sign up to build your music library'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {!isLogin && (
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full bg-white/5 text-white rounded-xl py-3.5 pl-11 pr-4 outline-none border border-white/10 focus:border-[#8B5CF6] focus:bg-white/10 transition-all font-medium placeholder:text-white/40"
                />
              </div>
            )}

            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                <Mail size={18} />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full bg-white/5 text-white rounded-xl py-3.5 pl-11 pr-4 outline-none border border-white/10 focus:border-[#8B5CF6] focus:bg-white/10 transition-all font-medium placeholder:text-white/40"
              />
            </div>

            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                <Lock size={18} />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-white/5 text-white rounded-xl py-3.5 pl-11 pr-4 outline-none border border-white/10 focus:border-[#8B5CF6] focus:bg-white/10 transition-all font-medium placeholder:text-white/40"
              />
            </div>

            <button 
              type="submit"
              disabled={loading || !email || !password || (!isLogin && !name)}
              className="w-full py-4 mt-4 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white font-bold text-lg shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={20} className="animate-spin" />}
              {isLogin ? 'Log In' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={toggleMode}
              className="text-sm font-medium text-white/60 hover:text-white transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
