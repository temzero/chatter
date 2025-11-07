import { TFunction } from "i18next";

export const formatDuration = (seconds: number) => {
  if (!seconds || seconds <= 0) return "00:00";

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  // Pad numbers with leading zeros
  const minsStr = mins.toString().padStart(2, "0");
  const secsStr = secs.toString().padStart(2, "0");

  return `${minsStr}:${secsStr}`;
};

export function formatDurationByStartAndEnd(
  start?: string | Date,
  end?: string | Date | null,
  t?: TFunction
) {
  if (!start || !end) return t ? t("time.empty") : "-";

  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffMs = endDate.getTime() - startDate.getTime();

  if (diffMs <= 0) return t ? t("time.empty") : "-";

  const totalSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  let result = "";
  if (hours > 0) result += `${hours}${t ? t("time.hour") : "h"} `;
  if (minutes > 0) result += `${minutes}${t ? t("time.minute") : "m"} `;
  if (seconds > 0) result += `${seconds}${t ? t("time.second") : "s"}`;

  return result.trim();
}
