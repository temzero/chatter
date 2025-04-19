// ChatDataContext.tsx
import React, { createContext, useContext, useMemo, useEffect, useState } from 'react';
import { UserProps, MessageProps, ChatRoomProps, MediaProps } from '@/data/types';
import {
  chatRoomsData,
  mediaData,
  messagesData,
  usersData,
  myProfileData,
  initializeIndexes,
  getUserChatRooms,
  getChatRoomMessages,
  getMessageMedia,
  getUserMessages,
  getUser,
  getChatRoomUsers,
  getLastMessage,
  getUserContacts,
  searchUsers,
  searchMessages,
  userChatRoomsIndex,
  chatRoomMessagesIndex,
  messageMediaIndex,
  userMessagesIndex,
  userContactsIndex
} from '@/data/data';

type DataContextType = {
  // Raw data
  users: Record<string, UserProps>;
  media: Record<string, MediaProps>;
  messages: Record<string, MessageProps>;
  chatRooms: Record<string, ChatRoomProps>;
  myProfile: UserProps;
  
  // Indexes
  userChatRoomsIndex: Record<string, string[]>;
  chatRoomMessagesIndex: Record<string, string[]>;
  messageMediaIndex: Record<string, string[]>;
  userMessagesIndex: Record<string, string[]>;
  userContactsIndex: Record<string, string[]>;
  
  // Utility functions
  getUserChatRooms: typeof getUserChatRooms;
  getChatRoomMessages: typeof getChatRoomMessages;
  getMessageMedia: typeof getMessageMedia;
  getUserMessages: typeof getUserMessages;
  getUser: typeof getUser;
  getChatRoomUsers: typeof getChatRoomUsers;
  getLastMessage: typeof getLastMessage;
  getUserContacts: typeof getUserContacts;
  searchUsers: typeof searchUsers;
  searchMessages: typeof searchMessages;
  
  // State management
  currentChatRoomId: string | null;
  setCurrentChatRoomId: (id: string | null) => void;
  
  // Initialization state
  isInitialized: boolean;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentChatRoomId, setCurrentChatRoomId] = useState<string | null>(null);

  // Initialize indexes on first render
  useEffect(() => {
    try {
      initializeIndexes();
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize indexes:', error);
      // You might want to add error state handling here
    }
  }, []);

  const value = useMemo(() => ({
    // Raw data
    users: usersData,
    media: mediaData,
    messages: messagesData,
    chatRooms: chatRoomsData,
    myProfile: myProfileData,
    
    // Indexes
    userChatRoomsIndex,
    chatRoomMessagesIndex,
    messageMediaIndex,
    userMessagesIndex,
    userContactsIndex,
    
    // Utility functions
    getUserChatRooms,
    getChatRoomMessages,
    getMessageMedia,
    getUserMessages,
    getUser,
    getChatRoomUsers,
    getLastMessage,
    getUserContacts,
    searchUsers,
    searchMessages,
    
    // State
    currentChatRoomId,
    setCurrentChatRoomId,
    
    // Initialization state
    isInitialized
  }), [currentChatRoomId, isInitialized]);

  if (!isInitialized) {
    // You might want to return a loading state here
    return <div>Loading data...</div>;
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};