import { IsEnum } from 'class-validator';
import { FriendshipStatus } from '@shared/types/enums/friendship-type.enum';

export class RespondToRequestDto {
  @IsEnum([FriendshipStatus.ACCEPTED, FriendshipStatus.DECLINED])
  status: FriendshipStatus.ACCEPTED | FriendshipStatus.DECLINED;
}
