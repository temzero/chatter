import { ChatType } from 'src/shared/types/enums/chat-type.enum';
import { Exclude, Expose, Type } from 'class-transformer';
import { LastMessageResponseDto } from './last-message-response.dto';
import { ChatMemberRole } from 'src/shared/types/enums/chat-member-role.enum';
import { MessageResponseDto } from 'src/modules/message/dto/responses/message-response.dto';
import { ChatMemberLiteDto } from './chat-member-lite.dto';
import { ChatResponse } from 'src/shared/types/responses/chat.response';

@Exclude()
export class ChatResponseDto implements ChatResponse {
  @Expose() id: string;

  @Expose() type: ChatType;

  @Expose() myMemberId: string | null;

  @Expose() updatedAt: Date | string | null;

  @Expose() unreadCount?: number;

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

  @Expose()
  @Type(() => ChatMemberLiteDto)
  previewMembers?: ChatMemberLiteDto[];

  @Expose()
  @Type(() => MessageResponseDto)
  pinnedMessage?: MessageResponseDto | null;

  @Expose()
  @Type(() => LastMessageResponseDto)
  lastMessage?: LastMessageResponseDto | null;

  @Expose()
  mutedUntil?: string | Date | null;

  @Expose()
  inviteLinks?: string[];

  @Expose()
  isDeleted?: boolean | null;
}

@Exclude()
export class ChatWithMessagesResponseDto extends ChatResponseDto {
  /**
   * Array of messages in this chat
   */
  @Expose()
  @Type(() => MessageResponseDto)
  messages: MessageResponseDto[];

  /**
   * Indicates if there are more messages available to load
   */
  @Expose()
  hasMoreMessages: boolean;
}
