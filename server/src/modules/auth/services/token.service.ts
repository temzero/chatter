// src/auth/services/token.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TokenType } from '../types/token-type.enum';
import { JwtPayload, JwtRefreshPayload } from '../types/jwt-payload.type';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { ErrorResponse } from 'src/common/api-response/errors';
import { VerificationPurpose } from '../mail/constants/verificationPurpose';
import { VerificationCodeService } from './verification-code.service';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly verificationCodeService: VerificationCodeService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Generates a JWT token (access or refresh)
   */
  async generateToken(
    type: TokenType,
    payload: JwtPayload | JwtRefreshPayload,
  ): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { exp, iat, ...cleanPayload } = payload;
    const options = {
      [TokenType.ACCESS]: {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRATION'),
      },
      [TokenType.REFRESH]: {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION'),
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
      [TokenType.ACCESS]: this.configService.get<string>('JWT_ACCESS_SECRET'),
      [TokenType.REFRESH]: this.configService.get<string>('JWT_REFRESH_SECRET'),
    }[type];

    try {
      return await this.jwtService.verifyAsync<T>(token, { secret });
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (err.name === 'TokenExpiredError') {
        ErrorResponse.unauthorized('Token expired');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      } else if (err.name === 'JsonWebTokenError') {
        ErrorResponse.unauthorized('Invalid token');
      } else {
        ErrorResponse.unauthorized('Token verification failed');
      }
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
      ErrorResponse.badRequest('Missing required fields for token generation');
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
      ErrorResponse.badRequest('Refresh token is missing');
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
        secret: this.configService.get<string>('JWT_VERIFICATION_SECRET'),
        expiresIn: this.configService.get<string>(
          'JWT_VERIFICATION_EXPIRATION',
          '15m',
        ),
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
        secret: this.configService.get<string>('JWT_VERIFICATION_SECRET'),
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
