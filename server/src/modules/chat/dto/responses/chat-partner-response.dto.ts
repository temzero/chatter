import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ChatPartnerDto {
  @Expose()
  userId: string;

  @Expose()
  avatarUrl: string | null;

  @Expose()
  username: string;

  @Expose()
  nickname: string | null;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  bio: string | null;

  @Expose()
  email: string;

  @Expose()
  phoneNumber: string | null;

  @Expose()
  birthday: Date | null;
}
