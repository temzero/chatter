// src/auth/types/authenticated-request.type.ts
import { Request } from 'express';
import { RequestUser } from './request-user.type';

export interface AuthenticatedRequest extends Request {
  user: RequestUser;
}
