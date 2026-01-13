// services/api/feedback/feedback.service.ts
import API from "@/services/api/api";
import { PaginationQuery } from "@/shared/types/queries/pagination-query";
import { PaginationResponse } from "@/shared/types/responses/pagination.response";
import { CreateFeedbackRequest } from "@/shared/types/requests/create-feedback.request";
import { FeedbackResponse } from "@/shared/types/responses/feedback.response";
import { FeedbackStatsResponse } from "@/shared/types/responses/feedback-stats.response";
import { UpdateFeedbackRequest } from "@/shared/types/requests/update-feedback.request";

export const feedbackService = {
  /**
   * Submit new feedback
   */
  async createFeedback(
    feedbackData: CreateFeedbackRequest
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
    updateData: UpdateFeedbackRequest
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

const getDeviceInfo = () => {
  const userAgent = navigator.userAgent;

  return {
    pageUrl: window.location.href,
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
    platform: /Android/.test(userAgent)
      ? "ANDROID"
      : /iPhone|iPad|iPod/.test(userAgent)
      ? "IOS"
      : "WEB",
  };
};
