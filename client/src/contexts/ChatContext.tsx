// contexts/ChatContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';

type ChatInfoMode = 'view' | 'edit';

interface ChatContextType {
  isChatInfoVisible: boolean;
  chatInfoMode: ChatInfoMode;
  toggleChatInfo: () => void;
  closeChatInfo: () => void;
  openChatInfo: (mode?: ChatInfoMode) => void;
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

  // Save visibility state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(CHAT_INFO_VISIBILITY_KEY, String(isChatInfoVisible));
  }, [isChatInfoVisible]);

  const toggleChatInfo = () => {
    setIsChatInfoVisible(prev => !prev);
    setChatInfoMode('view'); // Always reset to view mode when toggling
  };

  const closeChatInfo = () => {
    setIsChatInfoVisible(false);
    setChatInfoMode('view'); // Reset to view mode when closing
  };

  const openChatInfo = (mode: ChatInfoMode = 'view') => {
    setChatInfoMode(mode);
    setIsChatInfoVisible(true);
  };

  return (
    <ChatContext.Provider value={{
      isChatInfoVisible,
      chatInfoMode,
      toggleChatInfo,
      closeChatInfo,
      openChatInfo,
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