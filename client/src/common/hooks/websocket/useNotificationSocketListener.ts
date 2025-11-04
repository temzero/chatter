// src/hooks/useNotificationSocketListeners.ts
import { useEffect } from "react";
import { useFriendshipStore } from "@/stores/friendshipStore";
import { FriendshipStatus } from "@/shared/types/enums/friendship-type.enum";
import { toast } from "react-toastify";
import { useChatMemberStore } from "@/stores/chatMemberStore";
import { getCurrentUserId } from "@/stores/authStore";
import { notificationWebSocketService } from "@/services/websocket/notification.service";
import { webSocketService } from "@/services/websocket/websocket.service";
import {
  FriendRequestResponse,
  FriendshipUpdateNotification,
} from "@/shared/types/responses/friendship.response";
import { useTranslation } from "react-i18next";

export function useNotificationSocketListeners() {
  const { t } = useTranslation();
  const currentUserId = getCurrentUserId();

  useEffect(() => {
    const handleNewFriendRequest = (request: FriendRequestResponse) => {
      const isReceiver = request.receiver.id === currentUserId;
      if (!isReceiver) return;
      useFriendshipStore.getState().addPendingRequest(request);
      toast.info(
        t("toast.friendship.new_request", { name: request.sender.name })
      );
    };

    const handleFriendshipUpdate = (data: FriendshipUpdateNotification) => {
      // (i.e., someone else acted on our request)
      if (data.user.id === currentUserId) {
        console.log("Skipping notification about our own action");
        return;
      }

      // 3. Only process if we're the affected party
      useChatMemberStore
        .getState()
        .updateFriendshipStatus(data.user.id, data.status);
      useFriendshipStore.getState().removeRequestLocally(data.friendshipId);

      console.log("data.status", data.status)

      // 4. Show notification with correct context
      if (data.status === FriendshipStatus.ACCEPTED) {
        useChatMemberStore
          .getState()
          .updateMemberLocallyByUserId(data.user.id, {
            firstName: data.user.firstName,
            username: data.user.username,
            email: data.user.email,
            bio: data.user.bio,
            phoneNumber: data.user.phoneNumber,
            birthday: data.user.birthday,
            friendshipStatus: data.status
          });

        toast.success(
          t("toast.friendship.accepted_by", { name: data.user.firstName })
        );
      } else if (data.status === FriendshipStatus.DECLINED) {
        toast.warning(
          t("toast.friendship.declined_by", { name: data.user.firstName })
        );
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
  }, [currentUserId, t]);
}
