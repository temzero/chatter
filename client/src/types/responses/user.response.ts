import { FriendshipStatus } from "../enums/friendshipType";

export type Theme = "light" | "dark" | "system";
export type LastSeenSetting = "everyone" | "contacts" | "nobody";
export type FontSize = "small" | "medium" | "large";

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
