import { UserRole } from '../../constants/user-role.constants';
import { UserStatus } from '../../constants/user-status.constants';

export class UserResponseDto {
  id: string;

  firstName: string;

  lastName: string;

  username: string;

  email: string;

  phoneNumber?: string | null;

  role: UserRole;

  status: UserStatus;

  avatarUrl?: string | null;

  lastLoginAt?: Date | null;

  createdAt: Date;
}
