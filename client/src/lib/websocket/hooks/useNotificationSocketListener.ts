// src/hooks/useNotificationSocketListeners.ts
import { useEffect } from "react";
import { notificationWebSocketService } from "../services/notification.service";
import { useFriendshipStore } from "@/stores/friendshipStore";
import { FriendshipStatus } from "@/types/enums/friendshipType";
import { toast } from "react-toastify";
import { useChatMemberStore } from "@/stores/chatMemberStore";
import { useCurrentUserId } from "@/stores/authStore";
import { FriendRequestResponse } from "@/types/responses/friendship.response";

export function useNotificationSocketListeners() {
  const currentUserId = useCurrentUserId();
  const friendshipStore = useFriendshipStore();
  const chatMemberStore = useChatMemberStore();

  useEffect(() => {
    const handleNewFriendRequest = (request: FriendRequestResponse) => {
      const isReceiver = request.receiver.id === currentUserId;
      if (!isReceiver) return;

      friendshipStore.addPendingRequest(request); // Optional: for optimistic updates
      toast.info(`New friend request from ${request.sender.name}`);
    };

    const handleFriendshipUpdate = (data: {
      friendshipId: string;
      status: FriendshipStatus;
      firstName: string;
      userId: string;
    }) => {
      toast.info(`Friendship Update, ${data.userId} ${data.userId}`);
      if (data.userId === data.userId) return null;
      // Single targeted update
      chatMemberStore.updateFriendshipStatus(data.userId, data.status);
      friendshipStore.removeRequest(data.friendshipId);

      // Smart notifications
      if (data.status === FriendshipStatus.ACCEPTED) {
        toast.success(`${data.firstName} accepted your request!`);
      } else if (data.status === FriendshipStatus.DECLINED) {
        toast.warning(`${data.firstName} declined your request`);
      }
    };

    // Subscribe to events
    notificationWebSocketService.onNewFriendRequest(handleNewFriendRequest);
    notificationWebSocketService.onFriendshipUpdate(handleFriendshipUpdate);

    return () => {
      // Clean up listeners
      notificationWebSocketService.offNewFriendRequest(handleNewFriendRequest);
      notificationWebSocketService.offFriendshipUpdate(handleFriendshipUpdate);
    };
  }, [chatMemberStore, currentUserId, friendshipStore]);
}
