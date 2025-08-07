// src/services/friendship.websocket.service.ts
import { FriendRequestResponse } from "@/types/responses/friendship.response";
import { webSocketService } from "./websocket.service";
import { FriendshipUpdateNotification } from "@/types/responses/friendship.response";
import { NotificationEvent } from "../constants/websocket-event.type";

export const notificationWebSocketService = {
  onFriendshipUpdate(callback: (data: FriendshipUpdateNotification) => void) {
    webSocketService.on(NotificationEvent.FRIENDSHIP_UPDATE, callback);
  },

  offFriendshipUpdate(callback: (data: FriendshipUpdateNotification) => void) {
    webSocketService.off(NotificationEvent.FRIENDSHIP_UPDATE, callback);
  },

  onNewFriendRequest(callback: (data: FriendRequestResponse) => void) {
    webSocketService.on(NotificationEvent.FRIEND_REQUEST, callback);
  },

  offNewFriendRequest(callback: (data: FriendRequestResponse) => void) {
    webSocketService.off(NotificationEvent.FRIEND_REQUEST, callback);
  },

  onFriendshipCancelRequest(
    callback: (data: { friendshipId: string; senderId: string }) => void
  ) {
    webSocketService.on(NotificationEvent.CANCEL_FRIEND_REQUEST, callback);
  },

  offFriendshipCancelRequest(
    callback: (data: { friendshipId: string; senderId: string }) => void
  ) {
    webSocketService.off(NotificationEvent.CANCEL_FRIEND_REQUEST, callback);
  },
};
