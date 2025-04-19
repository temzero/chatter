// contexts/ChatContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import {
  MessageProps,
  ChatRoomProps,
  MediaProps,
  UserProps,
} from '@/data/types';
import { useData } from './DataContext';

interface ChatContextType {
  // Room management
  activeRoom: ChatRoomProps | null;
  setActiveRoom: (roomId: string) => void;
  createRoom: (room: Omit<ChatRoomProps, 'id' | 'createdAt'>) => ChatRoomProps;
  leaveRoom: (roomId: string) => void;

  // Message operations
  activeRoomMessages: MessageProps[];
  activeRoomMedia: MediaProps[];
  sendMessage: (content?: string, mediaIds?: string[]) => MessageProps;
  editMessage: (messageId: string, newContent: string) => void;
  deleteMessage: (messageId: string) => void;

  // Reply functionality
  replyToMessage: (messageId: string) => void;
  currentReply: MessageProps | null;
  clearReply: () => void;

  // Media operations
  uploadMedia: (file: File) => Promise<MediaProps>;
  removeMedia: (mediaId: string) => void;

  // Typing indicators
  startTyping: () => void;
  stopTyping: () => void;
  typingUsers: UserProps[];
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const {
    myProfile: currentUser,
    chatRooms,
    messages,
    media,
    getChatRoomMessages,
    getMessageMedia,
    updateMessage,
    updateChatRoom,
    addMessage,
    addMedia,
    removeMedia: removeMediaFromData,
    getChatRoomUsers,
  } = useData();

  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [currentReply, setCurrentReply] = useState<MessageProps | null>(null);
  const [typingUsers, setTypingUsers] = useState<UserProps[]>([]);

  // Derived state
  const activeRoom = activeRoomId ? chatRooms[activeRoomId] : null;
  const activeRoomMessages = useMemo(
    () => (activeRoomId ? getChatRoomMessages(activeRoomId) : []),
    [activeRoomId, getChatRoomMessages]
  );
  const activeRoomMedia = useMemo(() => {
    const mediaItems: MediaProps[] = [];
    activeRoomMessages.forEach((message) => {
      if (message.mediaIds) {
        message.mediaIds.forEach((mediaId) => {
          const mediaItem = media[mediaId];
          if (mediaItem) mediaItems.push(mediaItem);
        });
      }
    });
    return mediaItems;
  }, [activeRoomMessages, media]);

  // Set active room and mark messages as read
  const setActiveRoom = useCallback(
    (roomId: string) => {
      setActiveRoomId(roomId);
      const currentMessages = getChatRoomMessages(roomId);

      // Mark messages as read
      currentMessages
        .filter((msg) => !msg.readBy?.includes(currentUser.id))
        .forEach((msg) => {
          updateMessage(msg.id, {
            readBy: [...(msg.readBy || []), currentUser.id],
          });
        });
    },
    [currentUser.id, getChatRoomMessages, updateMessage]
  );

  // Create new chat room
  const createRoom = useCallback(
    (room: Omit<ChatRoomProps, 'id' | 'createdAt'>): ChatRoomProps => {
      const newRoom: ChatRoomProps = {
        ...room,
        id: `room-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      updateChatRoom(newRoom.id, newRoom);
      return newRoom;
    },
    [updateChatRoom]
  );

  // Leave chat room
  const leaveRoom = useCallback(
    (roomId: string) => {
      if (activeRoomId === roomId) {
        setActiveRoomId(null);
      }
      // Additional logic to remove user from room participants
      // would go here in a real implementation
    },
    [activeRoomId]
  );

  // Send message
  const sendMessage = useCallback(
    (content?: string, mediaIds?: string[]): MessageProps => {
      if (!activeRoomId) throw new Error('No active room');
      if (!content && !mediaIds?.length)
        throw new Error('No message content or media');

      const newMessage: MessageProps = {
        id: `msg-${Date.now()}`,
        chatRoomId: activeRoomId,
        senderId: currentUser.id,
        content,
        mediaIds,
        timestamp: new Date().toISOString(),
        readBy: [currentUser.id],
        replyToId: currentReply?.id,
      };

      addMessage(newMessage);

      // Update last message in room
      updateChatRoom(activeRoomId, {
        lastMessage: newMessage.id,
        lastMessageTimestamp: newMessage.timestamp,
      });

      setCurrentReply(null);
      stopTyping();

      return newMessage;
    },
    [activeRoomId, currentUser.id, currentReply, addMessage, updateChatRoom]
  );

  // Edit message
  const editMessage = useCallback(
    (messageId: string, newContent: string) => {
      updateMessage(messageId, {
        content: newContent,
        edited: true,
        editedAt: new Date().toISOString(),
      });
    },
    [updateMessage]
  );

  // Delete message (soft delete)
  const deleteMessage = useCallback(
    (messageId: string) => {
      updateMessage(messageId, {
        deleted: true,
        deletedAt: new Date().toISOString(),
        content: 'This message was deleted',
        mediaIds: [],
      });
    },
    [updateMessage]
  );

  // Reply to message
  const replyToMessage = useCallback(
    (messageId: string) => {
      const message = messages[messageId];
      if (message) setCurrentReply(message);
    },
    [messages]
  );

  const clearReply = useCallback(() => {
    setCurrentReply(null);
  }, []);

  // Media operations
  const uploadMedia = useCallback(
    async (file: File): Promise<MediaProps> => {
      try {
        // In a real app, you would upload to a server
        const newMedia: MediaProps = {
          id: `media-${Date.now()}`,
          type: file.type.startsWith('image')
            ? 'image'
            : file.type.startsWith('video')
            ? 'video'
            : file.type.startsWith('audio')
            ? 'audio'
            : 'file',
          url: URL.createObjectURL(file),
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          uploadedAt: new Date().toISOString(),
          uploadedBy: currentUser.id,
        };

        addMedia(newMedia);
        return newMedia;
      } catch (error) {
        console.error('Failed to upload media:', error);
        throw error;
      }
    },
    [currentUser.id, addMedia]
  );

  const removeMedia = useCallback(
    (mediaId: string) => {
      removeMediaFromData(mediaId);
      // Revoke object URL if exists
      if (media[mediaId]?.url.startsWith('blob:')) {
        URL.revokeObjectURL(media[mediaId].url);
      }
    },
    [media, removeMediaFromData]
  );

  // Typing indicators
  const startTyping = useCallback(() => {
    if (!activeRoomId) return;
    // In a real app, you would notify other users via WebSocket
    // This is just local state for demonstration
    if (!typingUsers.some((user) => user.id === currentUser.id)) {
      setTypingUsers((prev) => [...prev, currentUser]);
    }
  }, [activeRoomId, currentUser, typingUsers]);

  const stopTyping = useCallback(() => {
    setTypingUsers((prev) => prev.filter((user) => user.id !== currentUser.id));
  }, [currentUser.id]);

  // Set first room as active by default
  useEffect(() => {
    if (!activeRoomId && Object.keys(chatRooms).length > 0) {
      setActiveRoom(Object.keys(chatRooms)[0]);
    }
  }, [activeRoomId, chatRooms, setActiveRoom]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(media).forEach((mediaItem) => {
        if (mediaItem.url.startsWith('blob:')) {
          URL.revokeObjectURL(mediaItem.url);
        }
      });
    };
  }, [media]);

  const value = {
    activeRoom,
    setActiveRoom,
    createRoom,
    leaveRoom,
    activeRoomMessages,
    activeRoomMedia,
    sendMessage,
    editMessage,
    deleteMessage,
    replyToMessage,
    currentReply,
    clearReply,
    uploadMedia,
    removeMedia,
    startTyping,
    stopTyping,
    typingUsers,
  };

  return (
    <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};