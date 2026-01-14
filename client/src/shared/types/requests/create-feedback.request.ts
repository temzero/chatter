// shared/types/requests/create-feedback.request.ts
import {
  FeedbackCategory,
  FeedbackPriority,
} from "@/shared/types/enums/feedback.enum";

// shared/types/requests/create-feedback.request.ts
export interface CreateFeedbackRequest {
  userId: string;
  sessionId?: string;
  rating?: number;
  category: FeedbackCategory;
  message: string;
  imageUrl?: string;
  tags?: string[];
  status?: string;
  priority?: FeedbackPriority;
  platform?: string;
  userAgent?: string;
  appVersion?: string;
  deviceInfo?: {
    deviceModel?: string;
    browser?: string;
    browserVersion?: string;
    screenResolution?: string;
    language?: string;
  };
}
