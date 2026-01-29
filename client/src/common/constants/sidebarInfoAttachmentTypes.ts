// sidebarInfoAttachmentItems.ts
import { AttachmentType } from "@/shared/types/enums/attachment-type.enum";

export const SIDEBAR_INFO_ATTACHMENT_ITEMS = [
  {
    id: AttachmentType.IMAGE,
    icon: "image",
  },
  {
    id: AttachmentType.VIDEO,
    icon: "movie",
  },
  {
    id: AttachmentType.PDF,
    icon: "picture_as_pdf",
  },
  {
    id: AttachmentType.FILE,
    icon: "description",
  },
  {
    id: AttachmentType.AUDIO,
    icon: "music_note",
  },
  {
    id: AttachmentType.LINK,
    icon: "link",
  },
] as const;
