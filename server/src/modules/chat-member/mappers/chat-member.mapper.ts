// chat-member.mapper.ts
import { plainToInstance } from 'class-transformer';
import { ChatMember } from '../entities/chat-member.entity';
import {
  DirectChatMemberResponseDto,
  GroupChatMemberResponseDto,
} from '../dto/responses/chat-member-response.dto';
import { ChatType } from '../../chat/constants/chat-types.constants';

export function mapChatMemberToResponseDto(
  member: ChatMember,
  chatType?: ChatType,
) {
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
    });
  }

  return plainToInstance(GroupChatMemberResponseDto, baseMember);
}
