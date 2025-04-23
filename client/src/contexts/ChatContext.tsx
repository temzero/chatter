import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  Dispatch,
  SetStateAction,
  useMemo,
} from 'react';
import { ChatsData } from './data';
import { MessagesData } from '@/data/message';
import type { MessageProps } from '@/data/message';
import type { ChatProps } from '@/data/types';

// Modified getMessagesByChatId to accept current messages list
const getMessagesByChatId = (chatId: string, messages: MessageProps[]) => {
  return messages.filter((msg) => msg.chatId === chatId);
};

const getMediaFromMessages = (messages: MessageProps[]) => {
  return messages
    .filter((msg) => msg.media && msg.media.length > 0)  // Ensure media is not empty
    .flatMap((msg) => 
      msg.media!.map((mediaItem) => ({
        ...mediaItem,               // Spread media item properties
        messageId: msg.id,          // Add messageId
        chatId: msg.chatId,         // Add chatId
        timestamp: msg.time,        // Add timestamp
      }))
    );
};

interface ChatContextType {
  chats: ChatProps[];
  activeChat: ChatProps | null;
  activeMessages: MessageProps[];
  activeMedia: MediaProps[]; // New field for active media
  setActiveChat: Dispatch<SetStateAction<ChatProps | null>>;
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
  addChat: (newChat: ChatProps) => void;
  updateChat: (id: string, updatedData: Partial<ChatProps>) => void;
  deleteChat: (id: string) => void;
  addMessage: (newMessage: MessageProps) => void;
  deleteMessage: (id: string) => void;
  getChatMedia: (chatId: string) => MediaProps[];
  setDraftMessage: (chatId: string, draft: string) => void;
  getDraftMessage: (chatId: string) => string;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [chats, setChats] = useState<ChatProps[]>(ChatsData);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeChat, setActiveChat] = useState<ChatProps | null>(null);
  const [messages, setMessages] = useState<MessageProps[]>(MessagesData);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const activeMessages = useMemo(() => {
    return activeChat ? getMessagesByChatId(activeChat.id, messages) : [];
    
  }, [activeChat, messages]);
  console.log('activeMessages' , activeMessages)

  // New: Active media derived from active messages
  const activeMedia = useMemo(() => {
    return getMediaFromMessages(activeMessages);
  }, [activeMessages]);

  const filteredChats = useMemo(() => {
    return chats.filter((chat) =>
      [chat.name, chat.lastMessage, chat.type]
        .join(' ')
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [chats, searchTerm]);

  // New: Helper to get media for any chat
  const getChatMedia = (chatId: string) => {
    const chatMessages = getMessagesByChatId(chatId, messages);
    return getMediaFromMessages(chatMessages);
  };

  const addChat = (newChat: ChatProps) => {
    setChats([newChat, ...chats]);
  };

  const updateChat = (id: string, updatedData: Partial<ChatProps>) => {
    setChats(
      chats.map((chat) =>
        chat.id === id ? { ...chat, ...updatedData } : chat
      )
    );
  };

  const deleteChat = (id: string) => {
    setChats(chats.filter((chat) => chat.id !== id));
    setMessages(messages.filter((message) => message.chatId !== id));
    if (activeChat?.id === id) {
      setActiveChat(null);
    }
  };

  const addMessage = (newMessage: MessageProps) => {
    setMessages([...messages, newMessage]);
  
    if (activeChat && newMessage.chatId === activeChat.id) {
      const { text = "", media = [] } = newMessage;
      const types = media.map((m) => m.type);
  
      let mediaIcon: React.ReactNode = null;
      if (types.includes("photo")) {
        mediaIcon = (
          <i className="material-symbols-outlined text-md">image</i>
        );
      } else if (types.includes("video")) {
        mediaIcon = (
          <i className="material-symbols-outlined text-md">videocam</i>
        );
      } else if (types.includes("audio")) {
        mediaIcon = (
          <i className="material-symbols-outlined text-md">music_note</i>
        );
      } else if (types.length) {
        mediaIcon = (
          <i className="material-symbols-outlined text-md">folder_zip</i>
        );
      }
  
      let lastMessageContent: React.ReactNode = null;
      if (text) {
        lastMessageContent = (
          <>
            {mediaIcon} {text}
          </>
        );
      } else if (media.length > 0 && media[0].fileName) {
        lastMessageContent = (
          <p className='text-purple-500 flex items-center gap-1'>
            {mediaIcon} {media[0].fileName}
          </p>
        );
      } else {
        lastMessageContent = mediaIcon;
      }
  
      updateChat(activeChat.id, {
        lastMessage: lastMessageContent,
        lastMessageTime: newMessage.time,
      });
    }
  };
  

  // In your ChatProvider component
  const deleteMessage = (id: string) => {
    setMessages(messages.filter((message) => message.id !== id));
  };

  const setDraftMessage = (chatId: string, text: string) => {
    setDrafts((prev) => ({ ...prev, [chatId]: text }));
  };
  
  const getDraftMessage = (chatId: string) => {
    return drafts[chatId] || '';
  };

  return (
    <ChatContext.Provider
      value={{
        chats: filteredChats,
        activeChat,
        activeMessages,
        activeMedia,
        setActiveChat,
        searchTerm,
        setSearchTerm,
        addChat,
        updateChat,
        deleteChat,
        addMessage,
        deleteMessage,
        getChatMedia,
        setDraftMessage,
        getDraftMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

// MediaProps interface (add this if not already defined elsewhere)
interface MediaProps {
  type: 'photo' | 'video' | 'audio' | 'file';
  url: string;
  messageId: string;
  chatId: string;
  timestamp: string;
}