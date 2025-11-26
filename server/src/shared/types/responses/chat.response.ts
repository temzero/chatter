import { ChatType } from 'src/shared/types/enums/chat-type.enum';
import { ChatMemberRole } from 'src/shared/types/enums/chat-member-role.enum';
import { MessageResponse } from './message.response';
import { ChatMemberResponse } from './chat-member.response';
import { PaginationResponse } from './pagination.response';

export interface ChatResponse {
  id: string;
  type: ChatType;
  name: string | null;
  avatarUrl?: string | null;
  description?: string | null;
  myMemberId: string | null;
  myRole?: ChatMemberRole;
  updatedAt?: Date | string | null;
  otherMemberUserIds?: string[];
  pinnedMessage?: MessageResponse | null;
  unreadCount?: number;
  mutedUntil?: string | Date | null;
  inviteLinks?: string[];
  pinnedAt?: Date | string | null;
  isDeleted?: boolean | null;
  previewMembers?: ChatMemberLite[];
}

export interface ChatMemberLite {
  id: string;
  userId: string;
  avatarUrl?: string | null;
  nickname?: string | null;
  firstName: string | null;
  lastName: string | null;
}

export interface ChatDataResponse extends ChatResponse {
  messageData: PaginationResponse<MessageResponse>;
  memberData: PaginationResponse<ChatMemberResponse>;
}
