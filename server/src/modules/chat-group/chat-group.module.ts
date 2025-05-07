import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatGroupController } from './chat-group.controllers';
import { ChatGroupService } from './chat-group.service';
import { ChatGroup } from 'src/modules/chat-group/entities/chat-group.entity';
import { ChatGroupMember } from 'src/modules/chat-group-member/entities/chat-group-member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChatGroup, ChatGroupMember])],
  controllers: [ChatGroupController],
  providers: [ChatGroupService],
  exports: [ChatGroupService],
})
export class ChatGroupModule {}
