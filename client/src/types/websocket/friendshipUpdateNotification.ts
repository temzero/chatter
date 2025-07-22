import { FriendshipStatus } from "../enums/friendshipType";

export interface FriendshipUpdateNotification {
  friendshipId: string;
  status: FriendshipStatus;
  firstName: string;
  userId: string;
  timestamp: string;
}
