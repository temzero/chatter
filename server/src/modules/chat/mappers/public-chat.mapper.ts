// src/modules/chat/mappers/public-chat.mapper.ts
import { Injectable } from '@nestjs/common';
import { Chat } from '../entities/chat.entity';
import { ChatResponseDto } from '../dto/responses/chat-response.dto';
import { ChatType } from 'src/shared/types/enums/chat-type.enum';
import { MessageMapper } from 'src/modules/message/mappers/message.mapper';

@Injectable()
export class PublicChatMapper {
  constructor(private readonly messageMapper: MessageMapper) {}

  async map(chat: Chat): Promise<ChatResponseDto> {
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
        ? await this.messageMapper.mapMessageToMessageResDto(chat.pinnedMessage)
        : null,
      otherMemberUserIds: [],
      unreadCount: 0,
      mutedUntil: null,
    };
  }
}
