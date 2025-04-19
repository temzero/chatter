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
import { MessagesData } from '@/data/messages';
import type { MessageProps } from '@/data/messages';
import type { ChatProps } from '@/data/types';

// Modified getMessagesByChatId to accept current messages list
const getMessagesByChatId = (chatId: number, messages: MessageProps[]) => {
  return messages.filter((msg) => msg.chatId === chatId);
};

interface ChatContextType {
  chats: ChatProps[];
  activeChat: ChatProps | null;
  activeMessages: MessageProps[];
  setActiveChat: Dispatch<SetStateAction<ChatProps | null>>;
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
  addChat: (newChat: ChatProps) => void;
  updateChat: (id: number, updatedData: Partial<ChatProps>) => void;
  deleteChat: (id: number) => void;
  addMessage: (newMessage: MessageProps) => void;
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

  const activeMessages = useMemo(() => {
    return activeChat ? getMessagesByChatId(activeChat.id, messages) : [];
  }, [activeChat, messages]);

  const filteredChats = useMemo(() => {
    return chats.filter((chat) =>
      [chat.name, chat.lastMessage, chat.type]
        .join(' ')
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [chats, searchTerm]);

  const addChat = (newChat: ChatProps) => {
    setChats([newChat, ...chats]);
  };

  const updateChat = (id: number, updatedData: Partial<ChatProps>) => {
    setChats(
      chats.map((chat) =>
        chat.id === id ? { ...chat, ...updatedData } : chat
      )
    );
  };

  const deleteChat = (id: number) => {
    setChats(chats.filter((chat) => chat.id !== id));
    setMessages(messages.filter((message) => message.chatId !== id));
    if (activeChat?.id === id) {
      setActiveChat(null);
    }
  };

  const addMessage = (newMessage: MessageProps) => {
    setMessages([...messages, newMessage]);

    if (activeChat && newMessage.chatId === activeChat.id) {
      updateChat(activeChat.id, {
        lastMessage: newMessage.text,
        lastMessageTime: newMessage.time,
      });
    }
  };

  return (
    <ChatContext.Provider
      value={{
        chats: filteredChats,
        activeChat,
        activeMessages,
        setActiveChat,
        searchTerm,
        setSearchTerm,
        addChat,
        updateChat,
        deleteChat,
        addMessage,
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
