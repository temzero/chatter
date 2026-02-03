// utils/attachmentSorter.ts

import { AttachmentType } from "@/shared/types/enums/attachment-type.enum";
import { AttachmentResponse } from "@/shared/types/responses/message-attachment.response";

export enum AttachmentCategory {
  VISUAL = "visual",
  LINKS = "links",
  AUDIO = "audio",
  VOICE = "voice",
  PDF = "pdf",
  FILE = "file",
  LOCATION = "location",
}

const typeToCategory: Record<AttachmentType, AttachmentCategory> = {
  [AttachmentType.IMAGE]: AttachmentCategory.VISUAL,
  [AttachmentType.VIDEO]: AttachmentCategory.VISUAL,
  [AttachmentType.LINK]: AttachmentCategory.LINKS,
  [AttachmentType.AUDIO]: AttachmentCategory.AUDIO,
  [AttachmentType.VOICE]: AttachmentCategory.VOICE,
  [AttachmentType.PDF]: AttachmentCategory.PDF,
  [AttachmentType.FILE]: AttachmentCategory.FILE,
  [AttachmentType.LOCATION]: AttachmentCategory.LOCATION,
};

export function sortAttachments(attachments: AttachmentResponse[]) {
  const result = {
    [AttachmentCategory.VISUAL]: [] as AttachmentResponse[],
    [AttachmentCategory.LINKS]: [] as AttachmentResponse[],
    [AttachmentCategory.PDF]: [] as AttachmentResponse[],
    [AttachmentCategory.FILE]: [] as AttachmentResponse[],
    [AttachmentCategory.LOCATION]: [] as AttachmentResponse[],
    [AttachmentCategory.AUDIO]: [] as AttachmentResponse[],
    [AttachmentCategory.VOICE]: [] as AttachmentResponse[],
  };

  for (const attachment of attachments) {
    const category = typeToCategory[attachment.type];
    result[category].push(attachment);
  }

  return result;
}