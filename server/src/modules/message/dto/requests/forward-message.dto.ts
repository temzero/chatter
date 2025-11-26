import { IsUUID } from 'class-validator';
import { ForwardMessageRequest } from 'src/shared/types/requests/forward-message.request';

export class ForwardMessageDto implements ForwardMessageRequest {
  @IsUUID()
  chatId: string;

  @IsUUID()
  messageId: string;
}
