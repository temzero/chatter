import { AttachmentType } from '@shared/types/enums/attachment-type.enum';

export interface AttachmentUploadRequest {
  url: string;

  type: AttachmentType;
  filename: string;
  size: number;

  mimeType?: string;
  width?: number;
  height?: number;
  duration?: number;

  createdAt: string;
}
