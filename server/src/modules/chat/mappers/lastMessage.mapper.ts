// // src/modules/chat/mappers/chat.mapper.ts
// import { Chat } from '../entities/chat.entity';
// import { ChatResponseDto } from '../dto/responses/chat-response.dto';
// import { LastMessageResponseDto } from '../dto/responses/last-message-response.dto';
// import { Message } from 'src/modules/message/entities/message.entity';
// import { ChatType } from '../constants/chat-types.constants';
// import { ChatMember } from 'src/modules/chat-member/entities/chat-member.entity';
// import { MessageService } from 'src/modules/message/message.service';
// import { AttachmentType } from 'src/modules/message/constants/attachment-type.constants';

//   static transformLastMessageDto(
//     message: Message,
//     members: ChatMember[],
//     currentUserId?: string,
//   ): LastMessageResponseDto {
//     const isMe = message.senderId === currentUserId;

//     const member = members.find((m) => m.userId === message.senderId);

//     const senderDisplayName = isMe
//       ? 'Me'
//       : member?.nickname || member?.user?.firstName || 'Unknown';

//     // More robust forwarded message check
//     const isForwarded = !!message.forwardedFromMessage;

//     let content: string | undefined;
//     let icons: string[] | undefined;

//     if (isForwarded && message.forwardedFromMessage) {
//       const fwd = message.forwardedFromMessage;
//       content = fwd.content || 'Attachment';
//       icons = this.getAttachmentIcons(fwd.attachments);
//     } else {
//       content = message.content || 'Attachment';
//       icons = this.getAttachmentIcons(message.attachments);
//     }

//     return {
//       id: message.id,
//       senderId: message.senderId,
//       senderDisplayName,
//       content,
//       icons,
//       isForwarded,
//       createdAt: message.createdAt,
//     };
//   }

//   private static getAttachmentIcons(
//     attachments?: { type: AttachmentType }[],
//   ): string[] | undefined {
//     if (!attachments || attachments.length === 0) return undefined;

//     const iconMap: Record<AttachmentType, string> = {
//       [AttachmentType.IMAGE]: 'image',
//       [AttachmentType.VIDEO]: 'videocam',
//       [AttachmentType.AUDIO]: 'music_note',
//       [AttachmentType.TEXT]: '',
//       [AttachmentType.FILE]: 'folder_zip',
//       [AttachmentType.VOICE]: 'voice',
//       [AttachmentType.LOCATION]: 'location',
//       [AttachmentType.POLL]: 'poll',
//       [AttachmentType.SYSTEM]: 'system',
//     };

//     const seen = new Set<string>();
//     const icons: string[] = [];

//     for (const att of attachments) {
//       const icon = iconMap[att.type] || 'insert_drive_file';
//       if (!seen.has(icon)) {
//         icons.push(icon);
//         seen.add(icon);
//         if (icons.length >= 5) break;
//       }
//     }
//     return icons;
//   }
