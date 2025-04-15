// contexts/SidebarContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';

type SidebarType = 'default' | 'newChat' | 'search' | 'more' | 'profile' | 'settings';

interface SidebarContextType {
  currentSidebar: SidebarType;
  setSidebar: (sidebar: SidebarType) => void;
  isCompact: boolean;
  toggleCompact: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [currentSidebar, setSidebar] = useState<SidebarType>('default');
  const [isCompact, setIsCompact] = useState(() => {
    // Try to get the saved state from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar-compact');
      return saved === 'true';
    }
    return false;
  });

  const toggleCompact = () => {
    const newCompactState = !isCompact;
    setIsCompact(newCompactState);
    // Save to localStorage whenever it changes
    localStorage.setItem('sidebar-compact', String(newCompactState));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '`') {
        e.preventDefault(); // Prevent default tab behavior
        toggleCompact();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCompact]);

  return (
    <SidebarContext.Provider value={{ 
      currentSidebar, 
      setSidebar,
      isCompact,
      toggleCompact
    }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};