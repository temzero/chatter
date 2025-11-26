// src/websocket/features/notifications/notification.gateway.ts
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from 'src/modules/auth/guards/ws-jwt.guard';
import { AuthenticatedSocket } from '../constants/authenticatedSocket.type';
import { NotificationEvent } from 'src/shared/types/enums/websocket-events.enum';
import { FriendRequestResponseDto } from 'src/modules/friendship/dto/responses/friend-request-response.dto';
import { WebsocketNotificationService } from '../services/websocket-notification.service';

@WebSocketGateway()
@UseGuards(WsJwtGuard)
export class NotificationGateway {
  constructor(
    private readonly websocketNotificationService: WebsocketNotificationService,
  ) {}

  @SubscribeMessage(NotificationEvent.SUBSCRIBE)
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

  // Example notification method
  notifyFriendRequest(receiverId: string, payload: FriendRequestResponseDto) {
    this.websocketNotificationService.emitToUser(
      receiverId,
      NotificationEvent.FRIEND_REQUEST,
      payload,
    );
  }
}
