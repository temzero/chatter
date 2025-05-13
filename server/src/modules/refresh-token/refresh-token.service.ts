import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../auth/types/jwt-payload.type';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateAndRefreshToken(
    incomingToken: string,
    deviceId: string,
  ): Promise<{
    accessToken: string;
    newRefreshToken: string;
  }> {
    let decoded: JwtPayload;
    try {
      decoded = this.jwtService.verify<JwtPayload>(incomingToken, {
        secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
      });
    } catch (err) {
      console.error('JWT verification error:', err);
      throw new UnauthorizedException('Refresh token is expired or invalid');
    }

    const storedToken = await this.findByToken(
      incomingToken,
      decoded.sub,
      deviceId,
    );

    if (!storedToken) {
      throw new UnauthorizedException(
        'Refresh token not found or device mismatch',
      );
    }

    if (storedToken.expiresAt < new Date()) {
      await this.refreshTokenRepository.remove(storedToken);
      throw new UnauthorizedException('Refresh token expired (DB)');
    }

    const user = await this.userService.getUserById(storedToken.userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      email: user.email,
    };

    const accessToken = this.generateAccessToken(payload);
    const newRefreshToken = this.generateRefreshToken(user.id);

    await this.storeRefreshToken(
      user.id,
      newRefreshToken,
      deviceId,
      storedToken.deviceName,
    );

    return {
      accessToken,
      newRefreshToken,
    };
  }

  generateAccessToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN', '1h'),
    });
  }

  generateRefreshToken(userId: string): string {
    return this.jwtService.sign(
      { sub: userId },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>(
          'JWT_REFRESH_EXPIRES_IN',
          '7d',
        ),
      },
    );
  }

  async storeRefreshToken(
    userId: string,
    token: string,
    deviceId: string,
    deviceName?: string,
  ): Promise<RefreshToken> {
    await this.deleteOldDeviceTokens(userId, deviceId);

    const expiresIn = this.configService.get<string>(
      'JWT_REFRESH_EXPIRES_IN',
      '10m',
    );
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + parseInt(expiresIn, 10));

    const refreshToken = this.refreshTokenRepository.create({
      userId,
      token,
      deviceId,
      deviceName,
      expiresAt,
    });

    return this.refreshTokenRepository.save(refreshToken);
  }

  async deleteOldDeviceTokens(userId: string, deviceId: string): Promise<void> {
    await this.refreshTokenRepository.delete({ userId, deviceId });
  }

  async deleteAllUserTokens(userId: string): Promise<void> {
    await this.refreshTokenRepository.delete({ userId });
  }

  async findByToken(
    incomingToken: string,
    userId?: string,
    deviceId?: string,
  ): Promise<RefreshToken | null> {
    const storedTokens = await this.refreshTokenRepository.find({
      where: { deviceId, userId },
    });

    return storedTokens.find((t) => t.token === incomingToken) || null;
  }

  async cleanupExpiredTokens(): Promise<void> {
    await this.refreshTokenRepository
      .createQueryBuilder()
      .delete()
      .where('expiresAt < :now', { now: new Date() })
      .execute();
  }

  async getUserActiveSessions(userId: string): Promise<RefreshToken[]> {
    return this.refreshTokenRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }
}
