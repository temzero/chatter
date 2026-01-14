// shared/types/responses/feedback.response.ts
import {
  FeedbackCategory,
  FeedbackStatus,
  FeedbackPriority,
} from "@/shared/types/enums/feedback.enum";
import { UserResponse } from "./user.response";
import { Platform } from "../enums/platform.enum";

export interface FeedbackResponse {
  id: string;
  userId: string;
  sessionId?: string;
  rating?: number;
  category: FeedbackCategory;
  message: string;
  imageUrl?: string;
  tags?: string[];
  status: FeedbackStatus;
  priority?: FeedbackPriority;
  platform?: Platform;
  deviceInfo?: {
    deviceModel?: string;
    browser?: string;
    browserVersion?: string;
    screenResolution?: string;
    language?: string;
  };
  userAgent?: string;
  appVersion?: string;
  createdAt: string;
  updatedAt: string;
  user?: UserResponse;
}
