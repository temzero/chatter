import { create } from "zustand";
import { useMemo } from "react";
import { chatMemberService } from "@/services/http/chatMemberService";
import { useActiveChatId, useChatStore } from "./chatStore";
import { ChatMemberResponse } from "@/shared/types/responses/chat-member.response";
import { ChatType } from "@/shared/types/enums/chat-type.enum";
import { useShallow } from "zustand/shallow";
import { FriendshipStatus } from "@/shared/types/enums/friendship-type.enum";
import { getCurrentUserId } from "./authStore";
import { PaginationQuery } from "@/shared/types/queries/pagination-query";
import logger from "@/common/utils/logger";

interface ChatMemberState {
  chatMembers: Record<string, ChatMemberResponse[]>; // chatId -> members
  hasMoreMembers: Record<string, boolean>; // chatId -> hasMore
  isLoading: boolean;
  error: string | null;
}

interface ChatMemberActions {
  setInitialData: (
    chatId: string,
    members: ChatMemberResponse[],
    hasMore: boolean
  ) => void;
  fetchChatMembers: (chatId: string, query?: PaginationQuery) => Promise<void>;
  fetchMoreMembers: (chatId: string) => Promise<number>;
  getChatMemberById: (
    memberId: string,
    fetchIfMissing?: boolean
  ) => ChatMemberResponse | undefined | Promise<ChatMemberResponse | undefined>;
  getChatMemberByUserIdAndChatId: (
    chatId: string,
    userId: string
  ) => ChatMemberResponse | undefined;
  getOrFetchChatMemberByUserIdAndChatId: (
    chatId: string,
    userId: string
  ) => ChatMemberResponse | undefined | Promise<ChatMemberResponse | undefined>;
  getChatMemberUserIds: (chatId: string, type: ChatType) => string[];
  getDirectChatOtherMemberId: (
    chatId: string,
    myUserId: string
  ) => string | null;
  getAllChatMemberIds: () => string[];
  getAllUniqueUserIds: () => string[];
  addMemberLocally: (newMember: ChatMemberResponse) => void;
  updateMemberLocally: (
    chatId: string,
    memberId: string,
    updates: Partial<ChatMemberResponse>
  ) => void;
  updateMemberLocallyByUserId: (
    userId: string,
    updates: Partial<ChatMemberResponse>
  ) => void;
  updateMember: (
    chatId: string,
    memberId: string,
    updates: Partial<ChatMemberResponse>
  ) => Promise<void>;
  updateMemberNickname: (
    chatId: string,
    memberId: string,
    nickname: string
  ) => Promise<string>;
  updateMemberLastRead: (
    chatId: string,
    memberId: string,
    messageId: string | null
  ) => Promise<void>;
  updateFriendshipStatus: (
    otherUserId: string,
    status: FriendshipStatus | null
  ) => void;
  addGroupMember: (chatId: string, member: ChatMemberResponse) => void;
  removeChatMember: (chatId: string, userId: string) => void;
  clearChatMember: (chatId: string, userId: string) => void;
  clearChatMembers: (chatId: string) => void;
}

const initialState: ChatMemberState = {
  chatMembers: {},
  hasMoreMembers: {},
  isLoading: false,
  error: null,
};

export const useChatMemberStore = create<ChatMemberState & ChatMemberActions>(
  (set, get) => ({
    ...initialState,

    setInitialData: (chatId, members, hasMore) => {
      set((state) => ({
        chatMembers: {
          ...state.chatMembers,
          [chatId]: members,
        },
        hasMoreMembers: {
          ...state.hasMoreMembers,
          [chatId]: hasMore,
        },
      }));
    },

    fetchChatMembers: async (chatId: string, query?: PaginationQuery) => {
      set({ isLoading: true });
      const { items: members, hasMore } =
        await chatMemberService.fetchChatMembers(chatId, query);

      set((state) => ({
        chatMembers: {
          ...state.chatMembers,
          [chatId]: members,
        },
        hasMoreMembers: {
          ...state.hasMoreMembers,
          [chatId]: hasMore,
        },
        isLoading: false,
      }));
    },

    fetchMoreMembers: async (chatId: string) => {
      set({ isLoading: true });
      const existingMembers = get().chatMembers[chatId] || [];
      if (existingMembers.length === 0) {
        set({ isLoading: false });
        return 0;
      }

      const { items: newMembers, hasMore } =
        await chatMemberService.fetchChatMembers(chatId, {
          lastId: existingMembers[existingMembers.length - 1].id,
        });

      if (newMembers.length > 0) {
        set((state) => {
          const existing = state.chatMembers[chatId] || [];
          return {
            chatMembers: {
              ...state.chatMembers,
              [chatId]: [...existing, ...newMembers],
            },
            hasMoreMembers: {
              ...state.hasMoreMembers,
              [chatId]: hasMore,
            },
            isLoading: false,
          };
        });
      } else {
        // still update hasMoreMembers in case server returned 0 and hasMore = false
        set((state) => ({
          hasMoreMembers: {
            ...state.hasMoreMembers,
            [chatId]: hasMore,
          },
          isLoading: false,
        }));
      }

      return newMembers.length;
    },

    getChatMemberById: async (
      memberId: string,
      fetchIfMissing: boolean = false
    ) => {
      const { chatMembers } = get();
      // Use a more efficient lookup
      const member = Object.values(chatMembers)
        .flat()
        .find((m) => m.id === memberId);

      if (!member && fetchIfMissing) {
        try {
          return await chatMemberService.fetchMemberById(memberId);
        } catch (error) {
          logger.error("Failed to fetch member:", error);
          return undefined;
        }
      }

      return member;
    },

    getChatMemberByUserIdAndChatId: (chatId: string, userId: string) => {
      const { chatMembers } = get(); // get state from store
      const members = chatMembers[chatId] || [];
      return members.find((m) => m.userId === userId);
    },

    getOrFetchChatMemberByUserIdAndChatId: async (
      chatId: string,
      userId: string
    ) => {
      let member = get().getChatMemberByUserIdAndChatId(chatId, userId);

      if (!member) {
        try {
          const fetchedMember =
            await chatMemberService.fetchMemberByChatIdAndUserId(
              chatId,
              userId
            );

          if (fetchedMember) {
            set((state) => ({
              chatMembers: {
                ...state.chatMembers,
                [chatId]: [...(state.chatMembers[chatId] || []), fetchedMember],
              },
            }));
          }

          member = fetchedMember;
        } catch (error) {
          logger.error("Failed to fetch member:", error);
          return undefined;
        }
      }

      return member;
    },

    getChatMemberUserIds: (chatId: string): string[] => {
      const chat = useChatStore.getState().getChatById(chatId);
      if (!chat) return [];
      return chat.otherMemberUserIds || [];
    },

    getDirectChatOtherMemberId: (
      chatId: string,
      myUserId: string
    ): string | null => {
      const members = get().chatMembers[chatId];
      if (!members || members.length !== 2) return null;

      // Find the other member (different userId than mine)
      const otherMember = members.find((m) => m.userId !== myUserId);
      return otherMember ? otherMember.id : null;
    },

    getAllChatMemberIds: () => {
      const { chatMembers } = get();
      const allMemberIds = new Set<string>();

      Object.values(chatMembers).forEach((members) => {
        members.forEach((member) => {
          allMemberIds.add(member.userId);
        });
      });

      return Array.from(allMemberIds);
    },

    getAllUniqueUserIds: () => {
      const { chatMembers } = get();
      const allUserIds = new Set<string>();

      Object.values(chatMembers).forEach((members) => {
        members.forEach((member) => {
          allUserIds.add(member.userId);
        });
      });

      return Array.from(allUserIds);
    },

    addMemberLocally: (newMember) => {
      set((state) => {
        const currentMembers = state.chatMembers[newMember.chatId] || [];
        const memberExists = currentMembers.some((m) => m.id === newMember.id);
        if (memberExists) return state;

        // Update preview members through chat store
        useChatStore.getState().addToGroupPreviewMembers(newMember.chatId, {
          id: newMember.id,
          userId: newMember.userId,
          avatarUrl: newMember.avatarUrl,
          nickname: newMember.nickname,
          firstName: newMember.firstName,
          lastName: newMember.lastName,
        });

        return {
          chatMembers: {
            ...state.chatMembers,
            [newMember.chatId]: [...currentMembers, newMember],
          },
        };
      });
    },

    updateMemberLocally: (chatId, memberId, updates) => {
      set((state) => {
        const currentMembers = state.chatMembers[chatId] || [];
        const memberIndex = currentMembers.findIndex((m) => m.id === memberId);

        if (memberIndex === -1) return state;

        const updatedMembers = [...currentMembers];
        updatedMembers[memberIndex] = {
          ...updatedMembers[memberIndex],
          ...updates,
        };

        return {
          chatMembers: {
            ...state.chatMembers,
            [chatId]: updatedMembers,
          },
        };
      });
    },

    updateMemberLocallyByUserId: (
      userId: string,
      updates: Partial<ChatMemberResponse>
    ) => {
      set((state) => {
        const updatedChatMembers = { ...state.chatMembers };

        Object.entries(updatedChatMembers).forEach(([chatId, members]) => {
          updatedChatMembers[chatId] = members.map((member) => {
            if (member.userId === userId) {
              return { ...member, ...updates };
            }
            return member;
          });
        });

        return { chatMembers: updatedChatMembers };
      });
    },

    updateMember: async (chatId, memberId, updates) => {
      set({ isLoading: true });
      const updatedMember = await chatMemberService.updateMember(
        memberId,
        updates
      );

      // Use the local update function instead of direct state manipulation
      get().updateMemberLocally(chatId, memberId, updatedMember);
      set({ isLoading: false });
    },

    updateMemberNickname: async (chatId, memberId, nickname) => {
      set({ isLoading: true });
      const updatedNickname = await chatMemberService.updateMemberNickname(
        memberId,
        nickname
      );

      get().updateMemberLocally(chatId, memberId, {
        nickname: updatedNickname,
      });

      return updatedNickname;
    },

    updateFriendshipStatus: (otherUserId, status) => {
      set((state) => {
        const updatedChatMembers = { ...state.chatMembers };

        // Update all members matching the userId across all chats
        Object.entries(updatedChatMembers).forEach(([chatId, members]) => {
          updatedChatMembers[chatId] = members.map((member) => {
            if (member.userId === otherUserId) {
              return {
                ...member,
                friendshipStatus: status,
              };
            }
            return member;
          });
        });

        return {
          chatMembers: updatedChatMembers,
        };
      });
    },

    updateMemberLastRead: async (
      chatId: string,
      memberId: string,
      messageId: string | null
    ) => {
      await chatMemberService.updateLastRead(memberId, messageId);

      // Update local chat member data
      get().updateMemberLocally(chatId, memberId, {
        lastReadMessageId: messageId,
      });
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

    removeChatMember: async (chatId, userId) => {
      await chatMemberService.DeleteMember(chatId, userId);
      get().clearChatMember(chatId, userId);
    },

    clearChatMember: (chatId, userId) => {
      set((state) => {
        const currentMembers = state.chatMembers[chatId] || [];
        // Update preview members through chat store
        useChatStore.getState().removeFromGroupPreviewMembers(chatId, userId);
        return {
          chatMembers: {
            ...state.chatMembers,
            [chatId]: currentMembers.filter((m) => m.userId !== userId),
          },
        };
      });
    },

    clearChatMembers: (chatId: string) => {
      set((state) => {
        const newMembers = { ...state.chatMembers };
        const newHasMore = { ...state.hasMoreMembers };
        delete newMembers[chatId];
        delete newHasMore[chatId];
        return {
          chatMembers: newMembers,
          hasMoreMembers: newHasMore,
        };
      });
    },
  })
);

// EXPORT HOOKS

export const useActiveMembers = (): ChatMemberResponse[] | undefined => {
  const activeChatId = useActiveChatId();
  return useChatMemberStore((state) => {
    if (!activeChatId) return undefined;
    return state.chatMembers[activeChatId];
  });
};

export const getActiveMembers = (): ChatMemberResponse[] | undefined => {
  const activeChatId = useChatStore.getState().activeChatId;
  if (!activeChatId) return;
  return useChatMemberStore.getState().chatMembers[activeChatId];
};

export const getMyActiveChatMember = (
  myMemberId: string
): ChatMemberResponse | null => {
  const activeChatId = useChatStore.getState().activeChatId;
  if (!activeChatId) return null;
  const activeMembers =
    useChatMemberStore.getState().chatMembers[activeChatId] || [];
  return activeMembers.find((m) => m.id === myMemberId) || null;
};

export const useOthersActiveChatMembers = (
  myMemberId: string
): ChatMemberResponse[] => {
  const activeChatId = useChatStore((state) => state.activeChatId);

  const activeMembers = useChatMemberStore(
    useShallow((state) =>
      activeChatId ? state.chatMembers[activeChatId] || [] : []
    )
  );

  return activeMembers.filter((m) => m.id !== myMemberId);
};

export const useMembersByChatId = (
  chatId: string
): ChatMemberResponse[] | undefined => {
  return useChatMemberStore(useShallow((state) => state.chatMembers[chatId]));
};

export const useHasMoreMembers = (chatId: string) => {
  return useChatMemberStore((state) => state.hasMoreMembers[chatId] ?? true);
};

export const getDirectChatPartner = (
  chatId: string,
  myMemberId: string
): ChatMemberResponse | undefined => {
  if (!chatId || !myMemberId) return undefined;

  const state = useChatMemberStore.getState();
  const members = state.chatMembers[chatId];

  if (!members || members.length !== 2) return undefined;

  return members.find((member) => member.id !== myMemberId);
};

export const useGroupOtherMembers = (
  chatId: string
): ChatMemberResponse[] | undefined => {
  const myMemberId = getCurrentUserId();
  return useChatMemberStore(
    useShallow((state) => {
      const members = state.chatMembers[chatId];
      if (!members) return undefined;
      return members.filter((member) => member.id !== myMemberId);
    })
  );
};

export const useAllUniqueUserIds = (): string[] => {
  const chatMembers = useChatMemberStore(
    useShallow((state) => state.chatMembers)
  );

  return useMemo(() => {
    const allUserIds = new Set<string>();

    Object.values(chatMembers).forEach((members) => {
      members.forEach((member) => {
        allUserIds.add(member.userId);
      });
    });

    return Array.from(allUserIds);
  }, [chatMembers]);
};

export const useMemberAvatars = (chatId: string, limit: number = 4) => {
  const members = useChatMemberStore.getState().chatMembers[chatId];
  return (
    members
      ?.filter((member) => member.avatarUrl)
      .slice(0, limit)
      .map((member) => member.avatarUrl as string) || []
  );
};

export const useReadStatuses = (chatId: string) => {
  return useChatMemberStore(
    useShallow((state) => {
      const members = state.chatMembers[chatId] || [];
      // Memoize mapped array to avoid creating new objects every time
      return members.map((m) => ({
        id: m.id,
        lastReadMessageId: m.lastReadMessageId,
        avatarUrl: m.avatarUrl,
      }));
    })
  );
};

export const useMessageSender = (
  userId: string,
  chatId: string
): ChatMemberResponse | undefined => {
  const chatMembers = useChatMemberStore((state) => state.chatMembers);

  // Memoize so it doesn't recompute on every render
  return useMemo(() => {
    if (!userId || !chatId) return undefined;

    const members = chatMembers[chatId] || [];
    return members.find((m) => m.userId === userId);
  }, [userId, chatId, chatMembers]);
};
