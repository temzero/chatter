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
import { NotificationEvent } from '../constants/websocket-events';
import { FriendRequestResponseDto } from 'src/modules/friendship/dto/responses/friend-request-response.dto';

@WebSocketGateway()
@UseGuards(WsJwtGuard)
export class NotificationGateway {
  constructor(private readonly websocketService: WebsocketService) {}

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
    this.websocketService.emitToUser(
      receiverId,
      NotificationEvent.FRIEND_REQUEST,
      payload,
    );
  }
}
