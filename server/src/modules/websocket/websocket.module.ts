// src/websocket/websocket.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { WebsocketGateway } from './features/websocket.gateway';
import { WebsocketService } from './websocket.service';
import { MessageModule } from '../message/message.module';
import { UserModule } from '../user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';
import { ChatMemberModule } from '../chat-member/chat-member.module';
import { ChatGateway } from './features/chat.gateway';
import { NotificationGateway } from './features/notifications.gateway';
import { MessageMapper } from '../message/mappers/message.mapper';
import { ChatModule } from '../chat/chat.module';
import { SupabaseModule } from '../superbase/supabase.module';
import { BlockModule } from '../block/block.module';
import { WebsocketConnectionService } from './services/websocket-connection.service';
import { CallGateway } from './features/call.gateway';
import { WebsocketCallService } from './services/websocket-call.service';
import { WebsocketNotificationService } from './services/websocket-notification.service';

@Module({
  imports: [
    forwardRef(() => ChatModule),
    forwardRef(() => MessageModule),
    forwardRef(() => UserModule),
    forwardRef(() => ChatMemberModule),
    forwardRef(() => BlockModule),
    forwardRef(() => SupabaseModule),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_ACCESS_SECRET'),
        signOptions: { expiresIn: '60m' },
      }),
      inject: [ConfigService],
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
    WebsocketCallService,
    WebsocketNotificationService,
  ],
  exports: [
    WebsocketGateway,
    WebsocketService,
    WebsocketConnectionService,
    WebsocketCallService,
    WebsocketNotificationService,
  ],
})
export class WebSocketModule {}
