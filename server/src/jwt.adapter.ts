import { IoAdapter } from '@nestjs/platform-socket.io';
import { INestApplication, UnauthorizedException } from '@nestjs/common';
import { ServerOptions } from 'socket.io';
import { verify } from 'jsonwebtoken';
import { JwtPayload } from './modules/auth/types/jwt-payload.type';
import type { AuthenticatedSocket } from './modules/websocket/constants/authenticatedSocket.type';

export class JwtIoAdapter extends IoAdapter {
  constructor(private app: INestApplication) {
    super(app);
  }

  create(port: number, options?: ServerOptions) {
    const server = super.create(port, options);

    server.use((socket: AuthenticatedSocket, next) => {
      const authToken =
        socket.handshake.auth && typeof socket.handshake.auth.token === 'string'
          ? socket.handshake.auth.token
          : undefined;
      const headerAuth =
        socket.handshake.headers &&
        typeof socket.handshake.headers.authorization === 'string'
          ? socket.handshake.headers.authorization
          : undefined;
      const token: string | undefined =
        authToken || (headerAuth ? headerAuth.split(' ')[1] : undefined);

      if (!token) {
        return next(new UnauthorizedException('No token provided'));
      }

      try {
        const jwtSecret = process.env.JWT_ACCESS_SECRET;
        if (!jwtSecret) {
          throw new Error(
            'JWT_ACCESS_SECRET is not defined in environment variables',
          );
        }
        const payload = verify(token, jwtSecret) as JwtPayload;
        socket.data.userId = payload.sub;
        next();
      } catch (error) {
        console.error(error);
        return next(new UnauthorizedException('Invalid token'));
      }
    });

    return server;
  }
}
