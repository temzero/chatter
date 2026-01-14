export enum FeedbackCategory {
  BUG = 'bug',
  FEATURE = 'feature',
  INTERFACE = 'interface',
  IMPROVEMENT = 'improvement',
  PERFORMANCE = 'performance',
  SECURITY = 'security',
  OTHER = 'other',
}

export enum FeedbackStatus {
  NEW = 'new',
  REVIEWED = 'reviewed',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  REJECTED = 'rejected',
}

export enum FeedbackPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export const FeedbackCategoryIcons: Record<FeedbackCategory, string> = {
  [FeedbackCategory.BUG]: 'bug_report',
  [FeedbackCategory.INTERFACE]: 'web',
  [FeedbackCategory.FEATURE]: 'add_circle',
  [FeedbackCategory.IMPROVEMENT]: 'upgrade',
  [FeedbackCategory.PERFORMANCE]: 'speed',
  [FeedbackCategory.SECURITY]: 'lock',
  [FeedbackCategory.OTHER]: 'more_horiz',
} as const;

export const FeedbackCategoryEmoji: Record<FeedbackCategory, string> = {
  [FeedbackCategory.BUG]: '🪲',
  [FeedbackCategory.INTERFACE]: '🎨',
  [FeedbackCategory.FEATURE]: '💡',
  [FeedbackCategory.IMPROVEMENT]: '🚀',
  [FeedbackCategory.PERFORMANCE]: '⏱️',
  [FeedbackCategory.SECURITY]: '🔒',
  [FeedbackCategory.OTHER]: '❓',
} as const;
