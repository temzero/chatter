import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { AttachmentUploadDto } from './attachment-upload.dto';
import { Type } from 'class-transformer';

export class CreateMessageDto {
  @IsString()
  chatId: string;

  @IsString()
  memberId: string;

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
