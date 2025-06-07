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

@WebSocketGateway({ namespace: 'chat' })
export class ChatGateway {
  constructor(
    private readonly messageService: MessageService,
    private readonly websocketService: WebsocketService,
  ) {}

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: CreateMessageDto,
  ) {
    try {
      // Add senderId from socket if not in payload
      const senderId = client.data.user?.id;
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
