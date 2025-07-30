import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatMemberController } from './chat-member.controllers';
import { ChatMemberService } from './chat-member.service';
import { ChatMember } from './entities/chat-member.entity';
import { ChatModule } from '../chat/chat.module';
import { FriendshipModule } from '../friendship/friendship.module';
import { WebsocketService } from '../websocket/websocket.service';
import { BlockModule } from '../block/block.module';
import { MessageModule } from '../message/message.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatMember]),
    forwardRef(() => ChatModule),
    forwardRef(() => MessageModule),
    forwardRef(() => FriendshipModule),
    forwardRef(() => BlockModule),
  ],
  controllers: [ChatMemberController],
  providers: [ChatMemberService, WebsocketService],
  exports: [ChatMemberService, WebsocketService, TypeOrmModule],
})
export class ChatMemberModule {}
