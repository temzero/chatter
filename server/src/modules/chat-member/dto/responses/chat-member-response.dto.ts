import { Exclude, Expose } from 'class-transformer';
import { ChatMemberRole } from '../../constants/chat-member-roles.constants';
import { ChatMemberStatus } from '../../constants/chat-member-status.constants';
import { FriendshipStatus } from 'src/modules/friendship/constants/friendship-status.constants';

export type ChatMemberResponseDto =
  | DirectChatMemberResponseDto
  | GroupChatMemberResponseDto;

@Exclude()
export class GroupChatMemberResponseDto {
  @Expose() id: string;

  @Expose() chatId: string;

  @Expose() userId: string;

  @Expose() avatarUrl: string | null;

  @Expose() firstName: string;

  @Expose() lastName: string;

  @Expose() nickname: string | null;

  @Expose() role: ChatMemberRole;

  @Expose() status: ChatMemberStatus;

  @Expose() customTitle: string | null;

  @Expose() mutedUntil: Date | null;

  @Expose() lastReadMessageId: string | null;

  @Expose() createdAt: Date;
}

@Exclude()
export class DirectChatMemberResponseDto extends GroupChatMemberResponseDto {
  @Expose() username: string;

  @Expose() email: string;

  @Expose() phoneNumber: string | null;

  @Expose() birthday: Date | null;

  @Expose() bio: string | null;

  @Expose() friendshipStatus?: FriendshipStatus;
}
