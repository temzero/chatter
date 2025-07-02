import { AttachmentType } from "@/types/enums/attachmentType";
import type { MessageResponse } from "@/types/responses/message.response";
import type { LastMessageResponse } from "@/types/responses/message.response";

export function createLastMessage(
  message: MessageResponse
): LastMessageResponse {
  const isForwarded = !!message.forwardedFromMessage;

  let content: string | undefined;
  let icons: string[] | undefined;

  if (isForwarded && message.forwardedFromMessage) {
    const fwd = message.forwardedFromMessage;
    content = fwd.content || "Attachment";
    icons = getAttachmentIcons(fwd.attachments);
  } else {
    content = message.content || "Attachment";
    icons = getAttachmentIcons(message.attachments);
  }

  return {
    id: message.id,
    senderId: message.sender.id,
    senderDisplayName: message.sender.displayName,
    content,
    icons,
    isForwarded,
    createdAt: message.createdAt,
  };
}

function getAttachmentIcons(
  attachments?: { type: AttachmentType }[]
): string[] | undefined {
  if (!attachments || attachments.length === 0) return undefined;

  const iconMap: Record<AttachmentType, string> = {
    [AttachmentType.IMAGE]: "image",
    [AttachmentType.VIDEO]: "videocam",
    [AttachmentType.AUDIO]: "music_note",
    [AttachmentType.FILE]: "folder_zip",
    [AttachmentType.VOICE]: "voice",
    [AttachmentType.LOCATION]: "location",
  };

  const seen = new Set<string>();
  const icons: string[] = [];

  for (const att of attachments) {
    const icon = iconMap[att.type] || "insert_drive_file";
    if (!seen.has(icon) && icon !== "") {
      icons.push(icon);
      seen.add(icon);
      if (icons.length >= 5) break;
    }
  }

  return icons.length > 0 ? icons : undefined;
}
