// src/modules/chat/mappers/direct-chat.mapper.ts
import { Injectable } from '@nestjs/common';
import { Chat } from '../entities/chat.entity';
import { ChatResponseDto } from '../dto/responses/chat-response.dto';
import { ChatType } from '../constants/chat-types.constants';
import { MessageService } from 'src/modules/message/message.service';
import { MessageMapper } from 'src/modules/message/mappers/message.mapper';
import { ChatMemberService } from 'src/modules/chat-member/chat-member.service';

@Injectable()
export class SavedChatMapper {
  constructor(
    private readonly messageMapper: MessageMapper,
    private readonly messageService: MessageService,
    private readonly chatMemberService: ChatMemberService,
  ) {}

  async map(chat: Chat, currentUserId: string): Promise<ChatResponseDto> {
    const myMember = chat.members.find((m) => m.userId === currentUserId);
    if (!myMember) {
      throw new Error('Current user is not a valid member of this chat');
    }

    let unreadCount = 0;
    if (myMember.lastReadMessageId) {
      unreadCount = await this.messageService.getUnreadMessageCount(
        chat.id,
        myMember.lastReadMessageId,
        currentUserId,
      );
    }

    const mutedUntil =
      this.chatMemberService.checkAndClearExpiredMute(myMember);

    return {
      id: chat.id,
      type: ChatType.SAVED,
      myMemberId: myMember.id,
      name: 'Saved Messages',
      avatarUrl: null,
      updatedAt: chat.updatedAt,
      pinnedMessage: chat.pinnedMessage
        ? this.messageMapper.mapMessageToMessageResDto(chat.pinnedMessage)
        : null,
      lastMessage: null,
      otherMemberUserIds: [],
      previewMembers: [],
      unreadCount,
      mutedUntil,
      isDeleted: false,
    };
  }
}
