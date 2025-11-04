import { FriendshipStatus } from "@/shared/types/enums/friendship-type.enum";
import { UserResponse } from "./user.response";

export interface FriendshipResponse {
  id: string;
  senderId: string;
  sender: UserResponse;
  receiverId: string;
  receiver: UserResponse;
  status: FriendshipStatus;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  // Optional: You can also include sender and receiver user info if returned by API
  senderUsername?: string;
  receiverUsername?: string;
}

export interface FriendRequestResponse {
  id: string;
  sender: {
    id: string;
    name: string;
    avatarUrl?: string | null;
  };
  receiver: {
    id: string;
    name: string;
    avatarUrl?: string | null;
  };
  mutualFriends: number;
  requestMessage?: string | null;
  updatedAt: Date | string; // or Date, depending on how you want to handle it
}

export interface UserSummary {
  id: string;
  firstName: string;
  username: string;
  email: string;
  bio?: string;
  birthday?: string;
  phoneNumber?: string;
}

export interface FriendshipUpdateNotification {
  friendshipId: string;
  status: FriendshipStatus | null;
  timestamp: string;
  user: UserSummary; // Full user data of that person
}
