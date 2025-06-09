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

    // 1. Immediately remove the socket from mappings
    this.socketUserMap.delete(socketId);
    const userSockets = this.userSocketMap.get(userId);
    if (!userSockets) return null;

    userSockets.delete(socketId);
    const wasLastConnection = userSockets.size === 0;

    if (wasLastConnection) {
      this.userSocketMap.delete(userId);

      // 2. Get all chats the user is in
      const chatIds = await this.chatMemberService.getChatIdsByUserId(userId);

      // 3. Process each chat in parallel
      await Promise.all(
        chatIds.map(async (chatId) => {
          // 4. Get all members in this chat
          const allMembers =
            await this.chatMemberService.getAllMemberIds(chatId);

          // 5. Calculate new online status for this chat (excluding the disconnecting user)
          const remainingOnlineMembers = allMembers.filter(
            (memberId) => memberId !== userId && this.isUserOnline(memberId),
          );
          const chatIsNowOnline = remainingOnlineMembers.length > 0;

          // 6. Get sockets of all online members who should be notified
          const socketsToNotify = remainingOnlineMembers.flatMap((memberId) =>
            this.getUserSocketIds(memberId),
          );

          // 7. Emit to all relevant sockets
          if (socketsToNotify.length > 0) {
            this.server.to(socketsToNotify).emit('chat:statusChanged', {
              chatId,
              isOnline: chatIsNowOnline,
            });
          }
        }),
      );

      return { userId, wasLastConnection: true };
    }

    return { userId, wasLastConnection: false };
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
  async hasAnyOtherMemberOnline(
    chatId: string,
    excludeUserId: string,
  ): Promise<boolean> {
    const memberIds = await this.chatMemberService.getAllMemberIds(chatId);
    return memberIds
      .filter((id) => id !== excludeUserId)
      .some((id) => this.isUserOnline(id));
  }
}
