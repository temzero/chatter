import { IsOptional, IsString, IsBoolean, IsEnum } from 'class-validator';
import { MessageStatus } from '../../constants/message-status.constants';
import { EmptyStringToNull } from 'src/common/utils/dto.utils';

export class UpdateMessageDto {
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
