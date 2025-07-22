import { create } from "zustand";
import { friendshipService } from "@/services/friendshipService";
import { FriendshipStatus } from "@/types/enums/friendshipType";
import { handleError } from "@/utils/handleError";
import {
  FriendRequestResponse,
  FriendshipResponse,
} from "@/types/responses/friendship.response";
import { toast } from "react-toastify";

type FriendshipState = {
  pendingRequests: FriendRequestResponse[];
  isLoading: boolean;
};

type FriendshipActions = {
  sendFriendRequest: (
    receiverId: string,
    receiverName: string,
    message?: string
  ) => Promise<FriendRequestResponse>;
  fetchPendingRequests: () => Promise<void>;
  respondToRequest: (
    friendshipId: string,
    status: FriendshipStatus
  ) => Promise<FriendshipResponse>;
  addPendingRequest: (request: FriendRequestResponse) => void;
  removeRequest: (friendshipId: string) => Promise<void>;
  deleteFriendshipByUserId: (userId: string) => Promise<void>;
  clearRequests: () => void;
};

export const useFriendshipStore = create<FriendshipState & FriendshipActions>(
  (set) => ({
    pendingRequests: [],
    isLoading: false,

    sendFriendRequest: async (receiverId, receiverName, message) => {
      set({ isLoading: true });
      try {
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

    respondToRequest: async (friendshipId, status) => {
      set({ isLoading: true });
      try {
        const friendship = await friendshipService.respondToRequest(
          friendshipId,
          status
        );
        set((state) => ({
          pendingRequests: state.pendingRequests.filter(
            (req) => req.id !== friendshipId
          ),
          isLoading: false,
        }));
        return friendship;
      } catch (error) {
        console.error("Failed to respond to friend request:", error);
        set({ isLoading: false });
        throw error;
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

    removeRequest: async (friendshipId) => {
      set({ isLoading: true });
      try {
        await friendshipService.deleteRequest(friendshipId);
        set((state) => ({
          pendingRequests: state.pendingRequests.filter(
            (req) => req.id !== friendshipId
          ),
          isLoading: false,
        }));
      } catch (error) {
        console.error("Failed to remove friend request:", error);
        set({ isLoading: false });
        throw error;
      }
    },

    deleteFriendshipByUserId: async (userId) => {
      set({ isLoading: true });
      try {
        await friendshipService.deleteByUserId(userId);
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
