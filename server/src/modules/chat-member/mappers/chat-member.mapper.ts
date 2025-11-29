// chat-member.mapper.ts
import { plainToInstance } from 'class-transformer';
import { ChatMember } from '../entities/chat-member.entity';
import { ChatMemberResponseDto } from '../dto/responses/chat-member-response.dto';
import { ChatType } from '@shared/types/enums/chat-type.enum';
import { FriendshipStatus } from '@shared/types/enums/friendship-type.enum';

export function mapChatMemberToChatMemberResDto(
  member: ChatMember,
  chatType?: ChatType,
  isBlockedByMe?: boolean,
  isBlockedMe?: boolean,
  friendshipStatus?: FriendshipStatus | null,
): ChatMemberResponseDto {
  // If the user has blocked me, return minimal information
  if (isBlockedMe) {
    const blockedMember = {
      id: member.id,
      chatId: member.chatId,
      userId: member.userId,
      isBlockedMe: isBlockedMe,
      isBlockedByMe: isBlockedByMe,
      // Don't include any other personal information
    };

    return plainToInstance(ChatMemberResponseDto, blockedMember);
  }

  // Normal response if not blocked
  const baseMember = {
    id: member.id,
    chatId: member.chatId,
    userId: member.userId,
    avatarUrl: member.user.avatarUrl,
    firstName: member.user.firstName,
    lastName: member.user.lastName,
    nickname: member.nickname,
    role: member.role,
    status: member.status,
    customTitle: member.customTitle,
    mutedUntil: member.mutedUntil,
    lastReadMessageId: member.lastReadMessageId,
    isBlockedMe: isBlockedMe,
    isBlockedByMe: isBlockedByMe,
    pinnedAt: member.pinnedAt,
    createdAt: member.createdAt,
  };

  if (chatType === ChatType.DIRECT) {
    return plainToInstance(ChatMemberResponseDto, {
      ...baseMember,
      username: member.user.username,
      email: member.user.email,
      phoneNumber: member.user.phoneNumber,
      birthday: member.user.birthday,
      bio: member.user.bio,
      friendshipStatus,
    });
  }

  // For group chats, direct-specific fields will be null
  return plainToInstance(ChatMemberResponseDto, {
    ...baseMember,
    username: null,
    email: null,
    phoneNumber: null,
    birthday: null,
    bio: null,
    friendshipStatus: null,
  });
}
