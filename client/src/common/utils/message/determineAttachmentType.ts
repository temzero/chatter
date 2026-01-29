import { AttachmentType } from "@/shared/types/enums/attachment-type.enum";

// Comprehensive MIME type to AttachmentType mapping
const mimeTypeMap: Record<string, AttachmentType> = {
  // Images - all common image MIME types
  "image/jpeg": AttachmentType.IMAGE,
  "image/jpg": AttachmentType.IMAGE,
  "image/png": AttachmentType.IMAGE,
  "image/gif": AttachmentType.IMAGE,
  "image/webp": AttachmentType.IMAGE,
  "image/bmp": AttachmentType.IMAGE,
  "image/tiff": AttachmentType.IMAGE,
  "image/svg+xml": AttachmentType.IMAGE,
  "image/ico": AttachmentType.IMAGE,
  "image/x-icon": AttachmentType.IMAGE,
  "image/heic": AttachmentType.IMAGE,
  "image/heif": AttachmentType.IMAGE,
  "image/avif": AttachmentType.IMAGE,
  
  // Videos - comprehensive video formats
  "video/mp4": AttachmentType.VIDEO,
  "video/mpeg": AttachmentType.VIDEO,
  "video/ogg": AttachmentType.VIDEO,
  "video/webm": AttachmentType.VIDEO,
  "video/quicktime": AttachmentType.VIDEO,
  "video/x-msvideo": AttachmentType.VIDEO,
  "video/x-ms-wmv": AttachmentType.VIDEO,
  "video/x-flv": AttachmentType.VIDEO,
  "video/x-matroska": AttachmentType.VIDEO,
  "video/3gpp": AttachmentType.VIDEO,
  "video/3gpp2": AttachmentType.VIDEO,
  
  // Audio - comprehensive audio formats
  "audio/mpeg": AttachmentType.AUDIO,
  "audio/mp3": AttachmentType.AUDIO,
  "audio/wav": AttachmentType.AUDIO,
  "audio/x-wav": AttachmentType.AUDIO,
  "audio/ogg": AttachmentType.AUDIO,
  "audio/m4a": AttachmentType.AUDIO,
  "audio/x-m4a": AttachmentType.AUDIO,
  "audio/flac": AttachmentType.AUDIO,
  "audio/aac": AttachmentType.AUDIO,
  "audio/x-aac": AttachmentType.AUDIO,
  "audio/webm": AttachmentType.AUDIO,
  "audio/opus": AttachmentType.AUDIO,
  
  // PDF - all PDF MIME types
  "application/pdf": AttachmentType.PDF,
  "application/x-pdf": AttachmentType.PDF,
  "application/acrobat": AttachmentType.PDF,
  "application/vnd.pdf": AttachmentType.PDF,
  "application/x-bzpdf": AttachmentType.PDF,
  "application/x-gzpdf": AttachmentType.PDF,
  
  // Voice messages - specific to your app
  "audio/ogg;codecs=opus": AttachmentType.VOICE,
  "audio/webm;codecs=opus": AttachmentType.VOICE,
  
  // Documents (if you want to handle them separately later)
  "application/msword": AttachmentType.FILE,
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": AttachmentType.FILE,
  "application/vnd.ms-excel": AttachmentType.FILE,
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": AttachmentType.FILE,
  "application/vnd.ms-powerpoint": AttachmentType.FILE,
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": AttachmentType.FILE,
  "text/plain": AttachmentType.FILE,
  "text/csv": AttachmentType.FILE,
  "application/json": AttachmentType.FILE,
  "application/zip": AttachmentType.FILE,
  "application/x-zip-compressed": AttachmentType.FILE,
  "application/x-rar-compressed": AttachmentType.FILE,
};

// Extension to AttachmentType mapping (as fallback)
const extensionMap: Record<string, AttachmentType> = {
  // Images
  jpg: AttachmentType.IMAGE,
  jpeg: AttachmentType.IMAGE,
  png: AttachmentType.IMAGE,
  gif: AttachmentType.IMAGE,
  webp: AttachmentType.IMAGE,
  bmp: AttachmentType.IMAGE,
  tiff: AttachmentType.IMAGE,
  tif: AttachmentType.IMAGE,
  svg: AttachmentType.IMAGE,
  ico: AttachmentType.IMAGE,
  heic: AttachmentType.IMAGE,
  heif: AttachmentType.IMAGE,
  avif: AttachmentType.IMAGE,
  
  // Videos
  mp4: AttachmentType.VIDEO,
  mov: AttachmentType.VIDEO,
  avi: AttachmentType.VIDEO,
  mkv: AttachmentType.VIDEO,
  webm: AttachmentType.VIDEO,
  flv: AttachmentType.VIDEO,
  wmv: AttachmentType.VIDEO,
  m4v: AttachmentType.VIDEO,
  "3gp": AttachmentType.VIDEO,
  mpg: AttachmentType.VIDEO,
  mpeg: AttachmentType.VIDEO,
  
  // Audio
  mp3: AttachmentType.AUDIO,
  wav: AttachmentType.AUDIO,
  ogg: AttachmentType.AUDIO,
  m4a: AttachmentType.AUDIO,
  flac: AttachmentType.AUDIO,
  aac: AttachmentType.AUDIO,
  wma: AttachmentType.AUDIO,
  opus: AttachmentType.AUDIO,
  
  // PDF
  pdf: AttachmentType.PDF,
  
  // Voice
  weba: AttachmentType.VOICE,
  
  // Documents (for extension fallback)
  doc: AttachmentType.FILE,
  docx: AttachmentType.FILE,
  xls: AttachmentType.FILE,
  xlsx: AttachmentType.FILE,
  ppt: AttachmentType.FILE,
  pptx: AttachmentType.FILE,
  txt: AttachmentType.FILE,
  rtf: AttachmentType.FILE,
  csv: AttachmentType.FILE,
  json: AttachmentType.FILE,
  zip: AttachmentType.FILE,
  rar: AttachmentType.FILE,
  "7z": AttachmentType.FILE,
  tar: AttachmentType.FILE,
  gz: AttachmentType.FILE,
};

export function determineAttachmentType(file: File): AttachmentType {
  const mime = file.type.toLowerCase();
  
  // 1. Try exact MIME type match first (most reliable)
  if (mimeTypeMap[mime]) {
    return mimeTypeMap[mime];
  }
  
  // 2. Fallback to file extension
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (!ext) return AttachmentType.FILE;
  
  if (extensionMap[ext]) {
    return extensionMap[ext];
  }
  
  // 3. Default to FILE for anything else
  return AttachmentType.FILE;
}