// dto/call-lite-response.dto.ts
import { Exclude, Expose } from 'class-transformer';
import { CallStatus } from '../type/callStatus';

@Exclude()
export class CallLiteResponseDto {
  @Expose() id: string;

  @Expose() status: CallStatus;

  @Expose() startedAt: Date | null;

  @Expose() endedAt?: Date | null;
}
