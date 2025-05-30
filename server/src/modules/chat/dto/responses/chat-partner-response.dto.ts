import { Exclude, Expose } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { FriendshipStatus } from 'src/modules/friendship/constants/friendship-status.constants';

@Exclude()
export class ChatPartnerDto {
  @Expose()
  userId: string;

  @Expose()
  avatarUrl: string | null;

  @IsOptional()
  @Expose()
  nickname?: string | null;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  bio: string | null;

  @IsOptional()
  @Expose()
  username: string;

  @IsOptional()
  @Expose()
  email: string;

  @Expose()
  phoneNumber: string | null;

  @IsOptional()
  @Expose()
  birthday: Date | null;

  @Expose()
  friendshipStatus?: FriendshipStatus;
}
