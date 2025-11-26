import { EmailStyles } from '../../constants/email-style.constant';

export interface PasswordResetEmailParams {
  resetUrl: string;
  expirationTime: string;
}

export const PasswordResetEmailEN = {
  subject: () => 'Password Reset Request',
  html: (params: PasswordResetEmailParams) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>${EmailStyles.COMMON}</style>
    </head>
    <body>
      <div class="header">
        <h1>Password Reset Request</h1>
      </div>
      <div class="content">
        <p>You requested to reset your password. Click the button below:</p>
        <a href="${params.resetUrl}" class="reset-button">Reset Password</a>
        <div class="security-notice">
          This link will expire in ${params.expirationTime}. If you didn't request this reset, please ignore this email.
        </div>
      </div>
    </body>
    </html>
  `,
};
