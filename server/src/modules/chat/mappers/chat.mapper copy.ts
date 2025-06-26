// // src/modules/chat/mappers/chat.mapper.ts
// import { Chat } from '../entities/chat.entity';
// import { ChatResponseDto } from '../dto/responses/chat-response.dto';
// import { LastMessageResponseDto } from '../dto/responses/last-message-response.dto';
// import { Message } from 'src/modules/message/entities/message.entity';
// import { ChatType } from '../constants/chat-types.constants';
// import { ChatMember } from 'src/modules/chat-member/entities/chat-member.entity';

// export class ChatMapper {
//   static transformToDirectChatDto(
//     chat: Chat,
//     currentUserId: string,
//     unreadCount?: number,
//   ): ChatResponseDto {
//     // console.log('directChat', chat);
//     const myMember = chat.members.find((m) => m.userId === currentUserId);
//     const otherMember = chat.members.filter(
//       (m) => m.userId !== currentUserId,
//     )[0];

//     // if (!myMember) {
//     //   throw new Error('myMember not found in direct chat');
//     // }

//     // if (!otherMember) {
//     //   throw new Error('otherMember not found in direct chat');
//     // }

//     const fullName = [otherMember.user.firstName, otherMember.user.lastName]
//       .filter(Boolean)
//       .join(' ');
//     const displayName = otherMember.nickname || fullName || 'Unknown User';

//     return {
//       id: chat.id,
//       type: ChatType.DIRECT,
//       myMemberId: myMember?.id ?? '',
//       name: displayName,
//       avatarUrl: otherMember.user.avatarUrl ?? null,
//       updatedAt: chat.updatedAt,
//       lastMessage: chat.lastMessage
//         ? ChatMapper.transformLastMessageDto(
//             chat.lastMessage,
//             chat.members,
//             currentUserId,
//           )
//         : null,
//       otherMemberUserIds: [otherMember.userId],
//       unreadCount,
//     };
//   }

//   static transformToGroupChatDto(
//     chat: Chat,
//     currentUserId: string,
//     unreadCount?: number,
//   ): ChatResponseDto {
//     // console.log('groupChat', chat);

//     const myMember = chat.members.find((m) => m.userId === currentUserId);
//     const otherMembers = chat.members.filter((m) => m.userId !== currentUserId);

//     // if (!myMember) {
//     //   throw new Error('myMember not found in group chat');
//     // }

//     // if (!otherMembers) {
//     //   throw new Error('otherMembers not found in group chat');
//     // }

//     return {
//       id: chat.id,
//       type: chat.type as ChatType.GROUP | ChatType.CHANNEL,
//       myMemberId: myMember?.id ?? '',
//       myRole: myMember?.role,
//       name: chat.name ?? 'Unnamed Group',
//       avatarUrl: chat.avatarUrl ?? null,
//       description: chat.description ?? null,
//       updatedAt: chat.updatedAt,
//       lastMessage: chat.lastMessage
//         ? ChatMapper.transformLastMessageDto(
//             chat.lastMessage,
//             chat.members,
//             currentUserId,
//           )
//         : null,
//       otherMemberUserIds: otherMembers.map((m) => m.userId),
//       unreadCount,
//     };
//   }

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

//     return {
//       id: message.id,
//       senderId: message.senderId,
//       senderDisplayName,
//       content: message.content ?? undefined,
//       attachmentType: message.attachments?.[0]?.type ?? undefined,
//       createdAt: message.createdAt,
//     };
//   }
// }
