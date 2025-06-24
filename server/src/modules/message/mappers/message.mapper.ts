import { Injectable } from '@nestjs/common';
import { Message } from '../entities/message.entity';
import { MessageResponseDto } from '../dto/responses/message-response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class MessageMapper {
  toResponseDto(message: Message): MessageResponseDto {
    const senderMember = message.chat?.members?.[0];
    const groupedReactions = this.groupReactions(message.reactions || []);

    const responseData = {
      id: message.id,
      chatId: message.chatId,
      sender: {
        id: message.senderId,
        avatarUrl: message.sender?.avatarUrl,
        displayName:
          senderMember?.nickname ||
          `${message.sender?.firstName} ${message.sender?.lastName}`,
      },
      type: message.type,
      content: message.content,
      status: message.status,
      isPinned: message.isPinned,
      pinnedAt: message.pinnedAt,
      replyToMessageId: message.replyToMessageId,
      replyCount: message.replyCount,
      editedAt: message.editedAt,
      isDeleted: message.isDeleted,
      deletedAt: message.deletedAt,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
      reactions: groupedReactions,
      attachments: message.attachments,

      // ✅ Nested replyToMessage with sender & attachments
      replyToMessage: message.replyToMessage
        ? {
            id: message.replyToMessage.id,
            content: message.replyToMessage.content,
            createdAt: message.replyToMessage.createdAt,
            attachments: message.replyToMessage.attachments || [],
            sender: message.replyToMessage.sender
              ? {
                  id: message.replyToMessage.sender.id,
                  displayName: `${message.replyToMessage.sender?.firstName} ${message.replyToMessage.sender?.lastName}`,
                  avatarUrl: message.replyToMessage.sender.avatarUrl,
                }
              : null,
          }
        : null,

      forwardedFromMessage: message.forwardedFromMessage
        ? {
            id: message.forwardedFromMessage.id,
            content: message.forwardedFromMessage.content,
            createdAt: message.forwardedFromMessage.createdAt,
            attachments: message.forwardedFromMessage.attachments || [],
            sender: message.forwardedFromMessage.sender
              ? {
                  id: message.forwardedFromMessage.sender.id,
                  avatarUrl: message.forwardedFromMessage.sender.avatarUrl,
                  displayName: `${message.forwardedFromMessage.sender?.firstName} ${message.forwardedFromMessage.sender?.lastName}`,
                }
              : null,
          }
        : null,
    };

    return plainToInstance(MessageResponseDto, responseData, {
      excludeExtraneousValues: true,
    });
  }

  private groupReactions(
    reactions: { emoji: string; userId: string }[],
  ): Record<string, string[]> {
    const grouped: Record<string, string[]> = {};
    for (const reaction of reactions) {
      if (!grouped[reaction.emoji]) {
        grouped[reaction.emoji] = [];
      }
      grouped[reaction.emoji].push(reaction.userId);
    }
    return grouped;
  }
}
