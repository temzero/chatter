import { create } from "zustand";
import { chatMemberService } from "@/services/chat/chatMemberService";
import { useAuthStore } from "./authStore";
import type { ChatMember } from "@/types/chat";
import { ChatType } from "@/types/enums/ChatType";
import { useChatStore } from "./chatStore";

interface ChatMemberStore {
  chatMembers: Record<string, ChatMember[]>; // chatId -> members
  isLoading: boolean;
  error: string | null;

  fetchChatMembers: (chatId: string) => Promise<ChatMember[]>;
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
  updateMemberLastRead: (memberId: string) => Promise<void>;
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

  fetchChatMembers: async (chatId) => {
    try {
      set({ isLoading: true });
      const members = await chatMemberService.fetchChatMembers(chatId);
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

  getChatMemberUserIds: (chatId: string, type: ChatType): string[] => {
    const chat = useChatStore.getState().chats.find((c) => c.id === chatId);
    if (!chat) return [];

    if (type === ChatType.DIRECT) {
      if (!chat || chat.type !== ChatType.DIRECT) return [];
      return [chat.chatPartner.userId];
    }

    if (chat.type === ChatType.GROUP || chat.type === ChatType.CHANNEL) {
      return chat.memberUserIds || [];
    }

    return [];
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

  getAllUserIdsInChats: (): string[] => {
    const chats = useChatStore.getState().chats;
    const { chatMembers } = get();
    const allUserIds = new Set<string>();

    chats.forEach((chat) => {
      if (chat.type === ChatType.DIRECT) {
        allUserIds.add(chat.chatPartner.userId);
      } else {
        const members = chatMembers[chat.id] || [];
        members.forEach((member) => {
          allUserIds.add(member.userId);
        });
      }
    });

    return Array.from(allUserIds);
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
      const updatedNickname = await chatMemberService.updateMemberNickname(
        chatId,
        userId,
        nickname
      );

      set(() => {
        const activeChat = useChatStore.getState().activeChat;
        if (activeChat?.id === chatId && activeChat.type === ChatType.DIRECT) {
          const isCurrentUser = userId === currentUserId;
          const isPartner = userId === activeChat.chatPartner.userId;

          let updatedActiveChat = { ...activeChat };

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

          useChatStore.setState({
            activeChat: updatedActiveChat,
            chats: useChatStore
              .getState()
              .chats.map((chat) =>
                chat.id === chatId && chat.type === ChatType.DIRECT
                  ? updatedActiveChat
                  : chat
              ),
            filteredChats: useChatStore
              .getState()
              .filteredChats.map((chat) =>
                chat.id === chatId && chat.type === ChatType.DIRECT
                  ? updatedActiveChat
                  : chat
              ),
          });
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

  updateMemberLastRead: async (chatMemberId: string) => {
    chatMemberService.updateLastRead(chatMemberId);
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

// Selectors remain the same
export const useActiveMembers = () => {
  const activeChat = useChatStore((state) => state.activeChat);
  const chatMembers = useChatMemberStore((state) => state.chatMembers);
  return activeChat ? chatMembers[activeChat.id] || [] : [];
};

export const useMembersByChatId = (chatId: string) => {
  const chatMembers = useChatMemberStore((state) => state.chatMembers);
  return chatMembers[chatId] || [];
};

export const useUpdateMyLastRead = (memberId: string) => {
  return useChatMemberStore((state) => state.updateMemberLastRead(memberId));
};
