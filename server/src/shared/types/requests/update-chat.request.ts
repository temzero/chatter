export interface UpdateChatRequest {
  chatId: string;
  avatarUrl?: string | null;
  name?: string | null;
  description?: string | null;
  pinnedMessageId?: string;
  isPublic?: boolean;
}
