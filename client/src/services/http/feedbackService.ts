// services/api/feedback/feedback.service.ts
import API from "@/services/api/api";
import { PaginationQuery } from "@/shared/types/queries/pagination-query";
import { PaginationResponse } from "@/shared/types/responses/pagination.response";
import { CreateFeedbackRequest } from "@/shared/types/requests/create-feedback.request";
import { FeedbackResponse } from "@/shared/types/responses/feedback.response";
import { FeedbackStatsResponse } from "@/shared/types/responses/feedback-stats.response";
import { getCurrentUserId } from "@/stores/authStore";
import { Platform } from "@/shared/types/enums/platform.enum";

export const feedbackService = {
  /**
   * Submit new feedback
   */
  async createFeedback(
    feedbackData: Partial<CreateFeedbackRequest>
  ): Promise<FeedbackResponse> {
    const deviceInfo = getDeviceInfo();

    const enhancedData = {
      ...deviceInfo,
      ...feedbackData, // User data overrides device info
    };

    const { data } = await API.post("/feedback", enhancedData);
    return data;
  },

  /**
   * Get all feedback (admin/dashboard)
   */
  async fetchAllFeedback(
    query?: PaginationQuery
  ): Promise<PaginationResponse<FeedbackResponse>> {
    const { data } = await API.get("/feedback", { params: query });
    return data;
  },

  /**
   * Get feedback by ID
   */
  async fetchFeedbackById(feedbackId: string): Promise<FeedbackResponse> {
    const { data } = await API.get(`/feedback/${feedbackId}`);
    return data;
  },

  /**
   * Get feedback by user ID
   */
  async fetchUserFeedback(
    userId: string,
    query?: PaginationQuery
  ): Promise<PaginationResponse<FeedbackResponse>> {
    const { data } = await API.get(`/feedback/user/${userId}`, {
      params: query,
    });
    return data;
  },

  /**
   * Get feedback statistics
   */
  async fetchFeedbackStats(): Promise<FeedbackStatsResponse> {
    const { data } = await API.get("/feedback/stats");
    return data;
  },

  /**
   * Update feedback
   */
  async updateFeedback(
    feedbackId: string,
    updateData: CreateFeedbackRequest
  ): Promise<FeedbackResponse> {
    const { data } = await API.patch(`/feedback/${feedbackId}`, updateData);
    return data;
  },

  /**
   * Delete feedback
   */
  async deleteFeedback(feedbackId: string): Promise<void> {
    await API.delete(`/feedback/${feedbackId}`);
  },
};

const getPlatform = (): Platform => {
  const userAgent = navigator.userAgent.toLowerCase();

  // Check for specific platforms
  if (/android/.test(userAgent)) {
    return Platform.ANDROID;
  }

  if (/iphone|ipad|ipod/.test(userAgent)) {
    return Platform.IOS;
  }

  // More specific web platform detection
  if (/windows/.test(userAgent)) return Platform.WINDOWS;
  if (/macintosh|mac os x/.test(userAgent)) return Platform.MAC;
  if (/linux/.test(userAgent)) return Platform.LINUX;

  return Platform.WEB;
};

const getDeviceInfo = () => {
  const userAgent = navigator.userAgent;

  return {
    userId: getCurrentUserId(),
    sessionId: sessionStorage.getItem("sessionId") || undefined,
    userAgent,
    deviceInfo: {
      deviceModel: userAgent,
      browser:
        userAgent.match(/(Chrome|Firefox|Safari|Edge)\//)?.[1] || "Unknown",
      browserVersion:
        userAgent.match(/(Chrome|Firefox|Safari|Edge)\/[\d.]+/)?.[0] || "",
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      language: navigator.language,
    },
    platform: getPlatform(),
  };
};
