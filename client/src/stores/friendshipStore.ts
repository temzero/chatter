import { create } from "zustand";
import { friendshipService } from "@/services/friendshipService";
import { FriendshipStatus } from "@/shared/types/enums/friendship-type.enum";
import { handleError } from "@/utils/handleError";
import {
  FriendRequestResponse,
  FriendshipUpdateNotification,
} from "@/shared/types/responses/friendship.response";
import { toast } from "react-toastify";
import { useChatMemberStore } from "./chatMemberStore";

type FriendshipState = {
  pendingRequests: FriendRequestResponse[];
  isLoading: boolean;
};

type FriendshipActions = {
  sendFriendRequest: (
    receiverId: string,
    receiverName: string,
    currentUserId?: string,
    message?: string
  ) => Promise<FriendRequestResponse | undefined>;
  fetchPendingRequests: () => Promise<void>;
  respondToRequest: (
    friendshipId: string,
    userId: string,
    status: FriendshipStatus
  ) => Promise<FriendshipUpdateNotification>;
  addPendingRequest: (request: FriendRequestResponse) => void;
  cancelRequest: (friendshipId: string, userId?: string) => Promise<void>;
  removeRequestLocally: (friendshipId?: string, senderId?: string) => void;
  deleteFriendship: (userId: string) => Promise<void>;
  clearRequests: () => void;
};

export const useFriendshipStore = create<FriendshipState & FriendshipActions>(
  (set) => ({
    pendingRequests: [],
    isLoading: false,

    sendFriendRequest: async (
      receiverId,
      receiverName,
      currentUserId,
      message
    ) => {
      set({ isLoading: true });
      if (!currentUserId) return;
      try {
        useChatMemberStore
          .getState()
          .updateFriendshipStatus(currentUserId, FriendshipStatus.ACCEPTED);
        useChatMemberStore
          .getState()
          .updateFriendshipStatus(receiverId, FriendshipStatus.PENDING);
        const newRequest = await friendshipService.sendRequest(
          receiverId,
          message
        );
        set((state) => ({
          pendingRequests: [...state.pendingRequests, newRequest],
          isLoading: false,
        }));
        toast.success(`New friend request sent to ${receiverName}`);
        return newRequest;
      } catch (error) {
        set({ isLoading: false });
        console.error("Failed to send friend request:", error);
        handleError(error, "Failed to send friend request");
        throw error;
      }
    },

    fetchPendingRequests: async () => {
      set({ isLoading: true });
      try {
        const requests = await friendshipService.getPendingRequests();
        set({ pendingRequests: requests, isLoading: false });
      } catch (error) {
        console.error("Failed to fetch friend requests:", error);
        set({ isLoading: false });
      }
    },

    respondToRequest: async (friendshipId, userId, status) => {
      set({ isLoading: true });
      try {
        const friendship = await friendshipService.respondToRequest(
          friendshipId,
          status
        );

        console.log("friendship", friendship);
        useChatMemberStore.getState().updateFriendshipStatus(userId, status);

        return friendship;
      } catch (error) {
        console.error("Failed to respond to friend request:", error);
        set({ isLoading: false });
        throw handleError(error, "Failed to respond to friend request");
      } finally {
        set((state) => ({
          pendingRequests: state.pendingRequests.filter(
            (req) => req.id !== friendshipId
          ),
          isLoading: false,
        }));
      }
    },

    addPendingRequest: (request) => {
      set((state) => {
        const exists = state.pendingRequests.some((r) => r.id === request.id);
        if (exists) return state;
        return {
          pendingRequests: [...state.pendingRequests, request],
        };
      });
    },

    cancelRequest: async (friendshipId, userId) => {
      set({ isLoading: true });
      try {
        await friendshipService.cancelRequest(friendshipId, userId);
        set((state) => ({
          pendingRequests: state.pendingRequests.filter(
            (req) => req.id !== friendshipId
          ),
          isLoading: false,
        }));
      } catch (error) {
        set({ isLoading: false });
        handleError(error, "Failed to cancel friend request");
        throw error;
      } finally {
        if (userId) {
          useChatMemberStore.getState().updateFriendshipStatus(userId, null);
        }
      }
    },

    removeRequestLocally: (friendshipId, senderId) => {
      set((state) => {
        // If no identifiers provided, return current state
        if (!friendshipId && !senderId) return state;

        const newPendingRequests = state.pendingRequests.filter((req) => {
          // Case 1: Both identifiers provided - remove if either matches
          if (friendshipId && senderId) {
            return req.id !== friendshipId && req.sender.id !== senderId;
          }
          // Case 2: Only friendshipId provided
          if (friendshipId) {
            return req.id !== friendshipId;
          }
          // Case 3: Only senderId provided
          if (senderId) {
            return req.sender.id !== senderId;
          }
          return true;
        });

        // Only update if something actually changed
        if (newPendingRequests.length === state.pendingRequests.length) {
          return state;
        }

        return { pendingRequests: newPendingRequests };
      });

      // Also update chat member status if senderId was provided
      if (senderId) {
        useChatMemberStore.getState().updateFriendshipStatus(senderId, null);
      }
    },

    deleteFriendship: async (userId) => {
      set({ isLoading: true });
      try {
        await friendshipService.deleteByUserId(userId);
        useChatMemberStore.getState().updateFriendshipStatus(userId, null);
        set((state) => ({
          pendingRequests: state.pendingRequests.filter(
            (req) => req.sender.id !== userId && req.receiver.id !== userId
          ),
          isLoading: false,
        }));
      } catch (error) {
        console.error("Failed to delete friendship:", error);
        set({ isLoading: false });
        throw error;
      }
    },

    clearRequests: () => set({ pendingRequests: [] }),
  })
);
