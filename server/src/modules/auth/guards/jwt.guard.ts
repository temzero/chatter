// import { Injectable } from '@nestjs/common';
// import { AuthGuard } from '@nestjs/passport';

// @Injectable()
// export class JwtAuthGuard extends AuthGuard('jwt') {}

import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ErrorResponse } from 'src/common/api-response/errors';
import { UnauthorizedError } from 'src/shared/types/enums/error-message.enum';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor() {
    super();
  }

  handleRequest(err, user, info, context?: ExecutionContext) {
    console.log('JwtAuthGuard');

    let path = '';
    if (context && typeof context.switchToHttp === 'function') {
      const request = context.switchToHttp().getRequest<Record<string, any>>();
      path = typeof request?.url === 'string' ? request.url : '';
    }

    // Skip JWT check for public routes
    if (path.startsWith('/auth/')) {
      console.log('Skip JWT check for public routes');
      return null; // public route, no token needed
    }
    // No user or error
    if (err || !user) {
      // Distinguish token expired vs invalid
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (info && info.name === 'TokenExpiredError') {
        console.log('TOKEN_EXPIRED');
        ErrorResponse.unauthorized(UnauthorizedError.TOKEN_EXPIRED);
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (info && info.name === 'JsonWebTokenError') {
        console.log('INVALID_TOKEN');
        ErrorResponse.unauthorized(UnauthorizedError.INVALID_TOKEN);
      }

      // Generic unauthorized
      ErrorResponse.unauthorized();
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return user;
  }
}
