import { AttachmentType } from "@/shared/types/enums/attachment-type.enum";

export const getFileIcon = (fileName?: string | null): string => {
  if (!fileName) return "attach_file";
  const name = fileName.toLowerCase();

  // Determine file type based on extension
  if (name.endsWith(".pdf")) return "picture_as_pdf";
  if (/\.(doc|docx)$/.test(name)) return "description";
  if (/\.(xls|xlsx)$/.test(name)) return "grid_on";
  if (/\.(ppt|pptx)$/.test(name)) return "slideshow";
  if (/\.(zip|rar|7z)$/.test(name)) return "folder_zip";
  if (name.endsWith(".txt")) return "notes";
  if (/\.(js|ts|html|css|json)$/.test(name)) return "code";
  if (/\.(mp3|m4a|wav|ogg|flac)$/.test(name)) return "music_note";
  if (/\.(png|jpe?g|gif|webp|bmp|svg)$/.test(name)) return "image";
  if (/\.(mp4|mov|webm|avi|mkv)$/.test(name)) return "videocam";

  // Fallback
  return "insert_drive_file";
};

export function getAttachmentIcons(
  attachments?: { type: AttachmentType; filename?: string | null }[]
): string[] | undefined {
  if (!attachments || attachments.length === 0) return undefined;

  const seen = new Set<string>();
  const icons: string[] = [];

  for (const att of attachments) {
    const fileName = att.filename;
    if (!fileName) continue;

    const icon: string =
      att.type === AttachmentType.LOCATION
        ? "location_on"
        : att.type === AttachmentType.LINK
        ? "link"
        : att.type === AttachmentType.VOICE
        ? "mic"
        : getFileIcon(fileName);

    if (!seen.has(icon)) {
      icons.push(icon);
      seen.add(icon);
      if (icons.length >= 5) break;
    }
  }

  return icons;
}
