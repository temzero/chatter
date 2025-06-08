// src/websocket/features/notifications/notification.gateway.ts
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from 'src/modules/auth/guards/ws-jwt.guard';
import { WebsocketService } from '../websocket.service';
import { AuthenticatedSocket } from '../constants/authenticatedSocket.type';

@WebSocketGateway({ namespace: 'notifications' })
@UseGuards(WsJwtGuard)
export class NotificationGateway {
  constructor(private readonly websocketService: WebsocketService) {}

  @SubscribeMessage('subscribeToNotifications')
  handleSubscribe(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() userId: string,
  ) {
    // Validate the requesting user matches the subscription
    if (client.data.userId !== userId) {
      throw new Error('Unauthorized subscription attempt');
    }

    // Join user-specific notification room
    void client.join(`notifications_${userId}`);
    return { success: true };
  }

  @SubscribeMessage('markAsRead')
  handleMarkAsRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() notificationId: string,
  ) {
    // Implement your notification read logic here
    return { success: true, notificationId };
  }
}
