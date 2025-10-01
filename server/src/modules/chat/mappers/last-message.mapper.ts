// mappers/lastMessageMapper.ts
import { Message } from 'src/modules/message/entities/message.entity';
import { ChatMember } from 'src/modules/chat-member/entities/chat-member.entity';
import { LastMessageResponseDto } from '../dto/responses/last-message-response.dto';
import { AttachmentType } from 'src/modules/message/constants/attachment-type.constants';
export function mapMessageToLastMessageResDto(
  message: Message,
  members: ChatMember[],
  currentUserId?: string,
): LastMessageResponseDto {
  const isMe = message.senderId === currentUserId;
  const member = members.find((m) => m.userId === message.senderId);

  const senderDisplayName = isMe
    ? 'You'
    : member?.nickname ||
      member?.user?.firstName ||
      message.sender?.firstName ||
      'User';

  const isForwarded = !!message.forwardedFromMessage;

  let content: string | undefined;
  let icons: string[] | undefined;

  if (isForwarded && message.forwardedFromMessage) {
    const fwd = message.forwardedFromMessage;
    content = fwd.content || 'Attachment';
    icons = getAttachmentIcons(fwd.attachments);
  } else {
    content = message.content || 'Attachment';
    icons = getAttachmentIcons(message.attachments);
  }

  return {
    id: message.id,
    senderId: message.senderId,
    senderDisplayName,
    content,
    icons,
    call: message.call,
    isForwarded,
    systemEvent: message.systemEvent,
    createdAt: message.createdAt,
  };
}

function getAttachmentIcons(
  attachments?: { type: AttachmentType }[],
): string[] | undefined {
  if (!attachments || attachments.length === 0) return undefined;

  const iconMap: Record<AttachmentType, string> = {
    [AttachmentType.IMAGE]: 'image',
    [AttachmentType.VIDEO]: 'videocam',
    [AttachmentType.AUDIO]: 'music_note',
    [AttachmentType.TEXT]: '',
    [AttachmentType.FILE]: 'folder_zip',
    [AttachmentType.VOICE]: 'voice',
    [AttachmentType.LOCATION]: 'location',
    [AttachmentType.POLL]: 'poll',
    [AttachmentType.SYSTEM]: 'system',
  };

  const seen = new Set<string>();
  const icons: string[] = [];

  for (const att of attachments) {
    const icon = iconMap[att.type] || 'insert_drive_file';
    if (!seen.has(icon)) {
      icons.push(icon);
      seen.add(icon);
      if (icons.length >= 5) break;
    }

    return icons;
  }
}
