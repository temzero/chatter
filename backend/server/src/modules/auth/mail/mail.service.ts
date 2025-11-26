import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { Injectable } from '@nestjs/common';
import { ErrorResponse } from 'src/common/api-response/errors';
import { VerificationCodeService } from '../services/verification-code.service';
import { BadRequestError } from 'src/shared/types/enums/error-message.enum';
import { formatExpiration } from 'src/common/helpers/formatExpiration';
import { EnvConfig } from 'src/common/config/env.config';

// Bilingual email templates
import { WelcomeEmailVI } from './template/welcome/welcome.email.vi';
import { WelcomeEmailEN } from './template/welcome/welcome.email.en';
import { VerificationEmailEN } from './template/email-verification-code/verification-code.email.en';
import { VerificationEmailVI } from './template/email-verification-code/verification-code.email.vi';
import { PasswordResetEmailEN } from './template/password-reset/password-reset.email.en';
import { PasswordResetEmailVI } from './template/password-reset/password-reset.email.vi';

@Injectable()
export class MailService {
  private transporter: Transporter;
  private verificationExpiration: string;

  constructor(
    private readonly verificationCodeService: VerificationCodeService,
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

  async sendWelcomeEmail(
    userEmail: string,
    username: string,
    language?: string,
  ): Promise<void> {
    const content = language === 'vi' ? WelcomeEmailVI : WelcomeEmailEN;

    const html = content.html(username, EnvConfig.clientUrl);
    const subject = content.subject(username);

    await this.sendMail(userEmail, subject, html);
  }

  async sendEmailVerificationCode(
    email: string,
    userId: string,
    language?: string,
  ): Promise<boolean> {
    const { rawCode, verificationCode } =
      await this.verificationCodeService.generateAndSaveCode(userId, email);

    const content =
      language === 'vi' ? VerificationEmailVI : VerificationEmailEN;

    const html = content.html({
      verificationCode: rawCode,
      expirationTime: this.verificationExpiration,
      expiresAt: verificationCode.expiresAt,
    });

    const subject = content.subject();
    await this.sendMail(email, subject, html);
    return true;
  }

  async sendPasswordResetEmail(
    email: string,
    url: string,
    language?: string,
  ): Promise<void> {
    const content =
      language === 'vi' ? PasswordResetEmailVI : PasswordResetEmailEN;

    const html = content.html({
      resetUrl: url,
      expirationTime: this.verificationExpiration,
    });

    const subject = content.subject();
    await this.sendMail(email, subject, html);
  }
}
