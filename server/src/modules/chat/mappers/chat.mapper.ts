// src/modules/chat/mappers/chat.mapper.ts
import { Injectable } from '@nestjs/common';
import { Chat } from '../entities/chat.entity';
import { ChatResponseDto } from '../dto/responses/chat-response.dto';
import { ChatType } from '../constants/chat-types.constants';
import { MessageService } from 'src/modules/message/message.service';
import { MessageMapper } from 'src/modules/message/mappers/message.mapper';
import { ChatMemberService } from 'src/modules/chat-member/chat-member.service';
import { getActiveInviteLinks } from 'src/common/utils/invite-link.util';
import { ChatMemberLiteDto } from '../dto/responses/chat-member-lite.dto';
import { mapMessageToLastMessageResDto } from './last-message.mapper';
import { mapChatMemberToChatMemberLiteDto } from '../../chat-member/mappers/chat-member-lite.mapper';

@Injectable()
export class ChatMapper {
  constructor(
    private readonly messageMapper: MessageMapper,
    private readonly chatMemberService: ChatMemberService,
  ) {}

  async mapDirectChatToChatResDto(
    chat: Chat,
    currentUserId: string,
    messageService?: MessageService,
  ): Promise<ChatResponseDto> {
    const myMember = chat.members.find((m) => m.userId === currentUserId);
    if (!myMember) {
      throw new Error('Current user is not a valid member of this chat');
    }
    const otherMember = chat.members.find((m) => m.userId !== currentUserId);

    // Handle case where other member doesn't exist or is soft-deleted
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
      messageService &&
      myMember.lastReadMessageId &&
      myMember.lastReadMessageId !== 'undefined' &&
      myMember.lastReadMessageId !== 'null'
    ) {
      unreadCount = await messageService.getUnreadMessageCount(
        chat.id,
        myMember.lastReadMessageId,
        currentUserId,
      );
    }

    const mutedUntil = myMember
      ? this.chatMemberService.checkAndClearExpiredMute(myMember)
      : null;

    const previewMembers = [
      ...(otherMember
        ? [mapChatMemberToChatMemberLiteDto(otherMember)].filter(Boolean)
        : []),
    ] as ChatMemberLiteDto[];

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
        : null,
      otherMemberUserIds: otherMember ? [otherMember.userId] : [],
      previewMembers,
      unreadCount,
      mutedUntil,
      isDeleted: !!otherMember?.deletedAt, // Optional: add deletion status
    };
  }

  async mapGroupChatToChatResDto(
    chat: Chat,
    currentUserId: string,
    messageService?: MessageService,
  ): Promise<ChatResponseDto> {
    const myMember = chat.members.find((m) => m.userId === currentUserId);
    if (!myMember) {
      throw new Error('You must be a member to access this chat');
    }
    const otherMembers = chat.members.filter((m) => m.userId !== currentUserId);
    const previewMembers = [
      ...(myMember
        ? [mapChatMemberToChatMemberLiteDto(myMember)].filter(Boolean)
        : []),
      ...otherMembers
        .slice(0, myMember ? 7 : 8)
        .map((m) => mapChatMemberToChatMemberLiteDto(m))
        .filter(Boolean),
    ] as ChatMemberLiteDto[];

    let unreadCount = 0;
    if (
      messageService &&
      myMember.lastReadMessageId &&
      myMember.lastReadMessageId !== 'undefined' &&
      myMember.lastReadMessageId !== 'null'
    ) {
      unreadCount = await messageService.getUnreadMessageCount(
        chat.id,
        myMember.lastReadMessageId,
        currentUserId,
      );
    }
    const mutedUntil = myMember
      ? this.chatMemberService.checkAndClearExpiredMute(myMember)
      : null;

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

  mapPublicChatToChatResDto(chat: Chat): ChatResponseDto {
    return {
      id: chat.id,
      type: ChatType.CHANNEL,
      myMemberId: null,
      myRole: null,
      name: chat.name ?? 'Unnamed Channel',
      avatarUrl: chat.avatarUrl ?? null,
      description: chat.description ?? null,
      updatedAt: chat.updatedAt,
      pinnedMessage: chat.pinnedMessage
        ? this.messageMapper.mapMessageToMessageResDto(chat.pinnedMessage)
        : null,
      lastMessage: null, // Optional: you can fetch the most recent public message if needed
      otherMemberUserIds: [],
      unreadCount: 0,
      mutedUntil: null,
    };
  }
}
