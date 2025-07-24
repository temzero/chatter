// src/modules/friendship/dto/friendship-update-notification.dto.ts

import { Expose } from 'class-transformer';
import { FriendshipStatus } from '../../constants/friendship-status.constants';

export class FriendshipUpdateNotificationDto {
  @Expose()
  friendshipId: string;

  @Expose()
  status: FriendshipStatus | null;

  @Expose()
  firstName: string;

  @Expose()
  userId: string;

  @Expose()
  timestamp: string;
}
