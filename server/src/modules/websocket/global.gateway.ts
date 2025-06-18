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
import type { AuthenticatedSocket } from './constants/authenticatedSocket.type';

@WebSocketGateway({
  pingInterval: 10000,
  pingTimeout: 15000,
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
      console.error('Connection error:', error);
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

  // @SubscribeMessage('presence:subscribe')
  // async handlePresenceSubscribe(
  //   @ConnectedSocket() client: AuthenticatedSocket,
  // ) {
  //   const userId = client.data.userId;
  //   if (!userId) return;

  //   try {
  //     // Get all relevant users (chat members + friends + recent contacts)
  //     const relevantUsers = await this.getRelevantUsers(userId);

  //     // Subscribe to their presence updates
  //     relevantUsers.forEach((targetUserId) => {
  //       this.websocketService.addPresenceSubscriber(client.id, targetUserId);
  //     });

  //     // Send initial statuses
  //     const initialStatuses =
  //       this.websocketService.getUsersStatus(relevantUsers);
  //     client.emit('presence:init', initialStatuses);
  //   } catch (error) {
  //     console.error('Presence subscription error:', error);
  //   }
  // }

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
      console.error('Presence subscription error:', error);
    }
  }

  // private async getRelevantUsers(userId: string): Promise<string[]> {
  //   const chatIds = await this.chatMemberService.getChatIdsByUserId(userId);
  //   const uniqueUserIds = new Set<string>();

  //   for (const chatId of chatIds) {
  //     const members = await this.chatMemberService.getAllMemberIds(chatId);
  //     members.forEach((memberId) => {
  //       if (memberId !== userId) {
  //         uniqueUserIds.add(memberId);
  //       }
  //     });
  //   }

  //   return Array.from(uniqueUserIds);
  // }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: AuthenticatedSocket) {
    client.emit('pong', { timestamp: Date.now() });
  }
}
