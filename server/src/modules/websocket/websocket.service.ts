import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { ChatMemberService } from 'src/modules/chat-member/chat-member.service';

type UserConnectionStatus = {
  userId: string;
  wasLastConnection: boolean;
} | null;

@Injectable()
export class WebsocketService {
  private readonly userSocketMap = new Map<string, Set<string>>(); // userId → socketIds
  private readonly socketUserMap = new Map<string, string>(); // socketId → userId
  private server: Server;

  constructor(private readonly chatMemberService: ChatMemberService) {}

  setServer(server: Server) {
    this.server = server;
  }

  getServer(): Server {
    return this.server;
  }

  async userConnected(userId: string, socketId: string): Promise<boolean> {
    this.socketUserMap.set(socketId, userId);

    const isFirstConnection = !this.userSocketMap.has(userId);
    if (!this.userSocketMap.has(userId)) {
      this.userSocketMap.set(userId, new Set([socketId]));
    } else {
      this.userSocketMap.get(userId)!.add(socketId);
    }

    if (isFirstConnection) {
      // Get all chats this user is in
      const chatIds = await this.chatMemberService.getChatIdsByUserId(userId);

      // For each chat, notify members that status might have changed
      for (const chatId of chatIds) {
        const otherMembers =
          await this.chatMemberService.getAllMemberIds(chatId);

        // Notify each member individually (no need for chat room joins)
        otherMembers.forEach((memberId) => {
          if (memberId !== userId && this.isUserOnline(memberId)) {
            this.server
              .to(this.getUserSocketIds(memberId))
              .emit('chat:statusChanged', {
                chatId,
                isOnline: true, // because this user just came online
              });
          }
        });
      }
    }

    return isFirstConnection;
  }

  async userDisconnected(socketId: string): Promise<UserConnectionStatus> {
    const userId = this.socketUserMap.get(socketId);
    if (!userId) return null;

    // 1. Clean up socket mappings
    this.socketUserMap.delete(socketId);
    const userSockets = this.userSocketMap.get(userId);
    if (!userSockets) return null;

    userSockets.delete(socketId);
    const wasLastConnection = userSockets.size === 0;

    // 2. If this was the user's last connection, proceed with notifications
    if (wasLastConnection) {
      this.userSocketMap.delete(userId);

      // 3. Get all chats the user is in
      const chatIds = await this.chatMemberService.getChatIdsByUserId(userId);

      // 4. For each chat, check online members and notify as needed
      for (const chatId of chatIds) {
        const memberIds = await this.chatMemberService.getAllMemberIds(chatId);

        // Find other online members (excluding the disconnecting user)
        const otherOnlineMembers = memberIds.filter(
          (memberId) => memberId !== userId && this.isUserOnline(memberId),
        );

        // If exactly one other user is online, notify them
        if (otherOnlineMembers.length === 1) {
          const remainingUserId = otherOnlineMembers[0];
          const remainingUserSockets = this.userSocketMap.get(remainingUserId);

          if (remainingUserSockets) {
            // Notify all sockets of the remaining user
            for (const socketId of remainingUserSockets) {
              this.server.to(socketId).emit('chat:statusChanged', {
                chatId,
                userId, // The user who went offline
                isOnline: false,
              });
            }
          }
        }
      }
    }

    return { userId, wasLastConnection };
  }

  getOnlineUsers(): string[] {
    return Array.from(this.userSocketMap.keys());
  }

  getUsersStatus(userIds: string[]): Record<string, boolean> {
    const result: Record<string, boolean> = {};
    userIds.forEach((userId) => {
      result[userId] = this.userSocketMap.has(userId);
    });
    return result;
  }

  getUserSocketIds(userId: string): string[] {
    const sockets = this.userSocketMap.get(userId);
    return sockets ? Array.from(sockets) : [];
  }

  isUserOnline(userId: string): boolean {
    return this.userSocketMap.has(userId);
  }

  // Utility to check if any other chat member is online (excluding one user)
  async hasMoreThanTwoUsersOnline(
    chatId: string,
    excludeUserId: string,
  ): Promise<boolean> {
    const memberIds = await this.chatMemberService.getAllMemberIds(chatId);
    const onlineCount = memberIds
      .filter((id) => id !== excludeUserId)
      .filter((id) => this.isUserOnline(id)).length;
    return onlineCount > 2;
  }
}
