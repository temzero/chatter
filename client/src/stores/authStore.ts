// src/stores/authStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";
import { authService, storageService } from "@/services/api/auth";
import { MyProfileProps } from "@/data/types";

type MessageType = "error" | "success" | "info";

type Message = {
  type: "error" | "success" | "info";
  content: string;
} | null;

type AuthState = {
  currentUser: MyProfileProps | null;
  isAuthenticated: boolean;
  loading: boolean;
  message: Message;
};

type AuthActions = {
  setMessage: (type: MessageType, content: string) => void;
  clearMessage: () => void;
  setLoading: (loading: boolean, clearMessages?: boolean) => void;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: {
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    password: string;
  }) => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  resetPasswordWithToken: (token: string, newPassword: string) => Promise<void>;
  verifyEmailWithToken: (token: string) => Promise<void>;
  initializeAuth: () => Promise<void>;
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

      // Core actions
      setMessage: (type, content) => set({ message: { type, content } }),
      clearMessage: () => set({ message: null }),
      
      // New unified loading control
      setLoading: (loading, clearMessages = true) => {
        set({
          loading,
          ...(clearMessages ? { message: null } : {})
        });
      },

      // Auth initialization
      initializeAuth: async () => {
        try {
          get().setLoading(true);
          const user = storageService.getUser();
          if (user) {
            set({
              currentUser: user,
              isAuthenticated: true,
              loading: false,
              message: null,
            });
          } else {
            set({ ...initialState, loading: false });
          }
        } catch (error) {
          console.error("Auth initialization failed", error);
          storageService.clear();
          set({ ...initialState, loading: false });
        }
      },

      // Authentication methods
      login: async (usernameOrEmail, password) => {
        try {
          get().setLoading(true); // Auto-clears messages
          const { access_token, user } = await authService.login(
            usernameOrEmail,
            password
          );

          storageService.setToken(access_token);
          storageService.setUser(user);
          set({
            currentUser: user,
            isAuthenticated: true,
            loading: false,
            message: { type: "success", content: "Logged in successfully" },
          });
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
          await get().login(userData.username, userData.password);
          set({
            message: { type: "success", content: "Account created successfully" },
          });
        } catch (error) {
          const errorMessage = handleAuthError(error);
          get().setLoading(false, false);
          set({ message: { type: "error", content: errorMessage } });
          throw error;
        }
      },

      logout: () => {
        storageService.clear();
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
              content: "Password reset email sent. Please check your inbox." 
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
              content: "Password reset successfully. You can now login." 
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
            message: { type: "success", content: "Email verified successfully!" },
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
      onRehydrateStorage: () => (state) => {
        state?.initializeAuth();
      },
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
export const useCurrentUser = () => useAuthStore((state) => state.currentUser);
export const useIsAuthenticated = () => 
  useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.loading);
export const useAuthMessage = () => useAuthStore((state) => state.message);
export const useAuthActions = () => useAuthStore((state) => ({
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