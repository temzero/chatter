import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController } from './chat.controllers';
import { ChatService } from './chat.service';
import { Chat } from './entities/chat.entity';
import { ChatMemberModule } from '../chat-member/chat-member.module';
import { ChatMember } from '../chat-member/entities/chat-member.entity';
import { User } from '../user/entities/user.entity';
import { FriendshipModule } from '../friendship/friendship.module';
import { WebSocketModule } from '../websocket/websocket.module';
import { MessageModule } from '../message/message.module';
import { ChatMapper } from './mappers/chat.mapper';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chat, ChatMember, User]),
    forwardRef(() => ChatMemberModule),
    forwardRef(() => MessageModule),
    forwardRef(() => FriendshipModule),
    WebSocketModule,
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatMapper],
  exports: [ChatService, TypeOrmModule],
})
export class ChatModule {}
