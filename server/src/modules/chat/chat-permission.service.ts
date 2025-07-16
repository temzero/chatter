// src/modules/chat/chat-permission.service.ts
import { Injectable } from '@nestjs/common';
import { BlockService } from '../block/block.service';
import { Chat } from './entities/chat.entity';
import { ChatType } from './constants/chat-types.constants';
import { Message } from '../message/entities/message.entity';

@Injectable()
export class ChatPermissionService {
  constructor(private readonly blockService: BlockService) {}

  async canSendMessage(chat: Chat, senderId: string): Promise<boolean> {
    if (chat.type === ChatType.DIRECT) {
      // For direct chat, check if either user blocked the other
      const otherUserId = chat.members.find(
        (m) => m.userId !== senderId,
      )?.userId;
      if (!otherUserId) return false;

      return (
        !(await this.blockService.isBlocked(senderId, otherUserId)) &&
        !(await this.blockService.isBlocked(otherUserId, senderId))
      );
    }

    // For group chat, check if sender is blocked by any member
    const memberIds = chat.members.map((m) => m.userId);
    for (const memberId of memberIds) {
      if (await this.blockService.isBlocked(memberId, senderId)) {
        return false;
      }
    }

    return true;
  }

  async filterBlockedMessages(
    messages: Message[],
    userId: string,
  ): Promise<Message[]> {
    const blockedUserIds = await this.blockService.getBlockedUsers(userId);
    return messages.filter(
      (message) => !blockedUserIds.includes(message.senderId),
    );
  }

  async getBlockStatusForChat(
    chat: Chat,
    userId: string,
  ): Promise<{
    isBlocked: boolean;
    isBlockedBy: boolean;
    blockedUsers: string[];
  }> {
    if (chat.type === ChatType.DIRECT) {
      const otherUserId = chat.members.find((m) => m.userId !== userId)?.userId;
      if (!otherUserId) {
        return {
          isBlocked: false,
          isBlockedBy: false,
          blockedUsers: [],
        };
      }

      const isBlocked = await this.blockService.isBlocked(userId, otherUserId);
      const isBlockedBy = await this.blockService.isBlocked(
        otherUserId,
        userId,
      );

      return {
        isBlocked,
        isBlockedBy,
        blockedUsers: isBlocked ? [otherUserId] : isBlockedBy ? [userId] : [],
      };
    }

    // For group chat
    const memberIds = chat.members.map((m) => m.userId);
    const blockedUsers: string[] = [];

    for (const memberId of memberIds) {
      if (await this.blockService.isBlocked(userId, memberId)) {
        blockedUsers.push(memberId);
      }
    }

    return {
      isBlocked: blockedUsers.length > 0,
      isBlockedBy: false, // In group chats, we don't consider being blocked by others
      blockedUsers,
    };
  }
}
