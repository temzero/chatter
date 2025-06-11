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

    console.log('isFirstConnection', isFirstConnection);

    if (isFirstConnection) {
      const chatIds = await this.chatMemberService.getChatIdsByUserId(userId);
      console.log('User connected :', userId);

      for (const chatId of chatIds) {
        const otherMembers =
          await this.chatMemberService.getAllMemberIds(chatId);

        otherMembers.forEach((memberId) => {
          if (memberId !== userId && this.isUserOnline(memberId)) {
            this.server
              .to(this.getUserSocketIds(memberId))
              .emit('chat:statusChanged', {
                chatId,
                isOnline: true,
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

    this.socketUserMap.delete(socketId);
    const userSockets = this.userSocketMap.get(userId);
    if (!userSockets) return null;

    userSockets.delete(socketId);
    const wasLastConnection = userSockets.size === 0;

    if (wasLastConnection) {
      this.userSocketMap.delete(userId);
      const chatIds = await this.chatMemberService.getChatIdsByUserId(userId);

      for (const chatId of chatIds) {
        const memberIds = await this.chatMemberService.getAllMemberIds(chatId);
        const otherOnlineMembers = memberIds.filter(
          (memberId) => memberId !== userId && this.isUserOnline(memberId),
        );

        if (otherOnlineMembers.length === 1) {
          const remainingUserId = otherOnlineMembers[0];
          const remainingUserSockets = this.userSocketMap.get(remainingUserId);

          if (remainingUserSockets) {
            for (const socketId of remainingUserSockets) {
              this.server.to(socketId).emit('chat:statusChanged', {
                chatId,
                userId,
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

  async emitToChatMembers(chatId: string, event: string, payload: any) {
    const memberIds = await this.chatMemberService.getAllMemberIds(chatId);

    for (const userId of memberIds) {
      const socketIds = this.getUserSocketIds(userId);
      console.log('socketIds', socketIds);
      for (const socketId of socketIds) {
        this.server.to(socketId).emit(event, payload);
      }
    }
  }

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
