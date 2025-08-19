import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { IncomingCallResponse } from '../constants/callPayload.type';

@Injectable()
export class WebsocketCallService implements OnModuleDestroy {
  private readonly pendingCalls = new Map<string, IncomingCallResponse>();
  private readonly callCleanupInterval: NodeJS.Timeout;

  constructor() {
    this.callCleanupInterval = setInterval(
      () => this.cleanupExpiredCalls(),
      60000,
    );
  }

  onModuleDestroy() {
    clearInterval(this.callCleanupInterval);
  }

  addPendingCall(key: string, callData: IncomingCallResponse): void {
    this.pendingCalls.set(key, { ...callData, timestamp: Date.now() });
  }

  getAndRemovePendingCall(key: string): IncomingCallResponse | undefined {
    const call = this.pendingCalls.get(key);
    this.pendingCalls.delete(key);
    return call;
  }

  private cleanupExpiredCalls(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    this.pendingCalls.forEach((call, key) => {
      if (now - call.timestamp > 60000) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach((key) => this.pendingCalls.delete(key));
  }
}
