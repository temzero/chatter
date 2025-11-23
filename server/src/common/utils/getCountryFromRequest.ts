import type { Request } from 'express';

/**
 * Detect language based on timezone.
 * Default: 'en'
 */
export function getCountryCodeFromRequest(req: Request): string {
  const timezone =
    req.headers['x-client-timezone']?.toString() ||
    Intl.DateTimeFormat().resolvedOptions().timeZone;

  switch (timezone) {
    // ===== Vietnamese =====
    case 'Asia/Ho_Chi_Minh':
    case 'Asia/Saigon':
    case 'Asia/Hanoi':
      return 'vi';

    // ===== Thai =====
    case 'Asia/Bangkok':
      return 'th';

    // ===== Indonesian (Bahasa) =====
    case 'Asia/Jakarta':
    case 'Asia/Makassar':
    case 'Asia/Jayapura':
      return 'id';

    // ===== Malaysian =====
    case 'Asia/Kuala_Lumpur':
    case 'Asia/Kuching':
      return 'ms'; // (if you add Malay later)

    // ===== Singapore — English/Chinese mixed — default to English =====
    case 'Asia/Singapore':
      return 'en';

    // ===== Chinese (Simplified) =====
    case 'Asia/Shanghai':
    case 'Asia/Chongqing':
    case 'Asia/Harbin':
    case 'Asia/Urumqi':
      return 'zh';

    // ===== Chinese (Traditional: Taiwan, Hong Kong) =====
    case 'Asia/Taipei':
    case 'Asia/Hong_Kong':
      return 'zh';

    // ===== Japanese =====
    case 'Asia/Tokyo':
      return 'ja';

    // ===== Korean =====
    case 'Asia/Seoul':
      return 'ko';

    // ===== Hindi (India) =====
    case 'Asia/Kolkata':
      return 'hi';

    // ===== Spanish speaking regions =====
    case 'Europe/Madrid':
    case 'Atlantic/Canary':
    case 'America/Mexico_City':
    case 'America/Argentina/Buenos_Aires':
    case 'America/Santiago':
    case 'America/Lima':
    case 'America/Bogota':
    case 'America/Guatemala':
      return 'es';

    // ===== English-speaking regions =====
    case 'Europe/London':
    case 'America/New_York':
    case 'America/Chicago':
    case 'America/Denver':
    case 'America/Los_Angeles':
    case 'America/Toronto':
    case 'Australia/Sydney':
    case 'Australia/Melbourne':
    case 'Pacific/Auckland':
      return 'en';

    // ===== Default =====
    default:
      return 'en';
  }
}
