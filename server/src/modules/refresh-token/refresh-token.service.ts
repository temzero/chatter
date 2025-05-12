import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import * as bcrypt from 'bcrypt';

// refresh-token.service.ts
@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async createRefreshToken(
    userId: string,
    token: string,
    deviceId: string,
    deviceName?: string,
  ): Promise<RefreshToken> {
    // Remove any existing token for THIS DEVICE only
    await this.revokeDeviceTokens(userId, deviceId);

    const hashedToken = await bcrypt.hash(token, 10);

    const refreshToken = this.refreshTokenRepository.create({
      userId,
      token: hashedToken,
      deviceId,
      deviceName,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    return this.refreshTokenRepository.save(refreshToken);
  }

  async validateRefreshToken(
    storedToken: RefreshToken,
    incomingToken: string,
  ): Promise<boolean> {
    return bcrypt.compare(incomingToken, storedToken.token);
  }

  async revokeDeviceTokens(userId: string, deviceId: string): Promise<void> {
    await this.refreshTokenRepository.delete({ userId, deviceId });
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.refreshTokenRepository.delete({ userId });
  }

  async findByToken(
    incomingToken: string,
    userId?: string, // Optional: Improves performance by reducing candidates
  ): Promise<RefreshToken | null> {
    // 1. Fetch potential tokens (filter by userId if available)
    const query: FindManyOptions<RefreshToken> = {
      relations: ['user'],
    };

    if (userId) {
      query.where = { userId }; // Narrow down by user first
    }

    const candidates = await this.refreshTokenRepository.find(query);

    // 2. Compare each candidate hash with the incoming token
    for (const storedToken of candidates) {
      const isMatch = await bcrypt.compare(incomingToken, storedToken.token);
      if (isMatch) {
        return storedToken; // Found the valid token!
      }
    }

    return null; // No match found
  }

  async getUserActiveSessions(userId: string): Promise<RefreshToken[]> {
    return this.refreshTokenRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }
}
