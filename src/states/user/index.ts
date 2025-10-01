import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { userInfo } from './typings';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Khởi tạo một đối tượng user rỗng nhưng vẫn tuân thủ interface userInfo
// Giúp tránh lỗi TypeScript khi store được khởi tạo lần đầu.
const initialUser: userInfo = {
  id: '',
  name: null,
  phone: null,
  email: null,
  avatar: null,
  status: 'PENDING',
  operatingHours: {
    monday: null,
    tuesday: null,
    wednesday: null,
    thursday: null,
    friday: null,
    saturday: null,
    sunday: null,
  },
  type: 'SHOE_CLEANING',
  // Thêm các giá trị mặc định khác nếu cần
};

type State = {
  token: string;
  user: userInfo;
  isPasswordRequired: boolean; // Đổi tên 'isPassword' cho rõ nghĩa hơn
  balance: number;
  callId: string;
  evidenceImage: string,
};

type Actions = {
  setToken: (token: string) => void;
  setUser: (user: userInfo) => void;
  setIsPasswordRequired: (isPasswordRequired: boolean) => void;
  setBalance: (balance: number) => void;
  setCallId: (callId: string) => void;
  logout: () => void;
  setEvidenceImage: (image: string) => void;
  failedAttempts: number;
  lastFailedAttempt: number | null;
  walletLockoutUntil: number | null;
  incrementFailedAttempts: () => void;
  resetFailedAttempts: () => void;
  setWalletLockout: (durationMs: number) => void;
  setLastFailedAttempt: () => void;
};

export const useUserStore = create<State & Actions>()(
  persist(
    (set) => ({
      // --- STATE ---
      token: '',
      user: initialUser,
      isPasswordRequired: false,
      balance: 0,
      callId: '',
      evidenceImage: '',
      // --- ACTIONS ---
      setUser: (user) => set({ user }),

      // Đã đơn giản hóa, middleware persist sẽ tự động lưu vào AsyncStorage
      setToken: (token) => set({ token }),

      setIsPasswordRequired: (isPasswordRequired) => set({ isPasswordRequired }),
      setBalance: (balance) => set({ balance }),
      setCallId: (callId) => set({ callId }),

      setEvidenceImage: (image) => set({ evidenceImage: image }),
      failedAttempts: 0,
      lastFailedAttempt: null,
      walletLockoutUntil: null,
      incrementFailedAttempts: () => set((state) => ({ failedAttempts: state.failedAttempts + 1 })),
      resetFailedAttempts: () => set({ failedAttempts: 0, lastFailedAttempt: null }), // Reset cả lastFailedAttempt
      setWalletLockout: (durationMs) => set({ walletLockoutUntil: Date.now() + durationMs }),
      setLastFailedAttempt: () => set({ lastFailedAttempt: Date.now() }),

      // Thêm một action logout để reset state về ban đầu
      logout: () => set({ token: '', user: initialUser, balance: 0 }),
    }),
    {
      name: 'useUserStore', // Tên key trong AsyncStorage
      storage: createJSONStorage(() => AsyncStorage),
      // Chỉ persist những state cần thiết, không lưu trữ các state tạm thời
      partialize: (state) => ({ token: state.token, user: state.user }),
    },
  ),
);