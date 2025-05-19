import { create } from "zustand";
import { persist } from "zustand/middleware";
import { chatService } from "@/services/chat/chatService";
import { useMessageStore } from "./messageStore";
import { useSidebarInfoStore } from "./sidebarInfoStore";
import type {
  Chat,
  ChatTypes,
  ChatGroupTypes,
  ChatGroupMember,
  GroupChat,
  PrivateChat,
} from "@/types/chat";
import { groupChatService } from "@/services/chat/groupChatService";

interface ChatStore {
  chats: Chat[];
  searchTerm: string;
  activeChat: Chat | null;
  isLoading: boolean;
  error: string | null;
  filteredChats: Chat[];
  groupMembers: Record<string, ChatGroupMember[]>;

  getChats: (userId: string) => Promise<void>;
  getChatById: (chatId: string) => Promise<void>;
  getGroupMembers: (groupId: string) => Promise<void>;
  setActiveChat: (chat: Chat | null) => void;
  setActiveChatById: (chatId: string | null) => Promise<void>;
  createPrivateChat: (chatPartnerId: string) => Promise<PrivateChat>;
  createGroupChat: (payload: {
    name: string;
    memberIds: string[];
    type: ChatGroupTypes;
  }) => Promise<Chat>;
  updatePrivateChat: (
    id: string,
    payload: Partial<PrivateChat>
  ) => Promise<void>;
  updateGroupChat: (id: string, payload: Partial<GroupChat>) => Promise<void>;
  deleteChat: (id: string, type: ChatTypes) => Promise<void>;
  setSearchTerm: (term: string) => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      chats: [],
      groupMembers: {},
      filteredChats: [],
      searchTerm: "",
      activeChat: null,
      isLoading: false,
      error: null,

      getChats: async () => {
        set({ isLoading: true, error: null });
        try {
          const chats: Chat[] = await chatService.getAllChats();
          set({ chats, isLoading: false });
          console.log("fetched Chats:", chats);
        } catch (error) {
          console.error("Failed to fetch chats:", error);
          set({
            error: "Failed to load chats",
            isLoading: false,
          });
        }
      },

      getChatById: async (chatId) => {
        set({ isLoading: true });
        try {
          const chat: Chat = await chatService.getChatById(chatId);
          set((state) => ({
            chats: state.chats.some((c) => c.id === chatId)
              ? state.chats.map((c) => (c.id === chatId ? chat : c))
              : [...state.chats, chat],
            activeChat:
              state.activeChat?.id === chatId ? chat : state.activeChat,
            isLoading: false,
          }));
        } catch (error) {
          console.error("Failed to fetch chat:", error);
          set({
            error: "Failed to load chat",
            isLoading: false,
          });
        }
      },

      getGroupMembers: async (groupId) => {
        const members = await groupChatService.getGroupChatMembers(groupId);
        set((state) => ({
          groupMembers: { ...state.groupMembers, [groupId]: members },
        }));
      },

      setSearchTerm: (term) => {
        const { chats } = get();

        if (!term.trim()) {
          set({
            searchTerm: term,
            filteredChats: chats,
          });
          return;
        }

        const lowerCaseTerm = term.toLowerCase();
        const filtered = chats.filter((chat) => {
          const nameMatch = chat.name?.toLowerCase().includes(lowerCaseTerm);

          if (chat.type === "private") {
            const partnerNameMatch = chat.chatPartner?.first_name
              ?.toLowerCase()
              .includes(lowerCaseTerm);
            return nameMatch || partnerNameMatch;
          }

          return nameMatch;
        });

        set({
          searchTerm: term,
          filteredChats: filtered,
        });
      },

      setActiveChat: (chat) => {
        useSidebarInfoStore.getState().setSidebarInfo("default");
        set({ activeChat: chat });
      },

      setActiveChatById: async (chatId: string | null) => {
        if (!chatId) {
          get().setActiveChat(null);
          return;
        }

        try {
          const existingChat = get().chats.find((chat) => chat.id === chatId);
          if (existingChat) {
            get().setActiveChat(existingChat);
          } else {
            console.error("Cannot find chat in existing chats");
          }
        } catch (error) {
          console.error("Failed to set active chat:", error);
          set({ error: "Failed to load chat" });
        }
      },

      createPrivateChat: async (chatPartnerId) => {
        set({ isLoading: true });
        try {
          const newChat = await chatService.createPrivateChat(chatPartnerId);
          set((state) => ({
            chats: [newChat, ...state.chats],
            isLoading: false,
          }));
          return newChat;
        } catch (error) {
          console.error("Failed to create chat:", error);
          set({
            error: "Failed to create chat",
            isLoading: false,
          });
          throw error;
        }
      },

      createGroupChat: async (payload) => {
        set({ isLoading: true });
        try {
          const newChat = await chatService.createGroupChat(payload);
          set((state) => ({
            chats: [newChat, ...state.chats],
            isLoading: false,
          }));
          return newChat;
        } catch (error) {
          console.error("Failed to create chat:", error);
          set({
            error: "Failed to create chat",
            isLoading: false,
          });
          throw error;
        }
      },

      updatePrivateChat: async (id, payload) => {
        set({ isLoading: true });
        try {
          const updatedChat = await chatService.updatePrivateChat(id, payload);
          set((state) => ({
            chats: state.chats.map((chat) =>
              chat.id === id ? updatedChat : chat
            ),
            activeChat:
              state.activeChat?.id === id ? updatedChat : state.activeChat,
            isLoading: false,
          }));
        } catch (error) {
          console.error("Failed to update private chat:", error);
          set({
            error: "Failed to update private chat",
            isLoading: false,
          });
          throw error;
        }
      },

      updateGroupChat: async (id, payload) => {
        set({ isLoading: true });
        try {
          const updatedChat = await chatService.updateGroupChat(id, payload);
          set((state) => ({
            chats: state.chats.map((chat) =>
              chat.id === id ? updatedChat : chat
            ),
            activeChat:
              state.activeChat?.id === id ? updatedChat : state.activeChat,
            isLoading: false,
          }));
        } catch (error) {
          console.error("Failed to update group chat:", error);
          set({
            error: "Failed to update group chat",
            isLoading: false,
          });
          throw error;
        }
      },

      deleteChat: async (id, type) => {
        set({ isLoading: true });
        try {
          await chatService.deleteChat(id, type);

          useMessageStore.setState((msgState) => {
            const filteredMessages = msgState.messages.filter(
              (m) => m.chat.id !== id
            );
            const isDeletingActive = get().activeChat?.id === id;
            return {
              messages: filteredMessages,
              activeMessages: isDeletingActive ? [] : msgState.activeMessages,
              activeMedia: isDeletingActive ? [] : msgState.activeMedia,
            };
          });

          set((state) => ({
            chats: state.chats.filter((chat) => chat.id !== id),
            activeChat: state.activeChat?.id === id ? null : state.activeChat,
            isLoading: false,
          }));
        } catch (error) {
          console.error("Failed to delete chat:", error);
          set({
            error: "Failed to delete chat",
            isLoading: false,
          });
          throw error;
        }
      },
    }),
    {
      name: "chat-storage",
      partialize: (state) => ({
        activeChat: state.activeChat,
        chats: state.chats,
      }),
    }
  )
);
