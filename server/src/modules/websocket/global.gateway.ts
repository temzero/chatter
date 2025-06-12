import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { WebsocketService } from './websocket.service';
import type { AuthenticatedSocket } from './constants/authenticatedSocket.type';
import { ChatMemberService } from '../chat-member/chat-member.service';

@WebSocketGateway()
export class GlobalGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly websocketService: WebsocketService,
    private readonly chatMemberService: ChatMemberService,
  ) {}

  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    this.websocketService.setServer(server);
    console.log('WebSocket Gateway initialized');
  }

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const userId = client.data.userId;
      if (!userId) {
        console.log('Connection rejected - no userId');
        client.disconnect();
        return;
      }

      // Optional: respond to ping
      client.on('ping', () => {
        client.emit('pong');
      });

      const isFirstConnection = this.websocketService.userConnected(
        userId,
        client.id,
      );

      if (await isFirstConnection) {
        this.server.emit('userOnline', { userId, online: true });
        this.server
          .to(`presence:${userId}`)
          .emit('presence:update', userId, true);

        await this.notifyUserStatusChange(userId, true);
      }

      client.emit('connectionSuccess', {
        message: 'Connected',
        userId,
      });
    } catch (error) {
      console.error('Connection error:', error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    const userId = client.data.userId;
    if (!userId) return;

    console.log(`User ${userId} disconnected from socket ${client.id}`);

    const status = await this.websocketService.userDisconnected(client.id);
    if (status?.wasLastConnection) {
      console.log(
        `Last connection lost for user ${userId}, emitting offline status`,
      );
      this.server.emit('userOnline', { userId, online: false });
      this.server
        .to(`presence:${userId}`)
        .emit('presence:update', userId, false);

      await this.notifyUserStatusChange(userId, true);
    }
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

  async notifyUserStatusChange(userId: string, isOnline: boolean) {
    const chatIds = await this.chatMemberService.getChatIdsByUserId(userId);

    for (const chatId of chatIds) {
      await this.websocketService.emitToChatMembers(
        chatId,
        'chat:statusChanged',
        {
          userId,
          isOnline,
        },
      );
    }
  }
}
