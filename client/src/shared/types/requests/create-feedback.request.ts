// shared/types/requests/create-feedback.request.ts
import {
  FeedbackCategory,
  FeedbackPriority,
} from "@/shared/types/enums/feedback.enum";

export interface CreateFeedbackRequest {
  userId?: string;
  sessionId?: string;
  rating?: number;
  category?: FeedbackCategory;
  message?: string;
  tags?: string[];
  priority?: FeedbackPriority;
  appVersion?: string;
  platform?: string;
  osVersion?: string;
  deviceInfo?: {
    deviceModel?: string;
    browser?: string;
    browserVersion?: string;
    screenResolution?: string;
    language?: string;
  };
  imageUrl?: string;
  pageUrl?: string;
  userAgent?: string;
  ipAddress?: string;
}
