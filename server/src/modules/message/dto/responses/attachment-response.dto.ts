import { Expose } from 'class-transformer';
import { AttachmentType } from '../../constants/attachment-type.constants';

export class AttachmentResponseDto {
  @Expose()
  id: string;

  @Expose()
  type: AttachmentType;

  @Expose()
  url: string;

  @Expose()
  thumbnailUrl?: string;

  @Expose()
  filename?: string;

  @Expose()
  size?: number;

  @Expose()
  mimeType?: string;

  @Expose()
  width?: number;

  @Expose()
  height?: number;

  @Expose()
  duration?: number;

  @Expose()
  createdAt: Date;
}
