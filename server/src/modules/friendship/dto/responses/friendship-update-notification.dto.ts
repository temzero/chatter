import { Expose, Type } from 'class-transformer';
import { FriendshipStatus } from '@shared/types/enums/friendship-type.enum';
import {
  FriendshipUpdateNotification,
  UserSummary,
} from '@shared/types/responses/friendship.response';

export class UserSummaryDto implements UserSummary {
  @Expose()
  id: string;

  @Expose()
  firstName: string;

  @Expose()
  username: string;

  @Expose()
  email: string;

  @Expose()
  bio?: string;

  @Expose()
  birthday?: string;

  @Expose()
  phoneNumber?: string;
}

export class FriendshipUpdateNotificationDto implements FriendshipUpdateNotification {
  @Expose()
  friendshipId: string;

  @Expose()
  status: FriendshipStatus | null;

  @Expose()
  timestamp: string;

  @Expose()
  @Type(() => UserSummaryDto)
  user: UserSummaryDto; // 👈 full accepted user's data
}
