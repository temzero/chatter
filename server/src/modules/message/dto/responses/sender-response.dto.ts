import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class SenderResponseDto {
  @Expose()
  id: string;

  @Expose()
  avatarUrl?: string | null;

  @Expose()
  displayName: string | null;
}
