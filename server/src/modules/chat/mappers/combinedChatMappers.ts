// combinedChat.mapper.ts
import { Chat } from 'src/modules/chat/entities/chat.entity';
import { ChatGroup } from 'src/modules/chat-group/entities/chat-group.entity';
import { PrivateChatDto, GroupChatDto } from '../dto/response/chats.dto';
import { ChatPartnerDto } from '../dto/response/chat-partner';

export function mapChatToPrivateChatDto(
  chat: Chat,
  currentUserId: string,
): PrivateChatDto {
  const chatPartner =
    chat.member1.id === currentUserId ? chat.member2 : chat.member1;
  const nickname =
    chat.member1.id === currentUserId
      ? chat.member2_nickname
      : chat.member1_nickname;

  // Mapping chatPartner to the simplified DTO
  const chatPartnerDto: ChatPartnerDto = {
    id: chatPartner.id,
    username: chatPartner.username,
    first_name: chatPartner.first_name,
    last_name: chatPartner.last_name,
    avatar: chatPartner.avatar,
    bio: chatPartner.bio,
    phone_number: chatPartner.phone_number,
    birthday: chatPartner.birthday,
    status: chatPartner.status,
    last_seen: chatPartner.last_seen,
  };

  return {
    id: chat.id,
    type: 'private',
    name: nickname ?? chatPartner.first_name ?? 'Unknown User',
    chatPartner: chatPartnerDto,
    lastMessage: chat.lastMessage,
    pinnedMessage: chat.pinnedMessage,
    updatedAt: chat.lastMessage?.updatedAt ?? chat.updatedAt,
  };
}

export function mapGroupToGroupChatDto(group: ChatGroup): GroupChatDto {
  return {
    id: group.id,
    type: group.type as 'group' | 'channel',
    name: group.name,
    avatar: group.avatar,
    description: group.description ?? '',
    lastMessage: group.lastMessage,
    pinnedMessage: group.pinnedMessage,
    updatedAt: group.lastMessage?.updatedAt ?? group.updatedAt,
  };
}
