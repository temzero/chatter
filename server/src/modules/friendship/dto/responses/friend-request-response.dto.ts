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
  updatedAt: Date;
}

export interface SentRequestResDto {
  id: string;
  receiverId: string;
  receiverName: string;
  receiverAvatarUrl?: string | null;
  mutualFriends: number;
  requestMessage?: string | null;
  updatedAt: Date;
}
