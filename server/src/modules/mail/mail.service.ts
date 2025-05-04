import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: Transporter;

  constructor(private readonly configService: ConfigService) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    this.transporter = nodemailer.createTransport({
      service: this.configService.get<string>('EMAIL_SERVICE'),
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASS'),
      },
    });
  }

  async sendMail(to: string, subject: string, html: string): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await this.transporter.sendMail({
      to,
      subject,
      html,
      from: this.configService.get<string>('EMAIL_USER'), // ensure proper 'from'
    });
  }

  async sendVerificationEmail(email: string, url: string): Promise<void> {
    const html = `
      <h1>Email Verification</h1>
      <p>Click the link below to verify your email:</p>
      <a href="${url}">Verify Email</a>
    `;
    await this.sendMail(email, 'Chatter - Verify Your Email', html);
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
}
