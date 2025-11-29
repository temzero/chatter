import { IsUUID } from 'class-validator';
import { ForwardMessageRequest } from '@shared/types/requests/forward-message.request';

export class ForwardMessageDto implements ForwardMessageRequest {
  @IsUUID()
  chatId: string;

  @IsUUID()
  messageId: string;
}
