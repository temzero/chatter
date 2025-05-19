import { IsEnum, IsUUID } from 'class-validator';
import { FriendshipStatus } from '../../constants/friendship-status.constants';

export class RespondFriendRequestDto {
  @IsUUID()
  friendshipId: string;

  @IsEnum(FriendshipStatus)
  status: FriendshipStatus.ACCEPTED | FriendshipStatus.DECLINED;
}
