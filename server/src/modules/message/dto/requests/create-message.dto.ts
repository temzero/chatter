import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateMessageDto {
  @IsUUID()
  chatId: string;

  @IsOptional()
  @IsUUID()
  replyToMessageId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(3000)
  content?: string;

  @IsOptional()
  attachmentIds?: string[];
}
