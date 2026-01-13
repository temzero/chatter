// shared/types/responses/feedback.response.ts
import {
  FeedbackCategory,
  FeedbackStatus,
  FeedbackPriority,
} from "@/shared/types/enums/feedback.enum";
import { UserResponse } from "./user.response";

export interface FeedbackResponse {
  id: string;
  userId: string;
  sessionId?: string;
  rating?: number;
  category: FeedbackCategory;
  message?: string;
  tags?: string[];
  status: FeedbackStatus;
  priority?: FeedbackPriority;
  assignedToId?: string;
  team?: string;
  adminResponse?: string;
  respondedAt?: string;
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
  createdAt: string;
  updatedAt: string;
  user?: UserResponse;
  assignedTo?: UserResponse;
}


