// livekit-webhook.guard.ts
import { EnvConfig } from '@/common/config/env.config';
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { WebhookReceiver } from 'livekit-server-sdk';

@Injectable()
export class LiveKitWebhookGuard implements CanActivate {
  private readonly logger = new Logger(LiveKitWebhookGuard.name);
  private webhookReceiver: WebhookReceiver;

  constructor() {
    this.webhookReceiver = new WebhookReceiver(
      EnvConfig.livekit.apiKey,
      EnvConfig.livekit.apiSecret,
    );

    this.logger.log('🔐 LiveKit WebhookReceiver initialized');
    this.logger.log(
      `📝 API Key: ${EnvConfig.livekit.apiKey.substring(0, 10)}...`,
    );
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const req = context.switchToHttp().getRequest();
    try {
      const event = await this.webhookReceiver.receive(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        req.body.toString('utf8'),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        req.headers['authorization'],
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      req.webhookEvent = event;
      return true;
    } catch {
      return false;
    }
  }
}
