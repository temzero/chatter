import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/modules/user/user.service';
import { User } from 'src/modules/user/entities/user.entity';
import type { JwtPayload } from '../types/jwt-payload.type';

interface WsClient {
  handshake: {
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
    private jwtService: JwtService,
    private userService: UserService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: WsClient = context.switchToWs().getClient();
    const token = this.extractTokenFromAuthPayload(client);

    if (!token) {
      throw new WsException('Unauthorized');
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      });

      const user: User = await this.userService.getUserById(payload.sub);
      if (!user) {
        throw new WsException('User not found');
      }

      if (!client.data) {
        client.data = {};
      }
      client.data.user = user;
      return true;
    } catch {
      throw new WsException('Unauthorized');
    }
  }

  private extractTokenFromAuthPayload(client: WsClient): string | undefined {
    return client.handshake.auth?.token;
  }
}
