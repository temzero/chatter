import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatGroupMember } from 'src/entities/chat/chat-group-member.entity';
import { ChatGroupMemberService } from './chat-group-member.service';
import { ChatGroupMemberController } from './chat-group-member.controllers';

@Module({
  imports: [TypeOrmModule.forFeature([ChatGroupMember])],
  providers: [ChatGroupMemberService],
  controllers: [ChatGroupMemberController],
  exports: [ChatGroupMemberService],
})
export class ChatGroupMemberModule {}
