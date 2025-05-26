import { ChatType } from '../../constants/chat-types.constants';
import { Exclude, Expose, Type } from 'class-transformer';
import { LastMessageResponseDto } from './last-message-response.dto';
import { ChatMemberRole } from 'src/modules/chat-member/constants/chat-member-roles.constants';
import { ChatPartnerDto } from './chat-partner-response.dto';

export type ChatResponseDto = DirectChatResponseDto | GroupChatResponseDto;

// Base DTO for shared fields (extended by others)
@Exclude()
export abstract class BaseChatResponseDto {
  @Expose() id: string;
  @Expose() myNickname?: string | null;
  @Expose() updatedAt: Date;
  @Expose() unreadCount?: number;
  @Expose()
  @Type(() => LastMessageResponseDto)
  lastMessage?: LastMessageResponseDto | null;
}

// Direct Chat (only user-specific fields)
@Exclude()
export class DirectChatResponseDto extends BaseChatResponseDto {
  @Expose() type: ChatType.DIRECT;
  @Expose()
  @Type(() => ChatPartnerDto)
  chatPartner: ChatPartnerDto; // Only critical fields (id, username, avatar)
}

// Group/Channel Chat (only group-specific fields)
@Exclude()
export class GroupChatResponseDto extends BaseChatResponseDto {
  @Expose() type: ChatType.GROUP | ChatType.CHANNEL;
  @Expose() name: string | null;
  @Expose() avatarUrl?: string | null;
  @Expose() description?: string | null;
  @Expose() myRole?: ChatMemberRole;
  @Expose() memberCount?: number;
}
