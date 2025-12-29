import { FriendshipStatus } from "@/shared/types/enums/friendship-type.enum";

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string | null;
  firstName: string;
  lastName: string;
  phoneNumber?: string | null;
  birthday?: Date | string | null;
  bio: string | null;
  status: string;
  role: string;
  lastActiveAt: Date | string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  // Relationship fields
  friendshipStatus?: FriendshipStatus | null;
  isBlockedByMe?: boolean;
  isBlockedMe?: boolean;
}
