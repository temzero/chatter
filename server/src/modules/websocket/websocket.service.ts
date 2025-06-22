import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { ChatMemberService } from '../chat-member/chat-member.service';

@Injectable()
export class WebsocketService {
  private server: Server;

  // Tracks all active connections
  private readonly userSocketMap = new Map<string, Set<string>>(); // userId → socketIds
  private readonly socketUserMap = new Map<string, string>(); // socketId → userId

  // Presence subscription system
  private readonly presenceSubscriptions = new Map<string, Set<string>>(); // targetUserId → subscriberSocketIds
  private readonly socketSubscriptions = new Map<string, Set<string>>(); // socketId → targetUserIds

  constructor(private readonly chatMemberService: ChatMemberService) {}

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
  getUserSocketIds(userId: string): string[] {
    const sockets = this.userSocketMap.get(userId);
    return sockets ? Array.from(sockets) : [];
  }

  async emitToChatMembers(chatId: string, event: string, payload: any) {
    const memberIds = await this.chatMemberService.getAllMemberIds(chatId);

    for (const userId of memberIds) {
      const socketIds = this.getUserSocketIds(userId);
      // console.log('socketIds', socketIds);
      for (const socketId of socketIds) {
        this.server.to(socketId).emit(event, payload);
      }
    }
  }
}
