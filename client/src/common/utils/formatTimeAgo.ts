export const formatTimeAgo = (dateString: string | Date): string => {
  const createdAt = new Date(dateString);
  const now = new Date();

  const diffMs = now.getTime() - createdAt.getTime();
  if (diffMs < 0) return "In the future";

  // Calculate seconds
  const diffSecs = Math.floor(diffMs / 1000);
  if (diffSecs < 60) {
    return `now`;
  }

  // Calculate minutes
  const diffMins = Math.floor(diffSecs / 60);
  if (diffMins < 60) {
    return `${diffMins}m`;
  }

  // Calculate hours
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) {
    return `${diffHours}h`;
  }

  // Calculate days
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) {
    return `${diffDays}d`;
  }

  // Calculate months (approximate)
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) {
    return `${diffMonths}mth`;
  }

  // Calculate years
  const diffYears = Math.floor(diffMonths / 12);
  return `${diffYears} year${diffYears !== 1 ? "s" : ""}`;
};
