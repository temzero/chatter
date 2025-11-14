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
import { useChatStore } from "@/stores/chatStore";
import { WsNotificationResponse } from "@/shared/types/responses/ws-emit-chat-member.response";

export function useNotificationSocketListeners() {
  const { t } = useTranslation();
  const currentUserId = getCurrentUserId();

  useEffect(() => {
    const handleNewFriendRequest = (
      data: WsNotificationResponse<FriendRequestResponse>
    ) => {
      const { payload } = data;
      const isReceiver = payload.receiver.id === currentUserId;
      if (!isReceiver) return;
      useFriendshipStore.getState().addPendingRequest(payload);
      toast.info(
        t("toast.friendship.new_request", { name: payload.sender.name })
      );
    };

    const handleFriendshipUpdate = (
      data: WsNotificationResponse<FriendshipUpdateNotification>
    ) => {
      // (i.e., someone else acted on our request)
      const { payload } = data;

      if (payload.user.id === currentUserId) {
        console.log("Skipping notification about our own action");
        return;
      }

      // 3. Only process if we're the affected party
      useChatMemberStore
        .getState()
        .updateFriendshipStatus(payload.user.id, payload.status);
      useFriendshipStore.getState().removeRequestLocally(payload.friendshipId);

      console.log("data.status", payload.status);

      // 4. Show notification with correct context
      if (payload.status === FriendshipStatus.ACCEPTED) {
        useChatMemberStore
          .getState()
          .updateMemberLocallyByUserId(payload.user.id, {
            firstName: payload.user.firstName,
            username: payload.user.username,
            email: payload.user.email,
            bio: payload.user.bio,
            phoneNumber: payload.user.phoneNumber,
            birthday: payload.user.birthday,
            friendshipStatus: payload.status,
          });

        console.log("OTHER USER ACCEPTED MY REQUEST");

        setTimeout(() => {
          try {
            useChatStore.getState().getDirectChatByUserId(payload.user.id);
          } catch (error) {
            console.error(
              "Failed to create/get direct chat after friendship accepted:",
              error
            );
          }
        }, 1000);

        toast.success(
          t("toast.friendship.accepted_by", { name: payload.user.firstName })
        );
      } else if (payload.status === FriendshipStatus.DECLINED) {
        toast.warning(
          t("toast.friendship.declined_by", { name: payload.user.firstName })
        );
      }
    };

    const handleCancelFriendRequest = (
      data: WsNotificationResponse<{ friendshipId: string; senderId: string }>
    ) => {
      const { payload } = data;
      useFriendshipStore
        .getState()
        .removeRequestLocally(payload.friendshipId, payload.senderId);
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
