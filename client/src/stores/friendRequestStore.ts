import { create } from "zustand";
import { friendshipService } from "@/services/friendshipService";
import { FriendshipStatus } from "@/types/enums/friendshipType";
import { ReceivedRequestsResDto, SentRequestResDto } from "@/types/friendship";

type FriendRequestState = {
  receivedRequests: ReceivedRequestsResDto[];
  sentRequests: SentRequestResDto[];
  loading: boolean;
  error: string | null;
};

type FriendRequestActions = {
  fetchPendingRequests: () => Promise<void>;
  respondToRequest: (
    friendshipId: string,
    status: FriendshipStatus
  ) => Promise<void>;
  cancelRequest: (friendshipId: string) => Promise<void>;
  removeReceivedRequest: (friendshipId: string) => void;
  removeSentRequest: (friendshipId: string) => void;
  clearRequests: () => void;
  clearError: () => void;
};

export const useFriendRequestStore = create<
  FriendRequestState & FriendRequestActions
>((set) => ({
  receivedRequests: [],
  sentRequests: [],
  loading: false,
  error: null,

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
      await friendshipService.respondToRequest(friendshipId, status);
      set((state) => ({
        receivedRequests: state.receivedRequests.filter(
          (req) => req.id !== friendshipId
        ),
        loading: false,
      }));
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
      await friendshipService.respondToRequest(friendshipId, FriendshipStatus.DECLINED);
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

  removeReceivedRequest: (friendshipId) => {
    set((state) => ({
      receivedRequests: state.receivedRequests.filter(
        (req) => req.id !== friendshipId
      ),
    }));
  },

  removeSentRequest: (friendshipId) => {
    set((state) => ({
      sentRequests: state.sentRequests.filter((req) => req.id !== friendshipId),
    }));
  },

  clearRequests: () => set({ receivedRequests: [], sentRequests: [] }),

  clearError: () => set({ error: null }),
}));
