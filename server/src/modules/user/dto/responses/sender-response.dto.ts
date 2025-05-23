import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class SenderResponseDto {
  // @Expose()
  // id: string;

  // @Expose()
  // avatarUrl: string;

  @Expose()
  nickname: string;

  @Expose()
  firstName: string;

  // @Expose()
  // isOnline: boolean;
}
