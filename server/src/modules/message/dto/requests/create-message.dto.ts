import { IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { AttachmentUploadDto } from './attachment-upload.dto';
import { Type } from 'class-transformer';

export class CreateMessageDto {
  @IsUUID()
  id: string;

  @IsUUID()
  chatId: string;

  @IsUUID()
  memberId?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  replyToMessageId?: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => AttachmentUploadDto)
  attachments?: AttachmentUploadDto[];
}
