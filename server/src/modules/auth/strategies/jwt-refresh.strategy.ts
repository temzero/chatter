import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptionsWithRequest } from 'passport-jwt';
import { Request } from 'express';
import { JwtRefreshPayload } from '../types/jwt-payload.type';
import { EnvConfig } from 'src/common/config/env.config';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // eslint-disable-next-line @typescript-eslint/unbound-method
        JwtRefreshStrategy.getRefreshTokenFromRequest,
      ]),
      secretOrKey: EnvConfig.jwt.refresh.secret,
      ignoreExpiration: false,
      passReqToCallback: true,
    } as StrategyOptionsWithRequest);
  }

  validate(request: Request, payload: JwtRefreshPayload) {
    const refreshToken = JwtRefreshStrategy.getRefreshTokenFromRequest(request);
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    return {
      userId: payload.sub,
      email: payload.email,
      deviceId: payload.deviceId,
      deviceName: payload.deviceName,
      refreshToken,
    };
  }

  private static getRefreshTokenFromRequest(request: Request): string | null {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return request.cookies?.refreshToken || null;
  }
}
