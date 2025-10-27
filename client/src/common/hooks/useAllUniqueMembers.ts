import { FriendContactResponse } from "@/shared/types/responses/friend-contact.response";
import { getCurrentUserId } from "@/stores/authStore";
import { useChatMemberStore } from "@/stores/chatMemberStore";
import { useChatStore } from "@/stores/chatStore";

export const useAllUniqueMembers = (
  excludeChatId?: string
): FriendContactResponse[] | null => {
  const currentUserId = getCurrentUserId();
  const chatMembers = useChatMemberStore.getState().chatMembers;
  if (!currentUserId) return null;

  // Get user IDs to exclude (current user + members already in the chat we're adding to)
  const excludeUserIds = new Set<string>();
  excludeUserIds.add(currentUserId);

  if (excludeChatId) {
    const chat = useChatStore.getState().getChatById(excludeChatId);
    if (chat) {
      chat.otherMemberUserIds?.forEach((id) => excludeUserIds.add(id));
    }
  }

  // Collect all unique members from all chats
  const uniqueMembers = new Map<string, FriendContactResponse>();

  Object.entries(chatMembers).forEach(([chatId, members]) => {
    // Skip the chat we're excluding if specified
    if (excludeChatId && chatId === excludeChatId) return;

    members.forEach((member) => {
      // Skip excluded users and ensure we only keep one member per user ID
      if (!excludeUserIds.has(member.userId)) {
        if (!uniqueMembers.has(member.userId)) {
          uniqueMembers.set(member.userId, {
            id: member.id,
            userId: member.userId,
            firstName: member.firstName,
            lastName: member.lastName,
            avatarUrl: member.avatarUrl,
            username: member.username ?? undefined,
          });
        }
      }
    });
  });

  return Array.from(uniqueMembers.values());
};
