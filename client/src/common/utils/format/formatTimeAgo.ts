import { TFunction } from "i18next";
import { formatDateTime } from "./formatDateTime";

export const formatTimeAgo = (
  t: TFunction,
  dateString: string | Date
): string => {
  const createdAt = new Date(dateString);
  const now = new Date();

  const diffMs = now.getTime() - createdAt.getTime();
  if (diffMs < 0) return t("time.future");

  const diffSecs = Math.floor(diffMs / 1000);
  if (diffSecs < 60) return t("time.now");

  const diffMins = Math.floor(diffSecs / 60);
  if (diffMins < 60) return `${diffMins}${t("time.minute")}`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}${t("time.hour")}`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}${t("time.day")}`;

  // If older than 1 month → use full formatted date/time
  return formatDateTime(createdAt, true) ?? "";
};
