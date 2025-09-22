import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type AppState = {
  hasSeenOnboarding: boolean;
  hydrated: boolean;
  setHasSeenOnboarding: (v: boolean) => void;
  setHydrated: (v: boolean) => void;
  turnOnNotification: boolean;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  checkSocket: boolean;
  setCheckSocket: (loading: boolean) => void;
};

export const appStore = create<AppState>()(
  persist(
    (set) => ({
      hasSeenOnboarding: false,
      hydrated: false,
      setHasSeenOnboarding: (v) => set({ hasSeenOnboarding: v }),
      setHydrated: (v) => set({ hydrated: v }),
      turnOnNotification: false,
      loading: false,
      setLoading: loading => set({ loading }),
      checkSocket: true,
      setCheckSocket: checkSocket => set({ checkSocket }),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ hasSeenOnboarding: s.hasSeenOnboarding }),
      onRehydrateStorage: () => (state) => state?.setHydrated(true),
      
    },
  ),
);
