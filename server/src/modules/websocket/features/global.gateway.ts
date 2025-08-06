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
import { WebsocketService } from '../websocket.service';
import { emitWsError } from '../utils/emitWsError';
import type { AuthenticatedSocket } from '../constants/authenticatedSocket.type';
import { PresenceInitEvent } from '../constants/presenceEvent.type';
import { SystemEvent, PresenceEvent } from '../constants/websocket-events';

@WebSocketGateway({
  pingInterval: 10000,
  pingTimeout: 15000,
  cors: { origin: '*' },
})
export class GlobalGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly websocketService: WebsocketService) {}

  afterInit(server: Server) {
    this.websocketService.setServer(server);
  }

  handleConnection(client: AuthenticatedSocket) {
    try {
      const userId = client.data.userId;
      if (!userId) {
        console.warn('[WS] Connection rejected - missing userId');
        client.disconnect(true);
        return;
      }

      const isFirstConnection = this.websocketService.userConnected(
        userId,
        client.id,
      );

      if (isFirstConnection) {
        this.websocketService.notifyPresenceSubscribers(userId, true);
      }

      // Updated to use SystemEvent enum
      client.emit(SystemEvent.CONNECTION_ACK, {
        success: true,
        serverTime: new Date().toISOString(),
        pingInterval: 10000,
      });
    } catch (error) {
      console.error(`[WS] Connection error for ${client.id}:`, error);
      emitWsError(client, error, 'Connection failed');
      client.disconnect(true);
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    const result = this.websocketService.userDisconnected(client.id);
    if (!result) {
      console.warn(`[WS] No user found for disconnected socket ${client.id}`);
      return;
    }

    setTimeout(() => {
      if (!this.websocketService.isUserOnline(result.userId)) {
        this.websocketService.notifyPresenceSubscribers(result.userId, false);
      }
    }, 5000);
  }

  @SubscribeMessage(SystemEvent.PING)
  handlePing(@ConnectedSocket() client: AuthenticatedSocket) {
    client.emit(SystemEvent.PONG, {
      timestamp: Date.now(),
      serverTime: new Date().toISOString(),
    });
  }

  // --- Presence Handlers ---

  @SubscribeMessage(PresenceEvent.SUBSCRIBE)
  handlePresenceSubscribe(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() userIds: string[],
  ) {
    try {
      const currentUserId = client.data.userId;
      if (!currentUserId) throw new Error('Unauthenticated');

      if (!Array.isArray(userIds)) {
        throw new Error('Expected array of userIds');
      }

      userIds.forEach((targetUserId) => {
        this.websocketService.addPresenceSubscriber(client.id, targetUserId);
      });

      const statuses = this.websocketService.getUsersStatus(userIds);
      const initEvent: PresenceInitEvent = {
        statuses,
        subscribedCount: userIds.length,
        serverTime: new Date().toISOString(),
      };

      client.emit(PresenceEvent.INIT, initEvent);
    } catch (error) {
      console.error('[WS] Presence subscribe error:', error);
      emitWsError(client, error, 'Subscription failed');
    }
  }

  @SubscribeMessage(PresenceEvent.UNSUBSCRIBE)
  handlePresenceUnsubscribe(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() userIds: string[],
  ) {
    userIds.forEach((userId) => {
      this.websocketService.removePresenceSubscriber(client.id, userId);
    });
  }
}
