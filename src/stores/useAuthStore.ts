import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthResponse } from "@/features/auth/auth.service";

interface AuthState {
  token: string | null;
  user: AuthResponse["user"] | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  login: (data: AuthResponse) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: true,
      setLoading: (loading) => set({ isLoading: loading }),
      login: (data) =>
        set({
          token: data.token,
          user: data.user,
          isAuthenticated: true,
        }),
      logout: () =>
        set({
          token: null,
          user: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "auth-storage", // key in localStorage
      onRehydrateStorage: () => (state) => {
        state?.setLoading(false);
      },
    },
  ),
);
