import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { MessageService } from 'src/modules/message/message.service';
import { WebsocketService } from '../websocket.service';
import { AuthenticatedSocket } from '../constants/authenticatedSocket.type';
import { CreateMessageDto } from 'src/modules/message/dto/requests/create-message.dto';
import { ForwardMessageDto } from 'src/modules/message/dto/requests/forward-message.dto';
import { ChatMemberService } from 'src/modules/chat-member/chat-member.service';
import { MessageMapper } from 'src/modules/message/mappers/message.mapper';
import { ChatService } from 'src/modules/chat/chat.service';

const chatLink = 'chat:';

@WebSocketGateway()
export class ChatGateway {
  constructor(
    private readonly messageService: MessageService,
    private readonly chatService: ChatService,
    private readonly websocketService: WebsocketService,
    private readonly chatMemberService: ChatMemberService,
    private readonly messageMapper: MessageMapper,
  ) {}

  @SubscribeMessage(`${chatLink}getStatus`)
  async handleGetStatus(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() chatId: string,
  ) {
    const userId = client.data.userId;
    if (!userId) return false;

    const isOnline = await this.hasAnyOtherMemberOnline(chatId, userId);
    return { chatId, isOnline };
  }

  @SubscribeMessage(`${chatLink}typing`)
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

    // Broadcast to all other members in the chat
    await this.websocketService.emitToChatMembers(
      data.chatId,
      `${chatLink}userTyping`,
      payload,
    );
  }

  @SubscribeMessage(`${chatLink}sendMessage`)
  async handleMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: CreateMessageDto,
  ) {
    try {
      const senderId = client.data.userId;
      if (!senderId) {
        client.emit(`error`, { message: 'Unauthorized' });
        return;
      }

      // Create the message
      const message = await this.messageService.createMessage(
        senderId,
        payload,
      );
      const messageResponse = this.messageMapper.toMessageResponseDto(message);

      // Update the sender's last read message to this new message
      const updatedMember = await this.chatMemberService.updateLastRead(
        payload.memberId,
        message.id, // using the newly created message's ID
      );

      // Emit the new message to all chat members
      await this.websocketService.emitToChatMembers(
        payload.chatId,
        `${chatLink}newMessage`,
        messageResponse,
      );

      // Emit the read update to all chat members
      if (updatedMember) {
        await this.websocketService.emitToChatMembers(
          payload.chatId,
          `${chatLink}messageRead`,
          {
            chatId: payload.chatId,
            memberId: updatedMember.id,
            messageId: message.id,
          },
        );
      }
    } catch (error) {
      console.error('Error handling sendMessage:', error);
      client.emit(`error`, { message: 'Failed to send message' });
    }
  }

  @SubscribeMessage(`${chatLink}forwardMessage`)
  async handleForwardMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: ForwardMessageDto,
  ) {
    try {
      console.log('Received forwardMessage payload:', payload);
      const senderId = client.data.userId;
      console.log('Sender ID:', senderId);

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
      console.log('Forwarded message created:', forwardedMessage);

      // Get member of sender in target chat
      const member = await this.chatMemberService.getMemberByChatIdAndUserId(
        payload.chatId,
        senderId,
      );
      console.log('Chat member found:', member);

      if (!member) {
        throw new Error(`User is not a member of chat ${payload.chatId}`);
      }

      // Update last read
      await this.chatMemberService.updateLastRead(
        member.id,
        forwardedMessage.id,
      );
      console.log('Updated last read message ID:', forwardedMessage.id);

      // Convert to DTO
      const messageResponse =
        this.messageMapper.toMessageResponseDto(forwardedMessage);
      console.log('Mapped message response:', messageResponse);

      // Emit new message to all chat members
      await this.websocketService.emitToChatMembers(
        payload.chatId,
        `${chatLink}newMessage`,
        messageResponse,
      );
      console.log(`Emitted newMessage to chat ${payload.chatId}`);

      // Emit read update
      await this.websocketService.emitToChatMembers(
        payload.chatId,
        `${chatLink}messageRead`,
        {
          chatId: payload.chatId,
          memberId: member.id,
          messageId: forwardedMessage.id,
        },
      );
      console.log(`Emitted messageRead to chat ${payload.chatId}`);

      return messageResponse;
    } catch (error) {
      console.error('Error handling forwardMessage:', error);
      client.emit(`error`, {
        message: 'Failed to forward message',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  @SubscribeMessage('chat:reactToMessage')
  async handleReactToMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody()
    payload: {
      messageId: string;
      chatId: string;
      emoji: string;
      userId: string;
    },
  ) {
    const { messageId, chatId, emoji, userId } = payload;
    await this.messageService.toggleReaction(messageId, userId, emoji);
    const reactions =
      await this.messageService.getReactionsForMessage(messageId);
    const formatted = this.messageService.formatReactions(reactions);

    await this.websocketService.emitToChatMembers(
      chatId,
      'chat:messageReaction',
      {
        messageId,
        reactions: formatted,
      },
    );
  }

  @SubscribeMessage(`${chatLink}messageRead`)
  async handleMarkAsRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody()
    data: { chatId: string; memberId: string; messageId: string },
  ) {
    console.log('message Read: ', data.messageId);
    const userId = client.data.userId;
    if (!userId) return;

    // Update read time in DB and get the member
    const member = await this.chatMemberService.updateLastRead(
      data.memberId,
      data.messageId,
    );

    if (!member) return;

    // Notify other participants with memberId and messageId
    await this.websocketService.emitToChatMembers(
      data.chatId,
      `${chatLink}messageRead`,
      {
        chatId: data.chatId,
        memberId: member.id, // This matches what client expects
        messageId: data.messageId,
      },
    );
  }

  @SubscribeMessage(`${chatLink}togglePinMessage`)
  async handleTogglePinMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chatId: string; messageId: string | null },
  ) {
    const userId = client.data.userId;
    if (!userId) return;

    try {
      if (data.messageId) {
        const updatedChat = await this.chatService.pinMessage(
          data.chatId,
          data.messageId,
          userId,
        );

        await this.websocketService.emitToChatMembers(
          data.chatId,
          `${chatLink}pinMessageUpdated`,
          {
            chatId: data.chatId,
            message: updatedChat.pinnedMessage,
          },
        );
      } else {
        await this.chatService.unpinMessage(data.chatId, userId);

        await this.websocketService.emitToChatMembers(
          data.chatId,
          `${chatLink}pinMessageUpdated`,
          {
            chatId: data.chatId,
            message: null,
          },
        );
      }
    } catch (error) {
      client.emit('error', {
        message: 'Failed to toggle pin message',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  @SubscribeMessage(`${chatLink}saveMessage`)
  async handleSaveMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { messageId: string | null },
  ) {
    const userId = client.data.userId;
    if (!userId || !data.messageId) {
      client.emit('error', { message: 'Invalid save request' });
      return;
    }

    console.log('Saved Message', data.messageId);

    try {
      // Step 1: Get or create the user's saved chat
      const savedChat = await this.chatService.getOrCreateSavedChat(userId);

      if (!savedChat) {
        client.emit('error', { message: 'Saved chat not found!' });
        console.log('Saved chat not found!');

        return;
      }

      // 2. Forward the message into the saved chat
      const savedMessage = await this.messageService.createForwardedMessage(
        userId,
        savedChat.id,
        data.messageId,
      );

      // Step 3: Format and emit to client
      const response = this.messageMapper.toMessageResponseDto(savedMessage);
      client.emit(`${chatLink}saveMessage`, response);

      // Optional: emit to all user's devices (if you track sockets by userId)
      this.websocketService.emitToUser(
        userId,
        `${chatLink}saveMessage`,
        response,
      );
    } catch (error) {
      console.error('Error saving message:', error);
      client.emit('error', {
        message: 'Failed to save message',
        error: error instanceof Error ? error.message : String(error),
      });
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
      .some((id) => this.websocketService.isUserOnline(id));
  }
}
