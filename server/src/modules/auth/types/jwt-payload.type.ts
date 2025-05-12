// src/auth/interfaces/jwt-payload.interface.ts
export type JwtPayload = {
  sub: string;
  username: string;
  email: string;
  iat?: number;
  exp?: number;
};
