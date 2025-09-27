// import { Injectable } from '@nestjs/common';
// import { Chat } from '../entities/chat.entity';
// import { ChatResponseDto } from '../dto/responses/chat-response.dto';
// import { LastMessageResponseDto } from '../dto/responses/last-message-response.dto';
// import { Message } from 'src/modules/message/entities/message.entity';
// import { ChatType } from '../constants/chat-types.constants';
// import { ChatMember } from 'src/modules/chat-member/entities/chat-member.entity';
// import { MessageService } from 'src/modules/message/message.service';
// import { AttachmentType } from 'src/modules/message/constants/attachment-type.constants';
// import { MessageMapper } from 'src/modules/message/mappers/message.mapper';
// import { ChatMemberService } from 'src/modules/chat-member/chat-member.service';
// import { getActiveInviteLinks } from 'src/common/utils/invite-link.util';
// import { ChatMemberPreviewDto } from '../dto/responses/chat-member-preview.dto';

// export function transformLastMessageDto(
//   message: Message,
//   members: ChatMember[],
//   currentUserId?: string,
// ): LastMessageResponseDto {
//   const isMe = message.senderId === currentUserId;
//   const member = members.find((m) => m.userId === message.senderId);

//   const senderDisplayName = isMe
//     ? 'You'
//     : member?.nickname ||
//       member?.user?.firstName ||
//       message.sender?.firstName ||
//       'User';

//   const isForwarded = !!message.forwardedFromMessage;

//   let content: string | undefined;
//   let icons: string[] | undefined;

//   if (isForwarded && message.forwardedFromMessage) {
//     const fwd = message.forwardedFromMessage;
//     content = fwd.content || 'Attachment';
//     icons = this.getAttachmentIcons(fwd.attachments);
//   } else {
//     content = message.content || 'Attachment';
//     icons = this.getAttachmentIcons(message.attachments);
//   }

//   return {
//     id: message.id,
//     senderId: message.senderId,
//     senderDisplayName,
//     content,
//     icons,
//     callStatus: message.call?.status,
//     isForwarded,
//     systemEvent: message.systemEvent,
//     createdAt: message.createdAt,
//   };
// }
