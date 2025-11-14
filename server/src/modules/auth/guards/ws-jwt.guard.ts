import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/modules/user/user.service';
import { User } from 'src/modules/user/entities/user.entity';
import type { JwtPayload } from '../types/jwt-payload.type';
import { ErrorResponse } from 'src/common/api-response/errors';
import {
  NotFoundError,
  UnauthorizedError,
} from 'src/shared/types/enums/error-message.enum';

interface WsClient {
  handshake: {
    query?: Record<string, any>;
    auth?: {
      token?: string;
    };
    headers?: Record<string, string>;
  };
  data?: Record<string, any>;
}

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: WsClient = context.switchToWs().getClient();
    const token = this.extractTokenFromAuthPayload(client);

    if (!token) {
      ErrorResponse.unauthorized();
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      });

      console.log('payload from accessToken: ', payload);

      const user: User = await this.userService.getUserById(payload.sub);
      if (!user) {
        ErrorResponse.notFound(NotFoundError.USER_NOT_FOUND);
      }

      console.log('UserData from accessToken: ', user);

      client.data = { ...(client.data || {}), user };
      return true;
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.name === 'TokenExpiredError') {
          ErrorResponse.unauthorized(UnauthorizedError.TOKEN_EXPIRED);
        } else if (err.name === 'JsonWebTokenError') {
          ErrorResponse.unauthorized(UnauthorizedError.INVALID_TOKEN);
        }
      }
      ErrorResponse.forbidden();
    }
  }

  private extractTokenFromAuthPayload(client: WsClient): string | undefined {
    // Try different ways to get the token
    const token =
      typeof client.handshake?.auth?.token === 'string'
        ? client.handshake.auth.token
        : typeof client.handshake?.query?.token === 'string'
          ? client.handshake.query.token
          : typeof client.handshake?.headers?.authorization === 'string'
            ? client.handshake.headers.authorization.split(' ')[1]
            : undefined;

    console.log('Extracted token:', token);
    return token;
  }
}
