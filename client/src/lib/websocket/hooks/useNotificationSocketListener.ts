// src/hooks/useNotificationSocketListeners.ts
import { useEffect } from "react";
import { notificationWebSocketService } from "../services/notification.service";
import { useFriendshipStore } from "@/stores/friendshipStore";
import { FriendshipStatus } from "@/types/enums/friendshipType";
import { toast } from "react-toastify";
import { useChatMemberStore } from "@/stores/chatMemberStore";
import { useCurrentUserId } from "@/stores/authStore";
import {
  FriendRequestResponse,
  FriendshipUpdateNotification,
} from "@/types/responses/friendship.response";

export function useNotificationSocketListeners() {
  const currentUserId = useCurrentUserId();
  const friendshipStore = useFriendshipStore();
  const chatMemberStore = useChatMemberStore();

  useEffect(() => {
    const handleNewFriendRequest = (request: FriendRequestResponse) => {
      const isReceiver = request.receiver.id === currentUserId;
      if (!isReceiver) return;

      chatMemberStore.updateFriendshipStatus(
        request.sender.id,
        FriendshipStatus.ACCEPTED
      );
      friendshipStore.addPendingRequest(request);
      toast.info(`New friend request from ${request.sender.name}`);
    };

    const handleFriendshipUpdate = (data: FriendshipUpdateNotification) => {
      // (i.e., someone else acted on our request)
      if (data.userId === currentUserId) {
        console.log("Skipping notification about our own action");
        return;
      }

      // 3. Only process if we're the affected party
      chatMemberStore.updateFriendshipStatus(data.userId, data.status);
      friendshipStore.removeRequest(data.friendshipId);

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
      toast.info(`Friend request was canceled ${friendshipId}`);
      friendshipStore.removeRequestLocally(friendshipId, senderId);
    };

    // Subscribe to events
    notificationWebSocketService.onNewFriendRequest(handleNewFriendRequest);
    notificationWebSocketService.onFriendshipUpdate(handleFriendshipUpdate);
    notificationWebSocketService.onFriendshipCancelRequest(
      handleCancelFriendRequest
    );

    return () => {
      // Clean up listeners
      notificationWebSocketService.offNewFriendRequest(handleNewFriendRequest);
      notificationWebSocketService.offFriendshipUpdate(handleFriendshipUpdate);
      notificationWebSocketService.offFriendshipCancelRequest(
        handleCancelFriendRequest
      );
    };
  }, [chatMemberStore, currentUserId, friendshipStore]);
}
