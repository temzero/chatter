// import { create } from "zustand";
// import { chatMemberService } from "@/services/http/chatMemberService";
// import { useActiveChatId, useChatStore } from "./chatStore";
// import type {
//   ChatMember,
//   GroupChatMember,
// } from "@/shared/types/responses/chat-member.response";
// import { ChatType } from "@/shared/types/enums/chat-type.enum";
// import { useShallow } from "zustand/shallow";
// import { FriendshipStatus } from "@/shared/types/enums/friendship-type.enum";
// import { useAuthStore, useCurrentUserId } from "./authStore";
// import { handleError } from "@/common/utils/handleError";
// import { useMemo } from "react";

// interface ChatMemberState {
//   chatMembers: Record<string, ChatMember[]>; // chatId -> members
//   isLoading: boolean;
//   error: string | null;
// }

// interface ChatMemberActions {
//   fetchChatMembers: (chatId: string) => Promise<ChatMember[]>;
//   getChatMemberById: (
//     memberId: string,
//     fetchIfMissing?: boolean
//   ) => ChatMember | undefined | Promise<ChatMember | undefined>;
//   getChatMemberByUserIdAndChatId: (
//     chatId: string,
//     userId: string,
//     fetchIfMissing?: boolean
//   ) => ChatMember | undefined | Promise<ChatMember | undefined>;
//   getChatMemberUserIds: (chatId: string, type: ChatType) => string[];
//   getDirectChatOtherMemberId: (
//     chatId: string,
//     myUserId: string
//   ) => string | null;
//   getAllChatMemberIds: () => string[];
//   getAllUniqueUserIds: () => string[];
//   addMemberLocally: (newMember: GroupChatMember) => void;
//   updateMemberLocally: (
//     chatId: string,
//     memberId: string,
//     updates: Partial<ChatMember>
//   ) => void;
//   updateMember: (
//     chatId: string,
//     memberId: string,
//     updates: Partial<ChatMember>
//   ) => Promise<void>;
//   updateMemberNickname: (
//     chatId: string,
//     memberId: string,
//     nickname: string
//   ) => Promise<string>;
//   updateMemberLastRead: (
//     chatId: string,
//     memberId: string,
//     messageId: string | null
//   ) => Promise<void>;
//   updateFriendshipStatus: (
//     otherUserId: string,
//     status: FriendshipStatus | null
//   ) => void;
//   addGroupMember: (chatId: string, member: ChatMember) => void;
//   removeChatMember: (chatId: string, userId: string) => void;
//   clearChatMember: (chatId: string, userId: string) => void;
//   clearChatMembers: (chatId: string) => void;
// }

// const initialState: ChatMemberState = {
//   chatMembers: {},
//   isLoading: false,
//   error: null,
// };

// export const useChatMemberStore = create<ChatMemberState & ChatMemberActions>(
//   (set, get) => ({
//     ...initialState,

//     fetchChatMembers: async (chatId) => {
//       try {
//         set({ isLoading: true });

//         let members: ChatMember[] = [];

//         members = await chatMemberService.fetchChatMembers(chatId);

//         set((state) => ({
//           chatMembers: { ...state.chatMembers, [chatId]: members },
//           isLoading: false,
//         }));
//         return members;
//       } catch (error) {
//         console.error("Failed to fetch chat members:", error);
//         set({ error: "Failed to fetch members", isLoading: false });
//         return [];
//       }
//     },

//     getChatMemberById: async (
//       memberId: string,
//       fetchIfMissing: boolean = false
//     ) => {
//       const { chatMembers } = get();
//       // Use a more efficient lookup
//       const member = Object.values(chatMembers)
//         .flat()
//         .find((m) => m.id === memberId);

//       if (!member && fetchIfMissing) {
//         try {
//           return await chatMemberService.fetchMemberById(memberId);
//         } catch (error) {
//           console.error("Failed to fetch member:", error);
//           return undefined;
//         }
//       }

//       return member;
//     },

//     getChatMemberByUserIdAndChatId: async (
//       chatId: string,
//       userId: string,
//       fetchIfMissing: boolean = false
//     ) => {
//       const { chatMembers } = get();
//       const members = chatMembers[chatId] || [];
//       let member = members.find((m) => m.userId === userId);

//       if (!member && fetchIfMissing) {
//         try {
//           const fetchedMember =
//             await chatMemberService.fetchMemberByChatIdAndUserId(
//               chatId,
//               userId
//             );

//           if (fetchedMember) {
//             set((state) => ({
//               chatMembers: {
//                 ...state.chatMembers,
//                 [chatId]: [...(state.chatMembers[chatId] || []), fetchedMember],
//               },
//             }));
//           }

//           member = fetchedMember;
//         } catch (error) {
//           console.error("Failed to fetch member:", error);
//           return undefined;
//         }
//       }

//       return member;
//     },

//     getChatMemberUserIds: (chatId: string): string[] => {
//       const chat = useChatStore.getState().chats.find((c) => c.id === chatId);
//       if (!chat) return [];
//       return chat.otherMemberUserIds || [];
//     },

//     getDirectChatOtherMemberId: (
//       chatId: string,
//       myUserId: string
//     ): string | null => {
//       const members = get().chatMembers[chatId];
//       if (!members || members.length !== 2) return null;

//       // Find the other member (different userId than mine)
//       const otherMember = members.find((m) => m.userId !== myUserId);
//       return otherMember ? otherMember.id : null;
//     },

//     getAllChatMemberIds: () => {
//       const { chatMembers } = get();
//       const allMemberIds = new Set<string>();

//       Object.values(chatMembers).forEach((members) => {
//         members.forEach((member) => {
//           allMemberIds.add(member.userId);
//         });
//       });

//       return Array.from(allMemberIds);
//     },

//     getAllUniqueUserIds: () => {
//       const { chatMembers } = get();
//       const allUserIds = new Set<string>();

//       Object.values(chatMembers).forEach((members) => {
//         members.forEach((member) => {
//           allUserIds.add(member.userId);
//         });
//       });

//       return Array.from(allUserIds);
//     },

//     addMemberLocally: (newMember) => {
//       set((state) => {
//         const currentMembers = state.chatMembers[newMember.chatId] || [];
//         const memberExists = currentMembers.some((m) => m.id === newMember.id);
//         if (memberExists) return state;

//         // Update preview members through chat store
//         useChatStore.getState().addToGroupPreviewMembers(newMember.chatId, {
//           id: newMember.id,
//           userId: newMember.userId,
//           avatarUrl: newMember.avatarUrl,
//           nickname: newMember.nickname,
//           firstName: newMember.firstName,
//           lastName: newMember.lastName,
//         });

//         return {
//           chatMembers: {
//             ...state.chatMembers,
//             [newMember.chatId]: [...currentMembers, newMember],
//           },
//         };
//       });
//     },

//     updateMemberLocally: (chatId, memberId, updates) => {
//       set((state) => {
//         const currentMembers = state.chatMembers[chatId] || [];
//         const memberIndex = currentMembers.findIndex((m) => m.id === memberId);

//         if (memberIndex === -1) return state;

//         const updatedMembers = [...currentMembers];
//         updatedMembers[memberIndex] = {
//           ...updatedMembers[memberIndex],
//           ...updates,
//         };

//         return {
//           chatMembers: {
//             ...state.chatMembers,
//             [chatId]: updatedMembers,
//           },
//         };
//       });
//     },

//     updateMember: async (chatId, memberId, updates) => {
//       set({ isLoading: true });
//       try {
//         const updatedMember = await chatMemberService.updateMember(
//           memberId,
//           updates
//         );

//         // Use the local update function instead of direct state manipulation
//         get().updateMemberLocally(chatId, memberId, updatedMember);
//         set({ isLoading: false });
//       } catch (error) {
//         console.error("Failed to update chat member:", error);
//         set({ error: "Failed to update member", isLoading: false });
//         throw error;
//       }
//     },

//     updateMemberNickname: async (chatId, memberId, nickname) => {
//       set({ isLoading: true });
//       try {
//         const updatedNickname = await chatMemberService.updateMemberNickname(
//           memberId,
//           nickname
//         );

//         get().updateMemberLocally(chatId, memberId, {
//           nickname: updatedNickname,
//         });

//         return updatedNickname;
//       } catch (error) {
//         console.error("Failed to update member nickname:", error);
//         set({ error: "Failed to update nickname", isLoading: false });
//         throw error;
//       }
//     },

//     updateFriendshipStatus: (otherUserId, status) => {
//       set((state) => {
//         const updatedChatMembers = { ...state.chatMembers };

//         // Update all members matching the userId across all chats
//         Object.entries(updatedChatMembers).forEach(([chatId, members]) => {
//           updatedChatMembers[chatId] = members.map((member) => {
//             if (member.userId === otherUserId) {
//               return {
//                 ...member,
//                 friendshipStatus: status,
//               };
//             }
//             return member;
//           });
//         });

//         return {
//           chatMembers: updatedChatMembers,
//         };
//       });
//     },

//     updateMemberLastRead: async (
//       chatId: string,
//       memberId: string,
//       messageId: string | null
//     ) => {
//       try {
//         // Update backend
//         await chatMemberService.updateLastRead(memberId, messageId);

//         // Update local chat member data
//         get().updateMemberLocally(chatId, memberId, {
//           lastReadMessageId: messageId,
//         });

//         // Also reset unread count in chat store
//         const chatStore = useChatStore.getState();
//         chatStore.updateChatLocally(chatId, { unreadCount: 0 });
//       } catch (error) {
//         console.error("Failed to update last read:", error);
//       }
//     },

//     addGroupMember: (chatId, member) => {
//       set((state) => {
//         const currentMembers = state.chatMembers[chatId] || [];
//         return {
//           chatMembers: {
//             ...state.chatMembers,
//             [chatId]: [...currentMembers, member],
//           },
//         };
//       });
//     },

//     removeChatMember: async (chatId, userId) => {
//       try {
//         await chatMemberService.DeleteMember(chatId, userId);
//         get().clearChatMember(chatId, userId);
//       } catch (error) {
//         handleError(error, "Failed to remove member");
//       }
//     },

//     clearChatMember: (chatId, userId) => {
//       set((state) => {
//         const currentMembers = state.chatMembers[chatId] || [];
//         // Update preview members through chat store
//         useChatStore.getState().removeFromGroupPreviewMembers(chatId, userId);
//         return {
//           chatMembers: {
//             ...state.chatMembers,
//             [chatId]: currentMembers.filter((m) => m.userId !== userId),
//           },
//         };
//       });
//     },

//     clearChatMembers: (chatId: string) => {
//       set((state) => {
//         const newMembers = { ...state.chatMembers };
//         delete newMembers[chatId];
//         return { chatMembers: newMembers };
//       });
//     },
//   })
// );

// // EXPORT HOOKS

// export const useActiveMembers = (): ChatMember[] | undefined => {
//   const activeChatId = useActiveChatId();
//   return useChatMemberStore(
//     useShallow((state) => {
//       if (!activeChatId) return undefined;
//       return state.chatMembers[activeChatId];
//     })
//   );
// };

// export const useMembersByChatId = (
//   chatId: string
// ): ChatMember[] | undefined => {
//   return useChatMemberStore(useShallow((state) => state.chatMembers[chatId]));
// };

// export const getMyChatMember = async (
//   chatId?: string,
//   fetchIfMissing: boolean = true
// ): Promise<ChatMember | undefined | null> => {
//   if (!chatId) return null;

//   const currentUserId = useAuthStore.getState().currentUser?.id;
//   if (!currentUserId) return null;

//   return await useChatMemberStore
//     .getState()
//     .getChatMemberByUserIdAndChatId(chatId, currentUserId, fetchIfMissing);
// };

// export const getMyChatMemberId = async (
//   chatId: string,
//   fetchIfMissing: boolean = true
// ): Promise<string | undefined> => {
//   const currentUserId = useAuthStore.getState().currentUser?.id;
//   if (!currentUserId) return undefined;

//   const member = await useChatMemberStore
//     .getState()
//     .getChatMemberByUserIdAndChatId(chatId, currentUserId, fetchIfMissing);

//   return member?.id;
// };

// export const getDirectChatPartner = (
//   chatId: string,
//   myMemberId: string
// ): ChatMember | undefined => {
//   if (!chatId || !myMemberId) return undefined;

//   const state = useChatMemberStore.getState();
//   const members = state.chatMembers[chatId];

//   if (!members || members.length !== 2) return undefined;

//   return members.find((member) => member.id !== myMemberId);
// };

// export const useGroupOtherMembers = (
//   chatId: string
// ): ChatMember[] | undefined => {
//   const myMemberId = useCurrentUserId();
//   return useChatMemberStore(
//     useShallow((state) => {
//       const members = state.chatMembers[chatId];
//       if (!members) return undefined;
//       return members.filter((member) => member.id !== myMemberId);
//     })
//   );
// };

// export const useAllUniqueUserIds = (): string[] => {
//   const chatMembers = useChatMemberStore(
//     useShallow((state) => state.chatMembers)
//   );

//   return useMemo(() => {
//     const allUserIds = new Set<string>();

//     Object.values(chatMembers).forEach((members) => {
//       members.forEach((member) => {
//         allUserIds.add(member.userId);
//       });
//     });

//     return Array.from(allUserIds);
//   }, [chatMembers]);
// };

// export const useMemberAvatars = (chatId: string, limit: number = 4) => {
//   const members = useChatMemberStore.getState().chatMembers[chatId];
//   return members
//     .filter((member) => member.avatarUrl)
//     .slice(0, limit)
//     .map((member) => member.avatarUrl as string);
// };
