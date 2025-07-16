// src/modules/friendship/dto/friendship-response.dto.ts
import { Expose, Type } from 'class-transformer';
import { FriendshipStatus } from '../../constants/friendship-status.constants';
import { UserResponseDto } from 'src/modules/user/dto/responses/user-response.dto';

export class FriendshipResponseDto {
  @Expose()
  id: string;

  @Expose()
  @Type(() => UserResponseDto)
  sender: UserResponseDto;

  @Expose()
  @Type(() => UserResponseDto)
  receiver: UserResponseDto;

  @Expose()
  senderStatus: FriendshipStatus;

  @Expose()
  receiverStatus: FriendshipStatus;

  @Expose()
  requestMessage: string | null;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}

// For friendship status with a specific user
export class FriendshipStatusResponseDto {
  @Expose()
  status: FriendshipStatus;

  @Expose({ name: 'request_message' })
  requestMessage: string | null;

  @Expose({ name: 'created_at' })
  createdAt: Date;
}
