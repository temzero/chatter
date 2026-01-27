import { AttachmentType } from "@/shared/types/enums/attachment-type.enum";

export interface AttachmentUploadRequest {
  url: string;
  filename: string;

  type: AttachmentType;
  size?: number;

  thumbnailUrl?: string | null;
  mimeType?: string | null;
  width?: number | null;
  height?: number | null;
  duration?: number | null;

  createdAt?: string;
}
