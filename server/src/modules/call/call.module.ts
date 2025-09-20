import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CallController } from './call.controller';
import { CallService } from './call.service';
import { Call } from './entities/call.entity';
import { ChatMember } from '../chat-member/entities/chat-member.entity';
import { MessageModule } from '../message/message.module';
import { Chat } from '../chat/entities/chat.entity';
import { ChatMemberModule } from '../chat-member/chat-member.module';
import { LivekitService } from './liveKit.service';
import { LivekitWebhookController } from './livekit.webhook.controller';
import { CallStoreService } from '../websocket/services/call-store.service ';
import { ChatModule } from '../chat/chat.module';
import { WebsocketCallService } from '../websocket/services/websocket-call.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Call, Chat, ChatMember]),
    forwardRef(() => ChatModule),
    MessageModule,
    ChatMemberModule,
  ],
  controllers: [CallController, LivekitWebhookController],
  providers: [
    CallService,
    LivekitService,
    CallStoreService,
    WebsocketCallService,
  ],
  exports: [CallService, CallStoreService],
})
export class CallModule {}
