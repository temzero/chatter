import React, { createContext, useCallback, useContext, useState, useEffect } from 'react';

type ChatInfoMode = 'default' | 'media' | 'saved' | 'edit';

interface ChatInfoContextType {
  isChatInfoVisible: boolean;
  chatInfoMode: ChatInfoMode;
  toggleChatInfo: () => void;
  setChatInfoMode: (mode: ChatInfoMode) => void;
}

const ChatInfoContext = createContext<ChatInfoContextType | undefined>(undefined);

// Keys for localStorage
const CHAT_INFO_VISIBILITY_KEY = 'chatInfoVisibility';

export const ChatInfoProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [isChatInfoVisible, setIsChatInfoVisible] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(CHAT_INFO_VISIBILITY_KEY);
      return saved === 'true';
    }
    return false;
  });

  const [chatInfoMode, setChatInfoMode] = useState<ChatInfoMode>('default');

  const toggleChatInfo = useCallback(() => {
    setIsChatInfoVisible(prev => !prev);
    setChatInfoMode('default');
  }, []);

  useEffect(() => {
    localStorage.setItem(CHAT_INFO_VISIBILITY_KEY, String(isChatInfoVisible));
  }, [isChatInfoVisible]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'F1') {
      e.preventDefault();
      toggleChatInfo();
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      setChatInfoMode('default');
      e.stopPropagation();
    }
  }, [toggleChatInfo, setChatInfoMode]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <ChatInfoContext.Provider value={{
      isChatInfoVisible,
      chatInfoMode,
      toggleChatInfo,
      setChatInfoMode,
    }}>
      {children}
    </ChatInfoContext.Provider>
  );
};

export const useChatInfo = () => {
  const context = useContext(ChatInfoContext);
  if (!context) {
    throw new Error('useChatInfo must be used within a ChatInfoProvider');
  }
  return context;
};