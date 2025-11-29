// src/modules/attachment/mappers/attachment.mapper.ts
import { plainToInstance } from 'class-transformer';
import { Attachment } from '../entity/attachment.entity';
import { AttachmentResponseDto } from '@/modules/message/dto/responses/attachment-response.dto';

export const mapAttachmentsToAttachmentResDto = (
  attachments: Attachment[],
  chatId?: string,
  messageId?: string,
): AttachmentResponseDto[] => {
  if (!attachments?.length) return [];

  const enriched = attachments.map((attachment) => ({
    ...attachment,
    chatId,
    messageId,
  }));

  return plainToInstance(AttachmentResponseDto, enriched, {
    excludeExtraneousValues: true,
  });
};
