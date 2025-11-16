import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ErrorResponse } from 'src/common/api-response/errors';
import { UnauthorizedError } from 'src/shared/types/enums/error-message.enum';

@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {
  handleRequest(err, user, info) {
    // No user or error
    if (err || !user) {
      // Distinguish token expired vs invalid for refresh token
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (info && info.name === 'TokenExpiredError') {
        return ErrorResponse.unauthorized(
          UnauthorizedError.REFRESH_TOKEN_EXPIRED,
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (info && info.name === 'JsonWebTokenError') {
        return ErrorResponse.unauthorized(
          UnauthorizedError.INVALID_REFRESH_TOKEN,
        );
      }

      // Generic unauthorized for refresh token
      return ErrorResponse.unauthorized(UnauthorizedError.UNAUTHORIZED);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return user;
  }
}
