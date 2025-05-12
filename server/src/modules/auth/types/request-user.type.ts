// src/auth/types/request-user.type.ts
import { User } from 'src/modules/user/entities/user.entity';
import { JwtPayload } from './jwt-payload.type';

export type RequestUser = User | JwtPayload;
