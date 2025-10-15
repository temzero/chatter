import { Injectable } from '@nestjs/common';
import { DirectChatMapper } from './direct-chat.mapper';
import { GroupChatMapper } from './group-chat.mapper';
import { Chat } from '../entities/chat.entity';
import { ChatType } from 'src/shared/types/enums/chat-type.enum';
import { ChatResponseDto } from '../dto/responses/chat-response.dto';
import { SavedChatMapper } from './saved-chat.mapper';

@Injectable()
export class ChatMapper {
  constructor(
    private readonly directChatMapper: DirectChatMapper,
    private readonly groupChatMapper: GroupChatMapper,
    private readonly savedChatMapper: SavedChatMapper,
  ) {}

  async mapChatToChatResDto(
    chat: Chat,
    currentUserId: string,
  ): Promise<ChatResponseDto | undefined> {
    switch (chat.type) {
      case ChatType.DIRECT:
        return this.directChatMapper.map(chat, currentUserId);
      case ChatType.GROUP:
      case ChatType.CHANNEL:
        return this.groupChatMapper.map(chat, currentUserId);
      case ChatType.SAVED:
        return this.savedChatMapper.map(chat, currentUserId);
    }
  }
}
