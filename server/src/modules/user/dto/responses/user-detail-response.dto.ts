import { Exclude, Expose, Transform } from 'class-transformer';
import { UserRole } from '../../constants/user-role.constants';
import { UserStatus } from '../../constants/user-status.constants';
import { UserSettingsResponseDto } from './user-settings-response.dto';

@Exclude()
export class UserDetailResponseDto {
  @Expose()
  id: string;

  @Expose()
  avatarUrl?: string | null;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  username: string;

  @Expose()
  email: string;

  @Expose()
  phoneNumber?: string | null;

  @Expose()
  bio?: string | null;

  @Expose()
  birthday?: string | null;

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
  lastActiveAt?: string | null;

  @Expose()
  @Transform(({ value }): Record<string, unknown> => value ?? {})
  metadata: Record<string, unknown>;

  @Expose()
  createdAt?: string | null;

  @Expose()
  updatedAt?: string | null;

  @Expose()
  deletedAt?: string | null;

  @Expose()
  @Transform(({ obj }: { obj: Partial<UserDetailResponseDto> }) => {
    if (obj.settings) {
      return new UserSettingsResponseDto();
    }
    return null;
  })
  settings: UserSettingsResponseDto | null;

  constructor(partial: Partial<UserDetailResponseDto>) {
    Object.assign(this, partial);
  }
}
