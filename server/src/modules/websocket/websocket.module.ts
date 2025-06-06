// src/websocket/websocket.module.ts
import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';

@Module({
  providers: [ChatGateway],
  exports: [ChatGateway],
})
export class WebSocketModule {}
