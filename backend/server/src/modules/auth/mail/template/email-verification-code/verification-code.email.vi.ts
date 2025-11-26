import { EmailStyles } from '../../constants/email-style.constant';

export interface VerificationEmailParams {
  verificationCode: string;
  expirationTime: string;
  expiresAt: Date;
}

export const VerificationEmailVI = {
  subject: () => 'Mã xác thực của bạn',
  html: (params: VerificationEmailParams) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>${EmailStyles.COMMON}</style>
    </head>
    <body>
      <div class="header">
        <h1>Mã xác thực Email</h1>
      </div>
      <div class="content">
        <p>Mã xác thực của bạn là:</p>
        <div class="verification-code">${params.verificationCode}</div>
        <div class="expiration-notice">
          Mã này sẽ hết hạn sau ${params.expirationTime} (${params.expiresAt.toISOString()}).
        </div>
      </div>
    </body>
    </html>
  `,
};
