import { ChatMemberRole } from "../enums/chat-member-role.enum";
import { ChatMemberStatus } from "../enums/chat-member-status.enum";

export interface UpdateChatMemberRequest {
  nickname?: string | null;
  role?: ChatMemberRole | null;
  status?: ChatMemberStatus | null;
  customTitle?: string | null;
  mutedUntil?: Date | null;
  lastReadMessageId?: string | null;
  pinnedAt?: Date | string | null;
}
