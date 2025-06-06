// message-response.dto.ts
import { Exclude, Expose, Type } from 'class-transformer';
import { MessageStatus } from '../../constants/message-status.constants';
import { MessageType } from '../../constants/message-type.constants';
import { AttachmentResponseDto } from './attachment-response.dto';
import { ReactionResponseDto } from './reaction-response.dto';

@Exclude()
export class MessageResponseDto {
  @Expose() id: string;
  @Expose() chatId: string;
  @Expose() senderId: string;

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

  @Expose()
  @Type(() => ReactionResponseDto)
  reactions?: ReactionResponseDto[];

  @Expose()
  @Type(() => AttachmentResponseDto)
  attachments?: AttachmentResponseDto[];
}
