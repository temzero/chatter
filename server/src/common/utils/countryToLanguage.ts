// src/common/utils/countryToLang.ts
export function countryToLang(countryCode: string | null): string {
  switch (countryCode?.toUpperCase()) {
    case 'VN': // Vietnam
      return 'vi';
    case 'ES': // Spain
    case 'MX': // Mexico
    case 'AR': // Argentina
    case 'CO': // Colombia
      return 'es';
    case 'CN': // China
    case 'TW': // Taiwan
    case 'HK': // Hong Kong
    case 'SG': // Singapore
      return 'zh';
    case 'JP': // Japan
      return 'ja';
    case 'KR': // South Korea
      return 'ko';
    case 'TH': // Thailand
      return 'th';
    case 'IN': // India
      return 'hi';
    case 'US': // United States
    case 'GB': // United Kingdom
    case 'AU': // Australia
    case 'CA': // Canada
      return 'en';
    default:
      return 'en'; // fallback English
  }
}
