import { create } from "zustand";
import { persist } from "zustand/middleware";
import { chatService } from "@/services/chat/chatService";
import { useMessageStore } from "./messageStore";
import { useSidebarInfoStore } from "./sidebarInfoStore";
import { GroupChannelChat } from "@/types/chat";
import { chatMemberService } from "@/services/chat/chatMemberService";
import type { Chat, ChatType, ChatMember, DirectChat } from "@/types/chat";

interface ChatStore {
  chats: Chat[];
  searchTerm: string;
  activeChat: Chat | null;
  isLoading: boolean;
  error: string | null;
  filteredChats: Chat[];
  groupMembers: Record<string, ChatMember[]>;

  initialize: () => Promise<void>;
  getChats: () => Promise<void>;
  getChatById: (chatId: string) => Promise<void>;
  setActiveChat: (chat: Chat | null) => void;
  getGroupMembers: (groupId: string) => Promise<void>;
  setActiveChatById: (chatId: string | null) => Promise<void>;
  createDirectChat: (chatPartnerId: string) => Promise<DirectChat>;
  createGroupChat: (payload: {
    name: string;
    memberIds: string[];
    type: "group" | "channel";
  }) => Promise<Chat>;
  updateDirectChat: (id: string, payload: Partial<DirectChat>) => Promise<void>;
  updateGroupChat: (
    id: string,
    payload: Partial<GroupChannelChat>
  ) => Promise<void>;
  deleteChat: (id: string, type: ChatType) => Promise<void>;
  setSearchTerm: (term: string) => void;
  updateMember: (
    chatId: string,
    userId: string,
    updates: { role?: string; mutedUntil?: Date }
  ) => Promise<void>;
  updateMemberNickname: (
    chatId: string,
    userId: string,
    nickname: string
  ) => Promise<string>;
  clearChats: () => void;
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

      initialize: async () => {
        await get().getChats();
      },

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
        const members = await chatMemberService.getChatMembers(groupId);
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

          if (chat.type === "direct") {
            const partnerNameMatch = chat.firstName
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
        if (!chat) {
          console.log("chat not exist!");
          set({ activeChat: null });
          return;
        }
        useSidebarInfoStore.getState().setSidebarInfo("default");
        set({ activeChat: chat });
        if (chat.type !== "direct") {
          get().getGroupMembers(chat.id);
        }
      },

      setActiveChatById: async (chatId: string | null) => {
        if (!chatId) {
          console.log("no chatId");
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

      createDirectChat: async (chatPartnerId) => {
        set({ isLoading: true });
        try {
          const newChat = await chatService.createDirectChat(chatPartnerId);
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

      updateDirectChat: async (id, payload) => {
        set({ isLoading: true });
        try {
          const updatedChat = await chatService.updateDirectChat(id, payload);
          set((state) => ({
            chats: state.chats.map((chat) =>
              chat.id === id ? updatedChat : chat
            ),
            activeChat:
              state.activeChat?.id === id ? updatedChat : state.activeChat,
            isLoading: false,
          }));
        } catch (error) {
          console.error("Failed to update direct chat:", error);
          set({
            error: "Failed to update direct chat",
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

      updateMember: async (chatId, userId, updates) => {
        set({ isLoading: true });
        try {
          const updatedMember = await chatMemberService.updateMember(
            chatId,
            userId,
            updates
          );

          // Update the member inside groupMembers state
          set((state) => {
            const currentMembers = state.groupMembers[chatId] || [];
            const updatedMembers = currentMembers.map((member) =>
              member.userId === userId ? updatedMember : member
            );
            return {
              groupMembers: {
                ...state.groupMembers,
                [chatId]: updatedMembers,
              },
              isLoading: false,
            };
          });
        } catch (error) {
          console.error("Failed to update chat member:", error);
          set({ error: "Failed to update member", isLoading: false });
          throw error;
        }
      },

      updateMemberNickname: async (chatId, userId, nickname) => {
        set({ isLoading: true });
        try {
          const updatedNickname = await chatMemberService.updateMemberNickname(
            chatId,
            userId,
            nickname
          );

          // Update the active chat name if it's a direct chat
          set((state) => {
            if (
              state.activeChat?.id === chatId &&
              state.activeChat.type === "direct"
            ) {
              const updatedActiveChat = {
                ...state.activeChat,
                name: updatedNickname as string,
                firstName: updatedNickname as string,
              } as Chat;
              return {
                activeChat: updatedActiveChat,
                chats: state.chats.map((chat) =>
                  chat.id === chatId && chat.type === "direct"
                    ? updatedActiveChat
                    : chat
                ),
                isLoading: false,
              };
            }
            return { isLoading: false };
          });
          return updatedNickname;
        } catch (error) {
          console.error("Failed to update member nickname:", error);
          set({ error: "Failed to update nickname", isLoading: false });
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

      clearChats: () => {
        set({ chats: [], activeChat: null, groupMembers: {} });
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
