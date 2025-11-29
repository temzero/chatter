import { Exclude, Expose } from 'class-transformer';
import { ChatMemberLite } from '@shared/types/responses/chat.response';

@Exclude()
export class ChatMemberLiteDto implements ChatMemberLite {
  @Expose() id: string;
  @Expose() userId: string;
  @Expose() avatarUrl?: string | null;
  @Expose() nickname?: string | null;
  @Expose() firstName: string | null;
  @Expose() lastName: string | null;
}
