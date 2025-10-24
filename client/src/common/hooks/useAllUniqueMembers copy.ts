// import { FriendContactResponse } from "@/shared/types/responses/friend-contact.response";
// import { useCurrentUserId } from "@/stores/authStore";
// import { useChatMemberStore } from "@/stores/chatMemberStore";
// import { useChatStore } from "@/stores/chatStore";

// export const useAllUniqueMembers = (
//   excludeChatId?: string
// ): FriendContactResponse[] | null => {
//   const currentUserId = useCurrentUserId();
//   const chatMembers = useChatMemberStore.getState().chatMembers;
//   const chats = useChatStore.getState().chats;
//   if (!currentUserId) return null;

//   // Get user IDs to exclude (current user + members already in the chat we're adding to)
//   const excludeUserIds = new Set<string>();
//   excludeUserIds.add(currentUserId);

//   if (excludeChatId) {
//     const chat = chats.find((c) => c.id === excludeChatId);
//     if (chat) {
//       chat.otherMemberUserIds?.forEach((id) => excludeUserIds.add(id));
//     }
//   }

//   const uniqueMembers = new Map<string, FriendContactResponse>();

//   Object.entries(chatMembers).forEach(([chatId, members]) => {
//     // Skip the chat we're excluding if specified
//     if (excludeChatId && chatId === excludeChatId) return;

//     members.forEach((member) => {
//       // Skip excluded users and ensure we only keep one member per user ID
//       if (!excludeUserIds.has(member.userId)) {
//         if (!uniqueMembers.has(member.userId)) {
//           uniqueMembers.set(member.userId, {
//             id: member.id,
//             userId: member.userId,
//             firstName: member.firstName,
//             lastName: member.lastName,
//             avatarUrl: member.avatarUrl,
//             username: member.username ?? undefined,
//           });
//         }
//       }
//     });
//   });

//   return Array.from(uniqueMembers.values());
// };
