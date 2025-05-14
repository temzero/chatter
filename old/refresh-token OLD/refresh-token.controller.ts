import {
  Controller,
  Post,
  Req,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { RefreshTokenService } from './refresh-token.service';
import { Request, Response } from 'express';

@Controller('refresh-token')
export class RefreshTokenController {
  constructor(private readonly refreshTokenService: RefreshTokenService) {}

  @Post('refresh')
  async refreshAccessToken(@Req() req: Request, @Res() res: Response) {
    const cookies = req.cookies as Record<string, string> | undefined;
    // Check for refresh token in cookies or headers
    const tokenFromCookie = cookies?.refresh_token;
    const tokenFromHeader: string = req.headers['x-refresh-token'] as string;
    const refreshToken = tokenFromCookie || tokenFromHeader;

    const deviceId = req.headers['x-device-id'];

    if (!refreshToken || !deviceId) {
      throw new BadRequestException('Missing refresh token or device ID');
    }

    // Validate and rotate the refresh token
    const { accessToken, newRefreshToken } =
      await this.refreshTokenService.validateAndRefreshToken(
        refreshToken,
        deviceId as string,
      );

    // Optional: set HTTP-only cookie for web clients
    if (tokenFromCookie) {
      res.cookie('refresh_token', newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });
    }

    return res.json({
      access_token: accessToken,
      refresh_token: newRefreshToken,
    });
  }
}
