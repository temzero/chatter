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
  cors: { origin: '*' }, // Configure properly in production
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
  }

  handleConnection(client: AuthenticatedSocket) {
    try {
      const userId = client.data.userId;
      if (!userId) {
        client.disconnect();
        return;
      }

      // Register connection
      const isFirstConnection = this.websocketService.userConnected(
        userId,
        client.id,
      );

      // Notify subscribers of this user's online status
      if (isFirstConnection) {
        const subscribers = this.websocketService.getSubscribersForUser(userId);
        subscribers.forEach((socketId) => {
          this.server.to(socketId).emit('presence:update', userId, true);
        });
      }

      client.emit('connection_ack', { success: true });
    } catch (error) {
      emitWsError(client, error, 'Connection failed');
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    const result = this.websocketService.userDisconnected(client.id);
    if (!result) return;

    // Notify subscribers of this user's offline status
    if (result.wasLastConnection) {
      const subscribers = this.websocketService.getSubscribersForUser(
        result.userId,
      );
      subscribers.forEach((socketId) => {
        this.server.to(socketId).emit('presence:update', result.userId, false);
      });
    }
  }

  @SubscribeMessage('presence:subscribe')
  handlePresenceSubscribe(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() userIds: string[], // Expects an array of userIds from the client
  ) {
    const currentUserId = client.data.userId;
    if (!currentUserId) return;

    try {
      // Add client as a subscriber to each requested userId
      userIds.forEach((targetUserId) => {
        this.websocketService.addPresenceSubscriber(client.id, targetUserId);
      });

      // Send initial online statuses for these users
      const initialStatuses = this.websocketService.getUsersStatus(userIds);
      client.emit('presence:init', initialStatuses); // e.g., { "user123": true, "user456": false }
    } catch (error) {
      emitWsError(client, error, 'Failed to subscribe to presence updates');
    }
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: AuthenticatedSocket) {
    client.emit('pong', { timestamp: Date.now() });
  }
}
