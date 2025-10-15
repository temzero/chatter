import { Exclude, Expose } from 'class-transformer';
import { SystemEventType } from 'src/shared/types/enums/system-event-type.enum';
import { CallLiteResponse } from 'src/shared/types/responses/call-lite.response';
import { LastMessageResponse } from 'src/shared/types/responses/message.response';

@Exclude()
export class LastMessageResponseDto implements LastMessageResponse {
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
  call?: CallLiteResponse;

  @Expose()
  isForwarded?: boolean;

  @Expose()
  systemEvent?: SystemEventType | null;

  @Expose()
  createdAt: Date | string;
}
