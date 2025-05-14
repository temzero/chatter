// auth/services/token-storage.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from '../entities/refresh-token.entity';

@Injectable()
export class TokenStorageService {
  constructor(
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  createRefreshToken(
    token: string,
    userId: string,
    deviceId: string,
    deviceName?: string,
  ) {
    const expiresAt = new Date(
      Date.now() +
        parseInt(process.env.REFRESH_TOKEN_EXPIRATION_MS || '604800000', 10), // 7 days in milliseconds
    );
    const tokenData = this.refreshTokenRepository.create({
      token,
      userId,
      deviceId: deviceId,
      deviceName: deviceName,
      expiresAt,
    });
    return this.refreshTokenRepository.save(tokenData);
  }

  async findToken(token: string) {
    return this.refreshTokenRepository.findOneBy({ token });
  }
  async findTokenByUserId(userId: string) {
    return this.refreshTokenRepository.findOneBy({ userId });
  }
  async findTokenByUserIdAndDeviceId(userId: string, deviceId: string) {
    return this.refreshTokenRepository.findOneBy({ userId, deviceId });
  }
  async findTokenByUserIdAndDeviceIdAndToken(
    userId: string,
    deviceId: string,
    token: string,
  ) {
    return this.refreshTokenRepository.findOneBy({ userId, deviceId, token });
  }

  async deleteToken(token: string) {
    return await this.refreshTokenRepository.delete(token);
  }

  async deleteDeviceTokens(userId: string, deviceId: string): Promise<void> {
    await this.refreshTokenRepository.delete({ userId, deviceId });
  }

  async deleteAllUserTokens(userId: string): Promise<void> {
    await this.refreshTokenRepository.delete({ userId });
  }

  async purgeExpiredTokens(): Promise<void> {
    await this.refreshTokenRepository
      .createQueryBuilder()
      .delete()
      .where('expiresAt < :now', { now: new Date() })
      .execute();
  }
}
