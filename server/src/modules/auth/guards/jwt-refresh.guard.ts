import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ErrorResponse } from 'src/common/api-response/errors';
import { UnauthorizedError } from 'src/shared/types/enums/error-message.enum';

@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {
  handleRequest(err, user) {
    console.log('[JwtRefreshGuard]');

    // If user is missing → token invalid OR expired OR cookie missing → all = unauthorized
    if (err || !user) {
      console.log('[JwtRefreshGuard] REFRESH_TOKEN_EXPIRED');
      ErrorResponse.unauthorized(UnauthorizedError.REFRESH_TOKEN_EXPIRED);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return user;
  }
}
