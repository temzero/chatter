import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CallController } from './call.controller';
import { CallService } from './call.service';
import { Call } from './entities/call.entity';
import { ChatMember } from '../chat-member/entities/chat-member.entity';
import { MessageModule } from '../message/message.module';
import { Chat } from '../chat/entities/chat.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Call, Chat, ChatMember]), MessageModule],
  controllers: [CallController],
  providers: [CallService],
  exports: [CallService],
})
export class CallModule {}
