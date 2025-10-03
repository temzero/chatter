import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CallController } from './call.controller';
import { CallService } from './call.service';
import { Call } from './entities/call.entity';
import { ChatMember } from '../chat-member/entities/chat-member.entity';
import { MessageModule } from '../message/message.module';
import { Chat } from '../chat/entities/chat.entity';
import { ChatMemberModule } from '../chat-member/chat-member.module';
import { LiveKitService } from './liveKit.service';
import { LiveKitWebhookController } from './livekit.webhook.controller';
import { CallStoreService } from '../websocket/services/call-store.service ';
import { ChatModule } from '../chat/chat.module';
import { WebsocketCallService } from '../websocket/services/websocket-call.service';
import { WebSocketModule } from '../websocket/websocket.module';
import { UserModule } from '../user/user.module';
import { CallMapper } from './mappers/call.mapper';

@Module({
  imports: [
    TypeOrmModule.forFeature([Call, Chat, ChatMember]),
    forwardRef(() => UserModule),
    forwardRef(() => ChatModule),
    forwardRef(() => WebSocketModule),
    MessageModule,
    ChatMemberModule,
  ],
  controllers: [CallController, LiveKitWebhookController],
  providers: [
    CallMapper,
    CallService,
    LiveKitService,
    CallStoreService,
    WebsocketCallService,
  ],
  exports: [CallService, CallStoreService],
})
export class CallModule {}
