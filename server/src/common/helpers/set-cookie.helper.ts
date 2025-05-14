import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

export const setRefreshTokenCookie = (
  response: Response,
  refreshToken: string,
  configService: ConfigService,
  options?: Partial<ReturnType<typeof defaultOptions>>,
) => {
  response.cookie('refresh_token', refreshToken, {
    ...defaultOptions(configService),
    ...options, // allows overriding options if needed
  });
};

const defaultOptions = (configService: ConfigService) => ({
  httpOnly: true,
  secure: true,
  sameSite: 'strict' as const,
  maxAge:
    configService.get<number>('REFRESH_TOKEN_EXPIRATION_MS') ??
    7 * 24 * 60 * 60 * 1000,
});
