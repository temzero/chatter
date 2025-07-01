import { create } from "zustand";
import { persist } from "zustand/middleware";
import { chatService } from "@/services/chat/chatService";
import { useMessageStore } from "./messageStore";
import { chatMemberService } from "@/services/chat/chatMemberService";
import { ChatType } from "@/types/enums/ChatType";
import { useAuthStore } from "./authStore";
import { useShallow } from "zustand/shallow";
import type {
  ChatResponse,
  DirectChatResponse,
  GroupChatResponse,
  ChatMember,
  LastMessageResponse,
} from "@/types/responses/chat.response";
import React from "react";

interface ChatStore {
  chats: ChatResponse[];
  chatMembers: Record<string, ChatMember[]>; // chatId -> members
  searchTerm: string;
  activeChat: ChatResponse | null;
  isLoading: boolean;
  isInitialized: boolean;
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
  fetchChatMembers: (chatId: string) => Promise<ChatMember[]>;
  getChatMemberUserIds: (chatId: string, type: ChatType) => string[];
  getAllChatMemberIds: () => string[];
  getAllUserIdsInChats: () => string[];
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
  getGroupMemberById: (
    chatId: string,
    userId: string
  ) => ChatMember | undefined;
  addGroupMember: (chatId: string, member: ChatMember) => void;
  removeGroupMember: (chatId: string, userId: string) => void;
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
          chatMembers: Object.fromEntries(
            Object.entries(state.chatMembers).filter(([id]) => id !== chatId)
          ),
        }));
      };

      return {
        chats: [],
        chatMembers: {},
        filteredChats: [],
        searchTerm: "",
        activeChat: null,
        isLoading: false,
        isInitialized: false,
        error: null,

        initialize: async () => {
          const { getChats, fetchChatMembers } = get();
          try {
            // Set loading state for entire initialization
            set({ isLoading: true, error: null });
            // 1. Fetch all chats
            await getChats();
            const { chats } = get();
            // 2. Fetch members for all non-direct chats in parallel
            const groupChats = chats.filter(
              (chat) => chat.type !== ChatType.DIRECT
            );
            const memberPromises = groupChats.map((chat) =>
              fetchChatMembers(chat.id).catch((e) => {
                console.error(
                  `Failed to fetch members for chat ${chat.id}:`,
                  e
                );
                return []; // Return empty array on failure to continue with other chats
              })
            );

            await Promise.all(memberPromises);

            // Log results for debugging
            const { chatMembers } = get();
            console.log("Initialization complete:", {
              chatCount: chats.length,
              memberCount: Object.keys(chatMembers).length,
            });
          } catch (error) {
            console.error("Initialization failed:", error);
            set({ error: "Failed to initialize chat data" });
            throw error; // Re-throw to allow components to handle the error
          } finally {
            set({ isLoading: false, isInitialized: true });
          }
        },

        getChats: async () => {
          set({ isLoading: true, error: null });
          try {
            const chats: ChatResponse[] = await chatService.fetchAllChats();
            set({ chats, filteredChats: chats, isLoading: false });
          } catch (error) {
            console.error("Failed to fetch chats:", error);
            set({
              error: "Failed to load chats",
              isLoading: false,
            });
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
            set({
              error: "Failed to load chat",
              isLoading: false,
            });
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

        fetchChatMembers: async (chatId) => {
          try {
            const members = await chatMemberService.fetchChatMembers(chatId);
            // console.log("Fetched members:", members);
            set((state) => ({
              chatMembers: { ...state.chatMembers, [chatId]: members },
            }));
            return members;
          } catch (error) {
            console.error("Failed to fetch group members:", error);
            return [];
          }
        },

        getChatMemberUserIds: (chatId: string, type: ChatType): string[] => {
          if (type === ChatType.DIRECT) {
            const chat = get().chats.find(
              (c) => c.id === chatId
            ) as DirectChatResponse;
            if (!chat || !chat.chatPartner) return [];
            return [chat.chatPartner.userId];
          }

          const members = get().chatMembers[chatId];
          if (!members) return [];
          return members.map((member) => member.userId);
        },

        getAllChatMemberIds: () => {
          const { chatMembers } = get();
          const allMemberIds = new Set<string>();

          // Iterate through all chat members in all chats
          Object.values(chatMembers).forEach((members) => {
            members.forEach((member) => {
              allMemberIds.add(member.userId);
            });
          });

          return Array.from(allMemberIds);
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

          set({
            searchTerm: term,
            filteredChats: filtered,
          });
        },

        getAllUserIdsInChats: (): string[] => {
          const { chats, chatMembers } = get();
          const allUserIds = new Set<string>();

          // Process all chats
          chats.forEach((chat) => {
            if (chat.type === ChatType.DIRECT) {
              // Add direct chat partner
              allUserIds.add(chat.chatPartner.userId);
            } else {
              // Add all group chat members
              const members = chatMembers[chat.id] || [];
              members.forEach((member) => {
                allUserIds.add(member.userId);
              });
            }
          });

          return Array.from(allUserIds);
        },

        setActiveChat: async (chat) => {
          // Return early for null chat
          if (!chat) {
            set({ activeChat: null, isLoading: false });
            return Promise.resolve();
          }

          const { messages } = useMessageStore.getState();
          const { chatMembers, fetchChatMembers } = get();

          const alreadyFetchedMessages = !!messages[chat.id];
          const alreadyFetchedMembers =
            chat.type === ChatType.DIRECT || !!chatMembers[chat.id];

          set({ isLoading: true });
          set({ activeChat: chat });
          window.history.pushState({}, "", `/${chat.id}`);

          try {
            const fetchMessagesPromise = alreadyFetchedMessages
              ? null
              : useMessageStore.getState().fetchMessages(chat.id);

            const fetchMembersPromise = alreadyFetchedMembers
              ? null
              : fetchChatMembers(chat.id);

            // Await only non-null promises
            await Promise.all(
              [fetchMessagesPromise, fetchMembersPromise].filter(Boolean)
            );

            // Reset unreadCount if necessary
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
          // console.log("setActiveChat By ID");
          if (!chatId) {
            await get().setActiveChat(null);
            return;
          }

          try {
            const existingChat = get().chats.find((chat) => chat.id === chatId);
            if (existingChat) {
              // console.log("Existing chat");
              await get().setActiveChat(existingChat);
            } else {
              // console.log("No Existing chat");

              await get().fetchChatById(chatId);
              const fetchedChat = get().chats.find(
                (chat) => chat.id === chatId
              );
              if (fetchedChat) await get().setActiveChat(fetchedChat);
            }
            // console.log("setActiveChat ByID Finished");
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
              const currentMembers = state.chatMembers[chatId] || [];
              const updatedMembers = currentMembers.map((member) =>
                member.userId === userId ? updatedMember : member
              );
              return {
                chatMembers: {
                  ...state.chatMembers,
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

        getGroupMemberById: (chatId, userId) => {
          const members = get().chatMembers[chatId];
          return members?.find((member) => member.userId === userId);
        },

        addGroupMember: (chatId, member) => {
          set((state) => {
            const currentMembers = state.chatMembers[chatId] || [];
            return {
              chatMembers: {
                ...state.chatMembers,
                [chatId]: [...currentMembers, member],
              },
            };
          });
        },

        removeGroupMember: (chatId, userId) => {
          set((state) => {
            const currentMembers = state.chatMembers[chatId] || [];
            return {
              chatMembers: {
                ...state.chatMembers,
                [chatId]: currentMembers.filter((m) => m.userId !== userId),
              },
            };
          });
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
            chatMembers: {},
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

export const useActiveChat = () =>
  useChatStore(useShallow((state) => state.activeChat));

export const useIsActiveChat = (chatId: string): boolean =>
  useChatStore(
    React.useCallback((state) => state.activeChat?.id === chatId, [chatId])
  );

export const useAllChats = () =>
  useChatStore(useShallow((state) => state.chats));

// New selector to get active members
export const useActiveMembers = () => {
  const activeChat = useChatStore((state) => state.activeChat);
  const chatMembers = useChatStore((state) => state.chatMembers);
  return activeChat ? chatMembers[activeChat.id] || [] : [];
};

export const useMembersByChatId = (chatId: string) => {
  const chatMembers = useChatStore((state) => state.chatMembers);
  return chatMembers[chatId] || [];
};

export const useIsChatLoading = () => useChatStore((state) => state.isLoading);
