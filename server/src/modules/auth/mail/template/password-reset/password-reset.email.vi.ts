import { EmailStyles } from '../../constants/email-style.constant';

export interface PasswordResetEmailParams {
  resetUrl: string;
  expirationTime: string;
}

export const PasswordResetEmailVI = {
  subject: () => 'Yêu cầu đặt lại mật khẩu',
  html: (params: PasswordResetEmailParams) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>${EmailStyles.COMMON}</style>
    </head>
    <body>
      <div class="header">
        <h1>Yêu cầu đặt lại mật khẩu</h1>
      </div>
      <div class="content">
        <p>Bạn đã yêu cầu đặt lại mật khẩu. Nhấn nút bên dưới:</p>
        <a href="${params.resetUrl}" class="reset-button">Đặt lại mật khẩu</a>
        <div class="security-notice">
          Liên kết này sẽ hết hạn trong ${params.expirationTime}. Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
        </div>
      </div>
    </body>
    </html>
  `,
};
