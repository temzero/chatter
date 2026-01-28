import { Exclude, Expose } from 'class-transformer';
import { AttachmentType } from '@shared/types/enums/attachment-type.enum';
import { AttachmentResponse } from '@shared/types/responses/message-attachment.response';

@Exclude()
export class AttachmentResponseDto implements AttachmentResponse {
  @Expose() id: string;
  @Expose() type: AttachmentType;
  @Expose() url: string;

  @Expose() messageId: string;
  @Expose() chatId: string;

  @Expose() thumbnailUrl?: string | null = null;
  @Expose() filename?: string | null = null;
  @Expose() size?: number | null = null;
  @Expose() mimeType?: string | null = null;
  @Expose() width?: number | null = null;
  @Expose() height?: number | null = null;
  @Expose() duration?: number | null = null;
  @Expose() metadata?: Record<string, unknown> | null = null;

  @Expose() createdAt: Date | string;
  @Expose() updatedAt: Date | string;
}
