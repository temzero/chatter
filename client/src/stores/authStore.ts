// src/stores/authStore.ts
import axios from "axios";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService } from "@/services/authService";
import { useChatStore } from "@/stores/chatStore";
import { useSidebarStore } from "./sidebarStore";
import { useSidebarInfoStore } from "./sidebarInfoStore";
import type { User } from "@/types/user";
import { SidebarMode } from "@/types/enums/sidebarMode";
import { webSocketService } from "@/lib/websocket/services/websocket.service";

type MessageType = "error" | "success" | "info";

type Message = {
  type: MessageType;
  content: string;
} | null;

type AuthState = {
  currentUser: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  message: Message;
};

type AuthActions = {
  setCurrentUser: (user: User | null) => void;
  setMessage: (type: MessageType, content: string) => void;
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
  initialize: () => Promise<void>;
};

const initialState: AuthState = {
  currentUser: null,
  isAuthenticated: false,
  loading: false, // Changed default to false
  message: null,
};

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      initialize: async () => {
        try {
          get().setLoading(true);
          const user = await authService.getCurrentUser();

          if (!user) {
            return set({ ...initialState, loading: false });
          }

          set({
            currentUser: user,
            isAuthenticated: true,
            loading: false,
            message: null,
          });
        } catch (error) {
          console.error(error);
          set({ ...initialState, loading: false });
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
          await authService.login(identifier, password);
          set({
            isAuthenticated: true,
            loading: false,
            message: { type: "success", content: "Logged in successfully" },
          });
          useChatStore.getState().clearChats();
          // await webSocketService.connect();
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
          const { user } = await authService.register(userData);
          set({
            currentUser: user,
            isAuthenticated: true,
            loading: false,
            message: {
              type: "success",
              content: "Account created successfully",
            },
          });
          // await webSocketService.connect();
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
        useSidebarInfoStore.getState().setSidebarInfo(SidebarMode.DEFAULT);
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

// Selector hooks

// Memoized action selector (won't cause re-renders when actions don't change)
export const useAuthActions = () =>
  useAuthStore((state) => ({
    setMessage: state.setMessage,
    clearMessage: state.clearMessage,
    setLoading: state.setLoading,
    login: state.login,
    logout: state.logout,
    register: state.register,
    sendPasswordResetEmail: state.sendPasswordResetEmail,
    resetPasswordWithToken: state.resetPasswordWithToken,
    verifyEmailWithToken: state.verifyEmailWithToken,
  }));

// Individual selectors (only for frequently used isolated values)
export const useCurrentUser = () => useAuthStore((state) => state.currentUser);
export const useIsAuthenticated = () =>
  useAuthStore((state) => state.isAuthenticated);
