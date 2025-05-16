// chat-group-member.dto.ts
export class ChatGroupMemberResponseDto {
  id: string;
  username: string;
  nickname: string | null;

  avatar: string | null;
  first_name: string;
  last_name: string;
  last_seen: Date | null;
  chat_group_id: string;
  is_admin: boolean;
  is_banned: boolean;
  muted_until: Date | null;
  joinedAt: Date;
}
