import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";
import { MyProfileProps } from "@/data/types";

// Context value type
interface AuthContextType {
  currentUser: MyProfileProps | null;
  setCurrentUser: Dispatch<SetStateAction<MyProfileProps | null>>;
  isAuthenticated: boolean;
  setIsAuthenticated: Dispatch<SetStateAction<boolean>>;
  loading: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: {
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    password: string;
  }) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  message: string | null;
  setMessage: Dispatch<SetStateAction<string | null>>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider props
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<MyProfileProps | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setCurrentUser(userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Failed to initialize user", error);
      } finally {
        setLoading(false);
      }
    };

    initializeUser();
  }, []);

  const login = async (usernameOrEmail: string, password: string) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usernameOrEmail, password }),
    });

    const data = await res.json();
    console.log("Login response:", data);

    if (!res.ok) {
      setMessage(data.message);
      throw new Error(data.message || "Login failed");
    }

    const { access_token, user } = data;
    localStorage.setItem("token", access_token);
    localStorage.setItem("user", JSON.stringify(user));
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const register = async (userData: {
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    password: string;
  }) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/user/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
  
    const data = await res.json();
    console.log("Register response:", data);
  
    if (!res.ok) {
      setMessage(data.message);
      throw new Error(data.message || "Registration failed");
    }
  
    // Automatically log in after successful registration
    try {
      await login(userData.username, userData.password);
    } catch (err) {
      console.error("Auto login failed after registration:", err);
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const resetPassword = async (email: string) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    console.log("Reset password response:", data);

    if (!res.ok) {
      setMessage(data.message);
      throw new Error(data.message || "Reset password failed");
    }

    setMessage("Password reset email sent");
  };

  const value: AuthContextType = {
    currentUser,
    setCurrentUser,
    isAuthenticated,
    setIsAuthenticated,
    loading,
    login,
    logout,
    register,
    resetPassword,
    message,
    setMessage,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
