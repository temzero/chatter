import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { ErrorResponse } from 'src/common/api-response/errors';
import { TokenService } from '../services/token.service';
import { VerificationPurpose } from './constants/verificationPurpose';
import { VerificationCodeService } from '../services/verification-code.service';

@Injectable()
export class MailService {
  private transporter: Transporter;

  constructor(
    private readonly configService: ConfigService,
    private readonly verificationCodeService: VerificationCodeService,
    private readonly tokenService: TokenService,
  ) {
    this.transporter = nodemailer.createTransport({
      service: this.configService.get<string>('EMAIL_SERVICE'),
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASS'),
      },
    });
  }

  async sendMail(to: string, subject: string, html: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        to,
        subject,
        html,
        from: this.configService.get<string>('EMAIL_USER'),
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        ErrorResponse.throw(error, 'Failed to send email');
      } else {
        ErrorResponse.badRequest('Failed to send email');
      }
    }
  }

  async sendEmailVerificationCode(
    userId: string,
    email: string,
  ): Promise<boolean> {
    const { rawCode, verificationCode } =
      await this.verificationCodeService.generateAndSaveCode(userId, email);

    const html = `
    <h1>Email Verification Code</h1>
    <p>Your verification code is:</p>
    <h2>${rawCode}</h2>
    <p>This code will expire in 10 minutes (${verificationCode.expiresAt.toISOString()}).</p>
  `;

    await this.sendMail(email, 'Your Verification Code', html);
    return true;
  }

  async sendPasswordResetEmail(email: string, url: string): Promise<void> {
    const html = `
      <h1>Password Reset Request</h1>
      <p>You requested to reset your password. Click the link below:</p>
      <a href="${url}">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
    `;
    await this.sendMail(email, 'Password Reset Request', html);
  }

  async sendEmailVerificationLink(
    userId: string,
    email: string,
  ): Promise<void> {
    const token = await this.tokenService.generateEmailToken(
      userId,
      email,
      VerificationPurpose.EMAIL_VERIFICATION,
    );
    const verificationUrl = `${this.configService.get('CLIENT_URL')}/verify-email?token=${token}`;

    const html = `
    <h1>Email Verification</h1>
    <p>Click the link below to verify your email:</p>
    <a href="${verificationUrl}">Verify Email</a>
    <p>This link will expire in 10 minutes.</p>
  `;

    await this.sendMail(email, 'Verify Your Email', html);
  }
}
