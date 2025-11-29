import { Injectable } from '@nestjs/common';
import { ChatService } from '../chat/chat.service';
import { ChatMemberService } from '../chat-member/chat-member.service';
import { MessageService } from '../message/message.service';
import { FolderService } from '../folder/folder.service';
import { FriendshipService } from '../friendship/friendship.service';
import { BootstrapResponse } from '@shared/types/responses/bootstrap.response';
import { PaginationResponse } from '@shared/types/responses/pagination.response';
import { ChatDataResponseDto } from './dto/chat-data-response.dto';

@Injectable()
export class BootstrapService {
  constructor(
    private readonly chatService: ChatService,
    private readonly chatMemberService: ChatMemberService,
    private readonly messageService: MessageService,
    private readonly folderService: FolderService,
    private readonly friendshipService: FriendshipService,
  ) {}

  async getAppInitiationData(userId: string): Promise<BootstrapResponse> {
    const CHAT_LIMIT = 20;
    const MESSAGES_PER_CHAT_LIMIT = 20;
    const MEMBERS_PER_CHAT_LIMIT = 20;
    const FOLDER_LIMIT = 20;
    const FRIEND_REQUEST_LIMIT = 50;

    const [chatData, folderData, friendRequestData] = await Promise.all([
      this.getInitialChatsWithData(
        userId,
        CHAT_LIMIT,
        MESSAGES_PER_CHAT_LIMIT,
        MEMBERS_PER_CHAT_LIMIT,
      ),
      this.folderService.getFolders(userId, { limit: FOLDER_LIMIT }),
      this.friendshipService.getPendingRequests(userId, {
        limit: FRIEND_REQUEST_LIMIT,
      }),
    ]);

    return { userId, chatData, folderData, friendRequestData };
  }

  async getInitialChatsWithData(
    userId: string,
    chatLimit: number,
    messageLimit: number,
    memberLimit: number,
  ): Promise<PaginationResponse<ChatDataResponseDto>> {
    // 1. Get base chats with pagination from ChatService
    const { items: baseChats, hasMore: hasMoreChats } =
      await this.chatService.getInitialChats(userId, { limit: chatLimit });

    // 2. Fetch messages AND members for each chat in parallel
    const chatsWithData = await Promise.all(
      baseChats.map(async (chat) => {
        const [messagesData, membersData] = await Promise.all([
          this.messageService.getMessagesByChatId(chat.id, userId, {
            limit: messageLimit,
          }),
          this.chatMemberService.findByChatIdWithBlockStatus(chat.id, userId, {
            limit: memberLimit,
          }),
        ]);

        // Return with nested pagination structure
        return {
          ...chat,
          messageData: messagesData, // Now using PaginationResponse directly
          memberData: membersData, // Now using PaginationResponse directly
        };
      }),
    );

    return {
      items: chatsWithData,
      hasMore: hasMoreChats,
    };
  }
}
