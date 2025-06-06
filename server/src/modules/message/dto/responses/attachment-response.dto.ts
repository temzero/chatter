import { Exclude, Expose } from 'class-transformer';
import { AttachmentType } from '../../constants/attachment-type.constants';

@Exclude()
export class AttachmentResponseDto {
  @Expose() id: string;
  @Expose() messageId: string;
  @Expose() type: AttachmentType;
  @Expose() url: string;

  @Expose() thumbnailUrl?: string | null = null;
  @Expose() filename?: string | null = null;
  @Expose() size?: number | null = null;
  @Expose() mimeType?: string | null = null;
  @Expose() width?: number | null = null;
  @Expose() height?: number | null = null;
  @Expose() duration?: number | null = null;
  @Expose() metadata?: Record<string, unknown> | null = null;

  @Expose() createdAt: Date;
  @Expose() updatedAt: Date;
}
