import { IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateMessageRequest } from '@shared/types/requests/send-message.request';
import { AttachmentUploadDto } from '@/modules/attachment/dto/requests/attachment-upload.dto';

export class CreateMessageDto implements CreateMessageRequest {
  @IsUUID()
  id?: string;

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
