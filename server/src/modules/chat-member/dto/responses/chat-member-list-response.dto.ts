import { ChatMemberRole } from '../../constants/chat-member-roles.constants';
import { ChatMemberStatus } from '../../constants/chat-member-status.constants';

export class ChatMemberListResponseDto {
  chatId: string;
  userId: string;
  role: ChatMemberRole;
  status: ChatMemberStatus;
  nickname: string | null;
  user?: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
}
