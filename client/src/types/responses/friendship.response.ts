import { FriendshipStatus } from "../enums/friendshipType";
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
  sent: SentRequestResponse[];
  received: ReceivedRequestsResponse[];
}

export interface ReceivedRequestsResponse {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatarUrl?: string | null;
  mutualFriends: number;
  requestMessage?: string | null;
  updatedAt: string;
}

export interface SentRequestResponse {
  id: string;
  receiverId: string;
  receiverName: string;
  receiverAvatarUrl?: string | null;
  mutualFriends: number;
  requestMessage?: string | null;
  updatedAt: string;
}
