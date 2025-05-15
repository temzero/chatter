// src/auth/services/token.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TokenType } from '../types/token-type.enum';
import { JwtPayload, JwtRefreshPayload } from '../types/jwt-payload.type';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
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
        throw new UnauthorizedException('Token expired');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      } else if (err.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token');
      } else {
        throw new UnauthorizedException('Token verification failed');
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
    access_token: string;
    refresh_token: string;
  }> {
    // Validate required fields
    if (
      !payload.userId ||
      !payload.email ||
      !payload.deviceId ||
      !payload.deviceName
    ) {
      throw new Error('Missing required fields for token generation');
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
        access_token: await this.generateToken(TokenType.ACCESS, accessPayload),
        refresh_token: await this.generateToken(
          TokenType.REFRESH,
          refreshPayload,
        ),
      };
    } catch (error) {
      console.error('Token generation failed', error);
      throw new Error('Failed to generate tokens');
    }
  }

  /**
   * Extracts refresh token from request (header or cookie)
   */
  getRefreshTokenFromRequest(request: Request): string {
    const cookies = request.cookies as Record<string, string> | undefined;
    const tokenFromCookie = cookies?.refresh_token;

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
      throw new UnauthorizedException('Refresh token is missing');
    }

    return refreshToken;
  }
}
