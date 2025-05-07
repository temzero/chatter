import { create } from "zustand";
import type { Message, MessageMedia } from "@/types/message";
import { useChatStore } from "./chatStore";

export interface MessageStore {
  messages: Message[];
  drafts: Record<string, string>;
  activeMessages: Message[];
  activeMedia: MessageMedia[];

  addMessage: (newMessage: Message) => void;
  deleteMessage: (id: string) => void;
  getChatMedia: (chatId: string) => MessageMedia[];
  setDraftMessage: (chatId: string, draft: string) => void;
  getDraftMessage: (chatId: string) => string;
}

export const getMessagesByChatId = (chatId: string, messages: Message[]) =>
  messages.filter((msg) => msg.chat.id === chatId);

export const getMediaFromMessages = (messages: Message[]): MessageMedia[] =>
  messages
    .filter((msg) => msg.media_items && msg.media_items.length > 0)
    .flatMap((msg) =>
      msg.media_items!.map((mediaItem) => ({
        ...mediaItem,
        messageId: msg.id,
      }))
    );

const createLastMessageInfo = (message: Message) => {
  const { content = "", media_items = [], createdAt } = message;
  const types = media_items.map((m) => m.type);
  const icon = types.includes("image")
    ? "image"
    : types.includes("video")
    ? "videocam"
    : types.includes("audio")
    ? "music_note"
    : types.length
    ? "folder_zip"
    : undefined;

  const contentText = content || "Media";
  return { content: contentText, icon, time: createdAt };
};

export const useMessageStore = create<MessageStore>((set, get) => ({
  messages: [],
  drafts: {},
  activeMessages: [],
  activeMedia: [],

  addMessage: (newMessage) => {
    const { messages } = get();
    const updatedMessages = [...messages, newMessage];

    const activeChat = useChatStore.getState().activeChat;
    const shouldUpdateActive = activeChat?.id === newMessage.chat.id;

    const activeMessages = shouldUpdateActive
      ? getMessagesByChatId(activeChat.id, updatedMessages)
      : get().activeMessages;

    const activeMedia = shouldUpdateActive
      ? getMediaFromMessages(activeMessages)
      : get().activeMedia;

    const chats = useChatStore.getState().chats.map((chat) =>
      chat.id === newMessage.chat.id
        ? {
            ...chat,
            ...createLastMessageInfo(newMessage),
          }
        : chat
    );

    useChatStore.setState({ chats });

    set({
      messages: updatedMessages,
      activeMessages,
      activeMedia,
    });
  },

  deleteMessage: (id) => {
    const messages = get().messages.filter((msg) => msg.id !== id);
    const activeChat = useChatStore.getState().activeChat;

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
