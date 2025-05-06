import { create } from "zustand";
import { ChatsData } from "@/data/chat";
import { MessagesData } from "@/data/message";
import type { MessageProps } from "@/data/message";
import type { ChatProps } from "@/data/types";

interface MediaProps {
  type: "image" | "video" | "audio" | "file";
  url: string;
  fileName?: string;
  messageId: string;
  chatId: string;
  timestamp: string;
}

interface LastMessageInfo {
  content: string;
  icon?: string;
  time: string;
}

interface ChatStore {
  chats: ChatProps[];
  messages: MessageProps[];
  drafts: Record<string, string>;
  searchTerm: string;
  activeChat: ChatProps | null;
  activeMessages: MessageProps[];
  activeMedia: MediaProps[];

  // Actions
  setSearchTerm: (term: string) => void;
  setActiveChat: (chat: ChatProps | null) => void;
  addChat: (newChat: ChatProps) => void;
  updateChat: (id: string, updatedData: Partial<ChatProps>) => void;
  deleteChat: (id: string) => void;
  addMessage: (newMessage: MessageProps) => void;
  deleteMessage: (id: string) => void;
  getChatMedia: (chatId: string) => MediaProps[];
  setDraftMessage: (chatId: string, draft: string) => void;
  getDraftMessage: (chatId: string) => string;
}

// Helpers
const getMessagesByChatId = (chatId: string, messages: MessageProps[]) => {
  return messages.filter((msg) => msg.chatId === chatId);
};

const getMediaFromMessages = (messages: MessageProps[]): MediaProps[] => {
  return messages
    .filter((msg) => msg.media && msg.media.length > 0)
    .flatMap((msg) =>
      msg.media!.map((mediaItem) => ({
        ...mediaItem,
        messageId: msg.id,
        chatId: msg.chatId,
        timestamp: msg.time,
      }))
    );
};

const createLastMessageInfo = (message: MessageProps): LastMessageInfo => {
  const { text = "", media = [], time } = message;
  const types = media.map((m) => m.type);

  const icon = types.includes("image")
    ? "image"
    : types.includes("video")
    ? "videocam"
    : types.includes("audio")
    ? "music_note"
    : types.length
    ? "folder_zip"
    : undefined;

  const content = text || media[0]?.fileName || "";

  return { content, icon, time };
};

// Zustand store
export const useChatStore = create<ChatStore>((set, get) => ({
  chats: ChatsData,
  messages: MessagesData,
  drafts: {},
  searchTerm: "",
  activeChat: null,
  activeMessages: [],
  activeMedia: [],

  setSearchTerm: (term) => set({ searchTerm: term }),

  setActiveChat: (chat) => {
    const messages = get().messages;
    const activeMessages = chat ? getMessagesByChatId(chat.id, messages) : [];
    const activeMedia = getMediaFromMessages(activeMessages);

    set({
      activeChat: chat,
      activeMessages,
      activeMedia,
    });
  },

  addChat: (newChat) => set((state) => ({ chats: [newChat, ...state.chats] })),

  updateChat: (id, updatedData) =>
    set((state) => ({
      chats: state.chats.map((chat) =>
        chat.id === id ? { ...chat, ...updatedData } : chat
      ),
    })),

  deleteChat: (id) =>
    set((state) => {
      const newChats = state.chats.filter((chat) => chat.id !== id);
      const newMessages = state.messages.filter(
        (message) => message.chatId !== id
      );
      const isDeletingActive = state.activeChat?.id === id;

      return {
        chats: newChats,
        messages: newMessages,
        activeChat: isDeletingActive ? null : state.activeChat,
        activeMessages: isDeletingActive ? [] : state.activeMessages,
        activeMedia: isDeletingActive ? [] : state.activeMedia,
      };
    }),

  addMessage: (newMessage) => {
    const { activeChat } = get();
    const updatedMessages = [...get().messages, newMessage];

    const shouldUpdateActive =
      activeChat && newMessage.chatId === activeChat.id;
    const activeMessages = shouldUpdateActive
      ? getMessagesByChatId(activeChat.id, updatedMessages)
      : get().activeMessages;

    const activeMedia = shouldUpdateActive
      ? getMediaFromMessages(activeMessages)
      : get().activeMedia;

    const updatedChats = get().chats.map((chat) =>
      chat.id === newMessage.chatId
        ? {
            ...chat,
            ...createLastMessageInfo(newMessage),
          }
        : chat
    );

    set({
      messages: updatedMessages,
      chats: updatedChats,
      activeMessages,
      activeMedia,
    });
  },

  deleteMessage: (id) => {
    const messages = get().messages.filter((msg) => msg.id !== id);
    const activeChat = get().activeChat;
    const activeMessages = activeChat
      ? getMessagesByChatId(activeChat.id, messages)
      : [];
    const activeMedia = getMediaFromMessages(activeMessages);

    set({
      messages,
      activeMessages,
      activeMedia,
    });
  },

  getChatMedia: (chatId) => {
    const chatMessages = getMessagesByChatId(chatId, get().messages);
    return getMediaFromMessages(chatMessages);
  },

  setDraftMessage: (chatId, draft) =>
    set((state) => ({
      drafts: { ...state.drafts, [chatId]: draft },
    })),

  getDraftMessage: (chatId) => {
    return get().drafts[chatId] || "";
  },
}));

// Selectors
export const useFilteredChats = () =>
  useChatStore((state) =>
    state.chats.filter((chat) =>
      [chat.name, chat.lastMessage, chat.type]
        .join(" ")
        .toLowerCase()
        .includes(state.searchTerm.toLowerCase())
    )
  );

export const useActiveMessages = () =>
  useChatStore((state) => state.activeMessages);

export const useActiveMedia = () => useChatStore((state) => state.activeMedia);
