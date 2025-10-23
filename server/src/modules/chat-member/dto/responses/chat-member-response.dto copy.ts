import { Exclude, Expose } from 'class-transformer';
import { ChatMemberRole } from 'src/shared/types/enums/chat-member-role.enum';
import { ChatMemberStatus } from 'src/shared/types/enums/chat-member-status.enum';
import { FriendshipStatus } from 'src/shared/types/enums/friendship-type.enum';

import {
  DirectChatMember,
  GroupChatMember,
} from 'src/shared/types/responses/chat-member.response';

// export type ChatMemberResponseDto =
//   | DirectChatMemberResponseDto
//   | GroupChatMemberResponseDto;

@Exclude()
export class GroupChatMemberResponseDto implements GroupChatMember {
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

  @Expose() isBlockedByMe: boolean;

  @Expose() isBlockedMe: boolean;

  @Expose() pinnedAt?: Date | string;

  @Expose() createdAt: Date | string;
}

@Exclude()
export class DirectChatMemberResponseDto
  extends GroupChatMemberResponseDto
  implements DirectChatMember
{
  @Expose() username: string;

  @Expose() email: string;

  @Expose() phoneNumber: string | null;

  @Expose() birthday: Date | null;

  @Expose() bio: string | null;

  @Expose() friendshipStatus?: FriendshipStatus;
}
