import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { Chat } from './entities/chat.entity';
import { ChatMemberModule } from '../chat-member/chat-member.module';
import { ChatMember } from '../chat-member/entities/chat-member.entity';
import { User } from '../user/entities/user.entity';
import { FriendshipModule } from '../friendship/friendship.module';
import { WebSocketModule } from '../websocket/websocket.module';
import { MessageModule } from '../message/message.module';
import { ChatMapper } from './mappers/chat.mapper';
import { BlockModule } from '../block/block.module';
import { InviteLinkModule } from '../invite-link/invite-link.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chat, ChatMember, User]),
    forwardRef(() => ChatMemberModule),
    forwardRef(() => MessageModule),
    forwardRef(() => FriendshipModule),
    forwardRef(() => BlockModule),
    forwardRef(() => WebSocketModule),
    forwardRef(() => InviteLinkModule),
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatMapper],
  exports: [ChatService, TypeOrmModule],
})
export class ChatModule {}
