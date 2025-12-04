// src/common/guards/livekit-webhook.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import * as crypto from 'crypto';

@Injectable()
export class LiveKitWebhookGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = context.switchToHttp().getRequest();

    // Skip verification if no secret is set (for development)
    const webhookSecret = process.env.LIVEKIT_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.warn(
        '⚠️ LIVEKIT_WEBHOOK_SECRET not set, skipping webhook verification',
      );
      return true;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const signature = request.headers['livekit-signature'];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const rawBody = request.rawBody; // Available because of your middleware

    if (!signature) {
      console.error('❌ No LiveKit signature provided');
      throw new HttpException(
        'Invalid webhook signature',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (!rawBody) {
      console.error('❌ No raw body available');
      throw new HttpException('No request body', HttpStatus.BAD_REQUEST);
    }

    const isValid = this.verifySignature(rawBody, signature, webhookSecret);

    if (!isValid) {
      console.error('❌ Invalid LiveKit webhook signature');
      throw new HttpException(
        'Invalid webhook signature',
        HttpStatus.UNAUTHORIZED,
      );
    }

    console.log('✅ LiveKit webhook signature verified');
    return true;
  }

  private verifySignature(
    rawBody: Buffer,
    signature: string,
    secret: string,
  ): boolean {
    try {
      const computedSignature = crypto
        .createHmac('sha256', secret)
        .update(rawBody)
        .digest('base64');

      // Use timing-safe comparison
      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(computedSignature),
      );
    } catch (error) {
      console.error('Signature verification error:', error);
      return false;
    }
  }
}
