import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { ChatMemberService } from '../../chat-member/chat-member.service';
import { BlockService } from '../../block/block.service';
import { WebsocketConnectionService } from './websocket-connection.service';
import {
  ChatEvent,
  CallEvent,
  NotificationEvent,
} from '.././constants/websocket-events';
import { FriendRequestResponseDto } from '../../friendship/dto/responses/friend-request-response.dto';
import { FriendshipUpdateNotificationDto } from '../../friendship/dto/responses/friendship-update-notification.dto';

export interface WsEmitChatMemberResponse<T = any> {
  payload: T;
  meta?: {
    isMuted?: boolean;
    isSender?: boolean;
  };
}

@Injectable()
export class WebsocketNotificationService {
  private server: Server;

  constructor(
    private readonly chatMemberService: ChatMemberService,
    private readonly blockService: BlockService,
    private readonly connectionService: WebsocketConnectionService,
  ) {}

  setServer(server: Server) {
    this.server = server;
  }

  /* Chat/Call Notifications */
  async emitToChatMembers<T extends object>(
    chatId: string,
    event: ChatEvent | CallEvent,
    payload: T,
    options: {
      senderId?: string;
      excludeSender?: boolean;
    } = {},
  ) {
    const members =
      await this.chatMemberService.getMemberUserIdsAndMuteStatus(chatId);

    const blockedUserIds = options.senderId
      ? await this.blockService.getBlockedUserIds(options.senderId)
      : [];

    for (const { userId, isMuted } of members) {
      if (
        options.excludeSender &&
        options.senderId &&
        userId === options.senderId
      ) {
        continue;
      }

      if (options.senderId && blockedUserIds.includes(userId)) {
        continue;
      }

      const enhancedPayload: WsEmitChatMemberResponse = {
        payload,
        meta: {
          isMuted,
          isSender: options.senderId ? userId === options.senderId : false,
        },
      };

      this.emitToUser(userId, event, enhancedPayload);
    }
  }

  /* General Notification Methods */
  emitToUser(userId: string, event: string, payload: any) {
    const socketIds = this.connectionService.getUserSocketIds(userId);
    for (const socketId of socketIds) {
      this.server.to(socketId).emit(event, payload);
    }
  }

  /* Friendship Notifications */
  notifyFriendRequest(receiverId: string, payload: FriendRequestResponseDto) {
    this.emitToUser(receiverId, NotificationEvent.FRIEND_REQUEST, payload);
  }

  notifyFriendshipUpdate(
    senderId: string | null,
    dto: FriendshipUpdateNotificationDto,
  ) {
    if (!senderId) return;
    this.emitToUser(senderId, NotificationEvent.FRIENDSHIP_UPDATE, dto);
  }

  notifyCancelFriendRequest(
    friendshipId: string | null,
    receiverId: string | null,
    senderId: string | null,
  ) {
    if (!receiverId) return;
    this.emitToUser(receiverId, NotificationEvent.CANCEL_FRIEND_REQUEST, {
      friendshipId,
      senderId,
    });
  }
}
