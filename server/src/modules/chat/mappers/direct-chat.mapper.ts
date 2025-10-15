// src/modules/chat/mappers/direct-chat.mapper.ts
import { Injectable } from '@nestjs/common';
import { Chat } from '../entities/chat.entity';
import { ChatResponseDto } from '../dto/responses/chat-response.dto';
import { ChatType } from 'src/shared/types/enums/chat-type.enum';
import { MessageService } from 'src/modules/message/message.service';
import { MessageMapper } from 'src/modules/message/mappers/message.mapper';
import { ChatMemberService } from 'src/modules/chat-member/chat-member.service';
import { mapMessageToLastMessageResDto } from './last-message.mapper';
import { mapChatMemberToChatMemberLiteDto } from '../../chat-member/mappers/chat-member-lite.mapper';
import { ChatMemberLiteDto } from '../dto/responses/chat-member-lite.dto';

@Injectable()
export class DirectChatMapper {
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
    const otherMember = chat.members.find((m) => m.userId !== currentUserId);

    const displayName = otherMember
      ? otherMember.nickname ||
        [otherMember.user?.firstName, otherMember.user?.lastName]
          .filter(Boolean)
          .join(' ') ||
        'Unknown User'
      : '????';

    const avatarUrl = otherMember?.user?.avatarUrl ?? null;

    let unreadCount = 0;
    if (
      this.messageService &&
      myMember.lastReadMessageId &&
      myMember.lastReadMessageId !== 'undefined' &&
      myMember.lastReadMessageId !== 'null'
    ) {
      unreadCount = await this.messageService.getUnreadMessageCount(
        chat.id,
        myMember.lastReadMessageId,
        currentUserId,
      );
    }

    const mutedUntil =
      this.chatMemberService.checkAndClearExpiredMute(myMember);

    const mappedMember = otherMember
      ? mapChatMemberToChatMemberLiteDto(otherMember)
      : null;
    const previewMembers: ChatMemberLiteDto[] = mappedMember
      ? [mappedMember]
      : [];

    return {
      id: chat.id,
      type: ChatType.DIRECT,
      myMemberId: myMember.id,
      name: displayName,
      avatarUrl,
      updatedAt: chat.updatedAt,
      pinnedMessage: chat.pinnedMessage
        ? this.messageMapper.mapMessageToMessageResDto(chat.pinnedMessage)
        : null,
      lastMessage: myMember.lastVisibleMessage
        ? mapMessageToLastMessageResDto(
            myMember.lastVisibleMessage,
            chat.members,
            currentUserId,
          )
        : undefined,
      otherMemberUserIds: otherMember ? [otherMember.userId] : [],
      previewMembers,
      unreadCount,
      mutedUntil,
      isDeleted: !!otherMember?.deletedAt,
    };
  }
}
