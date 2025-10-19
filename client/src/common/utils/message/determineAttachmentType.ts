import { AttachmentType } from "@/shared/types/enums/attachment-type.enum";

const imageExtensions = ["png", "jpg", "jpeg", "gif", "webp", "bmp", "tiff"];
const videoExtensions = ["mp4", "mov", "avi", "mkv", "webm"];
const audioExtensions = ["mp3", "wav", "ogg", "m4a"];

export function determineAttachmentType(file: File): AttachmentType {
  const mime = file.type.toLowerCase();

  if (mime.startsWith("image/")) return AttachmentType.IMAGE;
  if (mime.startsWith("video/")) return AttachmentType.VIDEO;
  if (mime.startsWith("audio/")) return AttachmentType.AUDIO;

  // fallback to filename extension
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (!ext) return AttachmentType.FILE;

  if (imageExtensions.includes(ext)) return AttachmentType.IMAGE;
  if (videoExtensions.includes(ext)) return AttachmentType.VIDEO;
  if (audioExtensions.includes(ext)) return AttachmentType.AUDIO;

  return AttachmentType.FILE;
}
