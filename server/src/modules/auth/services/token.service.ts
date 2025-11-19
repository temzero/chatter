// src/auth/services/token.service.ts
import * as jwt from 'jsonwebtoken';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenType } from '../types/token-type.enum';
import { JwtPayload, JwtRefreshPayload } from '../types/jwt-payload.type';
import { Request } from 'express';
import { ErrorResponse } from 'src/common/api-response/errors';
import { VerificationPurpose } from '../mail/constants/verificationPurpose.enum';
import {
  BadRequestError,
  UnauthorizedError,
} from 'src/shared/types/enums/error-message.enum';
import { EnvConfig } from 'src/common/config/env.config';

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  /**
   * Generates a JWT token (access or refresh)
   */
  async generateToken(
    type: TokenType,
    payload: JwtPayload | JwtRefreshPayload,
  ): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { iat, exp, ...cleanPayload } = payload;

    const options = {
      [TokenType.ACCESS]: {
        secret: EnvConfig.jwt.access.secret,
        expiresIn: EnvConfig.jwt.access.expiration,
      },
      [TokenType.REFRESH]: {
        secret: EnvConfig.jwt.refresh.secret,
        expiresIn: EnvConfig.jwt.refresh.expiration,
      },
    }[type];

    return this.jwtService.signAsync(cleanPayload, options);
  }

  /**
   * Verifies a JWT token
   */
  async verifyToken<T extends JwtPayload | JwtRefreshPayload>(
    type: TokenType,
    token: string,
  ): Promise<T> {
    const secret = {
      [TokenType.ACCESS]: EnvConfig.jwt.access.secret,
      [TokenType.REFRESH]: EnvConfig.jwt.refresh.secret,
    }[type];

    try {
      return await this.jwtService.verifyAsync<T>(token, { secret });
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.name === 'TokenExpiredError') {
          if (type === TokenType.ACCESS) {
            ErrorResponse.unauthorized(UnauthorizedError.TOKEN_EXPIRED);
          } else {
            ErrorResponse.unauthorized(UnauthorizedError.REFRESH_TOKEN_EXPIRED);
          }
        } else if (err.name === 'JsonWebTokenError') {
          if (type === TokenType.ACCESS) {
            ErrorResponse.unauthorized(UnauthorizedError.INVALID_TOKEN);
          } else {
            ErrorResponse.unauthorized(UnauthorizedError.INVALID_REFRESH_TOKEN);
          }
        }
      }
      ErrorResponse.unauthorized();
    }
  }

  /**
   * Decodes a JWT token WITHOUT verifying its signature.
   * Useful for extracting data from expired tokens.
   */
  decodeToken<T = any>(token: string): T | null {
    try {
      return jwt.decode(token) as T;
    } catch (error) {
      console.error('Failed to decode token', error);
      return null;
    }
  }

  /**
   * Generates both access and refresh tokens
   */
  async generateTokenPair(payload: {
    userId: string;
    email: string;
    deviceId: string;
    deviceName: string;
  }): Promise<{
    newAccessToken: string;
    newRefreshToken: string;
  }> {
    // Validate required fields
    if (
      !payload.userId ||
      !payload.email ||
      !payload.deviceId ||
      !payload.deviceName
    ) {
      ErrorResponse.badRequest(BadRequestError.MISSING_FIELDS_FOR_TOKEN);
    }

    const accessPayload: JwtPayload = {
      sub: payload.userId,
      email: payload.email,
    };

    const refreshPayload: JwtRefreshPayload = {
      sub: payload.userId,
      email: payload.email,
      deviceId: payload.deviceId,
      deviceName: payload.deviceName,
    };

    try {
      return {
        newAccessToken: await this.generateToken(
          TokenType.ACCESS,
          accessPayload,
        ),
        newRefreshToken: await this.generateToken(
          TokenType.REFRESH,
          refreshPayload,
        ),
      };
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to generate tokens');
    }
  }

  /**
   * Extracts refresh token from request (header or cookie)
   */
  getRefreshTokenFromRequest(request: Request): string {
    const cookies = request.cookies as Record<string, string> | undefined;
    const tokenFromCookie = cookies?.refreshToken;

    const authHeader = request.get('Authorization');
    let tokenFromHeader: string | undefined;

    if (authHeader) {
      const [type, value] = authHeader.split(' ');
      if (type === 'Refresh') {
        tokenFromHeader = value;
      }
    }

    const refreshToken = tokenFromHeader || tokenFromCookie;

    if (!refreshToken) {
      ErrorResponse.badRequest(BadRequestError.REFRESH_TOKEN_MISSING);
    }

    return refreshToken;
  }

  async generateEmailToken(
    userId: string,
    email: string,
    purpose: VerificationPurpose,
  ): Promise<string> {
    return this.jwtService.signAsync(
      {
        sub: userId,
        email,
        purpose,
      },
      {
        secret: EnvConfig.jwt.verification.secret,
        expiresIn: EnvConfig.jwt.verification.expiration,
      },
    );
  }

  /**
   * Verifies an email verification token
   */
  async verifyEmailToken(token: string): Promise<{
    userId: string;
    email: string;
    purpose: VerificationPurpose;
  }> {
    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: string;
        email: string;
        purpose: VerificationPurpose;
      }>(token, {
        secret: EnvConfig.jwt.verification.secret,
      });

      return {
        userId: payload.sub,
        email: payload.email,
        purpose: payload.purpose,
      };
    } catch (error) {
      ErrorResponse.throw(error, 'Invalid or expired verification token');
    }
  }
}
