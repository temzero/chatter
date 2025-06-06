import { MessageStatus } from "./enums/message";

export class UpdateMessageDto {
  content?: string;

  status?: MessageStatus;

  isPinned?: boolean;
}
