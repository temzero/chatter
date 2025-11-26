import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VerificationCode } from '../entities/verification_code.entity';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';

@Injectable()
export class VerificationCodeService {
  constructor(
    @InjectRepository(VerificationCode)
    private readonly verificationCodeRepository: Repository<VerificationCode>,
  ) {}

  async generateAndSaveCode(
    userId: string,
    email: string,
  ): Promise<{ rawCode: string; verificationCode: VerificationCode }> {
    const rawCode = randomInt(100000, 999999).toString();
    const hashedCode = await bcrypt.hash(rawCode, 10);

    await this.verificationCodeRepository.delete({ userId, email });

    const verificationCode = this.verificationCodeRepository.create({
      userId,
      email,
      hashedCode,
    });

    const savedCode =
      await this.verificationCodeRepository.save(verificationCode);

    return { rawCode, verificationCode: savedCode };
  }

  async verifyCode(
    userId: string,
    email: string,
    code: string,
  ): Promise<boolean> {
    // Find the most recent valid code
    const verificationCode = await this.verificationCodeRepository.findOne({
      where: { userId, email },
      order: { createdAt: 'DESC' },
    });

    if (!verificationCode) {
      return false;
    }

    // Check if code is expired
    if (new Date() > verificationCode.expiresAt) {
      await this.verificationCodeRepository.delete(verificationCode.id);
      return false;
    }

    // Compare the provided code with the hashed version
    const isValid = await bcrypt.compare(code, verificationCode.hashedCode);

    // Only delete if the code is valid
    if (isValid) {
      await this.verificationCodeRepository.delete(verificationCode.id);
    }

    return isValid;
  }

  async deleteExpiredCodes(): Promise<void> {
    await this.verificationCodeRepository
      .createQueryBuilder()
      .delete()
      .where('expiresAt < :now', { now: new Date() })
      .execute();
  }
}
