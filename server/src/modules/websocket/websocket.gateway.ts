import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';
import { WebsocketService } from './websocket.service';
import type { AuthenticatedSocket } from './constants/authenticatedSocket.type';

@WebSocketGateway()
@UseGuards(WsJwtGuard)
export class GlobalGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly websocketService: WebsocketService) {}

  afterInit(server: Server) {
    this.websocketService.setServer(server);
    console.log('WebSocket Gateway initialized');
  }

  handleConnection(client: AuthenticatedSocket) {
    const user = client.data.user;
    if (!user) return;

    this.websocketService.userConnected(user.id, client.id);
    this.server.emit('userOnline', { userId: user.id, online: true });

    client.emit('connectionSuccess', {
      message: 'WebSocket connection established',
      userId: user.id,
    });
  }

  handleDisconnect(client: AuthenticatedSocket) {
    const user = client.data.user;
    if (!user) return;

    this.websocketService.userDisconnected(user.id);
    this.server.emit('userOnline', { userId: user.id, online: false });
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
