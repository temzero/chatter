// expiration.utils.ts

export interface ExpirationConfig {
  value: string;
  defaultUnit?: 'ms' | 's' | 'm' | 'h' | 'd';
}

/**
 * Formats expiration string to human readable format
 * Supports: "15m", "1h", "2d", "30s", "500ms"
 */
export function formatExpiration(value: string | undefined): string {
  if (!value || typeof value !== 'string') return 'unknown';

  const match = value.match(/^(\d+)(ms|s|m|h|d)$/);
  if (!match) return value; // Return original if format doesn't match

  const [, numStr, unit] = match;
  const num = parseInt(numStr, 10);

  if (isNaN(num)) return value;

  const unitMap: Record<string, string> = {
    ms: 'millisecond',
    s: 'second',
    m: 'minute',
    h: 'hour',
    d: 'day',
  };

  const unitName = unitMap[unit] || unit;
  const plural = num > 1 ? 's' : '';

  return `${num} ${unitName}${plural}`;
}

/**
 * Converts expiration string to milliseconds
 * Supports: "15m", "1h", "2d", "30s", "500ms"
 */
export function formatExpirationToMs(value: string): number {
  if (!value || typeof value !== 'string') {
    throw new Error('Invalid expiration value: must be a non-empty string');
  }

  const match = value.match(/^(\d+)(ms|s|m|h|d)$/);
  if (!match) {
    throw new Error(
      `Invalid expiration format: ${value}. Expected format like "15m", "1h", "2d"`,
    );
  }

  const [, numStr, unit] = match;
  const num = parseInt(numStr, 10);

  if (isNaN(num) || num <= 0) {
    throw new Error(
      `Invalid expiration number: ${numStr}. Must be a positive integer`,
    );
  }

  const unitMultipliers: Record<string, number> = {
    ms: 1,
    s: 1000,
    m: 1000 * 60,
    h: 1000 * 60 * 60,
    d: 1000 * 60 * 60 * 24,
  };

  const multiplier = unitMultipliers[unit];
  if (!multiplier) {
    throw new Error(
      `Unsupported time unit: ${unit}. Supported units: ms, s, m, h, d`,
    );
  }

  return num * multiplier;
}

/**
 * Validates if a string is a valid expiration format
 */
export function isValidExpirationFormat(value: string): boolean {
  return /^\d+(ms|s|m|h|d)$/.test(value);
}

/**
 * Gets expiration in milliseconds with fallback
 */
export function getExpirationInMs(value: string, fallback?: string): number {
  try {
    return formatExpirationToMs(value);
  } catch {
    if (fallback) {
      return formatExpirationToMs(fallback);
    }
    throw new Error(
      `Invalid expiration format and no fallback provided: ${value}`,
    );
  }
}
