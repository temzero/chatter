import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Server } from 'socket.io';
import { WebsocketConnectionService } from './services/websocket-connection.service';
import { WebsocketNotificationService } from './services/websocket-notification.service';

@Injectable()
export class WebsocketService implements OnModuleDestroy {
  constructor(
    public readonly connection: WebsocketConnectionService,
    public readonly notification: WebsocketNotificationService,
  ) {}

  /** Set the Socket.IO server instance for all sub-services */
  setServer(server: Server) {
    this.connection.setServer(server);
    this.notification.setServer(server);
  }

  /** Cleanup on module destroy */
  onModuleDestroy() {}
}
