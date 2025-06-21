import { ChatType } from "./enums/ChatType";
import { LastMessageResponse } from "./messageResponse";

export interface ChatResponse {
  id: string;
  type: ChatType;
  name: string | null;
  avatarUrl?: string | null;
  description?: string | null;
  myMemberId: string;
  updatedAt: string;
  unreadCount?: number;
  lastMessage?: LastMessageResponse | null;
  otherMemberUserIds?: string[];
}
