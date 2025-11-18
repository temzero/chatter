// import { Response } from 'express';
// import { ConfigService } from '@nestjs/config';
// import {
//   formatExpirationToMs,
//   isValidExpirationFormat,
// } from 'src/common/helpers/formatExpiration';

// export const setRefreshTokenCookie = (
//   response: Response,
//   refreshToken: string,
//   configService: ConfigService,
//   options?: Partial<ReturnType<typeof defaultOptions>>,
// ) => {
//   response.cookie('refreshToken', refreshToken, {
//     ...defaultOptions(configService),
//     ...options, // allows overriding options if needed
//   });
// };

// const defaultOptions = (configService: ConfigService) => ({
//   httpOnly: true,
//   secure: true,
//   sameSite: 'strict' as const,
//   maxAge:
//     configService.get<number>('refreshToken_EXPIRATION_MS') ??
//     7 * 24 * 60 * 60 * 1000,
// });

import { Response } from 'express';
import { formatExpirationToMs } from 'src/common/helpers/formatExpiration';
import { EnvConfig } from '../config/env.config';

export interface CookieOptions {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  maxAge?: number;
  domain?: string;
  path?: string;
}

export const setRefreshTokenCookie = (
  response: Response,
  refreshToken: string,
  options?: Partial<CookieOptions>,
): void => {
  try {
    const cookieOptions = getRefreshTokenCookieOptions(options);
    response.cookie('refreshToken', refreshToken, cookieOptions);
  } catch (error) {
    console.error('Failed to set refresh token cookie:', error);
    throw new Error('Cookie configuration error');
  }
};

export const clearRefreshTokenCookie = (
  response: Response,
  options?: Partial<CookieOptions>,
): void => {
  try {
    const cookieOptions = getRefreshTokenCookieOptions(options);
    response.clearCookie('refreshToken', {
      ...cookieOptions,
      maxAge: 0, // Immediately expire
    });
  } catch (error) {
    console.error('Failed to clear refresh token cookie:', error);
    throw new Error('Cookie clearance error');
  }
};

export const getRefreshTokenCookieOptions = (
  options?: Partial<CookieOptions>,
): CookieOptions => {
  // Get expiration from environment with fallback
  const expirationConfig = EnvConfig.jwt.refresh.expiration;
  const maxAge = formatExpirationToMs(expirationConfig);

  // Determine secure flag based on environment
  const isProduction = EnvConfig.isProd();
  const secure = options?.secure ?? isProduction;

  const defaultOptions: CookieOptions = {
    httpOnly: true,
    secure: secure,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: maxAge,
    path: '/',
  };

  return {
    ...defaultOptions,
    ...options, // Allow overriding any options
  };
};

// Utility function to get expiration info for debugging
export const getRefreshTokenExpirationInfo = (): {
  original: string;
  ms: number;
  humanReadable: string;
} => {
  const expirationConfig = EnvConfig.jwt.refresh.expiration;
  const ms = formatExpirationToMs(expirationConfig);

  return {
    original: expirationConfig,
    ms,
    humanReadable: `${Math.round(ms / (1000 * 60 * 60 * 24))} days`,
  };
};
