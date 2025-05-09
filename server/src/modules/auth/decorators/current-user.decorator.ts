// src/common/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

// Extend the Request interface to include the 'user' property
declare module 'express' {
  interface Request {
    user?: JwtPayload;
  }
}
import { JwtPayload } from '../types/jwt-payload.type';

export const CurrentUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as JwtPayload;

    // If a specific property is requested, return just that property
    if (data) {
      return user[data];
    }

    // Otherwise return the entire user object
    return user;
  },
);
