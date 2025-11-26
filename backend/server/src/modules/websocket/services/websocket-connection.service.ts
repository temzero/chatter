import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { PresenceUpdateEvent } from 'src/shared/types/interfaces/presenceEvent';
import { PresenceEvent } from 'src/shared/types/enums/websocket-events.enum';

@Injectable()
export class WebsocketConnectionService {
  private server: Server;

  // Connection tracking
  private readonly userSocketMap = new Map<string, Set<string>>();
  private readonly socketUserMap = new Map<string, string>();

  // Presence subscriptions
  private readonly presenceSubscriptions = new Map<string, Set<string>>();
  private readonly socketSubscriptions = new Map<string, Set<string>>();

  setServer(server: Server) {
    this.server = server;
  }

  /* Connection Management */
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

    this.removeAllSubscriptionsForSocket(socketId);
    return { userId, wasLastConnection };
  }

  getUserSocketIds(userId: string): string[] {
    const sockets = this.userSocketMap.get(userId);
    if (!sockets) return [];

    const validSockets = Array.from(sockets).filter((socketId) =>
      this.server?.sockets?.sockets?.has(socketId),
    );

    if (validSockets.length !== sockets.size) {
      this.userSocketMap.set(userId, new Set(validSockets));
    }

    return validSockets;
  }

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

  /* Presence Management */
  addPresenceSubscriber(socketId: string, targetUserId: string): void {
    if (!this.presenceSubscriptions.has(targetUserId)) {
      this.presenceSubscriptions.set(targetUserId, new Set());
    }
    this.presenceSubscriptions.get(targetUserId)!.add(socketId);

    if (!this.socketSubscriptions.has(socketId)) {
      this.socketSubscriptions.set(socketId, new Set());
    }
    this.socketSubscriptions.get(socketId)!.add(targetUserId);
  }

  removeAllSubscriptionsForSocket(socketId: string): void {
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

  removePresenceSubscriber(socketId: string, targetUserId: string): boolean {
    const targetSubscribers = this.presenceSubscriptions.get(targetUserId);
    if (targetSubscribers) {
      targetSubscribers.delete(socketId);
      if (targetSubscribers.size === 0) {
        this.presenceSubscriptions.delete(targetUserId);
      }
    }

    const socketSubscriptions = this.socketSubscriptions.get(socketId);
    if (socketSubscriptions) {
      socketSubscriptions.delete(targetUserId);
      if (socketSubscriptions.size === 0) {
        this.socketSubscriptions.delete(socketId);
      }
    }

    return true;
  }

  notifyPresenceSubscribers(userId: string, isOnline: boolean): void {
    try {
      const subscribers = this.presenceSubscriptions.get(userId);
      if (!subscribers || subscribers.size === 0) return;

      const payload: PresenceUpdateEvent = {
        userId,
        isOnline,
        ...(!isOnline && {
          lastSeen: new Date().toISOString(),
        }),
      };

      this.server
        .to(Array.from(subscribers))
        .emit(PresenceEvent.UPDATE, payload);
    } catch (error) {
      console.error(`[WS] Presence notification error for ${userId}:`, error);
    }
  }
}
