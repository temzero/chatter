import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        (request: Request) => request.cookies?.refreshToken || null,
      ]),
      secretOrKey: EnvConfig.jwt.refresh.secret,
      ignoreExpiration: false, // still needed to let passport handle expiration
    });
  }

  validate(payload: JwtRefreshPayload) {
    return payload;
  }
}
