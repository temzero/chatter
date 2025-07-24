// src/services/friendship.websocket.service.ts
import { FriendRequestResponse } from "@/types/responses/friendship.response";
import { webSocketService } from "./websocket.service";
import { FriendshipUpdateNotification } from "@/types/responses/friendship.response";

const notificationsLink = "notifications:";

export const notificationWebSocketService = {
  onFriendshipUpdate(callback: (data: FriendshipUpdateNotification) => void) {
    webSocketService.on(`${notificationsLink}friendshipUpdate`, callback);
  },

  offFriendshipUpdate(callback: (data: FriendshipUpdateNotification) => void) {
    webSocketService.off(`${notificationsLink}friendshipUpdate`, callback);
  },

  onNewFriendRequest(callback: (data: FriendRequestResponse) => void) {
    webSocketService.on(`${notificationsLink}newFriendRequest`, callback);
  },

  offNewFriendRequest(callback: (data: FriendRequestResponse) => void) {
    webSocketService.off(`${notificationsLink}newFriendRequest`, callback);
  },

  onFriendshipCancelRequest(
    callback: (data: { friendshipId: string; senderId: string }) => void
  ) {
    webSocketService.on(
      `${notificationsLink}friendshipCancelRequest`,
      callback
    );
  },

  offFriendshipCancelRequest(
    callback: (data: { friendshipId: string; senderId: string }) => void
  ) {
    webSocketService.off(
      `${notificationsLink}friendshipCancelRequest`,
      callback
    );
  },
};
