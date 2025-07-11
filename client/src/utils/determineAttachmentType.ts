import { AttachmentType } from "@/types/enums/attachmentType";

export function determineAttachmentType(file: File): AttachmentType {
  const mime = file.type.toLowerCase();
  const name = file.name.toLowerCase();

  if (mime.startsWith("image/")) return AttachmentType.IMAGE;
  if (mime.startsWith("video/")) return AttachmentType.VIDEO;
  if (mime.startsWith("audio/")) return AttachmentType.AUDIO;

  if (mime === "application/pdf" || name.endsWith(".pdf")) {
    return AttachmentType.PDF ?? AttachmentType.FILE;
  }

  if (
    mime.includes("word") ||
    name.endsWith(".doc") ||
    name.endsWith(".docx")
  ) {
    return AttachmentType.WORD ?? AttachmentType.FILE;
  }

  if (
    mime.includes("excel") ||
    name.endsWith(".xls") ||
    name.endsWith(".xlsx")
  ) {
    return AttachmentType.EXCEL ?? AttachmentType.FILE;
  }

  if (mime.includes("zip") || name.endsWith(".zip") || name.endsWith(".rar")) {
    return AttachmentType.ARCHIVE ?? AttachmentType.FILE;
  }

  return AttachmentType.FILE;
}

export const attachmentTypeIcons: Record<AttachmentType, string> = {
  [AttachmentType.IMAGE]: "image",
  [AttachmentType.VIDEO]: "videocam",
  [AttachmentType.AUDIO]: "audiotrack",
  [AttachmentType.VOICE]: "mic",
  [AttachmentType.LOCATION]: "location_on",
  [AttachmentType.FILE]: "insert_drive_file",
  [AttachmentType.PDF]: "picture_as_pdf",
  [AttachmentType.WORD]: "description",
  [AttachmentType.EXCEL]: "grid_on",
  [AttachmentType.PPT]: "slideshow",
  [AttachmentType.ARCHIVE]: "folder_zip",
  [AttachmentType.TEXT]: "notes",
  [AttachmentType.CODE]: "code",
};
