import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class LocalGuard extends AuthGuard('local') {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const deviceId = request.headers['x-device-id'];

    if (!deviceId) {
      throw new BadRequestException('Device ID is required');
    }

    return super.canActivate(context);
  }

  handleRequest<TUser = any>(err: any, user: any, info: any): TUser {
    if (err || !user) {
      throw (
        err ||
        new UnauthorizedException(
          (info as { message?: string })?.message || 'Authentication failed',
        )
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return user;
  }
}
