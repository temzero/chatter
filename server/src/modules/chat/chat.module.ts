import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController } from './chat.controllers';
import { ChatService } from './chat.service';
import { Chat } from './entities/chat.entity';
import { ChatMemberModule } from '../chat-member/chat-member.module';
import { ChatMember } from '../chat-member/entities/chat-member.entity';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chat, ChatMember, User]),
    forwardRef(() => ChatMemberModule),
  ],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService, TypeOrmModule],
})
export class ChatModule {}
