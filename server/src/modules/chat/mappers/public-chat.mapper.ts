// src/modules/chat/mappers/public-chat.mapper.ts
import { Injectable } from '@nestjs/common';
import { Chat } from '../entities/chat.entity';
import { ChatResponseDto } from '../dto/responses/chat-response.dto';
import { ChatType } from '@shared/types/enums/chat-type.enum';
import { MessageMapper } from '@/modules/message/mappers/message.mapper';

@Injectable()
export class PublicChatMapper {
  constructor(private readonly messageMapper: MessageMapper) {}

  map(chat: Chat): ChatResponseDto {
    return {
      id: chat.id,
      type: ChatType.CHANNEL,
      myMemberId: null,
      myRole: undefined,
      name: chat.name ?? 'Unnamed Channel',
      avatarUrl: chat.avatarUrl ?? null,
      description: chat.description ?? null,
      updatedAt: chat.updatedAt,
      pinnedMessage: chat.pinnedMessage
        ? this.messageMapper.mapMessageToMessageResDto(chat.pinnedMessage)
        : null,
      otherMemberUserIds: [],
      unreadCount: 0,
      mutedUntil: null,
    };
  }
}
