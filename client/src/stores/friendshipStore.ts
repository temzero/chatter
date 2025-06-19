// friendshipStore.ts
import { create } from "zustand";
import { friendshipService } from "@/services/friendshipService";
import { FriendshipStatus } from "@/types/enums/friendshipType";
import { FriendshipResDto, ReceivedRequestsResDto, SentRequestResDto } from "@/types/friendship";

type FriendshipState = {
  receivedRequests: ReceivedRequestsResDto[];
  sentRequests: SentRequestResDto[];
  isLoading: boolean;
  error: string | null;
};

type FriendshipActions = {
  sendFriendRequest: (
    receiverId: string,
    message?: string
  ) => Promise<SentRequestResDto>;
  fetchPendingRequests: () => Promise<void>;
  respondToRequest: (
    friendshipId: string,
    status: FriendshipStatus
  ) => Promise<FriendshipResDto>;
  cancelRequest: (friendshipId: string) => Promise<void>;
  clearRequests: () => void;
  clearError: () => void;
  deleteFriendshipByUserId: (userId: string) => Promise<void>;
};

export const useFriendshipStore = create<FriendshipState & FriendshipActions>(
  (set) => ({
    receivedRequests: [],
    sentRequests: [],
    isLoading: false,
    error: null,

    sendFriendRequest: async (receiverId, message) => {
      set({ isLoading: true, error: null });
      try {
        const newSentRequest = await friendshipService.sendRequest(
          receiverId,
          message
        );
        console.log("newSentRequest", newSentRequest);
        set((state) => ({
          sentRequests: [...state.sentRequests, newSentRequest],
          isLoading: false,
        }));
        return newSentRequest;
      } catch (error) {
        console.error("Failed to send friend request:", error);
        set({
          error:
            error instanceof Error
              ? error.message
              : "Failed to send friend request",
          isLoading: false,
        });
        throw error;
      }
    },

    fetchPendingRequests: async () => {
      set({ isLoading: true, error: null });
      try {
        const { sent, received } = await friendshipService.getPendingRequests();
        set({
          receivedRequests: received,
          sentRequests: sent,
          isLoading: false,
        });
      } catch (error) {
        console.error("Failed to fetch friend requests:", error);
        set({
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch friend requests",
          isLoading: false,
        });
      }
    },

    respondToRequest: async (friendshipId, status) => {
      set({ isLoading: true, error: null });
      try {
        const friendShip = await friendshipService.respondToRequest(friendshipId, status);
        set((state) => ({
          receivedRequests: state.receivedRequests.filter(
            (req) => req.id !== friendshipId
          ),
          isLoading: false,
        }));
        return friendShip;
      } catch (error) {
        console.error("Failed to respond to friend request:", error);
        set({
          error:
            error instanceof Error
              ? error.message
              : "Failed to respond to friend request",
          isLoading: false,
        });
        throw error;
      }
    },

    cancelRequest: async (friendshipId) => {
      set({ isLoading: true, error: null });
      try {
        await friendshipService.deleteRequest(friendshipId);
        set((state) => ({
          sentRequests: state.sentRequests.filter(
            (req) => req.id !== friendshipId
          ),
          isLoading: false,
        }));
      } catch (error) {
        console.error("Failed to cancel friend request:", error);
        set({
          error:
            error instanceof Error
              ? error.message
              : "Failed to cancel friend request",
          isLoading: false,
        });
        throw error;
      }
    },

    deleteFriendshipByUserId: async (userId) => {
      set({ isLoading: true, error: null });
      try {
        await friendshipService.deleteByUserId(userId);
        set((state) => ({
          // Remove from sent requests where receiverId matches
          sentRequests: state.sentRequests.filter(
            (req) => req.receiverId !== userId
          ),
          isLoading: false,
        }));
      } catch (error) {
        console.error("Failed to delete friendship:", error);
        set({
          error:
            error instanceof Error
              ? error.message
              : "Failed to delete friendship",
          isLoading: false,
        });
        throw error;
      }
    },

    clearRequests: () => set({ receivedRequests: [], sentRequests: [] }),
    clearError: () => set({ error: null }),
  })
);
