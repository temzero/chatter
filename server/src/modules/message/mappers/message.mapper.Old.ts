import { Injectable } from '@nestjs/common';
import { Message } from '../entities/message.entity';
import { MessageResponseDto } from '../dto/responses/message-response.dto';
import { plainToInstance } from 'class-transformer';
import { AttachmentResponseDto } from '../dto/responses/attachment-response.dto';

@Injectable()
export class MessageMapper {
  toMessageResponseDto(message: Message): MessageResponseDto {
    const senderMember = message.chat?.members?.[0];
    const groupedReactions = this.groupReactions(message.reactions || []);

    const responseData = {
      id: message.id,
      chatId: message.chatId,
      sender: this.mapSender(
        message.senderId,
        message.sender,
        senderMember?.nickname,
      ),
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
      attachments: plainToInstance(
        AttachmentResponseDto,
        message.attachments || [],
      ),

      replyToMessage: this.mapNestedMessage(message.replyToMessage),
      forwardedFromMessage: this.mapNestedMessage(message.forwardedFromMessage),
    };

    return plainToInstance(MessageResponseDto, responseData, {
      excludeExtraneousValues: true,
    });
  }

  private mapNestedMessage(msg: Message | null | undefined) {
    if (!msg) return null;

    return {
      id: msg.id,
      content: msg.content,
      createdAt: msg.createdAt,
      attachments: plainToInstance(
        AttachmentResponseDto,
        msg.attachments || [],
      ),
      sender: this.mapSender(msg.senderId, msg.sender),
    };
  }

  private mapSender(
    senderId: string,
    sender: Message['sender'] | undefined,
    nickname?: string | null,
  ) {
    return {
      id: senderId,
      avatarUrl: sender?.avatarUrl,
      displayName: nickname || `${sender?.firstName} ${sender?.lastName}`,
    };
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
