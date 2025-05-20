import { AttachmentType } from '../../constants/attachment-type.constants';

export class AttachmentResponseDto {
  id: string;
  messageId: string;
  type: AttachmentType;
  url: string;
  thumbnailUrl: string | null;
  filename: string | null;
  size: number | null;
  mimeType: string | null;
  width: number | null;
  height: number | null;
  duration: number | null;
  metadata: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
}
