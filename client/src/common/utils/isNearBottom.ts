export function isNearBottom(
  element: HTMLElement | null,
  thresholdRatio: number = 1 // Default: 1x screen height
): boolean {
  if (!element) return false;

  const visibleHeight = element.clientHeight;
  const scrollPosition = element.scrollTop + visibleHeight;
  const totalHeight = element.scrollHeight;

  const threshold = visibleHeight * thresholdRatio;

  return totalHeight - scrollPosition <= threshold;
}
