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
import { ChatMemberService } from 'src/modules/chat-member/chat-member.service';
import { MessageMapper } from 'src/modules/message/mappers/message.mapper';

const chatLink = 'chat:';

@WebSocketGateway()
export class ChatGateway {
  constructor(
    private readonly messageService: MessageService,
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
        client.emit(`${chatLink}error`, { message: 'Unauthorized' });
        return;
      }

      // Create the message
      const message = await this.messageService.createMessage(
        senderId,
        payload,
      );
      const messageResponse = this.messageMapper.toResponseDto(message);

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
      client.emit(`${chatLink}error`, { message: 'Failed to send message' });
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

  // Utility to check if any other chat member is online (excluding one user)
  async hasAnyOtherMemberOnline(
    chatId: string,
    excludeUserId: string,
  ): Promise<boolean> {
    const memberIds = await this.chatMemberService.getAllMemberIds(chatId);
    return memberIds
      .filter((id) => id !== excludeUserId)
      .some((id) => this.websocketService.isUserOnline(id));
  }
}
