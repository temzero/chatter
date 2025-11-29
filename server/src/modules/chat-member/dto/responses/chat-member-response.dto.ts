import { Exclude, Expose } from 'class-transformer';
import { ChatMemberRole } from '@shared/types/enums/chat-member-role.enum';
import { ChatMemberStatus } from '@shared/types/enums/chat-member-status.enum';
import { FriendshipStatus } from '@shared/types/enums/friendship-type.enum';

@Exclude()
export class ChatMemberResponseDto {
  // Common fields for both direct and group chats
  @Expose() id: string;
  @Expose() chatId: string;
  @Expose() userId: string;
  @Expose() avatarUrl: string | null;
  @Expose() firstName: string;
  @Expose() lastName: string;
  @Expose() nickname: string | null;
  @Expose() role: ChatMemberRole;
  @Expose() status: ChatMemberStatus;
  @Expose() customTitle: string | null;
  @Expose() mutedUntil: Date | null;
  @Expose() lastReadMessageId: string | null;
  @Expose() isBlockedByMe: boolean;
  @Expose() isBlockedMe: boolean;
  @Expose() pinnedAt?: Date | string;
  @Expose() createdAt: Date | string;

  // Direct chat specific fields (will be null for group chats)
  @Expose() username: string | null;
  @Expose() email: string | null;
  @Expose() phoneNumber: string | null;
  @Expose() birthday: Date | null;
  @Expose() bio: string | null;
  @Expose() friendshipStatus?: FriendshipStatus | null;
}
