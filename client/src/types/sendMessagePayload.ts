export interface SendMessagePayload {
  chatId: string;
  memberId: string;
  replyToMessageId?: string | null;
  content?: string;
  attachmentIds?: string[];
}

export interface ForwardMessagePayload {
  chatId: string;
  messageId: string;
}
