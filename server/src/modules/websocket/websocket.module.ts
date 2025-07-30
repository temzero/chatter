// src/websocket/websocket.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { GlobalGateway } from './global.gateway';
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
import { NotificationWsService } from './notification.service';

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
    GlobalGateway,
    ChatGateway,
    NotificationGateway,
    WsJwtGuard,
    MessageMapper,
    NotificationWsService,
  ],
  exports: [GlobalGateway, WebsocketService, NotificationWsService],
})
export class WebSocketModule {}
