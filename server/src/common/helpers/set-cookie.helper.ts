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
    // Clear old cookie first
    clearRefreshTokenCookie(response);
    // Set new cookie
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
    const cookieOptions = getRefreshTokenCookieOptions(options, true);
    response.clearCookie('refreshToken', cookieOptions);
  } catch (error) {
    console.error('Failed to clear refresh token cookie:', error);
    throw new Error('Cookie clearance error');
  }
};

export const getRefreshTokenCookieOptions = (
  options?: Partial<CookieOptions>,
  clear = false, // new flag to indicate cookie clearing
): CookieOptions => {
  const maxAge = clear
    ? 0
    : formatExpirationToMs(EnvConfig.jwt.refresh.expiration);

  const isProduction = EnvConfig.isProd();
  const secure = options?.secure ?? isProduction;
  const sameSite = isProduction ? 'strict' : 'lax';

  const defaultOptions: CookieOptions = {
    httpOnly: true,
    secure,
    sameSite,
    maxAge,
    path: '/',
  };

  return {
    ...defaultOptions,
    ...options,
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
