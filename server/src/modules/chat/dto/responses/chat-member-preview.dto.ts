import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ChatMemberPreviewDto {
  @Expose() id: string;
  @Expose() userId: string;
  @Expose() avatarUrl?: string | null;
  @Expose() nickname?: string | null;
  @Expose() firstName: string | null;
  @Expose() lastName: string | null;
}
