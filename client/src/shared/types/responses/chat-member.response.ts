import { ChatMemberRole } from "src/shared/types/enums/chat-member-role.enum";
import { ChatMemberStatus } from "src/shared/types/enums/chat-member-status.enum";
import { FriendshipStatus } from "src/shared/types/enums/friendship-type.enum";

export interface ChatMemberResponse {
  // Common fields for both direct and group chats
  id: string;
  chatId: string;
  userId: string;
  avatarUrl: string | null;
  firstName: string;
  lastName: string;
  nickname: string | null;
  role: ChatMemberRole;
  status: ChatMemberStatus;
  customTitle: string | null;
  mutedUntil: Date | null;
  lastReadMessageId: string | null;
  isBlockedByMe: boolean;
  isBlockedMe: boolean;
  pinnedAt?: Date | string;
  createdAt: Date | string;

  // Direct chat specific fields (will be null for group chats)
  username: string | null;
  email: string | null;
  phoneNumber: string | null;
  birthday: Date | string | null;
  bio: string | null;
  friendshipStatus?: FriendshipStatus | null;
}
