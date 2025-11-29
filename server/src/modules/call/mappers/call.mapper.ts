// src/modules/call/mappers/call.mapper.ts
import { Injectable } from '@nestjs/common';
import { Call } from '../entities/call.entity';
import { CallResponseDto } from '../dto/call-response.dto';
import { ChatMapper } from '@/modules/chat/mappers/chat.mapper';
import { mapChatMemberToChatMemberResDto } from '@/modules/chat-member/mappers/chat-member.mapper';
import { ChatType } from '@shared/types/enums/chat-type.enum';

@Injectable()
export class CallMapper {
  constructor(private readonly chatMapper: ChatMapper) {}

  async map(call: Call, currentUserId: string): Promise<CallResponseDto> {
    const dto = new CallResponseDto();

    dto.id = call.id;
    dto.status = call.status;
    dto.startedAt = call.startedAt ?? null;
    dto.endedAt = call.endedAt ?? null;
    dto.updatedAt = call.updatedAt ?? null;
    dto.createdAt = call.createdAt;

    // Map initiator properly
    if (call.initiator) {
      dto.initiator = mapChatMemberToChatMemberResDto(
        call.initiator,
        call.chat?.type ?? ChatType.DIRECT,
        false, // isBlockedByMe (optional)
        false, // isBlockedMe (optional)
      );
    }

    // Map chat using the unified ChatMapper
    if (call.chat) {
      dto.chat = await this.chatMapper.mapChatToChatResDto(
        call.chat,
        currentUserId,
      );
    }

    return dto;
  }
}
