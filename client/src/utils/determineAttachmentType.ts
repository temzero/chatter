import { AttachmentType } from "@/types/enums/attachmentType";

export function determineAttachmentType(file: File): AttachmentType {
  const mime = file.type.toLowerCase();
  if (mime.startsWith("image/")) return AttachmentType.IMAGE;
  if (mime.startsWith("video/")) return AttachmentType.VIDEO;
  if (mime.startsWith("audio/")) return AttachmentType.AUDIO;
  return AttachmentType.FILE;
}
