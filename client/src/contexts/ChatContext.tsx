import React, {createContext, useState, useEffect, useContext, ReactNode, Dispatch, SetStateAction} from 'react';
import { dummyChats } from './data';

export interface Chat {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  type: 'friends' | 'work' | 'study';
  phone?: string;
  email?: string;
  bio?: string;
  birthday?: string;
  isGroup?: boolean;
  members?: string[];
}

// Context value type
interface ChatContextType {
  chats: Chat[];
  activeChat: Chat | null;
  setActiveChat: Dispatch<SetStateAction<Chat | null>>;
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
  addChat: (newChat: Chat) => void;
  updateChat: (id: number, updatedData: Partial<Chat>) => void;
  deleteChat: (id: number) => void;
}

// Create context with default undefined
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Provider props
interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [chats, setChats] = useState<Chat[]>(dummyChats);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeChat, setActiveChat] = useState<Chat | null>(() => {
    // Load active chat from localStorage on initial render
    const savedChatId = localStorage.getItem('activeChatId');
    return savedChatId 
      ? dummyChats.find(chat => chat.id === Number(savedChatId)) || null
      : null;
  });

  // Update localStorage whenever activeChat changes
  useEffect(() => {
    if (activeChat) {
      localStorage.setItem('activeChatId', activeChat.id.toString());
    } else {
      localStorage.removeItem('activeChatId');
    }
  }, [activeChat]);

  const filteredChats = chats.filter((chat) =>
    [chat.name, chat.lastMessage, chat.type]
      .join(' ')
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const addChat = (newChat: Chat) => {
    setChats([newChat, ...chats]);
  };

  const updateChat = (id: number, updatedData: Partial<Chat>) => {
    setChats(
      chats.map((chat) =>
        chat.id === id ? { ...chat, ...updatedData } : chat
      )
    );
  };

  const deleteChat = (id: number) => {
    setChats(chats.filter((chat) => chat.id !== id));
  };

  return (
    <ChatContext.Provider
      value={{
        chats: filteredChats,
        activeChat,
        setActiveChat,
        searchTerm,
        setSearchTerm,
        addChat,
        updateChat,
        deleteChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

// Custom hook
export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
