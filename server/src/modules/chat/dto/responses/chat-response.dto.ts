import { ChatType } from '../../constants/chat-types.constants';
import { Exclude, Expose, Type } from 'class-transformer';
import { LastMessageResponseDto } from './last-message-response.dto';
import { ChatMemberRole } from 'src/modules/chat-member/constants/chat-member-roles.constants';

@Exclude()
export class ChatResponseDto {
  @Expose() id: string;

  @Expose() type: ChatType;

  @Expose() myMemberId: string;

  @Expose() updatedAt: Date;

  @Expose() unreadCount?: number;

  @Expose()
  @Type(() => LastMessageResponseDto)
  lastMessage?: LastMessageResponseDto | null;

  @Expose() otherMemberUserIds?: string[];

  /**
   * - Direct chat: nickname or full name of chat partner
   * - Group chat: group name
   */
  @Expose() name: string | null;

  /**
   * - Direct chat: avatar of chat partner
   * - Group chat: group avatar
   */
  @Expose() avatarUrl?: string | null;

  /** Group/channel only */
  @Expose() description?: string | null;

  @Expose() myRole?: ChatMemberRole;
}
