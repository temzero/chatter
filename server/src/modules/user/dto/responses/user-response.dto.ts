import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  username: string;

  @Expose()
  avatarUrl: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  email: string;

  @Expose()
  emailVerified: boolean;

  @Expose()
  phoneNumber: string;

  @Expose()
  phoneVerified: boolean;

  @Expose()
  birthday: Date;

  @Expose()
  bio: string;

  @Expose()
  role: string;

  @Expose()
  status: string;

  @Expose()
  isOnline: boolean;

  @Expose()
  lastActiveAt: string;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
