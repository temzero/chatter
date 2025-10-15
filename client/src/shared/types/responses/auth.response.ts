export interface AuthResponse {
  accessToken: string;
  message?: string;
}

export interface RefreshResponse {
  accessToken: string;
  email: string;
  deviceName: string;
  message?: string;
}
