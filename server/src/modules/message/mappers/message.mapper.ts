import { Injectable } from '@nestjs/common';
import { Message } from '../entities/message.entity';
import { MessageResponseDto } from '../dto/responses/message-response.dto';
import { plainToInstance } from 'class-transformer';
import { mapCallToCallLiteResponse } from '@/modules/call/mappers/callLite.mapper';
import { mapAttachmentsToAttachmentResDto } from '@/modules/attachment/mappers/attachment.mapper';

@Injectable()
export class MessageMapper {
  mapMessageToMessageResDto(
    message: Message,
    senderNickname?: string,
  ): MessageResponseDto {
    const groupedReactions = this.groupReactions(message.reactions || []);

    const responseData = {
      id: message.id,
      chatId: message.chatId,
      sender: this.mapSender(message.senderId, message.sender, senderNickname),
      systemEvent: message.systemEvent,
      content: message.content,
      status: message.status,
      isPinned: message.isPinned,
      pinnedAt: message.pinnedAt,
      replyToMessageId: message.replyToMessageId,
      replyCount: message.replyCount,
      isImportant: message.isImportant,
      editedAt: message.editedAt,
      isDeleted: message.isDeleted,
      deletedAt: message.deletedAt,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
      reactions: groupedReactions,
      attachments: mapAttachmentsToAttachmentResDto(
        message.attachments,
        message.chatId,
        message.id,
      ),

      // ✅ Call
      call: message.call ? mapCallToCallLiteResponse(message.call) : undefined,

      replyToMessage: this.mapNestedMessage(message.replyToMessage),
      forwardedFromMessage: this.mapNestedMessage(message.forwardedFromMessage),
    };

    return plainToInstance(MessageResponseDto, responseData, {
      excludeExtraneousValues: true,
    });
  }

  private mapNestedMessage(
    nestedMessage: Message | null | undefined,
    depth = 0,
    maxDepth = 3,
  ): MessageResponseDto | null {
    if (!nestedMessage || depth > maxDepth) return null;

    const senderId = nestedMessage.senderId || nestedMessage.sender?.id || '';
    const sender = this.mapSender(senderId, nestedMessage.sender);

    return {
      id: nestedMessage.id,
      content: nestedMessage.content,
      createdAt: nestedMessage.createdAt,
      attachments: mapAttachmentsToAttachmentResDto(
        nestedMessage.attachments,
        nestedMessage.chatId,
        nestedMessage.id,
      ),
      sender,
      systemEvent: nestedMessage.systemEvent,

      // ✅ Map nested call if present
      call: nestedMessage.call
        ? mapCallToCallLiteResponse(nestedMessage.call)
        : undefined,

      // call: nestedMessage.call,

      replyToMessage: this.mapNestedMessage(
        nestedMessage.replyToMessage,
        depth + 1,
        maxDepth,
      ),
      forwardedFromMessage: this.mapNestedMessage(
        nestedMessage.forwardedFromMessage,
        depth + 1,
        maxDepth,
      ),
    } as MessageResponseDto;
  }

  private mapSender(
    senderId: string,
    sender: Message['sender'] | undefined,
    nickname?: string | null,
  ) {
    return {
      id: senderId,
      avatarUrl: sender?.avatarUrl || null,
      displayName:
        nickname ||
        `${sender?.firstName ?? ''} ${sender?.lastName ?? ''}`.trim() ||
        'Unknown',
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
