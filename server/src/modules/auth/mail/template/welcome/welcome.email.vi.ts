import { EmailStyles } from '../../constants/email-style.constant';

export const WelcomeEmailVI = {
  subject: (username: string) => `Chào mừng ${username} đến với Chatter!`,
  html: (username: string, appUrl: string) => `
    <!DOCTYPE html>
    <html>
      <head>
        <style>${EmailStyles.COMMON}</style>
      </head>
      <body>
        <div class="header">
          <h1>Chào mừng đến với Chatter! 🎉</h1>
        </div>
        <div class="content">
          <p>Xin chào <strong>${username}</strong>,</p>
          <p>Chúng tôi rất vui mừng khi bạn tham gia cộng đồng! Chatter được thiết kế để giúp việc trò chuyện trở nên dễ dàng và thú vị.</p>
          <div class="features">
            <h3>Đây là những gì bạn có thể làm với Chatter:</h3>
            <div>💬 <strong>Nhắn tin thời gian thực</strong> - Trò chuyện ngay lập tức với bạn bè và đồng nghiệp</div>
            <div>👥 <strong>Nhóm trò chuyện</strong> - Tạo nhóm để thảo luận cùng nhóm</div>
            <div>🔒 <strong>Bảo mật thông tin</strong> - Cuộc trò chuyện của bạn được bảo vệ riêng tư</div>
            <div>📱 <strong>Đồng bộ đa thiết bị</strong> - Truy cập trò chuyện của bạn từ mọi nơi</div>
          </div>
          <p>Sẵn sàng để bắt đầu trò chuyện?</p>
          <a href="${appUrl}" class="cta-button">Mở ứng dụng Chatter</a>
          <p>Nếu bạn có bất kỳ câu hỏi nào hoặc cần hỗ trợ, đừng ngần ngại liên hệ với đội ngũ hỗ trợ của chúng tôi.</p>
          <div class="footer">
            <p>Chúc bạn trò chuyện vui vẻ!<br>Đội ngũ Chatter</p>
            <p>
              <a href="${appUrl}/privacy">Chính sách bảo mật</a> | 
              <a href="${appUrl}/help">Trung tâm trợ giúp</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `,
};
