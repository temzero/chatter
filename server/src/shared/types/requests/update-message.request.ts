import { MessageStatus } from '@shared/types/enums/message-status.enum';

export class UpdateMessageRequest {
  content?: string;
  status?: MessageStatus;
  isPinned?: boolean;
}
