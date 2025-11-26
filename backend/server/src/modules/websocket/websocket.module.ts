// src/websocket/websocket.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { WebsocketGateway } from './features/websocket.gateway';
import { WebsocketService } from './websocket.service';
import { MessageModule } from '../message/message.module';
import { UserModule } from '../user/user.module';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';
import { ChatMemberModule } from '../chat-member/chat-member.module';
import { ChatGateway } from './features/chat.gateway';
import { NotificationGateway } from './features/notifications.gateway';
import { MessageMapper } from '../message/mappers/message.mapper';
import { ChatModule } from '../chat/chat.module';
import { SupabaseModule } from '../superbase/supabase.module';
import { BlockModule } from '../block/block.module';
import { WebsocketConnectionService } from './services/websocket-connection.service';
import { WebsocketNotificationService } from './services/websocket-notification.service';
import { CallGateway } from './features/call.gateway';
import { CallModule } from '../call/call.module';
import { EnvConfig } from 'src/common/config/env.config';
@Module({
  imports: [
    forwardRef(() => ChatModule),
    forwardRef(() => MessageModule),
    forwardRef(() => UserModule),
    forwardRef(() => ChatMemberModule),
    forwardRef(() => BlockModule),
    forwardRef(() => SupabaseModule),
    forwardRef(() => CallModule), // Add CallModule import
    JwtModule.register({
      secret: EnvConfig.jwt.access.secret,
      signOptions: {
        expiresIn: EnvConfig.jwt.access.expiration,
      },
    }),
  ],
  providers: [
    WebsocketService,
    WebsocketGateway,
    ChatGateway,
    CallGateway,
    NotificationGateway,
    WsJwtGuard,
    MessageMapper,
    WebsocketConnectionService,
    WebsocketNotificationService,
  ],
  exports: [
    WebsocketGateway,
    WebsocketService,
    WebsocketConnectionService,
    WebsocketNotificationService,
  ],
})
export class WebSocketModule {}
