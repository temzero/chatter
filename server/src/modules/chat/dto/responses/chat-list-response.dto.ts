import { ChatType } from '../../constants/chat-types.constants';
import { Exclude, Expose, Type } from 'class-transformer';
import { LastMessageResponseDto } from './last-message-response.dto';
import { ChatMemberRole } from 'src/modules/chat-member/constants/chat-member-roles.constants';

@Exclude()
export class ChatListResponseDto {
  // Common fields for ALL chats
  @Expose() id: string;
  @Expose() type: ChatType; // "direct" | "group" | "channel"
  @Expose() name: string;
  @Expose() avatarUrl?: string | null;
  @Expose() description?: string | null;

  @Expose() updatedAt: Date;
  @Expose() unreadCount?: number;
  @Expose()
  @Type(() => LastMessageResponseDto)
  lastMessage?: LastMessageResponseDto;

  @Expose({ groups: ['direct'] })
  userId: string;
  @Expose({ groups: ['direct'] })
  username: string;
  @Expose({ groups: ['direct'] })
  firstName: string;
  @Expose({ groups: ['direct'] })
  lastName: string;
  @Expose({ groups: ['direct'] })
  email: string;
  @Expose({ groups: ['direct'] })
  phoneNumber: string;
  @Expose({ groups: ['direct'] })
  birthday: string;

  @Expose({ groups: ['group-channel'] })
  myRole?: ChatMemberRole; // Only for groups and channel
  @Expose({ groups: ['group-channel'] })
  memberCount?: number; // Only for groups and channel
}
