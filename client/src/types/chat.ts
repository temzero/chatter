import { ChatMemberRole } from "./ChatMemberRole";
import { ChatType } from "./enums/ChatType";
import { LastMessageResponse, MessageResponse } from "./messageResponse";

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
}
