import { create } from "zustand";
import { persist } from "zustand/middleware";
import { chatService } from "@/services/chat/chatService";
import { useMessageStore } from "./messageStore";
import { useSidebarInfoStore } from "./sidebarInfoStore";
import { chatMemberService } from "@/services/chat/chatMemberService";
import type {
  ChatResponse,
  DirectChatResponse,
  GroupChatResponse,
  ChatMember,
} from "@/types/chat";
import { ChatType } from "@/types/enums/ChatType";
import { useAuthStore } from "./authStore";

interface ChatStore {
  chats: ChatResponse[];
  searchTerm: string;
  activeChat: ChatResponse | null;
  isLoading: boolean;
  error: string | null;
  filteredChats: ChatResponse[];
  allGroupMembers: Record<string, ChatMember[]>;
  activeMembers: ChatMember[];

  initialize: () => Promise<void>;
  getChats: () => Promise<void>;
  getChatById: (chatId: string) => Promise<void>;
  setActiveChat: (chat: ChatResponse | null) => void;
  getGroupMembers: (groupId: string) => Promise<ChatMember[]>;
  setActiveChatById: (chatId: string | null) => Promise<void>;
  createOrGetDirectChat: (partnerId: string) => Promise<DirectChatResponse>;
  createGroupChat: (payload: {
    name: string;
    memberIds: string[];
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
        useMessageStore.setState((msgState) => {
          const filteredMessages = msgState.messages.filter(
            (m) => m.chat.id !== chatId
          );
          const isActive = get().activeChat?.id === chatId;
          return {
            messages: filteredMessages,
            activeMessages: isActive ? [] : msgState.activeMessages,
            activeMedia: isActive ? [] : msgState.activeMedia,
          };
        });

        // Cleanup chat store
        set((state) => ({
          chats: state.chats.filter((chat) => chat.id !== chatId),
          filteredChats: state.filteredChats.filter(
            (chat) => chat.id !== chatId
          ),
          activeChat: state.activeChat?.id === chatId ? null : state.activeChat,
          allGroupMembers: Object.fromEntries(
            Object.entries(state.allGroupMembers).filter(
              ([id]) => id !== chatId
            )
          ),
          activeMembers: state.activeMembers.filter(
            (member) => member.chatId !== chatId
          ),
        }));
      };

      return {
        chats: [],
        allGroupMembers: {},
        filteredChats: [],
        searchTerm: "",
        activeChat: null,
        activeMembers: [],
        isLoading: false,
        error: null,

        initialize: async () => {
          await get().getChats();
        },

        getChats: async () => {
          set({ isLoading: true, error: null });
          try {
            const chats: ChatResponse[] = await chatService.getAllChats();
            set({ chats, filteredChats: chats, isLoading: false });
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
            const chat: ChatResponse = await chatService.getChatById(chatId);
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
          try {
            const members = await chatMemberService.getChatMembers(groupId);
            set((state) => ({
              allGroupMembers: { ...state.allGroupMembers, [groupId]: members },
            }));
            return members;
          } catch (error) {
            console.error("Failed to fetch group members:", error);
            return [];
          }
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
            if (chat.type === ChatType.DIRECT) {
              return (
                chat.chatPartner.firstName
                  .toLowerCase()
                  .includes(lowerCaseTerm) ||
                chat.chatPartner.lastName
                  .toLowerCase()
                  .includes(lowerCaseTerm) ||
                chat.chatPartner.username.toLowerCase().includes(lowerCaseTerm)
              );
            } else {
              return chat.name?.toLowerCase().includes(lowerCaseTerm) ?? false;
            }
          });

          set({
            searchTerm: term,
            filteredChats: filtered,
          });
        },

        setActiveChat: async (chat) => {
          if (!chat) {
            set({ activeChat: null });
            return;
          }

          useSidebarInfoStore.getState().setSidebarInfo("default");
          set({ activeChat: chat });
          window.history.pushState({}, "", `/${chat.id}`);

          if (chat.type !== ChatType.DIRECT) {
            await get().getGroupMembers(chat.id);
            set((state) => ({
              activeMembers: state.allGroupMembers[chat.id] || [],
            }));
          }

          if (chat.unreadCount && chat.unreadCount > 0) {
            set((state) => ({
              chats: state.chats.map((c) =>
                c.id === chat.id ? { ...c, unreadCount: 0 } : c
              ),
            }));
          }
        },

        setActiveChatById: async (chatId) => {
          if (!chatId) {
            get().setActiveChat(null);
            return;
          }

          try {
            const existingChat = get().chats.find((chat) => chat.id === chatId);
            if (existingChat) {
              get().setActiveChat(existingChat);
            } else {
              await get().getChatById(chatId);
              const fetchedChat = get().chats.find(
                (chat) => chat.id === chatId
              );
              if (fetchedChat) get().setActiveChat(fetchedChat);
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
                await get().getChatById(payload.id);
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
              filteredChats: [newChat, ...state.filteredChats],
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

            set((state) => {
              const activeMembers = state.allGroupMembers[chatId] || [];
              const updatedMembers = activeMembers.map((member) =>
                member.userId === userId ? updatedMember : member
              );
              return {
                allGroupMembers: {
                  ...state.allGroupMembers,
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
            const currentUserId = useAuthStore.getState().currentUser?.id;
            const updatedNickname =
              await chatMemberService.updateMemberNickname(
                chatId,
                userId,
                nickname
              );

            set((state) => {
              if (
                state.activeChat?.id === chatId &&
                state.activeChat.type === ChatType.DIRECT
              ) {
                const isCurrentUser = userId === currentUserId;
                const isPartner =
                  userId === state.activeChat.chatPartner.userId;

                let updatedActiveChat = { ...state.activeChat };

                if (isPartner) {
                  updatedActiveChat = {
                    ...updatedActiveChat,
                    chatPartner: {
                      ...updatedActiveChat.chatPartner,
                      nickname: updatedNickname,
                    },
                  };
                } else if (isCurrentUser) {
                  updatedActiveChat = {
                    ...updatedActiveChat,
                    myNickname: updatedNickname,
                  };
                }

                return {
                  activeChat: updatedActiveChat,
                  chats: state.chats.map((chat) =>
                    chat.id === chatId && chat.type === ChatType.DIRECT
                      ? updatedActiveChat
                      : chat
                  ),
                  filteredChats: state.filteredChats.map((chat) =>
                    chat.id === chatId && chat.type === ChatType.DIRECT
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

        leaveGroupChat: async (chatId) => {
          set({ isLoading: true });
          try {
            const currentUserId = useAuthStore.getState().currentUser?.id;
            if (!currentUserId) {
              throw new Error("User not authenticated");
            }
            console.log(
              "Leaving group chat:",
              chatId,
              "for user:",
              currentUserId
            );
            await chatMemberService.removeMember(chatId, currentUserId);
            cleanupChat(chatId);
            set({ isLoading: false });
          } catch (error) {
            console.error("Failed to delete chat:", error);
            set({
              error: "Failed to delete chat",
              isLoading: false,
            });
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
            set({
              error: "Failed to delete chat",
              isLoading: false,
            });
            throw error;
          }
        },

        clearChats: () => {
          set({
            chats: [],
            filteredChats: [],
            activeChat: null,
            allGroupMembers: {},
            activeMembers: [],
          });
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
