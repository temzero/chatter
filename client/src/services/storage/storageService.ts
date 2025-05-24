import { v4 as uuidv4 } from "uuid";

export const storageService = {
  // Token management
  getAccessToken(): string | null {
    return localStorage.getItem("accessToken");
  },

  setAccessToken(token: string): void {
    localStorage.setItem("accessToken", token);
  },

  // User data management
  // getUser(): User | null {
  //   const user = localStorage.getItem("user");
  //   return user ? JSON.parse(user) : null;
  // },
  // setUser(user: User): void {
  //   localStorage.setItem("user", JSON.stringify(user));
  // },

  getDeviceId(): string {
    let deviceId = localStorage.getItem("deviceId");
    if (!deviceId) {
      deviceId = uuidv4(); // Generate a unique device ID if not found
      localStorage.setItem("deviceId", deviceId); // Store it in localStorage
    }
    return deviceId;
  },

  getDeviceName(): string {
    const saved = localStorage.getItem("deviceName");
    if (saved) return saved;

    const ua = navigator.userAgent;
    let os = "Unknown OS";
    let browser = "Unknown Browser";
    let deviceType = "Desktop"; // default

    // Detect Device Type
    if (/Mobi|Android/i.test(ua)) {
      deviceType = "Mobile";
    } else if (/Tablet|iPad/i.test(ua)) {
      deviceType = "Tablet";
    }

    // Detect OS
    if (/Windows NT 10.0/.test(ua)) os = "Windows 10";
    else if (/Windows NT 6.1/.test(ua)) os = "Windows 7";
    else if (/Android/.test(ua)) os = "Android";
    else if (/iPhone|iPad|iPod/.test(ua)) os = "iOS";
    else if (/Mac OS X/.test(ua)) os = "macOS";
    else if (/Linux/.test(ua)) os = "Linux";

    // Detect browser
    if (/Chrome/.test(ua) && !/Edg|OPR|Opera/.test(ua)) {
      browser = "Chrome";
    } else if (/Firefox/.test(ua)) {
      browser = "Firefox";
    } else if (/Safari/.test(ua) && !/Chrome/.test(ua)) {
      browser = "Safari";
    } else if (/Edg/.test(ua)) {
      browser = "Edge";
    } else if (/OPR|Opera/.test(ua)) {
      browser = "Opera";
    }

    const deviceName = `${deviceType} ${os} ${browser}`;
    localStorage.setItem("deviceName", deviceName);
    return deviceName;
  },

  setDeviceName(deviceName: string): void {
    localStorage.setItem("deviceName", deviceName);
  },

  // General storage methods
  getItem(key: string): string | null {
    return localStorage.getItem(key);
  },

  setItem(key: string, value: string): void {
    localStorage.setItem(key, value);
  },

  removeItem(key: string): void {
    localStorage.removeItem(key);
  },
  // Clear all auth-related data
  clearAuth(): void {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
  },

  clearAll(): void {
    localStorage.clear();
  },
};
