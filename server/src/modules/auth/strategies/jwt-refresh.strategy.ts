// src/auth/strategies/jwt-refresh.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptionsWithRequest } from 'passport-jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { JwtRefreshPayload } from '../types/jwt-payload.type';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        JwtRefreshStrategy.getRefreshTokenFromRequest,
      ]),
      secretOrKey: configService.get('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
      ignoreExpiration: false,
    } as StrategyOptionsWithRequest);
  }

  validate(request: Request, payload: JwtRefreshPayload) {
    const refreshToken = JwtRefreshStrategy.getRefreshTokenFromRequest(request);

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token malformed');
    }

    return {
      userId: payload.sub,
      email: payload.email,
      deviceId: payload.deviceId,
      deviceName: payload.deviceName,
      refreshToken,
    };
  }

  // Shared utility method
  private static getRefreshTokenFromRequest(
    this: void,
    request: Request,
  ): string | null {
    const cookieToken = (request?.cookies as Record<string, string> | undefined)
      ?.refreshToken;

    if (cookieToken) return cookieToken;

    const authHeader = request.get('Authorization');
    if (authHeader) {
      const [type, value] = authHeader.split(' ');
      if (type === 'Refresh') return value;
    }

    return null;
  }
}
