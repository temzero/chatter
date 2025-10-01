import { Exclude, Expose } from 'class-transformer';
// import { CallResponseDto } from 'src/modules/call/dto/call-response.dto';
import { Call } from 'src/modules/call/entities/call.entity';
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
  call?: Call;
  // call?: CallResponseDto;

  @Expose()
  isForwarded?: boolean;

  @Expose()
  systemEvent?: SystemEventType | null;

  @Expose()
  createdAt: Date;
}
