// src/modules/chat/mappers/chat.mapper.ts
import { Injectable } from '@nestjs/common';
import { Chat } from '../entities/chat.entity';
import { ChatResponseDto } from '../dto/responses/chat-response.dto';
import { LastMessageResponseDto } from '../dto/responses/last-message-response.dto';
import { Message } from 'src/modules/message/entities/message.entity';
import { ChatType } from '../constants/chat-types.constants';
import { ChatMember } from 'src/modules/chat-member/entities/chat-member.entity';
import { MessageService } from 'src/modules/message/message.service';
import { AttachmentType } from 'src/modules/message/constants/attachment-type.constants';
import { MessageMapper } from 'src/modules/message/mappers/message.mapper';
import { ChatMemberService } from 'src/modules/chat-member/chat-member.service';
import { getActiveInviteLinks } from 'src/common/utils/invite-link.util';
import { ChatMemberPreviewDto } from '../dto/responses/chat-member-preview.dto';

@Injectable()
export class ChatMapper {
  constructor(
    private readonly messageMapper: MessageMapper,
    private readonly chatMemberService: ChatMemberService,
  ) {}

  async transformToDirectChatDto(
    chat: Chat,
    currentUserId: string,
    messageService?: MessageService,
  ): Promise<ChatResponseDto> {
    // Find current user's member (must be active due to query)
    const myMember = chat.members.find((m) => m.userId === currentUserId);

    // Find other member (can be soft-deleted)
    const otherMember = chat.members.find((m) => m.userId !== currentUserId);

    if (!myMember) {
      throw new Error('Current user is not a valid member of this chat');
    }

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

    return {
      id: chat.id,
      type: ChatType.DIRECT,
      myMemberId: myMember.id,
      name: displayName,
      avatarUrl,
      updatedAt: chat.updatedAt,
      pinnedMessage: chat.pinnedMessage
        ? this.messageMapper.toMessageResponseDto(chat.pinnedMessage)
        : null,
      lastMessage: myMember.lastVisibleMessage
        ? this.transformLastMessageDto(
            myMember.lastVisibleMessage,
            chat.members,
            currentUserId,
          )
        : null,
      otherMemberUserIds: otherMember ? [otherMember.userId] : [],
      previewMembers: otherMember
        ? [this.transformToMemberPreviewDto(otherMember)]
        : [],
      unreadCount,
      mutedUntil,
      isDeleted: !!otherMember?.deletedAt, // Optional: add deletion status
    };
  }

  async transformToGroupChatDto(
    chat: Chat,
    currentUserId: string,
    messageService?: MessageService,
  ): Promise<ChatResponseDto> {
    const myMember = chat.members.find((m) => m.userId === currentUserId);
    const otherMembers = chat.members.filter((m) => m.userId !== currentUserId);
    const previewMembers = [
      ...(myMember ? [this.transformToMemberPreviewDto(myMember)] : []),
      ...otherMembers
        .slice(0, myMember ? 7 : 8) // Take one less from others if we include current user
        .map((m) => this.transformToMemberPreviewDto(m)),
    ];

    if (!myMember) {
      throw new Error('You must be a member to access this chat');
    }

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
        ? this.messageMapper.toMessageResponseDto(chat.pinnedMessage)
        : null,
      lastMessage: myMember.lastVisibleMessage
        ? this.transformLastMessageDto(
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

  transformToPublicChatDto(chat: Chat): ChatResponseDto {
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
        ? this.messageMapper.toMessageResponseDto(chat.pinnedMessage)
        : null,
      lastMessage: null, // Optional: you can fetch the most recent public message if needed
      otherMemberUserIds: [],
      unreadCount: 0,
      mutedUntil: null,
    };
  }

  transformLastMessageDto(
    message: Message,
    members: ChatMember[],
    currentUserId?: string,
  ): LastMessageResponseDto {
    const isMe = message.senderId === currentUserId;
    const member = members.find((m) => m.userId === message.senderId);

    const senderDisplayName = isMe
      ? 'You'
      : member?.nickname ||
        member?.user?.firstName ||
        message.sender?.firstName ||
        'User';

    const isForwarded = !!message.forwardedFromMessage;

    let content: string | undefined;
    let icons: string[] | undefined;

    if (isForwarded && message.forwardedFromMessage) {
      const fwd = message.forwardedFromMessage;
      content = fwd.content || 'Attachment';
      icons = this.getAttachmentIcons(fwd.attachments);
    } else {
      content = message.content || 'Attachment';
      icons = this.getAttachmentIcons(message.attachments);
    }

    return {
      id: message.id,
      senderId: message.senderId,
      senderDisplayName,
      content,
      icons,
      callStatus: message.call?.status,
      isForwarded,
      systemEvent: message.systemEvent,
      createdAt: message.createdAt,
    };
  }

  private transformToMemberPreviewDto(
    member: ChatMember,
  ): ChatMemberPreviewDto {
    return {
      id: member.id,
      userId: member.userId,
      avatarUrl: member.user?.avatarUrl ?? null,
      nickname: member.nickname ?? null,
      firstName: member.user?.firstName ?? null,
      lastName: member.user?.lastName ?? null,
    };
  }

  private getAttachmentIcons(
    attachments?: { type: AttachmentType }[],
  ): string[] | undefined {
    if (!attachments || attachments.length === 0) return undefined;

    const iconMap: Record<AttachmentType, string> = {
      [AttachmentType.IMAGE]: 'image',
      [AttachmentType.VIDEO]: 'videocam',
      [AttachmentType.AUDIO]: 'music_note',
      [AttachmentType.TEXT]: '',
      [AttachmentType.FILE]: 'folder_zip',
      [AttachmentType.VOICE]: 'voice',
      [AttachmentType.LOCATION]: 'location',
      [AttachmentType.POLL]: 'poll',
      [AttachmentType.SYSTEM]: 'system',
    };

    const seen = new Set<string>();
    const icons: string[] = [];

    for (const att of attachments) {
      const icon = iconMap[att.type] || 'insert_drive_file';
      if (!seen.has(icon)) {
        icons.push(icon);
        seen.add(icon);
        if (icons.length >= 5) break;
      }
    }

    return icons;
  }
}
