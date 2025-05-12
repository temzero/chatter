// src/auth/types/authenticated-request.type.ts
import { Request } from 'express';
import { User } from 'src/modules/user/entities/user.entity';
import { JwtPayload } from './jwt-payload.type';

export interface AuthenticatedRequest extends Request {
  user: User | JwtPayload; // Or your user type
}
