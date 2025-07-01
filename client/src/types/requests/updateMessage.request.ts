import { MessageStatus } from "../enums/message";

export class UpdateMessageRequest {
  content?: string;
  status?: MessageStatus;
  isPinned?: boolean;
}
