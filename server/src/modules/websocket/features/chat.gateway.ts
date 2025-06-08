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

@WebSocketGateway({ namespace: 'chat' })
export class ChatGateway {
  constructor(
    private readonly messageService: MessageService,
    private readonly websocketService: WebsocketService,
    private readonly chatMemberService: ChatMemberService,
  ) {}

  @SubscribeMessage('check-online')
  async handleChatroomHasOnline(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() chatId: string,
  ): Promise<boolean> {
    try {
      const memberIds = await this.chatMemberService.getAllMemberIds(chatId);
      const otherMemberIds = memberIds.filter(
        (id) => id !== client.data.userId,
      );
      const hasOnline = otherMemberIds.some((id) =>
        this.websocketService.isUserOnline(id),
      );
      return hasOnline;
    } catch (error) {
      console.error('Error checking chatroom online status:', error);
      return false;
    }
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: CreateMessageDto,
  ) {
    try {
      // Add senderId from socket if not in payload
      const senderId = client.data.userId;
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
}
