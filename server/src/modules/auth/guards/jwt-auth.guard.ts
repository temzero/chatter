// src/auth/guards/jwt-auth.guard.ts
import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // Add any additional pre-validation logic here if needed
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any) {
    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) {
      throw err;
    }
    console.log('user', user);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return user;
  }
}
