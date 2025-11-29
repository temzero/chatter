import { Exclude, Expose } from 'class-transformer';
import { FriendshipStatus } from '@shared/types/enums/friendship-type.enum';
import { UserResponse } from '@shared/types/responses/user.response';

@Exclude()
export class UserResponseDto implements UserResponse {
  @Expose() id: string;
  @Expose() username: string;
  @Expose() avatarUrl: string | null;
  @Expose() firstName: string;
  @Expose() lastName: string;
  @Expose() email: string;
  @Expose() emailVerified: boolean;
  @Expose() phoneNumber?: string | null;
  @Expose() phoneVerified: boolean;
  @Expose() birthday: Date | string | null;
  @Expose() bio: string | null;
  @Expose() role: string;
  @Expose() status: string;
  @Expose() lastActiveAt: Date | string | null;

  // Optional for "other" users
  @Expose() friendshipStatus?: FriendshipStatus | null;
  @Expose() isBlockedByMe?: boolean;
  @Expose() isBlockedMe?: boolean;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
