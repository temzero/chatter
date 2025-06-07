// websocket.service.ts
import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

type UserConnectionStatus = {
  userId: string;
  wasLastConnection: boolean;
} | null;

@Injectable()
export class WebsocketService {
  private readonly userSocketMap = new Map<string, Set<string>>(); // userId → socketIds
  private readonly socketUserMap = new Map<string, string>(); // socketId → userId
  private server: Server;

  setServer(server: Server) {
    this.server = server;
  }

  getServer(): Server {
    return this.server;
  }

  userConnected(userId: string, socketId: string): boolean {
    // Track socket → user mapping
    this.socketUserMap.set(socketId, userId);
    // Track user → sockets mapping
    if (!this.userSocketMap.has(userId)) {
      this.userSocketMap.set(userId, new Set());
      return true; // First connection
    }

    const sockets = this.userSocketMap.get(userId);
    if (sockets) {
      sockets.add(socketId);
    }
    return false;
  }

  userDisconnected(socketId: string): UserConnectionStatus {
    const userId = this.socketUserMap.get(socketId);
    if (!userId) return null;

    // Cleanup socket → user mapping
    this.socketUserMap.delete(socketId);

    // Cleanup user → sockets mapping
    const sockets = this.userSocketMap.get(userId);
    if (sockets) {
      sockets.delete(socketId);
      if (sockets.size === 0) {
        this.userSocketMap.delete(userId);
        return { userId, wasLastConnection: true };
      }
    }

    return { userId, wasLastConnection: false };
  }

  getUserSocketIds(userId: string): string[] {
    const sockets = this.userSocketMap.get(userId);
    return sockets ? Array.from(sockets) : [];
  }

  isUserOnline(userId: string): boolean {
    return this.userSocketMap.has(userId);
  }
}
