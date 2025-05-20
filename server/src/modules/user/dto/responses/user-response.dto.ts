import { Exclude, Expose, Transform } from 'class-transformer';
import { UserRole } from '../../constants/user-role.constants';
import { UserStatus } from '../../constants/user-status.constants';
import { UserSettingsResponseDto } from './user-settings-response.dto';
import { DateStringOrNull, StringOrNull } from 'src/common/utils/dto.utils';

@Exclude()
export class UserResponseDto {
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
  email: string;

  @Expose()
  @StringOrNull()
  phoneNumber: string | null;

  @Expose()
  @StringOrNull()
  bio: string | null;

  @Expose()
  @DateStringOrNull()
  birthday: string | null;

  @Expose()
  role: UserRole;

  @Expose()
  status: UserStatus;

  @Expose()
  emailVerified: boolean;

  @Expose()
  phoneVerified: boolean;

  @Expose()
  isOnline: boolean;

  @Expose()
  @DateStringOrNull()
  lastActiveAt: string | null;

  @Expose()
  @Transform(({ value }): Record<string, unknown> => value ?? {})
  metadata: Record<string, unknown>;

  @Expose()
  @DateStringOrNull()
  createdAt: string;

  @Expose()
  @DateStringOrNull()
  updatedAt: string;

  @Expose()
  @DateStringOrNull()
  deletedAt: string | null;

  @Expose()
  @Transform(({ obj }: { obj: Partial<UserResponseDto> }) => {
    if (obj.settings) {
      return new UserSettingsResponseDto();
    }
    return null;
  })
  settings: UserSettingsResponseDto | null;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
