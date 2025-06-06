import { Exclude, Expose } from 'class-transformer';
import { FriendshipStatus } from 'src/modules/friendship/constants/friendship-status.constants';

@Exclude()
export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  username: string;

  @Expose()
  avatarUrl?: string | null;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  email: string;

  @Expose()
  emailVerified: boolean;

  @Expose()
  phoneNumber?: string | null;

  @Expose()
  phoneVerified: boolean;

  @Expose()
  birthday?: Date | null;

  @Expose()
  bio: string;

  @Expose()
  role: string;

  @Expose()
  status: string;

  @Expose()
  isOnline: boolean;

  @Expose()
  lastActiveAt: string;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}

@Exclude()
export class ChatPartnerResDto {
  @Expose()
  id: string;

  @Expose()
  username: string;

  @Expose()
  avatarUrl?: string | null;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  email: string;

  @Expose()
  emailVerified: boolean;

  @Expose()
  phoneNumber?: string | null;

  @Expose()
  phoneVerified: boolean;

  @Expose()
  birthday?: Date | null;

  @Expose()
  bio?: string | null;

  @Expose()
  friendshipStatus?: FriendshipStatus | null;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
