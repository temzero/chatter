import {
  IsOptional,
  IsString,
  IsBoolean,
  IsEnum,
  IsArray,
} from 'class-validator';
import { MessageStatus } from '@shared/types/enums/message-status.enum';
import { UpdateMessageRequest } from '@shared/types/requests/update-message.request';
import { EmptyStringToNull } from '@/common/utils/dto.utils';
import { SystemEventType } from '@/shared/types/enums/system-event-type.enum';

export class UpdateMessageDto implements UpdateMessageRequest {
  // @IsOptional()
  // @IsString()
  // @EmptyStringToNull()
  // content?: string;

  // @IsOptional()
  // @IsEnum(MessageStatus)
  // status?: MessageStatus;

  // @IsOptional()
  // @IsBoolean()
  // isPinned?: boolean;
  @IsOptional()
  @IsString()
  @EmptyStringToNull()
  content?: string | null;

  @IsOptional()
  @IsEnum(MessageStatus)
  status?: MessageStatus;

  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;

  @IsOptional()
  @IsBoolean()
  isImportant?: boolean;

  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean;

  @IsOptional()
  @IsEnum(SystemEventType)
  systemEvent?: SystemEventType | null;

  @IsOptional()
  @IsString()
  replyToMessageId?: string | null;

  @IsOptional()
  @IsString()
  forwardedFromMessageId?: string | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  deletedForUserIds?: string[];

  // For updating attachments (add/remove)
  @IsOptional()
  @IsArray()
  attachmentIds?: string[];
}
