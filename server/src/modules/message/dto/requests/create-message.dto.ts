import { MessageType } from '../../constants/message-type.constants';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateMessageDto {
  @IsUUID()
  chatId: string;

  @IsUUID()
  senderId: string;

  @IsOptional()
  @IsUUID()
  replyToMessageId?: string;

  @IsEnum(MessageType)
  type: MessageType;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  content?: string;

  @IsOptional()
  attachmentIds?: string[];
}
