import { Exclude, Expose, Type } from 'class-transformer';
import { MessageStatus } from '@shared/types/enums/message-status.enum';
import { SenderResponseDto } from './sender-response.dto';
import { SystemEventType } from '@shared/types/enums/system-event-type.enum';
import { CallLiteResponseDto } from '@/modules/call/dto/call-lite-response.dto';
import { MessageResponse } from '@shared/types/responses/message.response';
import { AttachmentResponseDto } from '@/modules/attachment/dto/responses/attachment-response.dto';

@Exclude()
export class MessageResponseDto implements MessageResponse {
  @Expose() id: string;
  @Expose() chatId: string;
  @Expose() sender: SenderResponseDto;

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

  @Type(() => CallLiteResponseDto)
  @Expose()
  call?: CallLiteResponseDto;

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
