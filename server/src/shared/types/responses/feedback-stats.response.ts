// shared/types/responses/feedback-stats.response.ts
export interface FeedbackStatsResponse {
  total: number;
  withRating: number;
  averageRating: number | null;
  statusCounts?: Record<string, number>;
  categoryCounts?: Record<string, number>;
}
