import { IsOptional, IsString, IsBoolean, IsEnum } from 'class-validator';
import { MessageStatus } from 'src/shared/types/enums/message-status.enum';
import { UpdateMessageRequest } from 'src/shared/types/requests/update-message.request';
import { EmptyStringToNull } from 'src/common/utils/dto.utils';

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
