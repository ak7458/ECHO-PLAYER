import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      login: async (email, password) => {
        try {
          const res = await fetch('http://localhost:5001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });
          const data = await res.json();
          if (res.ok && data.user) {
            set({ user: data.user, isAuthenticated: true });
            return { success: true };
          }
          return { success: false, error: data.error };
        } catch (err) {
          return { success: false, error: 'Network error' };
        }
      },
      register: async (name, email, password) => {
        try {
          const res = await fetch('http://localhost:5001/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
          });
          const data = await res.json();
          if (res.ok && data.user) {
            set({ user: data.user, isAuthenticated: true });
            return { success: true };
          }
          return { success: false, error: data.error };
        } catch (err) {
          return { success: false, error: 'Network error' };
        }
      },
      logout: () => set({ user: null, isAuthenticated: false }),
      updateProfile: async (id, name, avatar) => {
        try {
          const res = await fetch('http://localhost:5001/api/auth/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, name, avatar })
          });
          const data = await res.json();
          if (res.ok && data.user) {
            set({ user: data.user });
            return { success: true };
          }
          return { success: false, error: data.error };
        } catch (err) {
          return { success: false, error: 'Network error' };
        }
      },
      uploadAvatar: async (file) => {
        try {
          const formData = new FormData();
          formData.append('avatar', file);
          
          const res = await fetch('http://localhost:5001/api/auth/avatar', {
            method: 'POST',
            body: formData
          });
          const data = await res.json();
          if (res.ok && data.avatarUrl) {
            return { success: true, avatarUrl: data.avatarUrl };
          }
          return { success: false, error: data.error };
        } catch (err) {
          return { success: false, error: 'Network error' };
        }
      }
    }),
    {
      name: 'echo-auth-storage'
    }
  )
);

export default useAuthStore;
