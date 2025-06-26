import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class LastMessageResponseDto {
  @Expose()
  id: string;

  @Expose()
  senderId: string;

  @Expose()
  senderDisplayName: string;

  @Expose()
  content?: string;

  @Expose()
  icons?: string[];

  @Expose()
  isForwarded?: boolean;

  @Expose()
  createdAt: Date;
}
