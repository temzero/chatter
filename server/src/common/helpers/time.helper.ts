export function convertSecondsToMilliseconds(value: number): number {
  if (typeof value !== 'number' || value <= 0) {
    throw new Error(
      'Invalid expiration value: must be a positive number (seconds)',
    );
  }
  return value * 1000;
}

/**
 * Convert seconds to human-readable expiration string
 * @param seconds Number of seconds
 * @returns Formatted string like "15m", "1h", "2d", "30s"
 */
export function formatSecondsToString(seconds: number): string {
  if (typeof seconds !== 'number' || seconds < 0) {
    throw new Error('Invalid input: seconds must be a non-negative number');
  }

  if (seconds === 0) return '0s';

  const units = [
    { label: 'd', value: 60 * 60 * 24 }, // days
    { label: 'h', value: 60 * 60 }, // hours
    { label: 'm', value: 60 }, // minutes
    { label: 's', value: 1 }, // seconds
  ];

  for (const unit of units) {
    if (seconds >= unit.value) {
      const amount = Math.floor(seconds / unit.value);
      return `${amount}${unit.label}`;
    }
  }

  return `${seconds}s`; // fallback (should not happen)
}
