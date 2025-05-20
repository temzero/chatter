import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatMemberController } from './chat-member.controllers';
import { ChatMemberService } from './chat-member.service';
import { ChatMember } from './entities/chat-member.entity';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatMember]),
    forwardRef(() => ChatModule), // Handle circular dependency
  ],
  controllers: [ChatMemberController],
  providers: [ChatMemberService],
  exports: [ChatMemberService, TypeOrmModule],
})
export class ChatMemberModule {}
