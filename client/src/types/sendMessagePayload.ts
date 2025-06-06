export interface SendMessagePayload {
  chatId: string;
  replyToMessageId?: string;
  content?: string;
  attachmentIds?: string[];
}
