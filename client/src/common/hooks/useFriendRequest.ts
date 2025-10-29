// src/hooks/useFriendRequest.ts
import { useFriendshipStore } from "@/stores/friendshipStore";
import { FriendshipStatus } from "@/shared/types/enums/friendship-type.enum";
import { useChatStore } from "@/stores/chatStore";
import { toast } from "react-toastify";
import { handleError } from "../utils/handleError";

export const useFriendRequest = () => {
  const pendingRequests = useFriendshipStore((state) => state.pendingRequests);
  const respondToRequest = useFriendshipStore.getState().respondToRequest;
  const cancelRequest = useFriendshipStore.getState().cancelRequest;

  const getDirectChatByUserId = useChatStore.getState().getDirectChatByUserId;

  const findReceivedRequest = (userId: string, currentUserId: string) => {
    return pendingRequests.find(
      (req) => req.sender.id === userId && req.receiver.id === currentUserId
    );
  };

  const findSentRequest = (userId: string, currentUserId: string) => {
    return pendingRequests.find(
      (req) => req.receiver.id === userId && req.sender.id === currentUserId
    );
  };

  const handleAccept = async (
    requestId: string,
    userId: string,
    onStatusChange?: (status: FriendshipStatus | null) => void
  ) => {
    try {
      await respondToRequest(requestId, userId, FriendshipStatus.ACCEPTED);
      toast.success("Friend request accepted");
      onStatusChange?.(FriendshipStatus.ACCEPTED);
      getDirectChatByUserId(userId);
    } catch (error) {
      handleError(error, "Failed to accept friend request");
    }
  };

  const handleDecline = async (
    requestId: string,
    userId: string,
    onStatusChange?: (status: FriendshipStatus | null) => void
  ) => {
    try {
      await respondToRequest(requestId, userId, FriendshipStatus.DECLINED);
      onStatusChange?.(null);
      toast.success("Friend request declined");
    } catch (error) {
      handleError(error, "Failed to decline friend request");
    }
  };

  const handleCancel = async (
    requestId: string,
    userId: string,
    onStatusChange?: (status: FriendshipStatus | null) => void
  ) => {
    try {
      await cancelRequest(requestId, userId);
      onStatusChange?.(null);
      toast.success("Friend request cancelled");
    } catch (error) {
      handleError(error, "Failed to cancel friend request");
    }
  };

  return {
    pendingRequests,
    findReceivedRequest,
    findSentRequest,
    handleAccept,
    handleDecline,
    handleCancel,
  };
};
