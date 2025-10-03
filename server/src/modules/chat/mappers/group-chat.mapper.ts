// src/modules/chat/mappers/group-chat.mapper.ts
import { Injectable } from '@nestjs/common';
import { Chat } from '../entities/chat.entity';
import { ChatResponseDto } from '../dto/responses/chat-response.dto';
import { MessageService } from 'src/modules/message/message.service';
import { MessageMapper } from 'src/modules/message/mappers/message.mapper';
import { ChatMemberService } from 'src/modules/chat-member/chat-member.service';
import { mapMessageToLastMessageResDto } from './last-message.mapper';
import { mapChatMemberToChatMemberLiteDto } from '../../chat-member/mappers/chat-member-lite.mapper';
import { getActiveInviteLinks } from 'src/common/utils/invite-link.util';
import { ChatMemberLiteDto } from '../dto/responses/chat-member-lite.dto';

@Injectable()
export class GroupChatMapper {
  constructor(
    private readonly messageMapper: MessageMapper,
    private readonly messageService: MessageService,
    private readonly chatMemberService: ChatMemberService,
  ) {}

  async map(chat: Chat, currentUserId: string): Promise<ChatResponseDto> {
    const myMember = chat.members.find((m) => m.userId === currentUserId);
    if (!myMember) throw new Error('You must be a member to access this chat');

    const otherMembers = chat.members.filter((m) => m.userId !== currentUserId);

    const previewMembers: ChatMemberLiteDto[] = [
      mapChatMemberToChatMemberLiteDto(myMember),
      ...otherMembers
        .slice(0, myMember ? 7 : 8)
        .map((m) => mapChatMemberToChatMemberLiteDto(m)),
    ].filter((m): m is ChatMemberLiteDto => m !== null && m !== undefined);

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

    return {
      id: chat.id,
      type: chat.type,
      myMemberId: myMember.id,
      myRole: myMember.role,
      name: chat.name ?? 'Unnamed Group',
      avatarUrl: chat.avatarUrl ?? null,
      description: chat.description ?? null,
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
        : null,
      otherMemberUserIds: otherMembers.map((m) => m.userId),
      previewMembers,
      inviteLinks: getActiveInviteLinks(chat.inviteLinks),
      unreadCount,
      mutedUntil,
    };
  }
}
