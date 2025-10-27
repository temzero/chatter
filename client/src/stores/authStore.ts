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
  clearMessage: () => void;
  setLoading: (loading: boolean, clearMessages?: boolean) => void;
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
        try {
          const token = localStorageService.getAccessToken();
          if (!token) {
            console.log("No Access-token");
            // refresh everything
            set({ ...initialState });
            return false;
          }

          get().setLoading(true);

          const user = await authService.getCurrentUser();

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

          return true; // success
        } catch (error) {
          console.error("Bootstrap auth error:", error);
          // refresh everything
          set({ ...initialState });
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
      clearMessage: () => set({ message: null }),

      // New unified loading control
      setLoading: (loading, clearMessages = true) => {
        set({
          loading,
          ...(clearMessages ? { message: null } : {}),
        });
      },

      // Authentication methods
      login: async (identifier, password) => {
        try {
          get().setLoading(true); // Auto-clears messages
          await authService.login({ identifier, password });
          set({
            isAuthenticated: true,
            loading: false,
            message: { type: "success", content: "Logged in successfully" },
          });
          useChatStore.getState().clearChats();
        } catch (error) {
          const errorMessage = handleAuthError(error);
          get().setLoading(false, false); // Keep error message
          set({ message: { type: "error", content: errorMessage } });
          throw error;
        }
      },

      register: async (userData) => {
        try {
          get().setLoading(true);
          await authService.register(userData);
          set({
            isAuthenticated: true,
            loading: false,
            message: {
              type: "success",
              content: "Account created successfully",
            },
          });
        } catch (error) {
          const errorMessage = handleAuthError(error);
          get().setLoading(false, false);
          set({ message: { type: "error", content: errorMessage } });
          throw error;
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
          loading: false,
          message: { type: "success", content: "Logged out successfully" },
        });
      },

      // Password recovery
      sendPasswordResetEmail: async (email) => {
        try {
          get().setLoading(true);
          await authService.sendPasswordResetEmail(email);
          set({
            message: {
              type: "success",
              content: "Password reset email sent. Please check your inbox.",
            },
            loading: false,
          });
        } catch (error) {
          const errorMessage = handleAuthError(error);
          get().setLoading(false, false);
          set({ message: { type: "error", content: errorMessage } });
          throw error;
        }
      },

      resetPasswordWithToken: async (token, newPassword) => {
        try {
          get().setLoading(true);
          await authService.resetPasswordWithToken(token, newPassword);
          set({
            message: {
              type: "success",
              content: "Password reset successfully. You can now login.",
            },
            loading: false,
          });
        } catch (error) {
          const errorMessage = handleAuthError(error);
          get().setLoading(false, false);
          set({ message: { type: "error", content: errorMessage } });
          throw error;
        }
      },

      // Email verification
      verifyEmailWithToken: async (token) => {
        try {
          get().setLoading(true);
          await authService.verifyEmailWithToken(token);
          set({
            message: {
              type: "success",
              content: "Email verified successfully!",
            },
            loading: false,
          });
        } catch (error) {
          const errorMessage = handleAuthError(error);
          get().setLoading(false, false);
          set({ message: { type: "error", content: errorMessage } });
          throw error;
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
function handleAuthError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message || "Network error";
  }
  return error instanceof Error ? error.message : "Unknown error occurred";
}

// EXPORT HOOKS

export const getCurrentUser = () => useAuthStore.getState().currentUser;
export const getCurrentUserId = () => useAuthStore.getState().currentUser?.id;

export const useIsMe = (userId: string): boolean => {
  const currentUser = getCurrentUser();
  if (!userId) return false;
  return currentUser?.id === userId;
};
export const useIsAuthenticated = () =>
  useAuthStore((state) => state.isAuthenticated);
