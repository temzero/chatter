import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatMember } from './entities/chat-member.entity';
import { ChatMemberController } from './chat-member.controllers';
import { ChatMemberService } from './chat-member.service';

@Module({
  imports: [TypeOrmModule.forFeature([ChatMember])],
  controllers: [ChatMemberController],
  providers: [ChatMemberService],
  exports: [ChatMemberService],
})
export class ChatMemberModule {}
