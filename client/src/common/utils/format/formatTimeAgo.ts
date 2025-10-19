import { formatDateTime } from "./formatDateTime";

export const formatTimeAgo = (dateString: string | Date): string => {
  const createdAt = new Date(dateString);
  const now = new Date();

  const diffMs = now.getTime() - createdAt.getTime();
  if (diffMs < 0) return "In the future";

  const diffSecs = Math.floor(diffMs / 1000);
  if (diffSecs < 60) return "now";

  const diffMins = Math.floor(diffSecs / 60);
  if (diffMins < 60) return `${diffMins}m`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d`;

  // If older than 1 month → use full formatted date/time
  return formatDateTime(createdAt, true) ?? "";
};
