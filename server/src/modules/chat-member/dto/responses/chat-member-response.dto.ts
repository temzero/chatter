import { ChatMemberRole } from '../../constants/chat-member-roles.constants';
import { ChatMemberStatus } from '../../constants/chat-member-status.constants';

export class ChatMemberResponseDto {
  id: string;
  chatId: string;
  userId: string;
  role: ChatMemberRole;
  status: ChatMemberStatus;
  nickname: string | null;
  customTitle: string | null;
  mutedUntil: Date | null;
  lastReadAt: Date | null;
  lastReadMessageId: string | null;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    username: string;
    avatar?: string;
  };
}
