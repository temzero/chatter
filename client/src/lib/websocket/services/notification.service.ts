// src/services/friendship.websocket.service.ts
import { FriendRequestResponse } from "@/types/responses/friendship.response";
import { webSocketService } from "./websocket.service";
import { FriendshipUpdateNotification } from "@/types/responses/friendship.response";

const notificationsLink = "notifications";
const NOTIFICATION_EVENTS = {
  FRIENDSHIP_UPDATE: `${notificationsLink}:friendshipUpdate`,
  NEW_FRIEND_REQUEST: `${notificationsLink}:newFriendRequest`,
  CANCEL_FRIEND_REQUEST: `${notificationsLink}:friendshipCancelRequest`,
};

export const notificationWebSocketService = {
  onFriendshipUpdate(callback: (data: FriendshipUpdateNotification) => void) {
    webSocketService.on(NOTIFICATION_EVENTS.FRIENDSHIP_UPDATE, callback);
  },

  offFriendshipUpdate(callback: (data: FriendshipUpdateNotification) => void) {
    webSocketService.off(NOTIFICATION_EVENTS.FRIENDSHIP_UPDATE, callback);
  },

  onNewFriendRequest(callback: (data: FriendRequestResponse) => void) {
    webSocketService.on(NOTIFICATION_EVENTS.NEW_FRIEND_REQUEST, callback);
  },

  offNewFriendRequest(callback: (data: FriendRequestResponse) => void) {
    webSocketService.off(NOTIFICATION_EVENTS.NEW_FRIEND_REQUEST, callback);
  },

  onFriendshipCancelRequest(
    callback: (data: { friendshipId: string; senderId: string }) => void
  ) {
    webSocketService.on(NOTIFICATION_EVENTS.CANCEL_FRIEND_REQUEST, callback);
  },

  offFriendshipCancelRequest(
    callback: (data: { friendshipId: string; senderId: string }) => void
  ) {
    webSocketService.off(NOTIFICATION_EVENTS.CANCEL_FRIEND_REQUEST, callback);
  },
};
