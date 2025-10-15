// mappers/call.mapper.ts
import { Call } from '../entities/call.entity';
import { CallLiteResponseDto } from '../dto/call-lite-response.dto';

export function mapCallToCallLiteResponse(call: Call): CallLiteResponseDto {
  return {
    id: call.id,
    status: call.status,
    startedAt: call.startedAt,
    endedAt: call.endedAt ?? null,
  };
}
