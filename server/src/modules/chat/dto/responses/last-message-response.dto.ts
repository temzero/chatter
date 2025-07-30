import { Exclude, Expose } from 'class-transformer';
import { SystemEventType } from 'src/modules/message/constants/system-event-type.constants';

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
  systemEvent?: SystemEventType | null;

  @Expose()
  createdAt: Date;
}
