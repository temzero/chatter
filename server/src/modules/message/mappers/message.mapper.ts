// message.mapper.ts
import { Injectable } from '@nestjs/common';
import { Message } from '../entities/message.entity';
import { MessageResponseDto } from '../dto/responses/message-response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class MessageMapper {
  toResponseDto(message: Message): MessageResponseDto {
    const senderMember = message.chat?.members?.[0];
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
      replyCount: message.replyCount,
      editedAt: message.editedAt,
      isDeleted: message.isDeleted,
      deletedAt: message.deletedAt,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
      reactions: message.reactions,
      attachments: message.attachments,
    };

    return plainToInstance(MessageResponseDto, responseData, {
      excludeExtraneousValues: true,
    });
  }
}
