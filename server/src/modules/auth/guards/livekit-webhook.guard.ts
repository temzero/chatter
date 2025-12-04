/* eslint-disable @typescript-eslint/no-unsafe-member-access */
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
import { EnvConfig } from '@/common/config/env.config';

@Injectable()
export class LiveKitWebhookGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = context.switchToHttp().getRequest();

    // Debug: Log all headers to see what LiveKit is actually sending
    console.log('📨 Webhook Headers:', request.headers);
    console.log('🔗 Request URL:', request.url);
    console.log('📝 Method:', request.method);

    // Check if webhook verification is enabled
    const shouldVerify = process.env.VERIFY_LIVEKIT_WEBHOOK !== 'false';

    if (!shouldVerify) {
      console.warn('⚠️ Webhook verification disabled via env');
      return true;
    }

    // Try different signature locations
    const signature = this.extractSignature(request);

    // If no signature found, check if we should allow it
    if (!signature) {
      console.warn('⚠️ No LiveKit signature found in headers');

      // For development/testing, you might want to allow unsigned webhooks
      const allowUnsigned =
        process.env.NODE_ENV !== 'production' ||
        process.env.ALLOW_UNSIGNED_WEBHOOKS === 'true';

      if (allowUnsigned) {
        console.warn('⚠️ Allowing unsigned webhook (development mode)');
        return true;
      }

      throw new HttpException(
        'Webhook signature required',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Get raw body from middleware
    const rawBody = request.rawBody;
    if (!rawBody) {
      console.error('❌ No raw body available');
      throw new HttpException('No request body', HttpStatus.BAD_REQUEST);
    }

    // Try to verify with available secrets
    const isValid = this.tryVerification(rawBody, signature);

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

  private extractSignature(request: any): string | null {
    // Try different header names
    const possibleHeaders = [
      'livekit-signature',
      'livekit-signature',
      'x-livekit-signature',
      'x-signature',
      'signature',
    ];

    for (const header of possibleHeaders) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const value =
        request.headers[header] || request.headers[header.toLowerCase()];
      if (value) {
        console.log(`🔑 Found signature in header "${header}"`);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return value;
      }
    }

    // Check query parameters (some services use ?signature=xxx)
    if (request.query?.signature) {
      console.log('🔑 Found signature in query parameter');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return request.query.signature;
    }

    return null;
  }

  private tryVerification(rawBody: Buffer, signature: string): boolean {
    // Try multiple possible secrets
    const secretsToTry = [
      process.env.LIVEKIT_WEBHOOK_SECRET, // Specific webhook secret
      EnvConfig.livekit.apiSecret, // Your API secret
      process.env.LIVEKIT_API_SECRET, // Direct env variable
    ].filter((secret) => !!secret); // Remove null/undefined

    console.log(`🔑 Trying ${secretsToTry.length} possible secrets`);

    for (const secret of secretsToTry) {
      try {
        const computedSignature = crypto
          .createHmac('sha256', secret)
          .update(rawBody)
          .digest('base64');

        if (
          crypto.timingSafeEqual(
            Buffer.from(signature),
            Buffer.from(computedSignature),
          )
        ) {
          console.log(`✅ Verified with secret: ${secret.substring(0, 10)}...`);
          return true;
        }
      } catch (error) {
        console.warn(`⚠️ Failed verification attempt with secret`);
      }
    }

    return false;
  }
}
