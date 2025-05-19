import { Expose, Type } from 'class-transformer';
import { UserResponseDto } from '../../../user/dto/responses/user-response.dto';
import { FriendshipStatus } from '../../constants/friendship-status.constants';

export class FriendshipResponseDto {
  @Expose()
  id: string;

  @Expose()
  @Type(() => UserResponseDto)
  requester: UserResponseDto;

  @Expose()
  @Type(() => UserResponseDto)
  addressee: UserResponseDto;

  @Expose()
  status: FriendshipStatus;

  @Expose()
  createdAt: Date;
}
