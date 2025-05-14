// src/auth/types/jwt-payload.interface.ts
export type JwtPayload = {
  sub: string; // User ID
  email: string;
  iat?: number; // Issued at
  exp?: number; // Expiration time
};

export type JwtRefreshPayload = JwtPayload & {
  deviceId: string;
  deviceName: string;
};
