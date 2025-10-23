import { ChatMemberRole } from 'src/shared/types/enums/chat-member-role.enum';
import { ChatMemberStatus } from 'src/shared/types/enums/chat-member-status.enum';
import { FriendshipStatus } from 'src/shared/types/enums/friendship-type.enum';

export type ChatMember = DirectChatMember | GroupChatMember;

// Base for both group and direct chat members
export interface GroupChatMember {
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
  lastReadMessageId: string | null;

  // block status fields:
  isBlockedByMe: boolean;
  isBlockedMe: boolean;

  createdAt: Date | string;
}

// Extends base GroupChatMember for direct chat specific fields
export interface DirectChatMember extends GroupChatMember {
  username: string;
  email: string;
  phoneNumber: string | null;
  birthday: Date | string | null;
  bio: string | null;
  friendshipStatus?: FriendshipStatus | null;
}
