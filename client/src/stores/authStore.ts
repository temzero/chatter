// src/stores/authStore.ts
import axios from "axios";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService } from "@/services/http/authService";
import { useChatStore } from "@/stores/chatStore";
import { useSidebarStore } from "./sidebarStore";
import { useSidebarInfoStore } from "./sidebarInfoStore";
import { SidebarMode } from "@/common/enums/sidebarMode";
import { webSocketService } from "@/services/websocket/websocket.service";
import type { UserResponse } from "@/shared/types/responses/user.response";
import { SidebarInfoMode } from "@/common/enums/sidebarInfoMode";
import { localStorageService } from "@/services/storage/localStorageService";
import { fetchInitialAppData } from "@/common/hooks/app/fetchInitialAppData";

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
        console.log("initialize Auth");
        try {
          const token = localStorageService.getAccessToken();
          if (!token) {
            console.log("No Access-token");
            // refresh everything
            set({ ...initialState });
            return false;
          }

          set({ loading: true });

          const user = await authService.fetchCurrentUser();

          if (!user) {
            // refresh everything
            set({ ...initialState });
            return false;
          }

          set({
            currentUser: user,
            isAuthenticated: true,
            loading: false,
            message: null,
          });

          return true;
        } catch (error) {
          get().logout();
          throw error;
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

      // Authentication methods
      login: async (identifier, password) => {
        console.log("authStore login");
        try {
          set({ loading: true });
          useChatStore.getState().clearChats();
          const { user, accessToken } = await authService.login({
            identifier,
            password,
          });

          await handleAuthSuccess(user, accessToken);
        } catch (error) {
          const errorMessage = handleAuthError(error);
          set({ message: { type: "error", content: errorMessage } });
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      register: async (userData) => {
        try {
          set({ loading: true });

          const { user, accessToken } = await authService.register(userData);

          await handleAuthSuccess(user, accessToken);
        } catch (error) {
          const errorMessage = handleAuthError(error);
          set({ message: { type: "error", content: errorMessage } });
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      logout: () => {
        authService.logout();
        webSocketService.disconnect();
        useChatStore.getState().clearChats();
        useSidebarStore.getState().setSidebar(SidebarMode.DEFAULT);
        useSidebarInfoStore.getState().setSidebarInfo(SidebarInfoMode.DEFAULT);
        set({
          ...initialState,
        });
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
        } catch (error) {
          const errorMessage = handleAuthError(error);
          set({ message: { type: "error", content: errorMessage } });
          throw error;
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
        } catch (error) {
          const errorMessage = handleAuthError(error);
          set({ message: { type: "error", content: errorMessage } });
          throw error;
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
        } catch (error) {
          const errorMessage = handleAuthError(error);
          set({ message: { type: "error", content: errorMessage } });
          throw error;
        } finally {
          set({ loading: false });
        }
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

function handleAuthError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message || "Network error";
  }
  return error instanceof Error ? error.message : "Unknown error occurred";
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
