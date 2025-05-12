import { Controller, Post, Req, Res } from '@nestjs/common';
import { RefreshTokenService } from './refresh-token.service';
import { Request, Response } from 'express';

@Controller('refresh-token')
export class RefreshTokenController {
  constructor(private readonly refreshTokenService: RefreshTokenService) {}

  @Post('create')
  async createRefreshToken(@Req() req: Request, @Res() res: Response) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { userId, token } = req.body;
    if (!userId || !token) {
      return res
        .status(400)
        .json({ message: 'User ID and token are required' });
    }
    const deviceId = req.headers['x-device-id'] as string;
    const deviceName = req.headers['x-device-name'] as string | undefined;

    const newToken = await this.refreshTokenService.createRefreshToken(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      userId,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      token,
      deviceId,
      deviceName,
    );

    return res.json({ refreshToken: newToken });
  }
}
