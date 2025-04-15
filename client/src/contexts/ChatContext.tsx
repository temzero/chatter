// contexts/ChatContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';

type ChatInfoMode = 'view' | 'edit';

interface ChatContextType {
  isChatInfoVisible: boolean;
  chatInfoMode: ChatInfoMode;
  toggleChatInfo: () => void;
  setChatInfoMode: (mode: ChatInfoMode) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Key for localStorage
const CHAT_INFO_VISIBILITY_KEY = 'chatInfoVisibility';

export const ChatProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  // Load initial visibility state from localStorage
  const [isChatInfoVisible, setIsChatInfoVisible] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(CHAT_INFO_VISIBILITY_KEY);
      return saved === 'true';
    }
    return false;
  });

  // Always start in 'view' mode
  const [chatInfoMode, setChatInfoMode] = useState<ChatInfoMode>('view');

  const toggleChatInfo = () => {
    setIsChatInfoVisible(prev => !prev);
    setChatInfoMode('view'); // Always reset to view mode when toggling
  };

  useEffect(() => {
    localStorage.setItem(CHAT_INFO_VISIBILITY_KEY, String(isChatInfoVisible));
  }, [isChatInfoVisible]);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        toggleChatInfo();
      }
    };
  
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <ChatContext.Provider value={{
      isChatInfoVisible,
      chatInfoMode,
      toggleChatInfo,
      setChatInfoMode
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};