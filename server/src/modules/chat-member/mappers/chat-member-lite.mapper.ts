// mappers/memberPreviewMapper.ts
import { ChatMember } from '@/modules/chat-member/entities/chat-member.entity';
import { ChatMemberLiteDto } from '../../chat/dto/responses/chat-member-lite.dto';

export function mapChatMemberToChatMemberLiteDto(
  member: ChatMember,
): ChatMemberLiteDto | null {
  if (!member || !member.user || !member.user.id) {
    console.warn('Invalid chat member encountered:', member);
    return null;
  }

  return {
    id: member.id,
    userId: member.userId,
    avatarUrl: member.user?.avatarUrl ?? null,
    nickname: member.nickname ?? null,
    firstName: member.user?.firstName ?? null,
    lastName: member.user?.lastName ?? null,
  };
}
