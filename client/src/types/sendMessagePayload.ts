export interface SendMessagePayload {
  chatId: string;
  memberId: string;
  replyToMessageId?: string;
  content?: string;
  attachmentIds?: string[];
}
