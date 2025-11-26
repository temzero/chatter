import { EmailStyles } from '../../constants/email-style.constant';

export const WelcomeEmailEN = {
  subject: (username: string) => `Welcome to Chatter, ${username}!`,
  html: (username: string, appUrl: string) => `
    <!DOCTYPE html>
    <html>
      <head>
        <style>${EmailStyles.COMMON}</style>
      </head>
      <body>
        <div class="header">
          <h1>Welcome to Chatter! 🎉</h1>
        </div>
        <div class="content">
          <p>Hello <strong>${username}</strong>,</p>
          <p>We're thrilled to have you join our community! Chatter is designed to make conversations seamless and enjoyable.</p>
          <div class="features">
            <h3>Here's what you can do with Chatter:</h3>
            <div>💬 <strong>Real-time messaging</strong> - Chat instantly with friends and colleagues</div>
            <div>👥 <strong>Group conversations</strong> - Create groups for team discussions</div>
            <div>🔒 <strong>Secure communication</strong> - Your conversations are private and protected</div>
            <div>📱 <strong>Multi-device sync</strong> - Access your chats from anywhere</div>
          </div>
          <p>Ready to start chatting?</p>
          <a href="${appUrl}" class="cta-button">Open Chatter App</a>
          <p>If you have any questions or need help getting started, don't hesitate to reach out to our support team.</p>
          <div class="footer">
            <p>Happy chatting!<br>The Chatter Team</p>
            <p>
              <a href="${appUrl}/privacy">Privacy Policy</a> | 
              <a href="${appUrl}/help">Help Center</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `,
};
