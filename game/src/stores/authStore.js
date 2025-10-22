import { create } from 'zustand';
import { getUserProfile } from '../services/firebase';

export const useAuthStore = create((set, get) => ({
  user: null,
  userProfile: null,
  loading: true,

  setUser: async (user) => {
    set({ user });

    if (user) {
      // Fetch user profile
      const profile = await getUserProfile(user.uid);
      set({ userProfile: profile });
    } else {
      set({ userProfile: null });
    }
  },

  setUserProfile: (profile) => set({ userProfile: profile }),

  setLoading: (loading) => set({ loading }),

  updateUserProfile: (updates) => {
    const { userProfile } = get();
    if (userProfile) {
      set({ userProfile: { ...userProfile, ...updates } });
    }
  },

  logout: () => {
    set({ user: null, userProfile: null });
  }
}));
