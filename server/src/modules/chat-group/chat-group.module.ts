import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatGroupController } from './chat-group.controllers';
import { ChatGroupService } from './chat-group.service';
import { ChatGroup } from 'src/entities/chat/chat-group.entity';
import { ChatGroupMember } from 'src/entities/chat/chat-group-member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChatGroup, ChatGroupMember])],
  controllers: [ChatGroupController],
  providers: [ChatGroupService],
})
export class ChatGroupModule {}
