// contexts/ChatContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProps, MessageProps, ChatRoomProps, MediaProps } from '@/data/types';
import { usersData, messagesData, chatRoomsData, mediaData, myProfileData } from '@/data/data';

interface ChatContextType {
  // Current user
  currentUser: UserProps;
  
  // Chat rooms
  chatRooms: Record<string, ChatRoomProps>;
  activeRoom: ChatRoomProps | null;
  setActiveRoom: (roomId: string) => void;
  createRoom: (room: Omit<ChatRoomProps, 'id' | 'createdAt'>) => ChatRoomProps;
  
  // Messages
  activeRoomMessages: MessageProps[];
  activeRoomMedia: MediaProps[]; // New state for active room media
  sendMessage: (content?: string, mediaIds?: string[]) => MessageProps;
  editMessage: (messageId: string, newContent: string) => void;
  deleteMessage: (messageId: string) => void;
  replyToMessage: (messageId: string) => void;
  currentReply: MessageProps | null;
  clearReply: () => void;
  
  // Users
  getOtherUsers: () => UserProps[];
  getUserById: (userId: string) => UserProps | undefined;
  
  // MediaProps
  getMediaById: (mediaId: string) => MediaProps | undefined;
  uploadMedia: (file: File) => Promise<MediaProps>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser] = useState<UserProps>(myProfileData);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [currentReply, setCurrentReply] = useState<MessageProps | null>(null);
  const [activeRoomMedia, setActiveRoomMedia] = useState<MediaProps[]>([]); 
  
  // In a real app, you would fetch these from your backend
  const [chatRoomsState, setChatRoomsState] = useState<Record<string, ChatRoomProps>>(chatRoomsData);
  const [messagesState, setMessagesState] = useState<Record<string, MessageProps>>(messagesData);
  const [mediaState, setMediaState] = useState<Record<string, MediaProps>>(mediaData);

  // Get active room
  const activeRoom = activeRoomId ? chatRoomsState[activeRoomId] : null;

  // Get messagesData for active room
  const activeRoomMessages = activeRoom 
    ? Object.values(messagesState)
            .filter(msg => msg.chatRoomId === activeRoom.id)
            .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
    : [];

  // Set active room
  const setActiveRoom = useCallback((roomId: string) => {
    setActiveRoomId(roomId);
    // Mark messagesData as read when opening room
    if (chatRoomsState[roomId]) {
      const updatedMessages = { ...messagesState };
      Object.values(updatedMessages)
        .filter(msg => msg.chatRoomId === roomId && !msg.readBy?.includes(currentUser.id))
        .forEach(msg => {
          updatedMessages[msg.id] = {
            ...msg,
            readBy: [...(msg.readBy || []), currentUser.id]
          };
        });
      setMessagesState(updatedMessages);
    }
  }, [chatRoomsState, messagesState, currentUser.id]);

  // Create new chat room
  const createRoom = useCallback((room: Omit<ChatRoomProps, 'id' | 'createdAt'>): ChatRoomProps => {
    const newRoom: ChatRoomProps = {
      ...room,
      id: `room${Object.keys(chatRoomsState).length + 1}`,
      createdAt: new Date(),
    };
    setChatRoomsState(prev => ({ ...prev, [newRoom.id]: newRoom }));
    return newRoom;
  }, [chatRoomsState]);

  // Send message
  const sendMessage = useCallback((content?: string, mediaIds?: string[]): MessageProps => {
    if (!activeRoom) throw new Error('No active room');
    else if (!content && !mediaIds) throw new Error('No message data')
    
    const newMessage: MessageProps = {
      id: `msg${Object.keys(messagesState).length + 1}`,
      chatRoomId: activeRoom.id,
      senderId: currentUser.id,
      content,
      mediaIds,
      timestamp: new Date(),
      readBy: [currentUser.id],
      replyToId: currentReply?.id,
    };

    setMessagesState(prev => ({ ...prev, [newMessage.id]: newMessage }));
    
    // Update last message in room
    setChatRoomsState(prev => ({
      ...prev,
      [activeRoom.id]: {
        ...prev[activeRoom.id],
        lastMessage: newMessage.id
      }
    }));

    setCurrentReply(null);

    if (mediaIds) {
      const mediaForMessage = mediaIds.map(id => mediaState[id]);
      setActiveRoomMedia(prevMedia => [...prevMedia, ...mediaForMessage]);
    }

    return newMessage;
  }, [activeRoom, currentUser.id, currentReply, messagesState, mediaState]);

  // Edit message
  const editMessage = useCallback((messageId: string, newContent: string) => {
    setMessagesState(prev => {
      if (!prev[messageId]) return prev;
      return {
        ...prev,
        [messageId]: {
          ...prev[messageId],
          content: newContent,
          edited: true,
          editedAt: new Date()
        }
      };
    });
  }, []);

  // Delete message
  const deleteMessage = useCallback((messageId: string) => {
    setMessagesState(prev => {
      if (!prev[messageId]) return prev;
      return {
        ...prev,
        [messageId]: {
          ...prev[messageId],
          deleted: true,
          deletedAt: new Date(),
          content: 'This message was deleted',
          mediaIds: undefined
        }
      };
    });
  }, []);

  // Reply to message
  const replyToMessage = useCallback((messageId: string) => {
    const message = messagesState[messageId];
    if (message) {
      setCurrentReply(message);
    }
  }, [messagesState]);

  const clearReply = useCallback(() => {
    setCurrentReply(null);
  }, []);

  // Get other usersData (for sidebar)
  const getOtherUsers = useCallback(() => {
    return Object.values(usersData).filter(user => user.id !== currentUser.id);
  }, [currentUser.id]);

  // Get user by ID
  const getUserById = useCallback((userId: string) => {
    return usersData[userId];
  }, []);

  // Get mediaData by ID
  const getMediaById = useCallback((mediaId: string) => {
    return mediaState[mediaId];
  }, [mediaState]);

  // Upload mediaData (simplified)
  const uploadMedia = useCallback(async (file: File): Promise<MediaProps> => {
    // In a real app, you would upload to a server
    const newMedia: MediaProps = {
      id: `mediaData${Object.keys(mediaState).length + 1}`,
      type: file.type.startsWith('image') ? 'image' : 
            file.type.startsWith('video') ? 'video' :
            file.type.startsWith('audio') ? 'audio' : 'file',
      url: URL.createObjectURL(file),
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      uploadedAt: new Date(),
      uploadedBy: currentUser.id
    };

    setMediaState(prev => ({ ...prev, [newMedia.id]: newMedia }));

    if (activeRoom) {
      setActiveRoomMedia(prevMedia => [...prevMedia, newMedia]);
    }

    return newMedia;
  }, [currentUser.id, mediaState, activeRoom]);

  // Set first room as active by default
  useEffect(() => {
    if (!activeRoomId && Object.keys(chatRoomsState).length > 0) {
      setActiveRoom(Object.keys(chatRoomsState)[0]);
    }
  }, [activeRoomId, chatRoomsState, setActiveRoom]);

  const value = {
    currentUser,
    chatRooms: chatRoomsState,
    activeRoom,
    setActiveRoom,
    createRoom,
    activeRoomMessages,
    activeRoomMedia,
    sendMessage,
    editMessage,
    deleteMessage,
    replyToMessage,
    currentReply,
    clearReply,
    getOtherUsers,
    getUserById,
    getMediaById,
    uploadMedia,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};