import { create } from "zustand";
import { chatMemberService } from "@/services/chat/chatMemberService";
import { useActiveChatId, useChatStore } from "./chatStore";
import type { ChatMember } from "@/types/responses/chatMember.response";
import { ChatType } from "@/types/enums/ChatType";
import { useShallow } from "zustand/shallow";
import { FriendshipStatus } from "@/types/enums/friendshipType";
import { useCurrentUserId } from "./authStore";

interface ChatMemberStore {
  chatMembers: Record<string, ChatMember[]>; // chatId -> members
  isLoading: boolean;
  error: string | null;

  fetchChatMembers: (chatId: string, type: ChatType) => Promise<ChatMember[]>;
  getChatMember: (chatId: string, memberId: string) => ChatMember | undefined;
  getChatMemberUserIds: (chatId: string, type: ChatType) => string[];
  getAllChatMemberIds: () => string[];
  getAllUserIdsInChats: () => string[];
  updateMemberLocally: (
    chatId: string,
    memberId: string,
    updates: Partial<ChatMember>
  ) => void;
  updateMember: (
    chatId: string,
    memberId: string,
    updates: Partial<ChatMember>
  ) => Promise<void>;
  updateMemberNickname: (
    chatId: string,
    memberId: string,
    nickname: string
  ) => Promise<string>;
  updateMemberLastRead: (
    chatId: string,
    memberId: string,
    messageId: string
  ) => Promise<void>;
  updateFriendshipStatus: (
    otherUserId: string,
    status: FriendshipStatus | null
  ) => void;
  addGroupMember: (chatId: string, member: ChatMember) => void;
  removeMemberLocally: (chatId: string, userId: string) => void;
}

export const useChatMemberStore = create<ChatMemberStore>((set, get) => ({
  chatMembers: {},
  isLoading: false,
  error: null,

  fetchChatMembers: async (chatId, type) => {
    try {
      set({ isLoading: true });

      let members: ChatMember[] = [];

      if (type === ChatType.DIRECT) {
        members = await chatMemberService.fetchDirectChatMembers(chatId);
      } else {
        members = await chatMemberService.fetchGroupChatMembers(chatId);
      }

      set((state) => ({
        chatMembers: { ...state.chatMembers, [chatId]: members },
        isLoading: false,
      }));
      return members;
    } catch (error) {
      console.error("Failed to fetch chat members:", error);
      set({ error: "Failed to fetch members", isLoading: false });
      return [];
    }
  },

  getChatMember: (chatId, memberId) => {
    const { chatMembers } = get();
    const members = chatMembers[chatId] || [];
    return members.find((member) => member.userId === memberId);
  },

  getChatMemberUserIds: (chatId: string): string[] => {
    const chat = useChatStore.getState().chats.find((c) => c.id === chatId);
    if (!chat) return [];
    return chat.otherMemberUserIds || [];
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

  getAllUserIdsInChats: () => {
    const chats = useChatStore.getState().chats;
    const { chatMembers } = get();
    const allUserIds = new Set<string>();

    chats.forEach((chat) => {
      const members = chatMembers[chat.id] || [];
      members.forEach((member) => {
        allUserIds.add(member.userId);
      });
    });

    return Array.from(allUserIds);
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

  updateMember: async (chatId, memberId, updates) => {
    set({ isLoading: true });
    try {
      const updatedMember = await chatMemberService.updateMember(
        memberId,
        updates
      );

      // Use the local update function instead of direct state manipulation
      get().updateMemberLocally(chatId, memberId, updatedMember);
      set({ isLoading: false });
    } catch (error) {
      console.error("Failed to update chat member:", error);
      set({ error: "Failed to update member", isLoading: false });
      throw error;
    }
  },

  updateMemberNickname: async (chatId, memberId, nickname) => {
    set({ isLoading: true });
    try {
      const updatedNickname = await chatMemberService.updateMemberNickname(
        memberId,
        nickname
      );

      get().updateMemberLocally(chatId, memberId, {
        nickname: updatedNickname,
      });

      return updatedNickname;
    } catch (error) {
      console.error("Failed to update member nickname:", error);
      set({ error: "Failed to update nickname", isLoading: false });
      throw error;
    }
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
    messageId: string
  ) => {
    // Just update directly without comparison
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

  removeMemberLocally: (chatId, userId) => {
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
}));

export const useActiveMembers = (): ChatMember[] | undefined => {
  const activeChatId = useActiveChatId();
  return useChatMemberStore(
    useShallow((state) => (activeChatId ? state.chatMembers[activeChatId] : []))
  );
};
// export const useActiveMembers = (): ChatMember[] | undefined => {
//   const activeChatId = useActiveChatId();
//   return useChatMemberStore((state) =>
//     activeChatId ? state.chatMembers[activeChatId] : []
//   );
// };

export const useMembersByChatId = (
  chatId: string
): ChatMember[] | undefined => {
  return useChatMemberStore(
    useShallow((state) => state.chatMembers[chatId] || [])
  );
};

export const useMyChatMember = (chatId: string): ChatMember | undefined => {
  const myMemberId = useCurrentUserId();
  return useChatMemberStore(
    useShallow((state) => {
      const members = state.chatMembers[chatId];
      return members.find((member) => member.id === myMemberId);
    })
  );
};

export const useDirectChatPartner = (
  chatId: string
): ChatMember | undefined => {
  const myMemberId = useCurrentUserId();
  return useChatMemberStore(
    useShallow((state) => {
      const members = state.chatMembers[chatId];
      if (!members || members.length !== 2) return undefined;

      return members.find((member) => member.id !== myMemberId);
    })
  );
};

export const useGroupOtherMembers = (chatId: string): ChatMember[] => {
  const myMemberId = useCurrentUserId();
  return useChatMemberStore(
    useShallow((state) => {
      const members = state.chatMembers[chatId];
      if (!members) return [];
      return members.filter((member) => member.id !== myMemberId);
    })
  );
};
