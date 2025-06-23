// message-response.dto.ts
import { Exclude, Expose, Type } from 'class-transformer';
import { MessageStatus } from '../../constants/message-status.constants';
import { MessageType } from '../../constants/message-type.constants';
import { AttachmentResponseDto } from './attachment-response.dto';

@Exclude()
export class MessageResponseDto {
  @Expose() id: string;
  @Expose() chatId: string;
  @Expose() senderId: string;
  @Expose() senderNickname: string;
  @Expose() senderFirstName: string;
  @Expose() senderLastName: string;
  @Expose() senderAvatarUrl: string;

  @Expose() type: MessageType;
  @Expose() content?: string | null;
  @Expose() status: MessageStatus;

  @Expose() isPinned: boolean;
  @Expose() pinnedAt?: Date | null;
  @Expose() replyToMessageId?: string | null;
  @Expose() replyCount: number;
  @Expose() editedAt?: Date | null;
  @Expose() isDeleted: boolean;
  @Expose() deletedAt?: Date | null;
  @Expose() createdAt: Date;
  @Expose() updatedAt: Date;
  @Expose() reactions: Record<string, string[]>;

  @Expose()
  @Type(() => AttachmentResponseDto)
  attachments?: AttachmentResponseDto[];
}
