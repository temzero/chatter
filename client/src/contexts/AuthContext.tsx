import React, { createContext, useState, useEffect, useContext, ReactNode, Dispatch, SetStateAction } from 'react';
import type { MyProfileProps } from '@/data/types';

// Context value type
interface AuthContextType {
  currentUser: MyProfileProps | null;
  setCurrentUser: Dispatch<SetStateAction<MyProfileProps | null>>;
  isAuthenticated: boolean;
  setIsAuthenticated: Dispatch<SetStateAction<boolean>>;
  loading: boolean;
  login: (user: MyProfileProps) => void;
  logout: () => void;
  // Add any other auth-related state or actions you need here
}

// Create context with default undefined
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider props
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<MyProfileProps | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize user data (e.g., from localStorage or API)
  useEffect(() => {
    const initializeUser = async () => {
      try {
        // Check for stored user data or token
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setCurrentUser(userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Failed to initialize user', error);
      } finally {
        setLoading(false);
      }
    };

    initializeUser();
  }, []);

  const login = (user: MyProfileProps) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    // You might also want to clear other related data or call an API
  };

  const value = {
    currentUser,
    setCurrentUser,
    isAuthenticated,
    setIsAuthenticated,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
