// src/modules/notifications/notification.service.ts
import { Injectable } from '@nestjs/common';
import { WebsocketService } from './websocket.service';
import { FriendRequestResponseDto } from '../friendship/dto/responses/friend-request-response.dto';
import { FriendshipUpdateNotificationDto } from '../friendship/dto/responses/friendship-update-notification.dto';

const notificationsLink = 'notifications:';

// notification-ws.service.ts
@Injectable()
export class NotificationWsService {
  constructor(private readonly websocketService: WebsocketService) {}

  // Friend Request
  notifyFriendRequest(receiverId: string, payload: FriendRequestResponseDto) {
    this.websocketService.emitToUser(
      receiverId,
      `${notificationsLink}newFriendRequest`,
      payload,
    );
  }

  notifyFriendshipUpdate(
    senderId: string | null,
    dto: FriendshipUpdateNotificationDto,
  ) {
    if (!senderId) return;
    this.websocketService.emitToUser(
      senderId,
      `${notificationsLink}friendshipUpdate`,
      dto,
    );
  }

  notifyCancelFriendRequest(
    friendshipId: string | null,
    receiverId: string | null,
    senderId: string | null,
  ) {
    if (!receiverId) return;
    this.websocketService.emitToUser(
      receiverId,
      `${notificationsLink}friendshipCancelRequest`,
      {
        friendshipId,
        senderId,
      },
    );
  }
}
