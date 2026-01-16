import { Feedback } from '@/modules/feedback/entities/feedback.entity';
import { EmailStyles } from '@/modules/auth/mail/constants/email-style.constant';
import {
  FeedbackCategory,
  FeedbackCategoryEmoji,
} from '@/shared/types/enums/feedback.enum';

export interface FeedbackEmailParams {
  feedback: Feedback;
  user: {
    email?: string;
    username?: string;
    firstName?: string;
  };
}

export const FeedbackEmailEN = {
  subject: ({ feedback, user }: FeedbackEmailParams) => {
    const displayName = user.firstName || user.username || 'User';
    const stars = feedback.rating ? '⭐'.repeat(feedback.rating) : '';
    const isRenderCategory =
      feedback.category && feedback.category !== FeedbackCategory.OTHER;
    const categoryEmoji = isRenderCategory
      ? FeedbackCategoryEmoji[feedback.category]
      : '';

    return `📝${stars} From ${displayName} ${categoryEmoji}`;
  },

  html: ({ feedback, user }: FeedbackEmailParams) => {
    const displayName = user.firstName || user.username || 'User';

    const isRenderCategory =
      feedback.category && feedback.category !== FeedbackCategory.OTHER;

    const stars = feedback.rating
      ? `<span class="star">
        ${'★'.repeat(feedback.rating)}${'☆'.repeat(5 - feedback.rating)}
      </span>`
      : '';

    const categoryLabel = isRenderCategory ? `${feedback.category} ` : '';

    const categoryIcon = isRenderCategory
      ? `
      <div class="background-symbol">
        ${FeedbackCategoryEmoji[feedback.category]}
      </div>
    `
      : '';

    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    ${EmailStyles.FEEDBACK}
  </style>
</head>

<body>
  <div class="container">
    <div class="feedback-header">
      <div>
        <h1>
          ${displayName}'s ${categoryLabel}feedback
        </h1>
        ${stars}
      </div>

      ${categoryIcon}
    </div>

    <div class="content">
      ${feedback.message ? `<div class="message">${feedback.message}</div>` : ''}

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
        <p><span class="label">From:</span> ${user?.firstName}</p>
        <p><span class="label">Username:</span> ${user?.username}</p>
        <p><span class="label">Email:</span> ${user?.email}</p>

        <div class="divider"></div>

        <p><span class="label">ID:</span> ${feedback.id}</p>
        <p><span class="label">Category:</span> ${feedback.category}</p>

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

        <p>
          <span class="label">Submitted At:</span>
          ${feedback.createdAt.toISOString()}
        </p>

        ${
          feedback.tags?.length
            ? `
          <div>
            ${feedback.tags
              .map((tag) => `<span class="tag">${tag}</span>`)
              .join('')}
          </div>
        `
            : ''
        }
      </div>

      <div class="footer-info">
        This email was generated automatically.
      </div>
    </div>
  </div>
</body>
</html>
`;
  },
};
