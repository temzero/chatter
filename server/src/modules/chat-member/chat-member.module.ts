import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatMemberController } from './chat-member.controllers';
import { ChatMemberService } from './chat-member.service';
import { ChatMember } from './entities/chat-member.entity';
import { ChatModule } from '../chat/chat.module';
import { FriendshipModule } from '../friendship/friendship.module';
import { BlockModule } from '../block/block.module';
import { MessageModule } from '../message/message.module';
import { WebSocketModule } from '../websocket/websocket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatMember]),
    forwardRef(() => ChatModule),
    forwardRef(() => MessageModule),
    forwardRef(() => FriendshipModule),
    forwardRef(() => BlockModule),
    forwardRef(() => WebSocketModule),
  ],
  controllers: [ChatMemberController],
  providers: [ChatMemberService],
  exports: [ChatMemberService, TypeOrmModule],
})
export class ChatMemberModule {}
