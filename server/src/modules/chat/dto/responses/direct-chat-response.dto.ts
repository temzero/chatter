import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class PrivateChatResponseDto {
  @Expose()
  id: string;

  @Expose()
  type: string; // ChatType.DIRECT

  @Expose()
  opponent: {
    id: string;
    name: string;
    avatar: string | null;
  };

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
