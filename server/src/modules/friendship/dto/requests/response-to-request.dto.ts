import { IsEnum } from 'class-validator';
import { FriendshipStatus } from '../../constants/friendship-status.constants';

export class RespondToRequestDto {
  @IsEnum([FriendshipStatus.ACCEPTED, FriendshipStatus.DECLINED])
  status: FriendshipStatus.ACCEPTED | FriendshipStatus.DECLINED;
}
