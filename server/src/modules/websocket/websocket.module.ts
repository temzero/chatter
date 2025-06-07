// src/websocket/websocket.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { GlobalGateway } from './websocket.gateway';
import { WebsocketService } from './websocket.service';
import { MessageModule } from '../message/message.module';
import { UserModule } from '../user/user.module'; // Add this import
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard'; // Import the guard

@Module({
  imports: [
    forwardRef(() => MessageModule),
    forwardRef(() => UserModule), // Add UserModule import
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
    WsJwtGuard, // Add the guard as a provider
  ],
  exports: [GlobalGateway, WebsocketService],
})
export class WebSocketModule {}
