import { Exclude, Expose } from 'class-transformer';
import { DateOrNull, StringOrNull } from 'src/common/utils/dto.utils';

@Exclude()
export class PublicUserResponseDto {
  @Expose()
  id: string;

  @Expose()
  @StringOrNull()
  avatarUrl: string | null;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  username: string;

  @Expose()
  @StringOrNull()
  bio: string | null;

  @Expose()
  isOnline: boolean;

  @Expose()
  @DateOrNull()
  lastActiveAt: string | null;

  constructor(partial: Partial<PublicUserResponseDto>) {
    Object.assign(this, partial);
  }
}
