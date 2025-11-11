// src/services/friendship.websocket.service.ts
import { FriendRequestResponse } from "@/shared/types/responses/friendship.response";
import { webSocketService } from "./websocket.service";
import { FriendshipUpdateNotification } from "@/shared/types/responses/friendship.response";
import { NotificationEvent } from "@/shared/types/enums/websocket-events.enum";
import { WsNotificationResponse } from "@/shared/types/responses/ws-emit-chat-member.response";

export const notificationWebSocketService = {
  onFriendshipUpdate(
    callback: (
      data: WsNotificationResponse<FriendshipUpdateNotification>
    ) => void
  ) {
    webSocketService.on(NotificationEvent.FRIENDSHIP_UPDATE, callback);
  },

  offFriendshipUpdate(
    callback: (
      data: WsNotificationResponse<FriendshipUpdateNotification>
    ) => void
  ) {
    webSocketService.off(NotificationEvent.FRIENDSHIP_UPDATE, callback);
  },

  onNewFriendRequest(
    callback: (data: WsNotificationResponse<FriendRequestResponse>) => void
  ) {
    webSocketService.on(NotificationEvent.FRIEND_REQUEST, callback);
  },

  offNewFriendRequest(
    callback: (data: WsNotificationResponse<FriendRequestResponse>) => void
  ) {
    webSocketService.off(NotificationEvent.FRIEND_REQUEST, callback);
  },

  onFriendshipCancelRequest(
    callback: (data: WsNotificationResponse<{ friendshipId: string; senderId: string }>) => void
  ) {
    webSocketService.on(NotificationEvent.CANCEL_FRIEND_REQUEST, callback);
  },

  offFriendshipCancelRequest(
    callback: (data: WsNotificationResponse<{ friendshipId: string; senderId: string }>) => void
  ) {
    webSocketService.off(NotificationEvent.CANCEL_FRIEND_REQUEST, callback);
  },

  removeAllListeners() {
    const events = [
      NotificationEvent.FRIENDSHIP_UPDATE,
      NotificationEvent.FRIEND_REQUEST,
      NotificationEvent.CANCEL_FRIEND_REQUEST,
    ];

    events.forEach((event) => webSocketService.off(event));
  },
};
