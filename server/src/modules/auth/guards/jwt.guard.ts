// import { Injectable } from '@nestjs/common';
// import { AuthGuard } from '@nestjs/passport';

// @Injectable()
// export class JwtAuthGuard extends AuthGuard('jwt') {}

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { ErrorResponse } from 'src/common/api-response/errors';
import { UnauthorizedError } from 'src/shared/types/enums/error-message.enum';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly config: ConfigService) {
    super();
  }

  handleRequest(err, user, info) {
    // No user or error
    if (err || !user) {
      // Distinguish token expired vs invalid
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (info && info.name === 'TokenExpiredError') {
        return ErrorResponse.unauthorized(UnauthorizedError.TOKEN_EXPIRED);
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (info && info.name === 'JsonWebTokenError') {
        return ErrorResponse.unauthorized(UnauthorizedError.INVALID_TOKEN);
      }

      // Generic unauthorized
      return ErrorResponse.unauthorized(UnauthorizedError.UNAUTHORIZED);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return user;
  }
}
