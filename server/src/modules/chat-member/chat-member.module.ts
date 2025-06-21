import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatMemberController } from './chat-member.controllers';
import { ChatMemberService } from './chat-member.service';
import { ChatMember } from './entities/chat-member.entity';
import { ChatModule } from '../chat/chat.module';
import { FriendshipModule } from '../friendship/friendship.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatMember]),
    forwardRef(() => ChatModule),
    forwardRef(() => FriendshipModule),
  ],
  controllers: [ChatMemberController],
  providers: [ChatMemberService],
  exports: [ChatMemberService, TypeOrmModule],
})
export class ChatMemberModule {}
