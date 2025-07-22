// src/services/friendship.websocket.service.ts
import { FriendRequestResponse } from "@/types/responses/friendship.response";
import { webSocketService } from "./websocket.service";
import { FriendshipUpdateNotification } from "@/types/websocket/friendshipUpdateNotification";

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
};
