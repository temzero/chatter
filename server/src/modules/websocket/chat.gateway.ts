import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';
import { ChatService } from '../chat/chat.service';
import { MessageService } from '../message/message.service';
import { CreateMessageDto } from '../message/dto/requests/create-message.dto';

@WebSocketGateway({
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: 'chat',
})
@UseGuards(WsJwtGuard)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly messageService: MessageService,
  ) {}

  async handleConnection(client: Socket) {
    const user = client.data.user;
    if (user) {
      await this.chatService.userConnected(user.id, client.id);
      this.server.emit('userOnline', { userId: user.id, online: true });
    }
  }

  async handleDisconnect(client: Socket) {
    const user = client.data.user;
    if (user) {
      await this.chatService.userDisconnected(user.id);
      this.server.emit('userOnline', { userId: user.id, online: false });
    }
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: CreateMessageDto,
  ) {
    const sender = client.data.user;
    const message = await this.messageService.createMessage(sender.id, payload);

    // Emit to sender
    client.emit('newMessage', message);

    // Emit to recipient if connected
    const recipientSocketId = await this.chatService.getUserSocketId(
      payload.recipientId,
    );
    if (recipientSocketId) {
      this.server.to(recipientSocketId).emit('newMessage', message);
    }

    return { success: true };
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: string,
  ) {
    client.join(roomId);
    return { success: true };
  }
}
