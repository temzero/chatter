import { ChatMemberRole } from "../enums/ChatMemberRole";
import { ChatType } from "../enums/ChatType";
import { LastMessageResponse, MessageResponse } from "./message.response";

export interface ChatResponse {
  id: string;
  type: ChatType;
  name: string | null;
  avatarUrl?: string | null;
  description?: string | null;
  myMemberId: string;
  myRole?: ChatMemberRole;
  updatedAt: string;
  otherMemberUserIds?: string[];
  pinnedMessage?: MessageResponse | null;
  lastMessage?: LastMessageResponse | null;
  unreadCount?: number;
  mutedUntil?: string | Date | null;
}
