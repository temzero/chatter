import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { ChatMemberService } from '../chat-member/chat-member.service';
import { BlockService } from '../block/block.service';

interface EnhancedPayload {
  payload: any;
  meta?: {
    isMuted?: boolean;
    isOwnMessage?: boolean;
  };
}

@Injectable()
export class WebsocketService {
  private server: Server;

  // Tracks all active connections
  private readonly userSocketMap = new Map<string, Set<string>>(); // userId → socketIds
  private readonly socketUserMap = new Map<string, string>(); // socketId → userId

  // Presence subscription system
  private readonly presenceSubscriptions = new Map<string, Set<string>>(); // targetUserId → subscriberSocketIds
  private readonly socketSubscriptions = new Map<string, Set<string>>(); // socketId → targetUserIds

  constructor(
    private readonly chatMemberService: ChatMemberService,
    private readonly blockService: BlockService,
  ) {}

  setServer(server: Server) {
    this.server = server;
  }

  // Connection Management
  userConnected(userId: string, socketId: string): boolean {
    this.socketUserMap.set(socketId, userId);

    const isFirstConnection = !this.userSocketMap.has(userId);
    if (isFirstConnection) {
      this.userSocketMap.set(userId, new Set());
    }
    this.userSocketMap.get(userId)!.add(socketId);

    return isFirstConnection;
  }

  userDisconnected(
    socketId: string,
  ): { userId: string; wasLastConnection: boolean } | null {
    const userId = this.socketUserMap.get(socketId);
    if (!userId) return null;

    this.socketUserMap.delete(socketId);
    const userSockets = this.userSocketMap.get(userId);
    if (!userSockets) return null;

    userSockets.delete(socketId);
    const wasLastConnection = userSockets.size === 0;

    if (wasLastConnection) {
      this.userSocketMap.delete(userId);
    }

    // Clean up presence subscriptions
    this.removeAllSubscriptionsForSocket(socketId);

    return { userId, wasLastConnection };
  }

  // Presence Subscription System
  addPresenceSubscriber(socketId: string, targetUserId: string): void {
    // Add to target's subscriber list
    if (!this.presenceSubscriptions.has(targetUserId)) {
      this.presenceSubscriptions.set(targetUserId, new Set());
    }
    this.presenceSubscriptions.get(targetUserId)!.add(socketId);

    // Add to socket's subscription list
    if (!this.socketSubscriptions.has(socketId)) {
      this.socketSubscriptions.set(socketId, new Set());
    }
    this.socketSubscriptions.get(socketId)!.add(targetUserId);
  }

  removeAllSubscriptionsForSocket(socketId: string): void {
    // Remove from all target users' subscription lists
    const targetUserIds = this.socketSubscriptions.get(socketId);
    if (targetUserIds) {
      for (const targetUserId of targetUserIds) {
        const subscribers = this.presenceSubscriptions.get(targetUserId);
        if (subscribers) {
          subscribers.delete(socketId);
          if (subscribers.size === 0) {
            this.presenceSubscriptions.delete(targetUserId);
          }
        }
      }
      this.socketSubscriptions.delete(socketId);
    }
  }

  getSubscribersForUser(userId: string): string[] {
    return Array.from(this.presenceSubscriptions.get(userId) || []);
  }

  // Status Utilities
  isUserOnline(userId: string): boolean {
    return this.userSocketMap.has(userId);
  }

  getUsersStatus(userIds: string[]): Record<string, boolean> {
    const result: Record<string, boolean> = {};
    userIds.forEach((userId) => {
      result[userId] = this.isUserOnline(userId);
    });
    return result;
  }

  // Helper Methods
  // getUserSocketIds(userId: string): string[] {
  //   const sockets = this.userSocketMap.get(userId);
  //   return sockets ? Array.from(sockets) : [];
  // }

  getUserSocketIds(userId: string): string[] {
    const sockets = this.userSocketMap.get(userId);
    if (!sockets) return [];

    // Verify each socket still exists
    const validSockets = Array.from(sockets).filter((socketId) =>
      this.server?.sockets?.sockets?.has(socketId),
    );

    // Clean up invalid sockets
    if (validSockets.length !== sockets.size) {
      this.userSocketMap.set(userId, new Set(validSockets));
      console.warn(
        `[WS Cleanup] Removed ${sockets.size - validSockets.length} stale sockets for ${userId}`,
      );
    }

    return validSockets;
  }

  async emitToChatMembers(
    chatId: string,
    event: string,
    payload: any,
    options: {
      senderId?: string;
      excludeSender?: boolean;
    } = {},
  ) {
    console.log(`🔔 Emitting event '${event}' to chat '${chatId}'`);
    const members =
      await this.chatMemberService.getMemberUserIdsAndMuteStatus(chatId);
    console.log('👥 Members to notify:', members);

    const blockedUserIds = options.senderId
      ? await this.blockService.getBlockedUserIds(options.senderId)
      : [];
    console.log('⛔ Blocked userIds:', blockedUserIds);

    for (const { userId, isMuted } of members) {
      console.log(`➡️ Checking member: ${userId}, muted: ${isMuted}`);

      if (
        options.excludeSender &&
        options.senderId &&
        userId === options.senderId
      ) {
        console.log(`🚫 Skipping sender (excludeSender = true): ${userId}`);
        continue;
      }

      if (options.senderId && blockedUserIds.includes(userId)) {
        console.log(`🚫 Skipping blocked user: ${userId}`);
        continue;
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const enhancedPayload: EnhancedPayload = {
        ...payload,
        meta: {
          isMuted,
          isOwnMessage: options.senderId ? userId === options.senderId : false,
        },
      };

      console.log(`📤 Emitting to user ${userId}:`, {
        event,
        payload: enhancedPayload,
      });

      this.emitToUser(userId, event, enhancedPayload);
    }
  }

  emitToUser(userId: string, event: string, payload: any) {
    const socketIds = this.getUserSocketIds(userId);
    console.log(`🔌 Emitting to user ${userId} via sockets:`, socketIds);

    for (const socketId of socketIds) {
      console.log(`📡 Sending to socket ${socketId}`);
      this.server.to(socketId).emit(event, payload);
    }
  }
}
