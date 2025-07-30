import { Exclude, Expose, Type } from 'class-transformer';
import { MessageStatus } from '../../constants/message-status.constants';
import { MessageType } from '../../constants/message-type.constants';
import { AttachmentResponseDto } from './attachment-response.dto';
import { SenderResponseDto } from './sender-response.dto';
import { SystemEventType } from '../../constants/system-event-type.constants';
// import { NestedMessageDto } from './message-nested.dto';

@Exclude()
export class MessageResponseDto {
  @Expose() id: string;
  @Expose() chatId: string;
  @Expose() sender: SenderResponseDto;

  @Expose() type: MessageType;
  @Expose() content?: string | null;
  @Expose() status: MessageStatus;

  @Expose() isPinned: boolean;
  @Expose() pinnedAt?: Date | null;

  @Expose() replyToMessageId?: string | null;

  @Expose()
  @Type(() => MessageResponseDto)
  replyToMessage?: MessageResponseDto | null;

  @Expose() replyCount: number;

  @Expose() forwardedFromMessageId?: string | null;

  @Expose()
  @Type(() => MessageResponseDto)
  forwardedFromMessage?: MessageResponseDto | null;

  @Expose() isImportant?: boolean;
  @Expose() systemEvent?: SystemEventType | null;
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
