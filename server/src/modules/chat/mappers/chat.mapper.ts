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

@Injectable()
export class ChatMapper {
  constructor(private readonly messageMapper: MessageMapper) {}

  async transformToDirectChatDto(
    chat: Chat,
    currentUserId: string,
    messageService?: MessageService,
  ): Promise<ChatResponseDto> {
    const myMember = chat.members.find((m) => m.userId === currentUserId);
    const otherMember = chat.members.find((m) => m.userId !== currentUserId);

    if (!otherMember || !myMember) {
      throw new Error('Invalid chat members');
    }

    const fullName = [otherMember.user.firstName, otherMember.user.lastName]
      .filter(Boolean)
      .join(' ');
    const displayName = otherMember.nickname || fullName || 'Unknown User';

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

    return {
      id: chat.id,
      type: ChatType.DIRECT,
      myMemberId: myMember.id,
      name: displayName,
      avatarUrl: otherMember.user.avatarUrl ?? null,
      updatedAt: chat.updatedAt,
      pinnedMessage: chat.pinnedMessage
        ? this.messageMapper.toMessageResponseDto(chat.pinnedMessage)
        : null,
      lastMessage: chat.lastMessage
        ? this.transformLastMessageDto(
            chat.lastMessage,
            chat.members,
            currentUserId,
          )
        : null,
      otherMemberUserIds: [otherMember.userId],
      unreadCount,
    };
  }

  async transformToGroupChatDto(
    chat: Chat,
    currentUserId: string,
    messageService?: MessageService,
  ): Promise<ChatResponseDto> {
    const myMember = chat.members.find((m) => m.userId === currentUserId);
    const otherMembers = chat.members.filter((m) => m.userId !== currentUserId);

    if (!myMember) {
      throw new Error('Current user is not a member of this group chat');
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
      lastMessage: chat.lastMessage
        ? this.transformLastMessageDto(
            chat.lastMessage,
            chat.members,
            currentUserId,
          )
        : null,
      otherMemberUserIds: otherMembers.map((m) => m.userId),
      unreadCount,
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
      ? 'Me'
      : member?.nickname || member?.user?.firstName || 'Unknown';

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
      isForwarded,
      createdAt: message.createdAt,
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
