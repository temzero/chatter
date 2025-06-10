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

const chatGateway = 'chat';

@WebSocketGateway()
export class ChatGateway {
  constructor(
    private readonly messageService: MessageService,
    private readonly websocketService: WebsocketService,
    private readonly chatMemberService: ChatMemberService,
  ) {}

  @SubscribeMessage(`${chatGateway}:getStatus`)
  async handleGetStatus(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() chatId: string,
  ) {
    const userId = client.data.userId;
    if (!userId) return false;

    const isOnline = await this.hasAnyOtherMemberOnline(chatId, userId);
    return { chatId, isOnline };
  }

  @SubscribeMessage(`${chatGateway}:typing`)
  handleTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chatId: string; isTyping: boolean },
  ) {
    const userId = client.data.userId;
    if (!userId) return;

    // Broadcast to all other members in the chat
    client.to(data.chatId).emit('userTyping', {
      userId,
      chatId: data.chatId,
      isTyping: data.isTyping,
    });
  }

  @SubscribeMessage(`${chatGateway}:sendMessage`)
  async handleMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: CreateMessageDto,
  ) {
    try {
      // Add senderId from socket if not in payload
      const senderId = client.data.userId;
      console.log('senderId: ', senderId);
      console.log('payload: ', payload);
      if (!senderId) {
        client.emit('error', { message: 'Unauthorized' });
        return;
      }

      const message = await this.messageService.createMessage(
        senderId,
        payload,
      );

      // Ensure sender has joined the room
      await client.join(payload.chatId);

      // Emit to all clients in the chat room (including sender)
      this.websocketService
        .getServer()
        .to(payload.chatId)
        .emit('newMessage', message);
    } catch (error) {
      console.error('Error handling sendMessage:', error);
      client.emit('error', { message: 'Failed to send message' });
    }
  }

  @SubscribeMessage(`${chatGateway}:markAsRead`)
  async handleMarkAsRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chatId: string },
  ) {
    const userId = client.data.userId;
    if (!userId) return;

    await this.chatMemberService.updateLastRead(data.chatId, userId);

    // Notify other participants that messages were read
    client.to(data.chatId).emit('messagesRead', {
      userId,
      chatId: data.chatId,
      timestamp: Date.now(),
    });
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
