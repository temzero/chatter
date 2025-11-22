import { EmailStyles } from '../../constants/email-style.constant';

export interface VerificationEmailParams {
  verificationCode: string;
  expirationTime: string;
  expiresAt: Date;
}

export const VerificationEmailEN = {
  subject: () => 'Your Verification Code',
  html: (params: VerificationEmailParams) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>${EmailStyles.COMMON}</style>
    </head>
    <body>
      <div class="header">
        <h1>Email Verification Code</h1>
      </div>
      <div class="content">
        <p>Your verification code is:</p>
        <div class="verification-code">${params.verificationCode}</div>
        <div class="expiration-notice">
          This code will expire in ${params.expirationTime} (${params.expiresAt.toISOString()}).
        </div>
      </div>
    </body>
    </html>
  `,
};
