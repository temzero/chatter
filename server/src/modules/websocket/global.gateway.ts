import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { WebsocketService } from './websocket.service';
import type { AuthenticatedSocket } from './constants/authenticatedSocket.type';

@WebSocketGateway()
export class GlobalGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly websocketService: WebsocketService) {}

  afterInit(server: Server) {
    this.websocketService.setServer(server);
    console.log('WebSocket Gateway initialized');
  }

  handleConnection(client: AuthenticatedSocket) {
    console.log(`New connection attempt from socket ${client.id}`);

    try {
      const userId = client.data.userId;
      if (!userId) {
        console.log('Connection rejected - no userId');
        client.disconnect();
        return;
      }

      console.log(`User ${userId} authenticated successfully`);

      const isFirstConnection = this.websocketService.userConnected(
        userId,
        client.id,
      );

      if (isFirstConnection) {
        console.log(`First connection for user ${userId}`);
        this.server.emit('userOnline', { userId, online: true });
        this.server
          .to(`presence:${userId}`)
          .emit('presence:update', userId, true);
      }

      client.emit('connectionSuccess', {
        message: 'Connected',
        userId,
      });
      console.log(`Connection completed for user ${userId}`);
    } catch (error) {
      console.error('Connection error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    const userId = client.data.userId;
    if (!userId) return;

    console.log(`User ${userId} disconnected from socket ${client.id}`);

    const status = this.websocketService.userDisconnected(client.id);
    if (status?.wasLastConnection) {
      console.log(
        `Last connection lost for user ${userId}, emitting offline status`,
      );
      this.server.emit('userOnline', { userId, online: false });
      this.server
        .to(`presence:${userId}`)
        .emit('presence:update', userId, false);
    }
  }

  @SubscribeMessage('genericEvent')
  handleGenericEvent(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: unknown,
  ) {
    return {
      event: 'genericEvent',
      data:
        typeof payload === 'object' && payload !== null
          ? (payload as Record<string, unknown>)
          : {},
    };
  }

  @SubscribeMessage('presence:get')
  handleGetPresence(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() userId: string,
  ) {
    const isOnline = this.websocketService.isUserOnline(userId);
    client.emit('presence:update', userId, isOnline);
  }

  @SubscribeMessage('presence:subscribe')
  async handleSubscribePresence(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() userId: string,
  ) {
    await client.join(`presence:${userId}`);
    const isOnline = this.websocketService.isUserOnline(userId);
    client.emit('presence:update', userId, isOnline);
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() roomId: string,
  ) {
    await client.join(roomId);
    return { success: true, roomId };
  }

  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() roomId: string,
  ) {
    await client.leave(roomId);
    return { success: true, roomId };
  }
}
