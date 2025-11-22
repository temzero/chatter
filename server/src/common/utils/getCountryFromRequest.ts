import type { Request } from 'express';

/**
 * Get country code based on timezone only.
 * Defaults to 'EN' if timezone not recognized.
 */
export function getCountryCodeFromRequest(req: Request): string {
  // Get timezone from client (passed from headers) or server (fallback)
  const timezone =
    req.headers['x-client-timezone']?.toString() ||
    Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Map timezone to country code
  switch (timezone) {
    case 'Asia/Saigon':
    case 'Asia/Ho_Chi_Minh':
      return 'VN';
    case 'Asia/Bangkok':
      return 'TH';
    case 'Asia/Jakarta':
      return 'ID';
    case 'Asia/Kuala_Lumpur':
      return 'MY';
    // add more mappings as needed
    default:
      return 'EN'; // fallback
  }
}
