import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { Injectable } from '@nestjs/common';
import { ErrorResponse } from '@/common/api-response/errors';
import { VerificationCodeService } from '../services/verification-code.service';
import { BadRequestError } from '@shared/types/enums/error-message.enum';
import { EnvConfig } from '@/common/config/env.config';

// Bilingual email templates
import { WelcomeEmailVI } from './template/welcome/welcome.email.vi';
import { WelcomeEmailEN } from './template/welcome/welcome.email.en';
import { VerificationEmailEN } from './template/email-verification-code/verification-code.email.en';
import { VerificationEmailVI } from './template/email-verification-code/verification-code.email.vi';
import { PasswordResetEmailEN } from './template/password-reset/password-reset.email.en';
import { PasswordResetEmailVI } from './template/password-reset/password-reset.email.vi';
import { formatSecondsToString } from '@/common/helpers/time.helper';
import { Feedback } from '@/modules/feedback/entities/feedback.entity';
import { FeedbackEmailEN } from './template/feedback/feedback.email.en';
import { User } from '@/modules/user/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class MailService {
  private transporter: Transporter;
  private verificationExpiration: string;

  constructor(
    @InjectRepository(User) // <-- ADD THIS DECORATOR
    private userRepo: Repository<User>,
    private readonly verificationCodeService: VerificationCodeService,
  ) {
    this.verificationExpiration = formatSecondsToString(
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

  async sendFeedbackEmailToAdmin(feedback: Feedback): Promise<void> {
    // Fetch fresh user data when actually needed
    const user = await this.userRepo.findOne({
      where: { id: feedback.userId },
      select: ['id', 'email', 'firstName', 'username'], // Only what you need
    });

    // Handle case where user might be deleted
    if (!user) {
      console.warn(
        `User ${feedback.userId} not found for feedback ${feedback.id}`,
      );
      return;
    }

    const adminEmail = EnvConfig.email.user;
    const subject = FeedbackEmailEN.subject({ feedback, user });

    // Pass both feedback and fresh user data
    const html = FeedbackEmailEN.html({
      feedback,
      user,
    });

    await this.sendMail(adminEmail, subject, html);
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
