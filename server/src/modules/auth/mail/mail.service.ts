import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { Injectable } from '@nestjs/common';
import { ErrorResponse } from 'src/common/api-response/errors';
import { TokenService } from '../services/token.service';
import { VerificationPurpose } from './constants/verificationPurpose.enum';
import { VerificationCodeService } from '../services/verification-code.service';
import { BadRequestError } from 'src/shared/types/enums/error-message.enum';
import { formatExpiration } from 'src/common/helpers/formatExpiration';
import { EnvConfig } from 'src/common/config/env.config';

@Injectable()
export class MailService {
  private transporter: Transporter;
  private verificationExpiration: string;

  constructor(
    private readonly verificationCodeService: VerificationCodeService,
    private readonly tokenService: TokenService,
  ) {
    this.verificationExpiration = formatExpiration(
      EnvConfig.jwt.verification.expiration,
    );

    const emailConfig = EnvConfig.email;
    this.transporter = nodemailer.createTransport({
      service: emailConfig.service,
      auth: {
        user: emailConfig.user,
        pass: emailConfig.password,
      },
    });
  }

  async sendMail(to: string, subject: string, html: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        to,
        subject,
        html,
        from: EnvConfig.email.user,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        ErrorResponse.throw(error, 'Failed to send email');
      } else {
        ErrorResponse.badRequest(BadRequestError.FAILED_TO_SEND_EMAIL);
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
    <p>This code will expire in ${this.verificationExpiration} (${verificationCode.expiresAt.toISOString()}).</p>
  `;

    await this.sendMail(email, 'Your Verification Code', html);
    return true;
  }

  async sendPasswordResetEmail(email: string, url: string): Promise<void> {
    const html = `
      <h1>Password Reset Request</h1>
      <p>You requested to reset your password. Click the link below:</p>
      <a href="${url}">Reset Password</a>
      <p>This link will expire in ${this.verificationExpiration}.</p>
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
    const verificationUrl = `${EnvConfig.clientUrl}/verify-email?token=${token}`;

    const html = `
    <h1>Email Verification</h1>
    <p>Click the link below to verify your email:</p>
    <a href="${verificationUrl}">Verify Email</a>
    <p>This link will expire in ${this.verificationExpiration}.</p>
  `;

    await this.sendMail(email, 'Verify Your Email', html);
  }
}
