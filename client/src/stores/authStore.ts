// src/stores/authStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService } from "@/services/http/authService";
import { webSocketService } from "@/services/websocket/websocket.service";
import { localStorageService } from "@/services/storage/localStorageService";
import { fetchInitialAppData } from "@/common/hooks/app/fetchInitialAppData";
import { clearAppData } from "@/common/hooks/app/clearAppData";
import type { UserResponse } from "@/shared/types/responses/user.response";

type AuthMessageType = "error" | "success" | "info";

interface Message {
  type: AuthMessageType;
  content: string;
}

interface AuthState {
  currentUser: UserResponse | null;
  isAuthenticated: boolean;
  loading: boolean;
  message: Message | null;
}

interface AuthActions {
  initialize: () => Promise<boolean>;
  setCurrentUser: (user: UserResponse | null) => void;
  setMessage: (type: AuthMessageType, content: string) => void;
  setLoading: (loading: boolean) => void;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    password: string;
  }) => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  resetPasswordWithToken: (token: string, newPassword: string) => Promise<void>;
  verifyEmailWithToken: (token: string) => Promise<void>;
  refreshAccessToken: () => Promise<string>;

  clearAuthStore: () => void;
}

const initialState: AuthState = {
  currentUser: null,
  isAuthenticated: false,
  loading: false,
  message: null,
};

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      initialize: async (): Promise<boolean> => {
        try {
          const token = localStorageService.getAccessToken();
          if (!token) {
            console.error("[AUTH]", "No Access-token");
            // refresh everything
            get().clearAuthStore();
            return false;
          }

          set({ loading: true });

          // First, check persisted state
          const persistedUser = get().currentUser;
          if (persistedUser) {
            set({ isAuthenticated: true, loading: false });
            return true;
          }

          const userData: UserResponse = await authService.fetchCurrentUser();

          if (!userData) {
            console.error("[AUTH]", "fetchCurrentUser failed");
            // refresh everything
            get().clearAuthStore();
            return false;
          }

          set({
            currentUser: userData,
            isAuthenticated: true,
            loading: false,
            message: null,
          });

          return true;
        } catch {
          set({ loading: false });
          return false;
        }
      },

      setCurrentUser: (user) => {
        set({
          currentUser: user,
          isAuthenticated: !!user,
        });
      },

      // Core actions
      setMessage: (type, content) => set({ message: { type, content } }),

      setLoading: (isLoading) => set({ loading: isLoading }),

      // Authentication methods
      login: async (identifier, password) => {
        set({ loading: true });
        try {
          const { user, accessToken } = await authService.login({
            identifier,
            password,
          });

          await handleAuthSuccess(user, accessToken);
        } finally {
          set({ loading: false });
        }
      },

      register: async (userData) => {
        try {
          set({ loading: true });

          const { user, accessToken } = await authService.register(userData);

          await handleAuthSuccess(user, accessToken);
        } finally {
          set({ loading: false });
        }
      },

      logout: () => {
        authService.logout();
        webSocketService.disconnect();
        clearAppData();
      },

      // Password recovery
      sendPasswordResetEmail: async (email) => {
        try {
          set({ loading: true });
          await authService.sendPasswordResetEmail(email);
          set({
            message: {
              type: "success",
              content: "Password reset email sent. Please check your inbox.",
            },
          });
        } finally {
          set({ loading: false });
        }
      },

      resetPasswordWithToken: async (token, newPassword) => {
        try {
          set({ loading: true });
          await authService.resetPasswordWithToken(token, newPassword);
          set({
            message: {
              type: "success",
              content: "Password reset successfully. You can now login.",
            },
          });
        } finally {
          set({ loading: false });
        }
      },

      // Email verification
      verifyEmailWithToken: async (token) => {
        try {
          set({ loading: true });
          await authService.verifyEmailWithToken(token);
          set({
            message: {
              type: "success",
              content: "Email verified successfully!",
            },
          });
        } finally {
          set({ loading: false });
        }
      },

      refreshAccessToken: async (): Promise<string> => {
        try {
          console.info("[AUTH]", "Refreshing access token...");
          const newAccessToken = await authService.refreshAccessToken();

          // Save new access token to localStorage
          localStorageService.setAccessToken(newAccessToken);

          // Optionally update any state if needed
          set({ isAuthenticated: true });

          return newAccessToken;
        } catch (error) {
          console.error("[AUTH] Failed to refresh token", error);
          // Logout if refresh fails
          get().clearAuthStore();
          window.location.href = "/auth/login";
          throw error; // re-throw so caller knows refresh failed
        }
      },

      clearAuthStore: () => {
        set({ ...initialState });
      },
    }),

    {
      name: "auth-storage",
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Error handling utility
async function handleAuthSuccess(user?: UserResponse, accessToken?: string) {
  if (!user || !accessToken) return;
  localStorageService.setAccessToken(accessToken);
  await fetchInitialAppData();
  useAuthStore.setState({
    currentUser: user,
    isAuthenticated: true,
  });
}

// EXPORT HOOKS

// export const useCurrentUser = () => useAuthStore((state) => state.currentUser);
// export const useCurrentUserId = () =>
//   useAuthStore((state) => state.currentUser?.id);
export const getCurrentUser = () => useAuthStore.getState().currentUser;
export const getCurrentUserId = () => useAuthStore.getState().currentUser?.id;

export const useIsMe = (userId: string): boolean => {
  const currentUser = getCurrentUser();
  if (!userId) return false;
  return currentUser?.id === userId;
};
export const useIsAuthenticated = () =>
  useAuthStore((state) => state.isAuthenticated);
