import { Message } from 'src/modules/message/entities/message.entity';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class SendMessageDto {
  @IsUUID()
  chatId: string;

  @IsOptional()
  @IsUUID()
  replyToMessageId?: string;

  @IsEnum(Message)
  type: Message;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  content?: string;

  @IsOptional()
  attachmentIds?: string[];
}
