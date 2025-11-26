import { Exclude, Expose } from 'class-transformer';
import { SenderResponse } from 'src/shared/types/responses/message.response';

@Exclude()
export class SenderResponseDto implements SenderResponse {
  @Expose()
  id: string;

  @Expose()
  avatarUrl?: string | null;

  @Expose()
  displayName: string;
}
