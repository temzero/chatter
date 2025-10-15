import { Expose } from 'class-transformer';
import { FriendshipStatus } from 'src/shared/types/enums/friendship-type.enum';

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
