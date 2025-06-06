import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class SenderResponseDto {
  @Expose()
  id: string;

  @Expose()
  avatarUrl?: string | null;

  @Expose()
  username: string;

  @Expose()
  displayName: string | null;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;
}
