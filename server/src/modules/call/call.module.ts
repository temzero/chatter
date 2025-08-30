import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CallController } from './call.controller';
import { CallService } from './call.service';
import { Call } from './entities/call.entities';
import { ChatMember } from '../chat-member/entities/chat-member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Call, ChatMember])],
  controllers: [CallController],
  providers: [CallService],
  exports: [CallService],
})
export class CallModule {}
