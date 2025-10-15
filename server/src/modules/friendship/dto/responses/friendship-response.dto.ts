// src/modules/friendship/dto/friendship-response.dto.ts
import { Expose, Type } from 'class-transformer';
import { FriendshipStatus } from 'src/shared/types/enums/friendship-type.enum';
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
