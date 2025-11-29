import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ErrorResponse } from '@/common/api-response/errors';
import { UnauthorizedError } from '@shared/types/enums/error-message.enum';

@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {
  handleRequest(err, user) {
    // If user is missing → token invalid OR expired OR cookie missing → all = unauthorized
    if (err || !user) {
      // console.log('[JwtRefresh GUARD] REFRESH_TOKEN_EXPIRED');
      ErrorResponse.unauthorized(UnauthorizedError.REFRESH_TOKEN_EXPIRED);
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return user;
  }
}
