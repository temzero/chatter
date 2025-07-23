// chat-member.mapper.ts
import { plainToInstance } from 'class-transformer';
import { ChatMember } from '../entities/chat-member.entity';
import {
  DirectChatMemberResponseDto,
  GroupChatMemberResponseDto,
} from '../dto/responses/chat-member-response.dto';
import { ChatType } from '../../chat/constants/chat-types.constants';
import { FriendshipStatus } from 'src/modules/friendship/constants/friendship-status.constants';

export function mapChatMemberToResponseDto(
  member: ChatMember,
  chatType?: ChatType,
  isBlockedByMe?: boolean,
  isBlockedMe?: boolean,
  friendshipStatus?: FriendshipStatus | null,
) {
  // If the user has blocked me, return minimal information
  if (isBlockedMe) {
    const blockedMember = {
      id: member.id,
      chatId: member.chatId,
      userId: member.userId,
      isBlockedMe: true, // Make it clear this user blocked me
      // Don't include any other personal information
    };

    return chatType === ChatType.DIRECT
      ? plainToInstance(DirectChatMemberResponseDto, blockedMember)
      : plainToInstance(GroupChatMemberResponseDto, blockedMember);
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
    isBlockedByMe: isBlockedByMe,
    isBlockedMe: false,
    createdAt: member.createdAt,
  };

  if (chatType === ChatType.DIRECT) {
    return plainToInstance(DirectChatMemberResponseDto, {
      ...baseMember,
      username: member.user.username,
      email: member.user.email,
      phoneNumber: member.user.phoneNumber,
      birthday: member.user.birthday,
      bio: member.user.bio,
      friendshipStatus,
    });
  }

  return plainToInstance(GroupChatMemberResponseDto, baseMember);
}
