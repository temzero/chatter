import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Server } from 'socket.io';
import { ChatMemberService } from '../../chat-member/chat-member.service';
import { BlockService } from '../../block/block.service';
import { PresenceUpdateEvent } from '../constants/presenceEvent.type';
import { ChatEvent, PresenceEvent } from '../constants/websocket-events';
import { CallEvent } from '../constants/websocket-events';
import { IncomingCallResponse } from '../constants/callPayload.type';

/**
 * Enhanced payload structure that includes optional metadata
 * about the message or event being sent
 */
interface EnhancedPayload {
  payload: any;
  meta?: {
    isMuted?: boolean; // Whether the recipient has muted the chat
    isOwnMessage?: boolean; // Whether the message is from the user themselves
  };
}

@Injectable()
export class WebsocketService implements OnModuleDestroy {
  private server: Server;

  // Maps user IDs to their active socket connections
  private readonly userSocketMap = new Map<string, Set<string>>();

  // Maps socket IDs to user IDs for quick lookup
  private readonly socketUserMap = new Map<string, string>();

  // Tracks which sockets are subscribed to which users' presence updates
  private readonly presenceSubscriptions = new Map<string, Set<string>>();

  // Tracks all presence subscriptions for each socket (reverse of presenceSubscriptions)
  private readonly socketSubscriptions = new Map<string, Set<string>>();

  // Stores pending call invitations with their timestamps for expiration
  private readonly pendingCalls = new Map<string, IncomingCallResponse>();

  // Interval handle for cleaning up expired calls
  private readonly callCleanupInterval: NodeJS.Timeout;

  constructor(
    private readonly chatMemberService: ChatMemberService,
    private readonly blockService: BlockService,
  ) {
    // Set up interval to clean up expired calls every minute
    this.callCleanupInterval = setInterval(
      () => this.cleanupExpiredCalls(),
      60000,
    );
  }

  /**
   * Clean up resources when the module is destroyed
   */
  onModuleDestroy() {
    clearInterval(this.callCleanupInterval);
  }

  /**
   * Set the Socket.IO server instance
   * @param server - The Socket.IO server instance
   */
  setServer(server: Server) {
    this.server = server;
  }

  /**
   * Add a pending call to the tracking map
   * @param key - Unique identifier for the call
   * @param callData - Call data including timestamp
   */
  addPendingCall(key: string, callData: IncomingCallResponse): void {
    this.pendingCalls.set(key, { ...callData, timestamp: Date.now() });
  }

  /**
   * Retrieve and remove a pending call from the tracking map
   * @param key - Unique identifier for the call
   * @returns The call data if found, undefined otherwise
   */
  getAndRemovePendingCall(key: string): IncomingCallResponse | undefined {
    const call = this.pendingCalls.get(key);
    this.pendingCalls.delete(key);
    return call;
  }

  /**
   * Clean up calls that have been pending for more than 60 seconds
   */
  private cleanupExpiredCalls(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    this.pendingCalls.forEach((call, key) => {
      if (now - call.timestamp > 60000) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach((key) => this.pendingCalls.delete(key));
  }

  /**
   * Register a new user connection
   * @param userId - The ID of the connecting user
   * @param socketId - The ID of the socket connection
   * @returns True if this is the first connection for the user
   */
  userConnected(userId: string, socketId: string): boolean {
    this.socketUserMap.set(socketId, userId);

    const isFirstConnection = !this.userSocketMap.has(userId);
    if (isFirstConnection) {
      this.userSocketMap.set(userId, new Set());
    }
    this.userSocketMap.get(userId)!.add(socketId);

    return isFirstConnection;
  }

  /**
   * Handle user disconnection
   * @param socketId - The ID of the disconnecting socket
   * @returns Object containing userId and whether this was their last connection, or null if user not found
   */
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

  /**
   * Subscribe a socket to presence updates for a specific user
   * @param socketId - The ID of the subscribing socket
   * @param targetUserId - The ID of the user whose presence is being subscribed to
   */
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

  /**
   * Remove all presence subscriptions for a socket when it disconnects
   * @param socketId - The ID of the disconnecting socket
   */
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

  /**
   * Unsubscribe a socket from a specific user's presence updates
   * @param socketId - The ID of the socket to unsubscribe
   * @param targetUserId - The ID of the user to stop receiving presence updates for
   * @returns True if operation was successful
   */
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

  /**
   * Check if a user is currently online
   * @param userId - The ID of the user to check
   * @returns True if the user has at least one active connection
   */
  isUserOnline(userId: string): boolean {
    return this.userSocketMap.has(userId);
  }

  /**
   * Get online status for multiple users
   * @param userIds - Array of user IDs to check
   * @returns Object mapping user IDs to their online status
   */
  getUsersStatus(userIds: string[]): Record<string, boolean> {
    const result: Record<string, boolean> = {};
    userIds.forEach((userId) => {
      result[userId] = this.isUserOnline(userId);
    });
    return result;
  }

  /**
   * Get all active socket IDs for a user, with validation
   * @param userId - The ID of the user
   * @returns Array of valid socket IDs for the user
   */
  getUserSocketIds(userId: string): string[] {
    const sockets = this.userSocketMap.get(userId);
    if (!sockets) return [];

    // Filter out any sockets that are no longer connected
    const validSockets = Array.from(sockets).filter((socketId) =>
      this.server?.sockets?.sockets?.has(socketId),
    );

    // Update the map if any sockets were removed
    if (validSockets.length !== sockets.size) {
      this.userSocketMap.set(userId, new Set(validSockets));
    }

    return validSockets;
  }

  /**
   * Notify all subscribers about a user's presence change
   * @param userId - The ID of the user whose presence changed
   * @param isOnline - The new online status
   */
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

  /**
   * Emit an event to all members of a chat with additional metadata
   * @param chatId - The ID of the chat
   * @param event - The event type to emit
   * @param payload - The data to send
   * @param options - Additional options:
   *   - senderId: The ID of the user sending the message
   *   - excludeSender: Whether to exclude the sender from recipients
   */
  async emitToChatMembers(
    chatId: string,
    event: ChatEvent | CallEvent,
    payload: any,
    options: {
      senderId?: string;
      excludeSender?: boolean;
    } = {},
  ) {
    const members =
      await this.chatMemberService.getMemberUserIdsAndMuteStatus(chatId);

    const blockedUserIds = options.senderId
      ? await this.blockService.getBlockedUserIds(options.senderId)
      : [];

    for (const { userId, isMuted } of members) {
      // Skip sender if excludeSender is true
      if (
        options.excludeSender &&
        options.senderId &&
        userId === options.senderId
      ) {
        continue;
      }

      // Skip blocked users
      if (options.senderId && blockedUserIds.includes(userId)) {
        continue;
      }

      // Enhance payload with metadata
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const enhancedPayload: EnhancedPayload = {
        ...payload,
        meta: {
          isMuted,
          isOwnMessage: options.senderId ? userId === options.senderId : false,
        },
      };

      this.emitToUser(userId, event, enhancedPayload);
    }
  }

  /**
   * Emit an event to a specific user across all their active connections
   * @param userId - The ID of the user to send to
   * @param event - The event type to emit
   * @param payload - The data to send
   */
  emitToUser(userId: string, event: string, payload: any) {
    const socketIds = this.getUserSocketIds(userId);
    for (const socketId of socketIds) {
      this.server.to(socketId).emit(event, payload);
    }
  }
}
