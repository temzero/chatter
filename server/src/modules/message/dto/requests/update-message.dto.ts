import { IsOptional, IsString, IsBoolean, IsEnum } from 'class-validator';
import { MessageStatus } from '@shared/types/enums/message-status.enum';
import { UpdateMessageRequest } from '@shared/types/requests/update-message.request';
import { EmptyStringToNull } from '@/common/utils/dto.utils';

export class UpdateMessageDto implements UpdateMessageRequest {
  @IsOptional()
  @IsString()
  @EmptyStringToNull()
  content?: string;

  @IsOptional()
  @IsEnum(MessageStatus)
  status?: MessageStatus;

  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;
}
