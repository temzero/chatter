import { Injectable } from '@nestjs/common';
import { DirectChatMapper } from './direct-chat.mapper';
import { GroupChatMapper } from './group-chat.mapper';
import { PublicChatMapper } from './public-chat.mapper';
import { Chat } from '../entities/chat.entity';
import { ChatType } from '../constants/chat-types.constants';

@Injectable()
export class ChatMapper {
  constructor(
    private readonly directChatMapper: DirectChatMapper,
    private readonly groupChatMapper: GroupChatMapper,
    private readonly publicChatMapper: PublicChatMapper,
  ) {}

  async mapChatToChatResDto(chat: Chat, currentUserId: string) {
    switch (chat.type) {
      case ChatType.DIRECT:
        return this.directChatMapper.map(chat, currentUserId);
      case ChatType.GROUP:
        return this.groupChatMapper.map(chat, currentUserId);
      case ChatType.CHANNEL:
        return this.publicChatMapper.map(chat);
    }
  }
}
