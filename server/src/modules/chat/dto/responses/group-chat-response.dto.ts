import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class GroupChatResponseDto {
  @Expose()
  id: string;

  @Expose()
  type: string; // ChatType.GROUP

  @Expose()
  name: string | null;

  @Expose()
  description: string | null;

  @Expose()
  avatar: string | null;

  @Expose()
  isPublic: boolean;

  @Expose()
  isBroadcastOnly: boolean;

  @Expose()
  lastMessage: any; // Replace with MessageDto if available

  @Expose()
  member: {
    userId: string;
    nickname: string | null;
    customTitle: string | null;
    role: string;
    status: string;
    lastReadAt: Date | null;
    lastReadMessageId: string | null;
  };

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
