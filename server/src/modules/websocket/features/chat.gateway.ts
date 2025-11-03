import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { MessageService } from 'src/modules/message/message.service';
import { AuthenticatedSocket } from '../constants/authenticatedSocket.type';
import { CreateMessageDto } from 'src/modules/message/dto/requests/create-message.dto';
import { ForwardMessageDto } from 'src/modules/message/dto/requests/forward-message.dto';
import { ChatMemberService } from 'src/modules/chat-member/chat-member.service';
import { MessageMapper } from 'src/modules/message/mappers/message.mapper';
import { ChatService } from 'src/modules/chat/chat.service';
import { emitWsError } from '../utils/emitWsError';
import { Message } from 'src/modules/message/entities/message.entity';
import { ChatEvent } from 'src/shared/types/enums/websocket-events.enum';
import { WebsocketNotificationService } from '../services/websocket-notification.service';
import { WebsocketConnectionService } from '../services/websocket-connection.service';
import { SupabaseService } from 'src/modules/superbase/supabase.service';

@WebSocketGateway()
export class ChatGateway {
  constructor(
    private readonly messageService: MessageService,
    private readonly chatService: ChatService,
    private readonly websocketNotificationService: WebsocketNotificationService,
    private readonly websocketConnectionService: WebsocketConnectionService,
    private readonly chatMemberService: ChatMemberService,
    private readonly messageMapper: MessageMapper,
    private readonly supabaseService: SupabaseService,
  ) {}

  @SubscribeMessage(ChatEvent.GET_STATUS)
  async handleGetStatus(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() chatId: string,
  ) {
    const userId = client.data.userId;
    if (!userId) return false;

    const isOnline = await this.hasAnyOtherMemberOnline(chatId, userId);
    return { chatId, isOnline };
  }

  @SubscribeMessage(ChatEvent.TYPING)
  async handleTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chatId: string; isTyping: boolean },
  ) {
    const userId = client.data.userId;
    if (!userId) return;

    const payload = {
      chatId: data.chatId,
      userId,
      isTyping: data.isTyping,
    };

    // Broadcast to all other members in the chat (excluding sender)
    await this.websocketNotificationService.emitToChatMembers(
      data.chatId,
      ChatEvent.USER_TYPING,
      payload,
      { senderId: userId, excludeSender: true },
    );
  }

  @SubscribeMessage(ChatEvent.SEND_MESSAGE)
  async handleMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: CreateMessageDto,
  ) {
    console.log('handleMessage', payload);
    try {
      const senderId = client.data.userId;
      if (!senderId) {
        client.emit('error', {
          messageId: payload.id,
          chatId: payload.chatId,
          error: 'Unauthorized',
        });
        return;
      }

      // Resolve memberId if not provided
      if (!payload.memberId) {
        const member = await this.chatMemberService.getMemberByChatIdAndUserId(
          payload.chatId,
          senderId,
        );
        if (!member) {
          client.emit(ChatEvent.MESSAGE_ERROR, {
            messageId: payload.id,
            chatId: payload.chatId,
            error: 'You are not a member of this chat',
          });
          return;
        }
        payload.memberId = member.id;
      }

      // Create the message in database
      // ✅ Use correct method based on whether it's a reply
      const message = payload.replyToMessageId
        ? await this.messageService.createReplyMessage(senderId, payload)
        : await this.messageService.createMessage(senderId, payload);

      const messageResponse =
        this.messageMapper.mapMessageToMessageResDto(message);

      // Update last read position
      const updatedMember = await this.chatMemberService.updateLastRead(
        payload.memberId,
        message.id,
      );

      // Broadcast new message to all chat members (including sender)
      await this.websocketNotificationService.emitToChatMembers(
        payload.chatId,
        ChatEvent.NEW_MESSAGE,
        messageResponse,
        { senderId },
      );

      // Broadcast read receipt if updated
      if (updatedMember) {
        await this.websocketNotificationService.emitToChatMembers(
          payload.chatId,
          ChatEvent.MESSAGE_READ,
          {
            chatId: payload.chatId,
            memberId: updatedMember.id,
            messageId: message.id,
          },
          { senderId },
        );
      }
    } catch (error) {
      // Delete uploaded files
      if (payload.attachments?.length) {
        for (const att of payload.attachments) {
          await this.supabaseService.deleteFileByUrl(att.url);
        }
      }

      // Handle specific message errors
      if (payload?.id) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to send message';

        // Notify the client
        client.emit(ChatEvent.MESSAGE_ERROR, {
          messageId: payload.id,
          chatId: payload.chatId,
          error: errorMessage,
        });
      } else {
        // Fallback for messages without ID
        emitWsError(client, error, 'Failed to send message');
      }
    }
  }

  @SubscribeMessage(ChatEvent.FORWARD_MESSAGE)
  async handleForwardMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: ForwardMessageDto,
  ) {
    try {
      const senderId = client.data.userId;

      if (!senderId) {
        console.warn('Unauthorized: senderId not found');
        client.emit(`error`, { message: 'Unauthorized' });
        return;
      }

      // Create forwarded message
      const forwardedMessage = await this.messageService.createForwardedMessage(
        senderId,
        payload.chatId,
        payload.messageId,
      );

      // Get member of sender in target chat
      const member = await this.chatMemberService.getMemberByChatIdAndUserId(
        payload.chatId,
        senderId,
      );

      if (!member) {
        throw new Error(`User is not a member of chat ${payload.chatId}`);
      }

      // Update last read
      await this.chatMemberService.updateLastRead(
        member.id,
        forwardedMessage.id,
      );

      // Convert to DTO
      const messageResponse =
        this.messageMapper.mapMessageToMessageResDto(forwardedMessage);

      // Emit new message to all chat members (including sender)
      await this.websocketNotificationService.emitToChatMembers(
        payload.chatId,
        ChatEvent.NEW_MESSAGE,
        messageResponse,
        { senderId },
      );

      // Emit read update (including sender)
      await this.websocketNotificationService.emitToChatMembers(
        payload.chatId,
        ChatEvent.MESSAGE_READ,
        {
          chatId: payload.chatId,
          memberId: member.id,
          messageId: forwardedMessage.id,
        },
        { senderId },
      );

      return messageResponse;
    } catch (error) {
      console.error('Error handling forwardMessage:', error);
      client.emit(`error`, {
        message: 'Failed to forward message',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  @SubscribeMessage(ChatEvent.SAVE_MESSAGE)
  async handleSaveMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { messageId: string | null },
  ) {
    const userId = client.data.userId;
    if (!userId || !data.messageId) {
      client.emit('error', { message: 'Invalid save request' });
      return;
    }
    try {
      // Step 1: Get or create the user's saved chat
      const savedChat = await this.chatService.getOrCreateSavedChat(userId);

      if (!savedChat) {
        client.emit('error', { message: 'Saved chat not found!' });
        return;
      }

      // 2. Forward the message into the saved chat
      const savedMessage = await this.messageService.createForwardedMessage(
        userId,
        savedChat.id,
        data.messageId,
      );

      // Step 3: Format and emit to client
      const messageResponse =
        this.messageMapper.mapMessageToMessageResDto(savedMessage);

      console.log('Saved messageResponse', messageResponse);

      await this.websocketNotificationService.emitToChatMembers(
        savedChat.id,
        ChatEvent.SAVE_MESSAGE,
        messageResponse,
      );
    } catch (error) {
      emitWsError(client, error, 'Failed to save message');
    }
  }

  @SubscribeMessage(ChatEvent.REACT_TO_MESSAGE)
  async handleReactToMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody()
    payload: {
      messageId: string;
      chatId: string;
      emoji: string;
    },
  ) {
    const senderId = client.data.userId;
    const { messageId, chatId, emoji } = payload;
    await this.messageService.toggleReaction(messageId, senderId, emoji);
    const reactions =
      await this.messageService.getReactionsForMessage(messageId);
    const formatted = this.messageService.formatReactions(reactions);

    await this.websocketNotificationService.emitToChatMembers(
      chatId,
      ChatEvent.MESSAGE_REACTION,
      {
        messageId,
        reactions: formatted,
      },
      { senderId },
    );
  }

  @SubscribeMessage(ChatEvent.MESSAGE_READ)
  async handleMarkAsRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody()
    data: { chatId: string; memberId: string; messageId: string },
  ) {
    const userId = client.data.userId;
    if (!userId) return;

    // Update read time in DB and get the member
    const member = await this.chatMemberService.updateLastRead(
      data.memberId,
      data.messageId,
    );

    if (!member) return;

    // Notify other participants with memberId and messageId (including sender)
    await this.websocketNotificationService.emitToChatMembers(
      data.chatId,
      ChatEvent.MESSAGE_READ,
      {
        chatId: data.chatId,
        memberId: member.id,
        messageId: data.messageId,
      },
      { senderId: userId },
    );
  }

  @SubscribeMessage(ChatEvent.TOGGLE_PIN_MESSAGE)
  async handleTogglePinMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chatId: string; messageId: string | null },
  ) {
    const userId = client.data.userId;
    if (!userId) return;

    try {
      if (data.messageId) {
        const pinnedMessage = await this.chatService.pinMessage(
          data.chatId,
          data.messageId,
          userId,
        );

        await this.websocketNotificationService.emitToChatMembers(
          data.chatId,
          ChatEvent.PIN_UPDATED,
          {
            chatId: data.chatId,
            message: pinnedMessage,
          },
        );
      } else {
        const unpinMessage = await this.chatService.unpinMessage(
          data.chatId,
          userId,
        );

        await this.websocketNotificationService.emitToChatMembers(
          data.chatId,
          ChatEvent.PIN_UPDATED,
          {
            chatId: data.chatId,
            message: unpinMessage,
          },
        );
      }
    } catch (error) {
      emitWsError(client, error, 'Failed to toggle pin message');
    }
  }

  @SubscribeMessage(ChatEvent.TOGGLE_IMPORTANT)
  async handleToggleImportant(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody()
    data: { messageId: string; chatId: string; isImportant: boolean },
  ) {
    const userId = client.data.userId;
    if (!userId) return;

    try {
      const isImportantUpdated =
        await this.messageService.markMessageAsImportant(
          userId,
          data.messageId,
          data.isImportant,
        );

      // Instead of mapping to full DTO, just send minimal data
      const importantUpdate = {
        chatId: data.chatId,
        messageId: data.messageId,
        isImportant: isImportantUpdated,
      };

      await this.websocketNotificationService.emitToChatMembers(
        data.chatId,
        ChatEvent.MESSAGE_IMPORTANT_TOGGLED,
        importantUpdate,
        { senderId: userId },
      );
    } catch (error) {
      emitWsError(client, error, 'Failed to toggle important');
    }
  }

  @SubscribeMessage(ChatEvent.DELETE_MESSAGE)
  async handleDeleteMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody()
    data: { messageId: string; chatId: string; isDeleteForEveryone: boolean },
  ) {
    const userId = client.data.userId;
    if (!userId) {
      client.emit('error', { message: 'Unauthorized' });
      return;
    }

    try {
      let deletedMessage: Message;

      if (data.isDeleteForEveryone) {
        // Delete for everyone
        deletedMessage = await this.messageService.deleteForEveryone(
          userId,
          data.messageId,
        );

        // Notify all chat members that the message has been deleted (including sender)
        await this.websocketNotificationService.emitToChatMembers(
          data.chatId,
          ChatEvent.MESSAGE_DELETED,
          {
            messageId: data.messageId,
            chatId: data.chatId,
          },
          { senderId: userId },
        );
      } else {
        // Delete for me only
        deletedMessage = await this.messageService.deleteForMe(
          userId,
          data.messageId,
        );

        this.websocketNotificationService.emitToUser(
          userId,
          ChatEvent.MESSAGE_DELETED,
          {
            messageId: data.messageId,
            chatId: data.chatId,
          },
        );
      }

      return { success: true, message: deletedMessage };
    } catch (error) {
      emitWsError(client, error, 'Failed to delete message');
    }
  }

  // Utility to check if any other chat member is online (excluding one user)
  async hasAnyOtherMemberOnline(
    chatId: string,
    excludeUserId: string,
  ): Promise<boolean> {
    const memberIds = await this.chatMemberService.getAllMemberUserIds(chatId);
    return memberIds
      .filter((id) => id !== excludeUserId)
      .some((id) => this.websocketConnectionService.isUserOnline(id));
  }
}
