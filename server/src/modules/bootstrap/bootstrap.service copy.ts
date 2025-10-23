import { Injectable } from '@nestjs/common';
import { ChatService } from '../chat/chat.service';
import { FolderService } from '../folder/folder.service';
import { FriendshipService } from '../friendship/friendship.service';
import { MessageService } from '../message/message.service';
import { BootstrapResponse } from 'src/shared/types/responses/bootstrap.response';

@Injectable()
export class BootstrapService {
  constructor(
    private readonly chatService: ChatService,
    private readonly messageService: MessageService,
    private readonly folderService: FolderService,
    private readonly friendshipService: FriendshipService,
  ) {}

  async getAppInitiationData(userId: string): Promise<BootstrapResponse> {
    const CHAT_LIMIT = 20;
    const MESSAGES_PER_CHAT_LIMIT = 20;
    const FOLDER_LIMIT = 50;
    const FRIEND_REQUEST_LIMIT = 50;

    const [chatData, folders, friendRequests] = await Promise.all([
      this.chatService.getInitialChatsWithMessages(
        userId,
        CHAT_LIMIT,
        MESSAGES_PER_CHAT_LIMIT,
      ),
      this.folderService.getFolders(userId, { limit: FOLDER_LIMIT }),
      this.friendshipService.getPendingRequests(userId, {
        limit: FRIEND_REQUEST_LIMIT,
      }),
    ]);

    return { userId, chatData, folders, friendRequests };
  }
}
