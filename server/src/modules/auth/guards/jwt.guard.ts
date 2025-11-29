// import { Injectable } from '@nestjs/common';
// import { AuthGuard } from '@nestjs/passport';

// @Injectable()
// export class JwtAuthGuard extends AuthGuard('jwt') {}

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ErrorResponse } from '@/common/api-response/errors';
import { UnauthorizedError } from '@shared/types/enums/error-message.enum';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor() {
    super();
  }

  handleRequest(err, user, info) {
    // No user or error
    if (err || !user) {
      // Distinguish token expired vs invalid
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (info && info.name === 'TokenExpiredError') {
        ErrorResponse.unauthorized(UnauthorizedError.TOKEN_EXPIRED);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      } else if (info && info.name === 'JsonWebTokenError') {
        ErrorResponse.unauthorized(UnauthorizedError.INVALID_TOKEN);
      } else
        // Generic unauthorized
        ErrorResponse.unauthorized(UnauthorizedError.TOKEN_EXPIRED);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return user;
  }
}
