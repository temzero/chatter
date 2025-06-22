import { create } from "zustand";
import { chatMemberService } from "@/services/chat/chatMemberService";
import { useActiveChatId, useChatStore } from "./chatStore";
import type { ChatMember } from "@/types/chatMember";
import { ChatType } from "@/types/enums/ChatType";
import { useShallow } from "zustand/shallow";

interface ChatMemberStore {
  chatMembers: Record<string, ChatMember[]>; // chatId -> members
  isLoading: boolean;
  error: string | null;

  fetchChatMembers: (chatId: string, type: ChatType) => Promise<ChatMember[]>;
  getChatMember: (chatId: string, memberId: string) => ChatMember | undefined;
  getChatMemberUserIds: (chatId: string, type: ChatType) => string[];
  getAllChatMemberIds: () => string[];
  getAllUserIdsInChats: () => string[];
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
  updateMemberLastRead: (
    chatId: string,
    memberId: string,
    messageId: string
  ) => Promise<void>;
  getGroupMemberById: (
    chatId: string,
    userId: string
  ) => ChatMember | undefined;
  addGroupMember: (chatId: string, member: ChatMember) => void;
  removeGroupMember: (chatId: string, userId: string) => void;
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

  updateMember: async (chatId, memberId, updates) => {
    set({ isLoading: true });
    try {
      const updatedMember = await chatMemberService.updateMember(
        memberId,
        updates
      );

      set((state) => {
        const currentMembers = state.chatMembers[chatId] || [];
        const updatedMembers = currentMembers.map((member) =>
          member.id === memberId ? updatedMember : member
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

  updateMemberNickname: async (memberId, nickname) => {
    set({ isLoading: true });
    try {
      const updatedNickname = await chatMemberService.updateMemberNickname(
        memberId,
        nickname
      );

      return updatedNickname;
    } catch (error) {
      console.error("Failed to update member nickname:", error);
      set({ error: "Failed to update nickname", isLoading: false });
      throw error;
    }
  },

  // In chatMemberStore.ts
  updateMemberLastRead: async (
    chatId: string,
    memberId: string,
    messageId: string
  ) => {
    set((state) => {
      const members = state.chatMembers[chatId];
      if (!members) return state;

      const memberIndex = members.findIndex((m) => m.id === memberId);
      if (memberIndex === -1) return state;

      const member = members[memberIndex];

      // Only update if the new messageId is more recent
      if (
        member.lastReadMessageId &&
        compareMessageIds(member.lastReadMessageId, messageId) >= 0
      ) {
        return state;
      }

      const updatedMembers = [...members];
      updatedMembers[memberIndex] = {
        ...member,
        lastReadMessageId: messageId,
      };

      return {
        ...state,
        chatMembers: {
          ...state.chatMembers,
          [chatId]: updatedMembers,
        },
      };
    });
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
}));

export const useActiveMembers = (): ChatMember[] | undefined => {
  const activeChatId = useActiveChatId();
  return useChatMemberStore(
    useShallow((state) => (activeChatId ? state.chatMembers[activeChatId] : []))
  );
};

export const useMembersByChatId = (
  chatId: string
): ChatMember[] | undefined => {
  return useChatMemberStore(
    useShallow((state) => state.chatMembers[chatId] || [])
  );
};

export const useDirectChatPartner = (
  chatId: string,
  myMemberId: string
): ChatMember | undefined => {
  return useChatMemberStore(
    useShallow((state) => {
      const members = state.chatMembers[chatId];
      if (!members || members.length !== 2) return undefined;

      return members.find((member) => member.id !== myMemberId);
    })
  );
};

export const useGroupOtherMembers = (
  chatId: string,
  myMemberId: string
): ChatMember[] => {
  return useChatMemberStore(
    useShallow((state) => {
      const members = state.chatMembers[chatId];
      if (!members) return [];
      return members.filter((member) => member.id !== myMemberId);
    })
  );
};

function compareMessageIds(a: string, b: string): number {
  // Implement your message ID comparison logic
  // This depends on how your message IDs are generated
  // For timestamp-based IDs:
  return new Date(a).getTime() - new Date(b).getTime();
  // For sequential IDs:
  // return parseInt(a) - parseInt(b);
}
