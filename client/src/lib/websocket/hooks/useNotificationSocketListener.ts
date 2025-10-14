// src/hooks/useNotificationSocketListeners.ts
import { useEffect } from "react";
import { notificationWebSocketService } from "../services/notification.service";
import { useFriendshipStore } from "@/stores/friendshipStore";
import { FriendshipStatus } from "@/shared/types/enums/friendship-type.enum";
import { toast } from "react-toastify";
import { useChatMemberStore } from "@/stores/chatMemberStore";
import { useCurrentUserId } from "@/stores/authStore";
import {
  FriendRequestResponse,
  FriendshipUpdateNotification,
} from "@/shared/types/responses/friendship.response";
import { webSocketService } from "../services/websocket.service";

export function useNotificationSocketListeners() {
  const currentUserId = useCurrentUserId();

  useEffect(() => {
    const handleNewFriendRequest = (request: FriendRequestResponse) => {
      const isReceiver = request.receiver.id === currentUserId;
      if (!isReceiver) return;
      useFriendshipStore.getState().addPendingRequest(request);
      toast.info(`New friend request from ${request.sender.name}`);
    };

    const handleFriendshipUpdate = (data: FriendshipUpdateNotification) => {
      // (i.e., someone else acted on our request)
      if (data.userId === currentUserId) {
        console.log("Skipping notification about our own action");
        return;
      }

      // 3. Only process if we're the affected party
      useChatMemberStore
        .getState()
        .updateFriendshipStatus(data.userId, data.status);
      useFriendshipStore.getState().removeRequestLocally(data.friendshipId);

      // 4. Show notification with correct context
      if (data.status === FriendshipStatus.ACCEPTED) {
        toast.success(`${data.firstName} accepted your friend request!`);
      } else if (data.status === FriendshipStatus.DECLINED) {
        toast.warning(`${data.firstName} declined your friend request`);
      }
    };

    const handleCancelFriendRequest = ({
      friendshipId,
      senderId,
    }: {
      friendshipId: string;
      senderId: string;
    }) => {
      useFriendshipStore
        .getState()
        .removeRequestLocally(friendshipId, senderId);
    };

    const socket = webSocketService.getSocket();
    if (!socket) return; // skip if not connected
    // Subscribe to events
    notificationWebSocketService.onNewFriendRequest(handleNewFriendRequest);
    notificationWebSocketService.onFriendshipUpdate(handleFriendshipUpdate);
    notificationWebSocketService.onFriendshipCancelRequest(
      handleCancelFriendRequest
    );

    return () => {
      const socket = webSocketService.getSocket();
      if (!socket) return; // skip cleanup if socket gone
      // Clean up listeners
      notificationWebSocketService.removeAllListeners();
    };
  }, [currentUserId]);
}
