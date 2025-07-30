import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { WebsocketService } from './websocket.service';
import { ChatMemberService } from '../chat-member/chat-member.service';
import { emitWsError } from './utils/emitWsError';
import type { AuthenticatedSocket } from './constants/authenticatedSocket.type';

@WebSocketGateway({
  pingInterval: 10000, // Send ping every 10 seconds
  pingTimeout: 15000, // Wait 15 seconds for pong before closing
  cors: { origin: '*' },
})
export class GlobalGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly websocketService: WebsocketService,
    private readonly chatMemberService: ChatMemberService,
  ) {}

  afterInit(server: Server) {
    this.websocketService.setServer(server);
    console.log('[WS] WebSocket server initialized');
  }

  handleConnection(client: AuthenticatedSocket) {
    try {
      const userId = client.data.userId;
      if (!userId) {
        console.warn('[WS] Connection rejected - missing userId');
        client.disconnect(true);
        return;
      }

      console.log(`[WS] New connection: ${client.id} for user ${userId}`);

      // 1. Register connection with enhanced validation
      const isFirstConnection = this.websocketService.userConnected(
        userId,
        client.id,
      );

      // 2. Add enhanced heartbeat monitoring
      // this.setupHeartbeat(client);

      // 3. Notify presence subscribers
      if (isFirstConnection) {
        this.notifyPresenceSubscribers(userId, true);
      }

      // 4. Send connection acknowledgement with server time
      client.emit('connection_ack', {
        success: true,
        serverTime: new Date().toISOString(),
        pingInterval: 10000,
      });

      console.log(`[WS] Connection established for ${userId} (${client.id})`);
    } catch (error) {
      console.error(`[WS] Connection error for ${client.id}:`, error);
      emitWsError(client, error, 'Connection failed');
      client.disconnect(true);
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    console.log(`[WS] Disconnecting: ${client.id}`);

    const result = this.websocketService.userDisconnected(client.id);
    if (!result) {
      console.warn(`[WS] No user found for disconnected socket ${client.id}`);
      return;
    }

    // Notify presence subscribers with delay to allow for reconnection
    setTimeout(() => {
      if (!this.websocketService.isUserOnline(result.userId)) {
        this.notifyPresenceSubscribers(result.userId, false);
      }
    }, 5000); // 5-second grace period for reconnection

    console.log(`[WS] User ${result.userId} disconnected (${client.id})`);
  }

  // --- Helper Methods ---

  private setupHeartbeat(client: AuthenticatedSocket) {
    let missedPings = 0;

    const heartbeatInterval = setInterval(() => {
      if (missedPings > 2) {
        console.warn(`[WS] Terminating stale connection ${client.id}`);
        clearInterval(heartbeatInterval);
        client.disconnect(true);
        return;
      }
      missedPings++;
      client.emit('ping', { timestamp: Date.now() });
    }, 10000);

    const pingHandler = (ack: () => void) => {
      missedPings = 0;
      ack();
    };

    client.on('pong', pingHandler);
    client.once('disconnect', () => clearInterval(heartbeatInterval));
  }

  private notifyPresenceSubscribers(userId: string, isOnline: boolean) {
    try {
      const subscribers = this.websocketService.getSubscribersForUser(userId);
      if (subscribers.length > 0) {
        console.log(
          `[WS] Notifying ${subscribers.length} subscribers of ${userId}'s status`,
        );
        subscribers.forEach((socketId) => {
          this.server.to(socketId).emit('presence:update', {
            userId,
            isOnline,
            lastSeen: isOnline ? undefined : new Date().toISOString(),
          });
        });
      }
    } catch (error) {
      console.error(`[WS] Presence notification error for ${userId}:`, error);
    }
  }

  // --- Message Handlers ---

  @SubscribeMessage('presence:subscribe')
  handlePresenceSubscribe(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() userIds: string[],
  ) {
    try {
      const currentUserId = client.data.userId;
      if (!currentUserId) throw new Error('Unauthenticated');

      // Validate input
      if (!Array.isArray(userIds)) {
        throw new Error('Expected array of userIds');
      }

      console.log(
        `[WS] ${currentUserId} subscribing to ${userIds.length} users`,
      );

      // Add subscriptions
      userIds.forEach((targetUserId) => {
        this.websocketService.addPresenceSubscriber(client.id, targetUserId);
      });

      // Send initial statuses with additional metadata
      const statuses = this.websocketService.getUsersStatus(userIds);
      client.emit('presence:init', {
        statuses,
        subscribedCount: userIds.length,
        serverTime: new Date().toISOString(),
      });
    } catch (error) {
      console.error('[WS] Presence subscribe error:', error);
      emitWsError(client, error, 'Subscription failed');
    }
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: AuthenticatedSocket) {
    client.emit('pong', {
      timestamp: Date.now(),
      serverTime: new Date().toISOString(),
    });
  }
}
