import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Call } from './entities/call.entity';
import { ChatMember } from '../chat-member/entities/chat-member.entity';
import { ChatModule } from '../chat/chat.module';
import { UserModule } from '../user/user.module';
import { CallController } from './call.controller';
import { CallService } from './call.service';
import { CallRepository } from './repositories/call.repository';
import { CallGateway } from '../websocket/features/call.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([Call, ChatMember]),
    ChatModule, // if you need chat integration
    UserModule, // for user references
  ],
  controllers: [CallController],
  providers: [CallService, CallRepository, CallGateway],
  exports: [CallService],
})
export class CallModule {}
