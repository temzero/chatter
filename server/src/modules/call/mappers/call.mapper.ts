// mappers/call.mapper.ts
import { Call } from '../entities/call.entity';
import { CallResponseDto } from '../dto/call-response.dto';
// import { mapChatMemberToChatMemberLiteDto } from 'src/modules/chat-member/mappers/chat-member-lite.mapper';

export function mapCallToCallResDto(call: Call): CallResponseDto {
  const dto = new CallResponseDto();

  dto.id = call.id;
  dto.chat = call.chat;
  dto.status = call.status;
  dto.startedAt = call.startedAt ?? null;
  dto.endedAt = call.endedAt ?? null;
  dto.updatedAt = call.updatedAt ?? null;
  dto.createdAt = call.createdAt;
  // dto.initiator = mapChatMemberToChatMemberLiteDto(call.initiator);
  dto.initiator = call.initiator;

  // fallback avatar if chat has no avatar
  if (!dto.chat?.avatarUrl) {
    dto.chat.avatarUrl = call.initiator?.user?.avatarUrl ?? null;
  }

  return dto;
}
