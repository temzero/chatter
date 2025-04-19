import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

type SidebarType = 'default' | 'newChat' | 'search' | 'more' | 'profile' | 'profileEdit' | 'settings' | 'settingsAccount';

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
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar-compact');
      return saved === 'true';
    }
    return false;
  });

  const toggleCompact = useCallback(() => {
    const newCompactState = !isCompact;
    setIsCompact(newCompactState);
    localStorage.setItem('sidebar-compact', String(newCompactState));
  }, [isCompact]);

  // Handle Escape key to reset sidebar to default
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && currentSidebar !== 'default') {
      e.preventDefault();
      setSidebar('default');
      e.stopPropagation();
    }
  }, [currentSidebar]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

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