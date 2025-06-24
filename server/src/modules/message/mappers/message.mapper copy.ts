// message.mapper.ts
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
      senderId: message.senderId,
      senderNickname: senderMember?.nickname || null,
      senderFirstName: message.sender?.firstName || null,
      senderLastName: message.sender?.lastName || null,
      senderAvatarUrl: message.sender?.avatarUrl || null,
      type: message.type,
      content: message.content,
      status: message.status,
      isPinned: message.isPinned,
      pinnedAt: message.pinnedAt,
      replyToMessageId: message.replyToMessageId,
      replyToMessage: message.replyToMessage,
      replyCount: message.replyCount,
      editedAt: message.editedAt,
      isDeleted: message.isDeleted,
      deletedAt: message.deletedAt,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
      reactions: groupedReactions, // ✅ transformed here
      attachments: message.attachments,
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
