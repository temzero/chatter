// src/modules/chat/mappers/chat-member.mapper.ts
import { ChatMember } from '../entities/chat-member.entity';
import { ChatMemberResponseDto } from '../dto/responses/chat-member-response.dto';

export function mapChatMemberToResponseDto(
  member: ChatMember,
): ChatMemberResponseDto {
  return {
    userId: member.user?.id,
    username: member.user?.username,
    avatarUrl: member.user?.avatarUrl,
    firstName: member.user?.firstName,
    lastName: member.user?.lastName,
    nickname: member.nickname,
    role: member.role,
    status: member.status,
    customTitle: member.customTitle,
    mutedUntil: member.mutedUntil,
    lastReadAt: member.lastReadAt,
    createdAt: member.createdAt,
    updatedAt: member.updatedAt,
  };
}
