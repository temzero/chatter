import { create } from "zustand";
import { persist } from "zustand/middleware";
import { chatService } from "@/services/chat/chatService";
import { useMessageStore } from "./messageStore";
import { ChatType } from "@/types/enums/ChatType";
import { useAuthStore } from "./authStore";
import { useShallow } from "zustand/shallow";
import type {
  ChatResponse,
  DirectChatResponse,
  GroupChatResponse,
  LastMessageResponse,
} from "@/types/chat";
import React from "react";
import { chatMemberService } from "@/services/chat/chatMemberService";
import { useChatMemberStore } from "./chatMemberStore";

interface ChatStore {
  chats: ChatResponse[];
  searchTerm: string;
  activeChat: ChatResponse | null;
  isLoading: boolean;
  error: string | null;
  filteredChats: ChatResponse[];

  initialize: () => Promise<void>;
  getChats: () => Promise<void>;
  fetchChatById: (chatId?: string) => Promise<void>;
  getDirectChatByUserId: (
    userId: string
  ) => Promise<ChatResponse | null | undefined>;
  setActiveChat: (chat: ChatResponse | null) => Promise<void>;
  setActiveChatById: (chatId: string | null) => Promise<void>;
  createOrGetDirectChat: (partnerId: string) => Promise<DirectChatResponse>;
  createGroupChat: (payload: {
    name: string;
    userIds: string[];
    type: ChatType.GROUP | ChatType.CHANNEL;
  }) => Promise<GroupChatResponse>;
  updateDirectChat: (
    id: string,
    payload: Partial<DirectChatResponse>
  ) => Promise<void>;
  updateGroupChat: (
    id: string,
    payload: Partial<GroupChatResponse>
  ) => Promise<void>;
  setLastMessage: (chatId: string, message: LastMessageResponse | null) => void;
  setSearchTerm: (term: string) => void;
  leaveGroupChat: (chatId: string) => Promise<void>;
  deleteChat: (id: string, type: ChatType) => Promise<void>;
  clearChats: () => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => {
      // Shared cleanup function
      const cleanupChat = (chatId: string) => {
        // Cleanup messages
        useMessageStore.getState().clearChatMessages(chatId);
        // Cleanup chat store
        set((state) => ({
          chats: state.chats.filter((chat) => chat.id !== chatId),
          filteredChats: state.filteredChats.filter(
            (chat) => chat.id !== chatId
          ),
          activeChat: state.activeChat?.id === chatId ? null : state.activeChat,
        }));
      };

      return {
        chats: [],
        filteredChats: [],
        searchTerm: "",
        activeChat: null,
        isLoading: false,
        error: null,

        initialize: async () => {
          try {
            set({ isLoading: true, error: null });
            await get().getChats();
            set({ isLoading: false });
          } catch (error) {
            console.error("Initialization failed:", error);
            set({ error: "Failed to initialize chat data", isLoading: false });
            throw error;
          }
        },

        getChats: async () => {
          set({ isLoading: true, error: null });
          try {
            const chats: ChatResponse[] = await chatService.getAllChats();
            set({ chats, filteredChats: chats, isLoading: false });
          } catch (error) {
            console.error("Failed to fetch chats:", error);
            set({ error: "Failed to load chats", isLoading: false });
          }
        },

        fetchChatById: async (chatId) => {
          const targetChatId = chatId || get().activeChat?.id;
          if (!targetChatId) {
            console.warn("No chatId provided and no active chat available");
            return;
          }

          set({ isLoading: true });
          try {
            const chat: ChatResponse = await chatService.fetchChatById(
              targetChatId
            );
            set((state) => ({
              chats: state.chats.some((c) => c.id === targetChatId)
                ? state.chats.map((c) => (c.id === targetChatId ? chat : c))
                : [...state.chats, chat],
              activeChat:
                state.activeChat?.id === targetChatId ? chat : state.activeChat,
              isLoading: false,
            }));
          } catch (error) {
            console.error("Failed to fetch chat:", error);
            set({ error: "Failed to load chat", isLoading: false });
          }
        },

        getDirectChatByUserId: async (userId) => {
          if (!userId) {
            console.warn("No userId provided");
            return;
          }

          const existingChat = get().chats.find(
            (chat) =>
              chat.type === ChatType.DIRECT &&
              chat.chatPartner.userId === userId
          );

          if (existingChat) {
            await get().fetchChatById(existingChat.id);
            return existingChat;
          }
          return null;
        },

        setSearchTerm: (term) => {
          const { chats } = get();

          if (!term.trim()) {
            set({ searchTerm: term, filteredChats: chats });
            return;
          }

          const lowerCaseTerm = term.toLowerCase();
          const filtered = chats.filter((chat) => {
            if (chat.type === ChatType.DIRECT) {
              const partner = chat.chatPartner;
              return (
                partner?.firstName?.toLowerCase().includes(lowerCaseTerm) ||
                partner?.lastName?.toLowerCase().includes(lowerCaseTerm) ||
                partner?.username?.toLowerCase().includes(lowerCaseTerm)
              );
            } else {
              return chat.name?.toLowerCase().includes(lowerCaseTerm) ?? false;
            }
          });

          set({ searchTerm: term, filteredChats: filtered });
        },

        setActiveChat: async (chat) => {
          if (!chat) {
            set({ activeChat: null, isLoading: false });
            return Promise.resolve();
          }

          const { messages } = useMessageStore.getState();
          const alreadyFetchedMessages = !!messages[chat.id];
          console.log("alreadyFetchedMessages", alreadyFetchedMessages);
          const { chatMembers } = useChatMemberStore.getState();
          const alreadyFetchedMembers = !!chatMembers[chat.id];
          console.log('alreadyFetchedMembers', alreadyFetchedMembers)

          set({ isLoading: true });
          set({ activeChat: chat });
          window.history.pushState({}, "", `/${chat.id}`);

          try {
            const fetchMessagesPromise = alreadyFetchedMessages
              ? null
              : useMessageStore.getState().fetchMessages(chat.id);

            const fetchMembersPromise =
              alreadyFetchedMembers || chat.type === ChatType.DIRECT
                ? null
                : useChatMemberStore.getState().fetchChatMembers(chat.id);

            await Promise.all(
              [fetchMessagesPromise, fetchMembersPromise].filter(Boolean)
            );

            set((state) => {
              const targetChat = state.chats.find((c) => c.id === chat.id);
              if (targetChat?.unreadCount === 0) return { isLoading: false };

              return {
                chats: state.chats.map((c) =>
                  c.id === chat.id ? { ...c, unreadCount: 0 } : c
                ),
                filteredChats: state.filteredChats.map((c) =>
                  c.id === chat.id ? { ...c, unreadCount: 0 } : c
                ),
                isLoading: false,
              };
            });
          } catch (error) {
            console.error("Error in setActiveChat:", error);
            set({ isLoading: false });
            throw error;
          }
        },

        setActiveChatById: async (chatId) => {
          if (!chatId) {
            await get().setActiveChat(null);
            return;
          }

          try {
            const existingChat = get().chats.find((chat) => chat.id === chatId);
            if (existingChat) {
              await get().setActiveChat(existingChat);
            } else {
              await get().fetchChatById(chatId);
              const fetchedChat = get().chats.find(
                (chat) => chat.id === chatId
              );
              if (fetchedChat) await get().setActiveChat(fetchedChat);
            }
          } catch (error) {
            console.error("Failed to set active chat:", error);
            set({ error: "Failed to load chat" });
          }
        },

        createOrGetDirectChat: async (partnerId) => {
          set({ isLoading: true });
          try {
            const { payload, wasExisting } =
              await chatService.createOrGetDirectChat(partnerId);

            if (wasExisting) {
              const existingChat = get().chats.find(
                (chat) => chat.id === payload.id
              );
              if (existingChat) {
                get().setActiveChat(existingChat);
              } else {
                await get().fetchChatById(payload.id);
                const fetchedChat = get().chats.find(
                  (chat) => chat.id === payload.id
                );
                if (fetchedChat) get().setActiveChat(fetchedChat);
              }
            } else {
              set((state) => ({
                chats: [payload, ...state.chats],
                filteredChats: [payload, ...state.filteredChats],
              }));
              get().setActiveChat(payload);
            }

            set({ isLoading: false });
            return payload;
          } catch (error) {
            console.error("Failed to create chat:", error);
            set({ error: "Failed to create chat", isLoading: false });
            throw error;
          }
        },

        createGroupChat: async (payload) => {
          set({ isLoading: true });
          try {
            const newChat = await chatService.createGroupChat(payload);
            set((state) => ({
              chats: [newChat, ...state.chats],
              filteredChats: [newChat, ...state.filteredChats],
              isLoading: false,
            }));
            return newChat;
          } catch (error) {
            console.error("Failed to create chat:", error);
            set({ error: "Failed to create chat", isLoading: false });
            throw error;
          }
        },

        updateDirectChat: async (id, payload) => {
          set({ isLoading: true });
          try {
            const updatedChat = await chatService.updateDirectChat(id, payload);
            set((state) => ({
              chats: state.chats.map((chat) =>
                chat.id === id ? { ...chat, ...updatedChat } : chat
              ),
              filteredChats: state.filteredChats.map((chat) =>
                chat.id === id ? { ...chat, ...updatedChat } : chat
              ),
              activeChat:
                state.activeChat?.id === id
                  ? { ...state.activeChat, ...updatedChat }
                  : state.activeChat,
              isLoading: false,
            }));
          } catch (error) {
            console.error("Failed to update direct chat:", error);
            set({ error: "Failed to update direct chat", isLoading: false });
            throw error;
          }
        },

        updateGroupChat: async (id, payload) => {
          set({ isLoading: true });
          try {
            const updatedChat = await chatService.updateGroupChat(id, payload);
            set((state) => ({
              chats: state.chats.map((chat) =>
                chat.id === id ? { ...chat, ...updatedChat } : chat
              ),
              filteredChats: state.filteredChats.map((chat) =>
                chat.id === id ? { ...chat, ...updatedChat } : chat
              ),
              activeChat:
                state.activeChat?.id === id
                  ? { ...state.activeChat, ...updatedChat }
                  : state.activeChat,
              isLoading: false,
            }));
          } catch (error) {
            console.error("Failed to update group chat:", error);
            set({ error: "Failed to update group chat", isLoading: false });
            throw error;
          }
        },

        setLastMessage: (chatId, message) => {
          if (!chatId || !message) {
            console.warn("Chat ID or message is missing");
            return;
          }
          set((state) => {
            const updateChat = (chat: ChatResponse) =>
              chat.id === chatId ? { ...chat, lastMessage: message } : chat;

            return {
              chats: state.chats.map(updateChat),
              filteredChats: state.filteredChats.map(updateChat),
              activeChat:
                state.activeChat?.id === chatId
                  ? { ...state.activeChat, lastMessage: message }
                  : state.activeChat,
            };
          });
        },

        leaveGroupChat: async (chatId) => {
          set({ isLoading: true });
          try {
            const currentUserId = useAuthStore.getState().currentUser?.id;
            if (!currentUserId) {
              throw new Error("User not authenticated");
            }
            await chatMemberService.removeMember(chatId, currentUserId);
            cleanupChat(chatId);
            set({ isLoading: false });
          } catch (error) {
            console.error("Failed to delete chat:", error);
            set({ error: "Failed to delete chat", isLoading: false });
            throw error;
          }
        },

        deleteChat: async (id, type) => {
          set({ isLoading: true });
          try {
            await chatService.deleteChat(id, type);
            cleanupChat(id);
            set({ isLoading: false });
          } catch (error) {
            console.error("Failed to delete chat:", error);
            set({ error: "Failed to delete chat", isLoading: false });
            throw error;
          }
        },

        clearChats: () => {
          set({ chats: [], filteredChats: [], activeChat: null });
        },
      };
    },
    {
      name: "chat-storage",
      partialize: (state) => ({
        activeChat: state.activeChat,
        chats: state.chats,
      }),
    }
  )
);

export const useActiveChat = () =>
  useChatStore(useShallow((state) => state.activeChat));

export const useIsActiveChat = (chatId: string): boolean =>
  useChatStore(
    React.useCallback((state) => state.activeChat?.id === chatId, [chatId])
  );

export const useAllChats = () =>
  useChatStore(useShallow((state) => state.chats));
