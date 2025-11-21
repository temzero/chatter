// dto/call-lite-response.dto.ts
import { Exclude, Expose } from 'class-transformer';
import { CallStatus } from 'src/shared/types/call';
import { CallLiteResponse } from 'src/shared/types/responses/call-lite.response';

@Exclude()
export class CallLiteResponseDto implements CallLiteResponse {
  @Expose() id: string;

  @Expose() status: CallStatus;

  @Expose() startedAt?: Date | string | null;

  @Expose() endedAt?: Date | string | null;
}
