// src/common/guards/livekit-webhook.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { EnvConfig } from '@/common/config/env.config';

@Injectable()
export class LiveKitWebhookGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = context.switchToHttp().getRequest();

    // Get JWT token from Authorization header
    const authHeader = request.headers['authorization'];
    if (!authHeader) {
      console.error('❌ LiveKit webhook: No Authorization header');
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    // Extract token
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : authHeader;

    try {
      // ⚠️ Verify with LIVEKIT_API_SECRET (NOT webhook secret)
      const apiSecret = EnvConfig.livekit.apiSecret;

      if (!apiSecret) {
        console.warn('⚠️ LIVEKIT_API_SECRET not set, allowing webhook');
        return true; // Allow in development
      }

      // Verify the JWT
      const decoded = jwt.verify(token, apiSecret, {
        algorithms: ['HS256'],
      });

      console.log('✅ LiveKit webhook JWT verified');
      return true;
    } catch (error) {
      console.error('❌ LiveKit webhook JWT invalid:', error.message);

      // For development/testing, you can allow it
      if (process.env.NODE_ENV !== 'production') {
        console.warn('⚠️ Development mode: Allowing unverified webhook');
        return true;
      }

      throw new HttpException('Invalid webhook token', HttpStatus.UNAUTHORIZED);
    }
  }
}
