// src/modules/friendship/dto/responses/friend-request-response.dto.ts
import { Expose, Type } from 'class-transformer';

class FriendRequestUserDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  avatarUrl?: string | null;
}

export class FriendRequestResponseDto {
  @Expose()
  id: string;

  @Expose()
  @Type(() => FriendRequestUserDto)
  sender: FriendRequestUserDto;

  @Expose()
  @Type(() => FriendRequestUserDto)
  receiver: FriendRequestUserDto;

  @Expose()
  mutualFriends: number;

  @Expose()
  requestMessage?: string | null;

  @Expose()
  updatedAt: Date;
}
