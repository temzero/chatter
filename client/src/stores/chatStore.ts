import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useShallow } from "zustand/shallow";
import { chatService } from "@/services/chat/chatService";
import { chatMemberService } from "@/services/chat/chatMemberService";
import { useMessageStore } from "./messageStore";
import { useAuthStore } from "./authStore";
import { useChatMemberStore } from "./chatMemberStore";
import { ChatType } from "@/types/enums/ChatType";
import type {
  ChatMemberPreview,
  ChatResponse,
} from "@/types/responses/chat.response";
import type {
  LastMessageResponse,
  MessageResponse,
} from "@/types/responses/message.response";
import { toast } from "react-toastify";
import { useModalStore } from "./modalStore";
import { useSidebarInfoStore } from "./sidebarInfoStore";
import { handleError } from "@/utils/handleError";

interface ChatStore {
  chats: ChatResponse[];
  savedChat: ChatResponse | null;
  activeChat: ChatResponse | null;
  filteredChats: ChatResponse[];
  searchTerm: string;
  hasMoreChats: boolean;
  isLoading: boolean;
  error: string | null;

  initialize: () => Promise<void>;
  getChatById: (id?: string) => ChatResponse | undefined;
  getChatType: (chatId: string) => ChatType | undefined;
  fetchChats: () => Promise<void>;
  fetchMoreChats: (limit?: number) => Promise<number>;
  fetchChatById: (
    chatId?: string,
    options?: { fetchFullData?: boolean }
  ) => Promise<ChatResponse>;
  getDirectChatByUserId: (userId: string) => Promise<ChatResponse | void>;
  setActiveChat: (chat: ChatResponse | null) => Promise<void>;
  setActiveChatById: (chatId: string | null) => Promise<void>;
  getAllUserIdsInChats: () => string[];
  createOrGetDirectChat: (partnerId: string) => Promise<ChatResponse>;
  createGroupChat: (payload: {
    name: string;
    userIds: string[];
    type: ChatType.GROUP | ChatType.CHANNEL;
  }) => Promise<ChatResponse>;
  updateDirectChat: (
    id: string,
    payload: Partial<ChatResponse>
  ) => Promise<void>;
  updateGroupChatLocally: (id: string, payload: Partial<ChatResponse>) => void;
  updateGroupChat: (
    id: string,
    payload: Partial<ChatResponse>
  ) => Promise<void>;
  addMembersToChat: (chatId: string, userIds: string[]) => Promise<void>;
  setMute: (chatId: string, memberId: string, mutedUntil: Date | null) => void;
  setLastMessage: (chatId: string, message: LastMessageResponse | null) => void;
  setUnreadCount: (chatId: string, incrementBy: number) => void;
  setPinnedMessage: (chatId: string, message: MessageResponse | null) => void;
  generateInviteLink: (chatId: string) => Promise<string>;
  refreshInviteLink: (chatId: string, token: string) => Promise<string>;
  setSearchTerm: (term: string) => void;
  leaveChat: (chatId: string) => Promise<void>;
  deleteChat: (id: string, type: ChatType) => Promise<void>;
  cleanupChat: (chatId: string) => void;
  clearChats: () => void;

  addToGroupPreviewMembers: (chatId: string, member: ChatMemberPreview) => void;
  removeFromGroupPreviewMembers: (chatId: string, userId: string) => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => {
      // Helper function to update chat state consistently
      const updateChatState = (
        state: ChatStore,
        chatId: string,
        updateFn: (chat: ChatResponse) => ChatResponse
      ) => ({
        chats: state.chats.map((chat) =>
          chat.id === chatId ? updateFn(chat) : chat
        ),
        filteredChats: state.filteredChats.map((chat) =>
          chat.id === chatId ? updateFn(chat) : chat
        ),
        activeChat:
          state.activeChat?.id === chatId
            ? updateFn(state.activeChat)
            : state.activeChat,
      });

      return {
        chats: [],
        savedChat: null,
        filteredChats: [],
        searchTerm: "",
        activeChat: null,
        hasMoreChats: true,
        isLoading: false,
        error: null,

        // initialize: async () => {
        //   try {
        //     set({ isLoading: true, error: null });
        //     await get().fetchChats();
        //   } catch (error) {
        //     console.error("Initialization failed:", error);
        //     set({ error: "Failed to initialize chat data" });
        //     throw error;
        //   } finally {
        //     set({ isLoading: false });
        //   }
        // },

        initialize: async () => {
          try {
            set({ isLoading: true, error: null });

            // Fetch initial data (chats + messages)
            const initialData = await chatService.fetchInitialData();
            if (!initialData) {
              await get().fetchChats(); // Fallback to regular fetch if initial fails
              return;
            }

            // Process chats (without messages)
            const chats = initialData.chats.map((chat) => {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { messages, hasMoreMessages, ...chatData } = chat;
              return chatData;
            });

            const savedChat =
              chats.find((chat) => chat.type === ChatType.SAVED) || null;
            const otherChats = chats.filter(
              (chat) => chat.type !== ChatType.SAVED
            );

            // Update chat store
            set({
              savedChat,
              chats: otherChats,
              filteredChats: otherChats,
              hasMoreChats: initialData.hasMoreChats,
            });

            // Process messages for each chat
            initialData.chats.forEach((chat) => {
              if (chat.messages?.length) {
                useMessageStore
                  .getState()
                  .setChatMessages(chat.id, chat.messages);
                useMessageStore.setState((state) => ({
                  hasMoreMessages: {
                    ...state.hasMoreMessages,
                    [chat.id]: chat.hasMoreMessages,
                  },
                }));
              }
            });
          } catch (error) {
            console.error("Initialization failed:", error);
            set({ error: "Failed to initialize chat data" });
            throw error;
          } finally {
            set({ isLoading: false });
          }
        },

        getChatById: (chatId?: string) => {
          if (!chatId) return undefined;
          const chat = get().chats.find((c) => c.id === chatId);
          return chat;
        },

        getChatType: (chatId) => {
          const chat = get().getChatById(chatId);
          return chat?.type;
        },

        fetchChats: async () => {
          set({ isLoading: true, error: null });
          try {
            const { chats, hasMore } = await chatService.fetchChats();

            const savedChat =
              chats.find((chat) => chat.type === ChatType.SAVED) || null;
            const otherChats = chats.filter(
              (chat) => chat.type !== ChatType.SAVED
            );

            set({
              savedChat,
              chats: otherChats,
              filteredChats: otherChats,
              hasMoreChats: hasMore,
            });
            // console.log("Chats fetched:", otherChats);
            // console.log("Saved chat:", savedChat);
          } catch (error) {
            console.error("Failed to fetch chats:", error);
            set({ error: "Failed to load chats" });
            handleError(error, "Failed to load chats");
          } finally {
            set({ isLoading: false });
          }
        },

        fetchMoreChats: async (limit = 5): Promise<number> => {
          const { chats, hasMoreChats, isLoading } = get();
          if (isLoading || !hasMoreChats) return 0; // return 0 if no load

          const lastChat = get().chats[get().chats.length - 1];
          if (!lastChat?.id) return 0;

          set({ isLoading: true });
          try {
            const { chats: newChats, hasMore } = await chatService.fetchChats({
              offset: chats.length,
              limit,
              beforeId: lastChat.id,
            });

            if (newChats.length > 0) {
              const filteredNewChats = newChats.filter(
                (chat) => chat.type !== ChatType.SAVED
              );

              set({
                chats: [...chats, ...filteredNewChats],
                filteredChats: [...chats, ...filteredNewChats],
                hasMoreChats: hasMore,
              });

              return filteredNewChats.length; // <-- Return number of chats loaded
            } else {
              set({ hasMoreChats: hasMore });
              return 0; // no chats loaded
            }
          } catch (error) {
            handleError(error, "Failed to load more chats");
            return 0;
          } finally {
            set({ isLoading: false });
          }
        },

        fetchChatById: async (chatId, options = { fetchFullData: false }) => {
          const targetChatId = chatId || get().activeChat?.id;
          if (!targetChatId) {
            throw new Error("No chat ID provided and no active chat");
          }

          set({ isLoading: true });
          try {
            const chat = await chatService.fetchChatById(targetChatId);

            // Update chat in state
            set((state) => ({
              chats: state.chats.some((c) => c.id === targetChatId)
                ? state.chats.map((c) => (c.id === targetChatId ? chat : c))
                : [chat, ...state.chats],
              activeChat:
                state.activeChat?.id === targetChatId ? chat : state.activeChat,
            }));

            // Optionally fetch full data
            if (options.fetchFullData) {
              await Promise.all([
                useChatMemberStore
                  .getState()
                  .fetchChatMembers(targetChatId, chat.type),
                useMessageStore.getState().fetchMessages(targetChatId),
              ]);
            }

            return chat;
          } catch (error) {
            set({ activeChat: null });
            handleError(error, "Failed to fetch chat");
            window.history.pushState({}, "", "/");
            throw error;
          } finally {
            set({ isLoading: false });
          }
        },

        getDirectChatByUserId: async (userId) => {
          const existingChat = get().chats.find(
            (chat) =>
              chat.type === ChatType.DIRECT &&
              chat.otherMemberUserIds?.includes(userId)
          );
          if (existingChat) {
            await get().fetchChatById(existingChat.id);
            return existingChat;
          }
          return;
        },

        setSearchTerm: (term) => {
          const { chats } = get();
          const trimmed = term.trim().toLowerCase();

          if (!trimmed) {
            set({ searchTerm: term, filteredChats: chats });
            return;
          }

          const filtered = chats.filter((chat) => {
            return chat.name?.toLowerCase().includes(trimmed);
          });

          set({ searchTerm: term, filteredChats: filtered });
        },

        setActiveChat: async (chat) => {
          useSidebarInfoStore.getState().setSidebarInfo();
          useMessageStore.getState().setDisplaySearchMessage(false);
          if (!chat) {
            set({ activeChat: null, isLoading: false });
            useModalStore.getState().setReplyToMessageId(null);
            return;
          }

          const { messages } = useMessageStore.getState();
          const { chatMembers } = useChatMemberStore.getState();
          const alreadyFetchedMessages = !!messages[chat.id];
          const alreadyFetchedMembers = !!chatMembers[chat.id];

          set({ activeChat: chat, isLoading: true });
          window.history.pushState({}, "", `/${chat.id}`);
          useModalStore.getState().setReplyToMessageId(null);

          try {
            const fetchMessagesPromise = alreadyFetchedMessages
              ? null
              : useMessageStore.getState().fetchMessages(chat.id);

            const fetchMembersPromise = alreadyFetchedMembers
              ? null
              : useChatMemberStore
                  .getState()
                  .fetchChatMembers(chat.id, chat.type);

            await Promise.all(
              [fetchMessagesPromise, fetchMembersPromise].filter(Boolean)
            );

            set((state) =>
              updateChatState(state, chat.id, (c) => ({
                ...c,
                unreadCount: 0,
              }))
            );
          } catch (error) {
            handleError(error, "Failed to set active chat");
          } finally {
            set({ isLoading: false });
          }
        },

        setActiveChatById: async (chatId) => {
          if (!chatId) {
            await get().setActiveChat(null);
            return;
          }

          const existingChat = get().chats.find((chat) => chat.id === chatId);
          if (existingChat) {
            await get().setActiveChat(existingChat);
          } else {
            await get().fetchChatById(chatId);
            const fetchedChat = get().chats.find((chat) => chat.id === chatId);
            if (fetchedChat) await get().setActiveChat(fetchedChat);
          }
        },

        getAllUserIdsInChats: () => {
          const chats = get().chats;
          const allUserIds = new Set<string>();

          chats.forEach((chat) => {
            chat.otherMemberUserIds?.forEach((userId) =>
              allUserIds.add(userId)
            );
          });

          return Array.from(allUserIds);
        },

        createOrGetDirectChat: async (partnerId) => {
          set({ isLoading: true });
          try {
            const { payload, wasExisting } =
              await chatService.createOrGetDirectChat(partnerId);

            if (!wasExisting) {
              set((state) => ({
                chats: [payload, ...state.chats],
                filteredChats: [payload, ...state.filteredChats],
              }));
            }

            await get().setActiveChat(payload);
            return payload;
          } catch (error) {
            set({ error: "Failed to create chat" });
            handleError(error, "Failed to create/get direct chat:");
            throw error;
          } finally {
            set({ isLoading: false });
          }
        },

        createGroupChat: async (payload) => {
          set({ isLoading: true });
          try {
            const newChat = await chatService.createGroupChat(payload);
            set((state) => ({
              chats: [newChat, ...state.chats],
              filteredChats: [newChat, ...state.filteredChats],
            }));
            return newChat;
          } catch (error) {
            console.error("Failed to create group chat:", error);
            set({ error: "Failed to create chat" });
            handleError(error, "Failed to create group chat");
            throw error;
          } finally {
            set({ isLoading: false });
          }
        },

        updateDirectChat: async (id, payload) => {
          set({ isLoading: true });
          try {
            const updatedChat = await chatService.updateDirectChat(id, payload);
            set((state) =>
              updateChatState(state, id, (chat) => ({
                ...chat,
                ...updatedChat,
              }))
            );
          } catch (error) {
            set({ error: "Failed to update direct chat" });
            handleError(error, "Failed to update chat");
            throw error;
          } finally {
            set({ isLoading: false });
          }
        },

        updateGroupChatLocally: (id, payload) => {
          set((state) =>
            updateChatState(state, id, (chat) => ({
              ...chat,
              ...payload,
            }))
          );
        },

        updateGroupChat: async (id, payload) => {
          set({ isLoading: true });
          try {
            const updatedChat = await chatService.updateGroupChat(id, payload);
            get().updateGroupChatLocally(id, updatedChat);
          } catch (error) {
            set({ error: "Failed to update group chat" });
            handleError(error, "Failed to update group chat");
            throw error;
          } finally {
            set({ isLoading: false });
          }
        },

        addMembersToChat: async (chatId, userIds) => {
          set({ isLoading: true });
          try {
            await chatMemberService.addMembers(chatId, userIds);
          } catch (error) {
            handleError(error, "Error adding user to chat");
          } finally {
            set({ isLoading: false });
          }
        },

        setMute: async (
          chatId: string,
          memberId: string,
          mutedUntil: Date | null
        ) => {
          try {
            const updatedMuteUntil = await chatMemberService.setMute(
              memberId,
              mutedUntil
            );

            set((state) =>
              updateChatState(state, chatId, (chat) => ({
                ...chat,
                mutedUntil: updatedMuteUntil,
              }))
            );
          } catch (error) {
            handleError(error, "Failed to set mute");
            throw error;
          }
        },

        setLastMessage: (chatId, message) => {
          if (!chatId || !message) return;
          set((state) =>
            updateChatState(state, chatId, (chat) => ({
              ...chat,
              lastMessage: message,
            }))
          );
        },

        setUnreadCount: (chatId: string, incrementBy: number) => {
          const isActiveChat = get().activeChat?.id === chatId;
          // console.log("isActiveChat", isActiveChat);
          if (isActiveChat) return;
          set((state) =>
            updateChatState(state, chatId, (chat) => ({
              ...chat,
              unreadCount: (chat.unreadCount || 0) + incrementBy,
            }))
          );
        },

        setPinnedMessage: (chatId: string, message: MessageResponse | null) => {
          // console.log("setPinnedMessage: ", chatId, message);
          set((state) =>
            updateChatState(state, chatId, (chat) => ({
              ...chat,
              pinnedMessage: message,
            }))
          );
        },

        generateInviteLink: async (chatId: string) => {
          try {
            const newInviteLink = await chatService.generateInviteLink(chatId);
            set((state) =>
              updateChatState(state, chatId, (chat) => ({
                ...chat,
                inviteLinks: [newInviteLink],
              }))
            );

            return newInviteLink;
          } catch (error) {
            handleError(error, "Failed to generate invite link");
            throw error;
          }
        },

        refreshInviteLink: async (chatId: string, token: string) => {
          try {
            const newInviteLink = await chatService.refreshInviteLink(token);
            set((state) =>
              updateChatState(state, chatId, (chat) => ({
                ...chat,
                inviteLinks: [newInviteLink],
              }))
            );

            return newInviteLink;
          } catch (error) {
            handleError(error, "Failed to refresh invite link");
            throw error;
          }
        },

        addToGroupPreviewMembers: (
          chatId: string,
          member: ChatMemberPreview
        ) => {
          const chat = get().chats.find((c) => c.id === chatId);
          if (!chat || chat.type === ChatType.DIRECT || chat.avatarUrl) return;

          const currentPreviews = chat.previewMembers || [];
          const currentMemberIds = chat.otherMemberUserIds || [];

          const exists = currentPreviews.some(
            (m) => m.userId === member.userId
          );

          if (!exists) {
            const updatedPreviews = [...currentPreviews, member].slice(0, 4);
            const updatedMemberIds = [...currentMemberIds, member.userId];

            get().updateGroupChatLocally(chatId, {
              previewMembers: updatedPreviews,
              otherMemberUserIds: updatedMemberIds,
            });
          }
        },

        removeFromGroupPreviewMembers: (chatId: string, userId: string) => {
          const chat = get().chats.find((c) => c.id === chatId);
          if (!chat || chat.type === ChatType.DIRECT || chat.avatarUrl) return;

          const updatedPreviews = (chat.previewMembers || []).filter(
            (m) => m.userId !== userId
          );

          const updatedMemberIds = (chat.otherMemberUserIds || []).filter(
            (id) => id !== userId
          );

          get().updateGroupChatLocally(chatId, {
            previewMembers: updatedPreviews,
            otherMemberUserIds: updatedMemberIds,
          });
        },

        leaveChat: async (chatId) => {
          set({ isLoading: true });
          try {
            const currentUserId = useAuthStore.getState().currentUser?.id;
            if (!currentUserId) throw new Error("User not authenticated");
            const { chatDeleted } = await chatMemberService.DeleteMember(
              chatId,
              currentUserId
            );
            get().cleanupChat(chatId);
            window.history.pushState({}, "", "/");

            if (chatDeleted) {
              toast.info("This chat was deleted because no members remained.");
            } else {
              toast.success("You left the chat.");
            }
          } catch (error) {
            console.error("Failed to leave chat:", error);
            set({ error: "Failed to leave chat" });
            handleError(error, "Failed to leave chat");
            throw error;
          } finally {
            set({ isLoading: false });
          }
        },

        deleteChat: async (id) => {
          set({ isLoading: true });
          try {
            await chatService.deleteChat(id);
            get().cleanupChat(id);
            window.history.pushState({}, "", "/");
            toast.success("Chat deleted");
          } catch (error) {
            set({ error: "Failed to delete chat" });
            handleError(error, "Failed to delete chat");
            throw error;
          } finally {
            set({ isLoading: false });
          }
        },

        clearChats: () => {
          set({ chats: [], filteredChats: [], activeChat: null });
        },

        cleanupChat: (chatId: string) => {
          useMessageStore.getState().clearChatMessages(chatId);
          useChatMemberStore.getState().clearChatMembers(chatId);
          set((state) => ({
            chats: state.chats.filter((chat) => chat.id !== chatId),
            filteredChats: state.filteredChats.filter(
              (chat) => chat.id !== chatId
            ),
            activeChat:
              state.activeChat?.id === chatId ? null : state.activeChat,
          }));
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
  useChatStore(useShallow((s) => s.activeChat));
export const useActiveChatId = () =>
  useChatStore(useShallow((s) => s.activeChat?.id));
export const useIsActiveChat = (chatId: string) =>
  useChatStore((state) => state.activeChat?.id === chatId);
export const useAllChats = () => useChatStore(useShallow((s) => s.chats));

// Saved chat
export const useSavedChat = () => useChatStore(useShallow((s) => s.savedChat));

export const useSetActiveSavedChat = () => {
  const getState = useChatStore;

  return async () => {
    const state = getState.getState();
    let savedChat = state.savedChat;

    if (!savedChat) {
      toast.warning("Saved chat not found, fetching from server...");
      try {
        const fetchedSavedChat = await chatService.fetchSavedChat();

        if (!fetchedSavedChat) {
          toast.error("Saved chat does not exist in the database!");
          return;
        }
        useChatStore.setState({ savedChat: fetchedSavedChat });
        savedChat = fetchedSavedChat;
      } catch (error) {
        toast.error("Error while fetching saved chat!");
        console.error("Failed to fetch saved chat:", error);
        return;
      }
    }

    await state.setActiveChat(savedChat);
  };
};
