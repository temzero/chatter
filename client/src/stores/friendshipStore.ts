// friendshipStore.ts
import { create } from "zustand";
import { friendshipService } from "@/services/friendshipService";
import { FriendshipStatus } from "@/types/enums/friendshipType";
import { FriendshipResDto, ReceivedRequestsResDto, SentRequestResDto } from "@/types/friendship";

type FriendshipState = {
  receivedRequests: ReceivedRequestsResDto[];
  sentRequests: SentRequestResDto[];
  loading: boolean;
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
    loading: false,
    error: null,

    sendFriendRequest: async (receiverId, message) => {
      set({ loading: true, error: null });
      try {
        const newSentRequest = await friendshipService.sendRequest(
          receiverId,
          message
        );
        console.log("newSentRequest", newSentRequest);
        set((state) => ({
          sentRequests: [...state.sentRequests, newSentRequest],
          loading: false,
        }));
        return newSentRequest;
      } catch (error) {
        console.error("Failed to send friend request:", error);
        set({
          error:
            error instanceof Error
              ? error.message
              : "Failed to send friend request",
          loading: false,
        });
        throw error;
      }
    },

    fetchPendingRequests: async () => {
      set({ loading: true, error: null });
      try {
        const { sent, received } = await friendshipService.getPendingRequests();
        set({
          receivedRequests: received,
          sentRequests: sent,
          loading: false,
        });
      } catch (error) {
        console.error("Failed to fetch friend requests:", error);
        set({
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch friend requests",
          loading: false,
        });
      }
    },

    respondToRequest: async (friendshipId, status) => {
      set({ loading: true, error: null });
      try {
        const friendShip = await friendshipService.respondToRequest(friendshipId, status);
        set((state) => ({
          receivedRequests: state.receivedRequests.filter(
            (req) => req.id !== friendshipId
          ),
          loading: false,
        }));
        return friendShip;
      } catch (error) {
        console.error("Failed to respond to friend request:", error);
        set({
          error:
            error instanceof Error
              ? error.message
              : "Failed to respond to friend request",
          loading: false,
        });
        throw error;
      }
    },

    cancelRequest: async (friendshipId) => {
      set({ loading: true, error: null });
      try {
        await friendshipService.deleteRequest(friendshipId);
        set((state) => ({
          sentRequests: state.sentRequests.filter(
            (req) => req.id !== friendshipId
          ),
          loading: false,
        }));
      } catch (error) {
        console.error("Failed to cancel friend request:", error);
        set({
          error:
            error instanceof Error
              ? error.message
              : "Failed to cancel friend request",
          loading: false,
        });
        throw error;
      }
    },

    deleteFriendshipByUserId: async (userId) => {
      set({ loading: true, error: null });
      try {
        await friendshipService.deleteByUserId(userId);
        set((state) => ({
          // Remove from sent requests where receiverId matches
          sentRequests: state.sentRequests.filter(
            (req) => req.receiverId !== userId
          ),
          loading: false,
        }));
      } catch (error) {
        console.error("Failed to delete friendship:", error);
        set({
          error:
            error instanceof Error
              ? error.message
              : "Failed to delete friendship",
          loading: false,
        });
        throw error;
      }
    },

    clearRequests: () => set({ receivedRequests: [], sentRequests: [] }),
    clearError: () => set({ error: null }),
  })
);
