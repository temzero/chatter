import { FriendshipStatus } from "./enums/friendshipType";

export interface FriendshipResponseDto {
  id: string;
  senderId: string;
  receiverId: string;
  status: FriendshipStatus;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  // Optional: You can also include sender and receiver user info if returned by API
  senderUsername?: string;
  receiverUsername?: string;
}
