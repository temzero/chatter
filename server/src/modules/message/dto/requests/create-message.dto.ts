import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateMessageDto {
  @IsUUID()
  chatId: string;

  @IsUUID()
  memberId: string;

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
