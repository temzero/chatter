import { ChatType } from '../constants/chat-types.constants';
import { Chat } from '../entities/chat.entity';
import { ChatResponseDto } from '../dto/responses/chat-response.dto';

export function mapChatResDto(chat: Chat, userId: string): ChatResponseDto {
  const otherMember = chat.members.find((member) => member.userId !== userId);

  return {
    id: chat.id,
    type: chat.type,
    name:
      chat.type === ChatType.PRIVATE && otherMember
        ? otherMember.user.username
        : chat.name,
    description: chat.description,
    avatar:
      chat.type === ChatType.PRIVATE && otherMember
        ? otherMember.user.avatar
        : chat.avatar,
    isPublic: chat.is_public,
    isBroadcastOnly: chat.is_broadcast_only,
    lastMessage: chat.lastMessage
      ? {
          id: chat.lastMessage.id,
          content: chat.lastMessage.content,
          createdAt: chat.lastMessage.createdAt,
          sender: chat.lastMessage.sender,
        }
      : null,
    pinnedMessage: chat.pinnedMessage
      ? {
          id: chat.pinnedMessage.id,
          content: chat.pinnedMessage.content,
          createdAt: chat.pinnedMessage.createdAt,
          sender: chat.pinnedMessage.sender,
        }
      : null,
    members: chat.members.map((member) => ({
      userId: member.userId,
      username: member.user.username,
      avatar: member.user.avatar,
      isAdmin: member.isAdmin,
      joinedAt: member.createdAt,
    })),
    createdAt: chat.createdAt,
    updatedAt: chat.updatedAt,
  };
}
