import { Feedback } from '@/modules/feedback/entities/feedback.entity';
import { FeedbackCategoryEmoji } from '@/shared/types/enums/feedback.enum';

export interface FeedbackEmailParams {
  feedback: Feedback;
}

export const FeedbackEmailEN = {
  subject: (feedback: Feedback) =>
    `User ${feedback.category} feedback ${feedback.rating ? `(${feedback.rating}/5)` : ''}`,

  html: ({ feedback }: FeedbackEmailParams) => `
<!DOCTYPE html>
<html>
<head>
  <style>

    body {
      font-family: Arial, sans-serif;
      background: #f5f5f5;
    }

    h1 {
      margin: 0;
      padding: 0;
    }

    .content {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      padding: 20px;
      border-radius: 10px;
    }

    .feedback-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: white;
      background: linear-gradient(135deg, #00ae80 0%, #008c66 100%);
      border-radius: 10px 10px 0 0;
    }
    
    .feedback-title-container {
     padding: 20px;
    }
    
    .feedback-icon{
        font-size: 80px;
        opacity: 75%;
        user-select: none;
        margin: 0 20px;
        margin-left: auto;
    }
    
    .star {
      color: #facc15;
      font-size: 40px;
      margin: 0;
      padding: 0;
    }
    
    .meta {
      background: #f9f9f9;
      padding: 0 16px;
      border-radius: 8px;
      margin: 16px 0;
      font-size: 14px;
      border: 2px solid rgb(134, 239, 172);
    }
    
    .label {
      font-weight: bold;
      color: #00ae80;
    }
    
    .message {
      padding: 8px;
      border-radius: 8px;
      font-size: 20px;
    }
    
    .cta-button {
      display: inline-block;
      background: #00ae80;
      color: white;
      padding: 8px 16px;
      text-decoration: none;
      border-radius: 5px;
      margin-top: 10px;
    }
    
    .footer-info {
        font-size: 16px;
      font-style: italic;
      font-weight: 300; /* lighter font weight */
      color: rgba(0, 0, 0, 0.6); /* opacity on text color only */
    }
  </style>
</head>

<body>
  <div class="content">
    <div class="feedback-header">
      <div class="feedback-title-container">
        <h1>📝 User Feedback</h1>
        ${
          feedback.rating
            ? `<p class="star">
                ${'★'.repeat(feedback.rating)}${'☆'.repeat(5 - feedback.rating)}
              </p>`
            : ''
        }
      </div>

      <h1 class="feedback-icon">
        ${FeedbackCategoryEmoji[feedback.category] || '❓'}
      </h1>
    </div>

    <div class="message">
      <p>${feedback.message || 'No message provided.'}</p>
    </div>

    ${
      feedback.imageUrl
        ? `
      <div class="message">
        <p class="label">Screenshot</p>
        <a class="cta-button" href="${feedback.imageUrl}" target="_blank">
          View Attachment
        </a>
      </div>
    `
        : ''
    }

    <div class="meta">
      <p><span class="label">ID:</span> ${feedback.id}</p>
      <p><span class="label">Category:</span> ${feedback.category}</p>
      <p><span class="label">Status:</span> ${feedback.status}</p>
      ${
        feedback.priority
          ? `<p><span class="label">Priority:</span> ${feedback.priority}</p>`
          : ''
      }
      ${
        feedback.platform
          ? `<p><span class="label">Platform:</span> ${feedback.platform}</p>`
          : ''
      }
      ${
        feedback.appVersion
          ? `<p><span class="label">App Version:</span> ${feedback.appVersion}</p>`
          : ''
      }
      <p><span class="label">Submitted At:</span> ${feedback.createdAt.toISOString()}</p>

      ${
        feedback.tags?.length
          ? `<div>${feedback.tags
              .map((tag) => `<span class="tag">${tag}</span>`)
              .join('')}</div>`
          : ''
      }
    </div>

    <div class="footer-info">
      This email was generated automatically.
    </div>
  </div>
</body>
</html>
  `,
};
