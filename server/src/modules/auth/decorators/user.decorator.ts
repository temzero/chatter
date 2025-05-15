// src/decorators/user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../types/jwt-payload.type';
import { Request } from 'express';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const payload = request.user as JwtPayload;

    if (!payload) {
      throw new Error('User decorator used without auth guard');
    }

    if (data === 'id') {
      return payload.sub;
    } else if (data === 'email') {
      return payload.email;
    }

    if (data) {
      return payload[data] as string;
    } else {
      return payload;
    }
  },
);
