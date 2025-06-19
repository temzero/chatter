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
    // console.log('Get chat Status for :', userId);
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

    // client.emit(`${chatLink}userTyping`, {
    //   userId,
    //   chatId: data.chatId,
    //   isTyping: data.isTyping,
    // });
  }

  @SubscribeMessage(`${chatLink}sendMessage`)
  async handleMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: CreateMessageDto,
  ) {
    console.log('message sent');
    try {
      // Add senderId from socket if not in payload
      const senderId = client.data.userId;
      // console.log('senderId: ', senderId);
      // console.log('payload: ', payload);
      if (!senderId) {
        client.emit(`${chatLink}error`, { message: 'Unauthorized' });
        return;
      }

      const message = await this.messageService.createMessage(
        senderId,
        payload,
      );
      const messageResponse = this.messageMapper.toResponseDto(message);

      // console.log('Message created:', messageResponse);

      await this.websocketService.emitToChatMembers(
        payload.chatId,
        `${chatLink}newMessage`,
        messageResponse,
      );
    } catch (error) {
      console.error('Error handling sendMessage:', error);
      client.emit(`${chatLink}error`, { message: 'Failed to send message' });
    }
  }

  @SubscribeMessage(`${chatLink}markAsRead`)
  async handleMarkAsRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chatId: string },
  ) {
    const userId = client.data.userId;
    if (!userId) return;

    await this.chatMemberService.updateLastRead(data.chatId, userId);

    // Notify other participants that messages were read
    client.to(data.chatId).emit(`${chatLink}messagesRead`, {
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
