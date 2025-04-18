import React, {createContext, useState, useEffect, useContext, ReactNode, Dispatch, SetStateAction} from 'react';
import type { MyProfileProps } from '@/data/types';
import { myProfileData } from '@/data/profile';


// Context value type
interface GlobalContextType {
  myProfile: MyProfileProps | null;
  setMyProfile: Dispatch<SetStateAction<MyProfileProps | null>>;
  isAuthenticated: boolean;
  setIsAuthenticated: Dispatch<SetStateAction<boolean>>;
  loading: boolean;
  logout: () => void;
  // Add any other global state you need here
}

// Create context with default undefined
const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

// Provider props
interface GlobalProviderProps {
  children: ReactNode;
}

export const GlobalProvider: React.FC<GlobalProviderProps> = ({ children }) => {
  const [myProfile, setMyProfile] = useState<MyProfileProps | null>(myProfileData);
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
          setMyProfile(userData);
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

  const logout = () => {
    // Clear user data
    setMyProfile(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    // You might also want to clear other related data or call an API
  };

  const value = {
    myProfile,
    setMyProfile,
    isAuthenticated,
    setIsAuthenticated,
    loading,
    logout,
  };

  return (
    <GlobalContext.Provider value={value}>
      {children}
    </GlobalContext.Provider>
  );
};

// Custom hook to use the global context
export const useGlobalContext = () => {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error('useGlobalContext must be used within a GlobalProvider');
  }
  return context;
};