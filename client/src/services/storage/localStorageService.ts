import { v4 as uuidv4 } from "uuid";

export const localStorageService = {
  // ─────────────────────────────────
  // TOKEN MANAGEMENT
  // ─────────────────────────────────
  getAccessToken(): string | null {
    const accessToken = localStorage.getItem("accessToken");
    console.log("[ACCESS TOKEN]", accessToken);
    return accessToken;
  },

  setAccessToken(token: string): void {
    localStorage.setItem("accessToken", token);
  },

  // ─────────────────────────────────
  // DEVICE ID
  // ─────────────────────────────────
  getDeviceId(): string {
    let deviceId = localStorage.getItem("deviceId");
    if (!deviceId) {
      deviceId = uuidv4();
      localStorage.setItem("deviceId", deviceId);
    }
    return deviceId;
  },

  // ─────────────────────────────────
  // DEVICE NAME
  // ─────────────────────────────────
  getDeviceName(): string {
    const saved = localStorage.getItem("deviceName");
    if (saved) return saved;

    const ua = navigator.userAgent;
    let os = "Unknown OS";
    let browser = "Unknown Browser";
    let deviceType = "Desktop";

    // Device Type
    if (/Mobi|Android/i.test(ua)) {
      deviceType = "Mobile";
    } else if (/Tablet|iPad/i.test(ua)) {
      deviceType = "Tablet";
    }

    // OS
    if (/Windows/.test(ua)) os = "Windows";
    else if (/Android/.test(ua)) os = "Android";
    else if (/iPhone|iPad|iPod/.test(ua)) os = "iOS";
    else if (/Mac OS X/.test(ua)) os = "macOS";
    else if (/Linux/.test(ua)) os = "Linux";

    // Browser
    if (/Chrome/.test(ua) && !/Edg|OPR|Opera/.test(ua)) browser = "Chrome";
    else if (/Firefox/.test(ua)) browser = "Firefox";
    else if (/Safari/.test(ua) && !/Chrome/.test(ua)) browser = "Safari";
    else if (/Edg/.test(ua)) browser = "Edge";
    else if (/OPR|Opera/.test(ua)) browser = "Opera";

    const deviceName = `${deviceType} ${os} ${browser}`;
    localStorage.setItem("deviceName", deviceName);
    return deviceName;
  },

  setDeviceName(deviceName: string): void {
    localStorage.setItem("deviceName", deviceName);
  },

  // ─────────────────────────────────
  // COUNTRY MANAGEMENT (NEW)
  // ─────────────────────────────────
  getCountry(): string | null {
    return localStorage.getItem("clientCountry");
  },

  setCountry(countryCode: string): void {
    localStorage.setItem("clientCountry", countryCode);
  },

  removeCountry(): void {
    localStorage.removeItem("clientCountry");
  },

  // ─────────────────────────────────
  // GENERAL STORAGE
  // ─────────────────────────────────
  getItem(key: string): string | null {
    return localStorage.getItem(key);
  },

  setItem(key: string, value: string): void {
    localStorage.setItem(key, value);
  },

  removeItem(key: string): void {
    localStorage.removeItem(key);
  },

  // ─────────────────────────────────
  // CLEAR AUTH
  // ─────────────────────────────────
  clearAuth(): void {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
  },

  // Clear everything
  clearAll(): void {
    localStorage.clear();
  },
};
