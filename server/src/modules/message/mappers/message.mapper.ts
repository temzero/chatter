import { Injectable } from '@nestjs/common';
import { Message } from '../entities/message.entity';
import { MessageResponseDto } from '../dto/responses/message-response.dto';
import { plainToInstance } from 'class-transformer';
import { AttachmentResponseDto } from '../dto/responses/attachment-response.dto';
import { CallResponseDto } from 'src/modules/call/dto/call-response.dto';
import { Call } from 'src/modules/call/entities/call.entity';

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
      attachments: plainToInstance(
        AttachmentResponseDto,
        message.attachments || [],
      ),

      // ✅ Call
      call: message.call ? this.mapCall(message.call) : undefined,

      replyToMessage: this.mapNestedMessage(message.replyToMessage),
      forwardedFromMessage: this.mapNestedMessage(message.forwardedFromMessage),
    };

    return plainToInstance(MessageResponseDto, responseData, {
      excludeExtraneousValues: true,
    });
  }

  private mapNestedMessage(
    msg: Message | null | undefined,
    depth = 0,
    maxDepth = 3,
  ): MessageResponseDto | null {
    if (!msg || depth > maxDepth) return null;

    const senderId = msg.senderId || msg.sender?.id || '';
    const sender = this.mapSender(senderId, msg.sender);

    return {
      id: msg.id,
      content: msg.content,
      createdAt: msg.createdAt,
      attachments: plainToInstance(
        AttachmentResponseDto,
        msg.attachments || [],
      ),
      sender,
      systemEvent: msg.systemEvent,

      // ✅ Map nested call if present
      call: msg.call ? this.mapCall(msg.call) : undefined,

      replyToMessage: this.mapNestedMessage(
        msg.replyToMessage,
        depth + 1,
        maxDepth,
      ),
      forwardedFromMessage: this.mapNestedMessage(
        msg.forwardedFromMessage,
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

  private mapCall(call: Call): CallResponseDto {
    return plainToInstance(CallResponseDto, {
      id: call.id,
      status: call.status,
      startedAt: call.startedAt,
      endedAt: call.endedAt,
      updatedAt: call.updatedAt,
      initiator: call.initiator
        ? {
            id: call.initiator.id,
            userId: call.initiator.userId,
            nickname: call.initiator.nickname,
          }
        : null,
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
