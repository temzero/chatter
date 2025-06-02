import { Exclude, Expose } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { FriendshipStatus } from 'src/modules/friendship/constants/friendship-status.constants';

@Exclude()
export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  username: string;

  @IsOptional()
  @Expose()
  avatarUrl: string | null;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  email: string;

  @Expose()
  emailVerified: boolean;

  @IsOptional()
  @Expose()
  phoneNumber: string | null;

  @Expose()
  phoneVerified: boolean;

  @IsOptional()
  @Expose()
  birthday: Date | null;

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

  @IsOptional()
  @Expose()
  avatarUrl: string | null;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  email: string;

  @Expose()
  emailVerified: boolean;

  @IsOptional()
  @Expose()
  phoneNumber: string | null;

  @Expose()
  phoneVerified: boolean;

  @IsOptional()
  @Expose()
  birthday: Date | null;

  @IsOptional()
  @Expose()
  bio: string | null;

  @IsOptional()
  @Expose()
  friendshipStatus: FriendshipStatus | null;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
