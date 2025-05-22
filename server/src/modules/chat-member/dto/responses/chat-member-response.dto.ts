import { Exclude, Expose } from 'class-transformer';
import { ChatMemberRole } from '../../constants/chat-member-roles.constants';
import { ChatMemberStatus } from '../../constants/chat-member-status.constants';

@Exclude()
export class ChatMemberResponseDto {
  @Expose()
  userId: string;

  @Expose()
  username: string;

  @Expose()
  avatarUrl: string | null;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  nickname: string | null;

  @Expose()
  role: ChatMemberRole;

  @Expose()
  status: ChatMemberStatus;

  @Expose()
  customTitle: string | null;

  @Expose()
  mutedUntil: Date | null;

  @Expose()
  lastReadAt: Date | null;

  @Expose()
  lastReadMessageId: string | null;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
