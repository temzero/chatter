import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import axios from "axios";
import { MyProfileProps } from "@/data/types";
import { authService, storageService } from "@/services/api/auth";

interface AuthContextType {
  currentUser: MyProfileProps | null;
  isAuthenticated: boolean;
  loading: boolean;
  message: string | null;
  setMessage: (message: string | null) => void;
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<MyProfileProps | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  // Initialize auth state from storage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const user = storageService.getUser();
        if (user) {
          setCurrentUser(user);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Failed to initialize auth state", error);
        storageService.clear();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const handleAuthError = useCallback((error: unknown): string => {
    let errorMessage = "An unexpected error occurred";

    if (axios.isAxiosError(error)) {
      errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Network error occurred";
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    setMessage(errorMessage);
    return errorMessage;
  }, []);

  const login = async (usernameOrEmail: string, password: string) => {
    try {
      setLoading(true);
      const { access_token, user } = await authService.login(
        usernameOrEmail,
        password
      );

      storageService.setToken(access_token);
      storageService.setUser(user);
      setCurrentUser(user);
      setIsAuthenticated(true);
      setMessage(null);
    } catch (error) {
      const errorMessage = handleAuthError(error);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: {
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    password: string;
  }) => {
    try {
      setLoading(true);
      await authService.register(userData);
      await login(userData.username, userData.password);
    } catch (error) {
      const errorMessage = handleAuthError(error);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    storageService.clear();
    setCurrentUser(null);
    setIsAuthenticated(false);
    setMessage(null);
  };

  const sendPasswordResetEmail = async (email: string) => {
    try {
      setLoading(true);
      await authService.sendPasswordResetEmail(email);
      setMessage("Password reset email sent. Please check your inbox.");
    } catch (error) {
      const errorMessage = handleAuthError(error);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetPasswordWithToken = async (token: string, newPassword: string) => {
    try {
      setLoading(true);
      await authService.resetPasswordWithToken(token, newPassword);
      setMessage(
        "Password reset successfully. You can now login with your new password."
      );
    } catch (error) {
      const errorMessage = handleAuthError(error);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const verifyEmailWithToken = async (token: string) => {
    try {
      setLoading(true);
      await authService.verifyEmailWithToken(token);
      setMessage("Email verified successfully!");
    } catch (error) {
      const errorMessage = handleAuthError(error);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    currentUser,
    isAuthenticated,
    loading,
    message,
    setMessage,
    login,
    logout,
    register,
    sendPasswordResetEmail,
    resetPasswordWithToken,
    verifyEmailWithToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
