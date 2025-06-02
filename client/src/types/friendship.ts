import { FriendshipStatus } from "./enums/friendshipType";
import { User } from "./user";

export interface FriendshipResDto {
  id: string;
  senderId: string;
  sender: User;
  receiverId: string;
  receiver: User;
  status: FriendshipStatus;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  // Optional: You can also include sender and receiver user info if returned by API
  senderUsername?: string;
  receiverUsername?: string;
}

export interface FriendRequestResDto {
  sent: SentRequestResDto[];
  received: ReceivedRequestsResDto[];
}

export interface ReceivedRequestsResDto {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatarUrl?: string | null;
  mutualFriends: number;
  requestMessage?: string | null;
  updatedAt: string;
}

export interface SentRequestResDto {
  id: string;
  receiverId: string;
  receiverName: string;
  receiverAvatarUrl?: string | null;
  mutualFriends: number;
  requestMessage?: string | null;
  updatedAt: string;
}

export { FriendshipStatus };

