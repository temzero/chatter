import { UserResponse } from './user.response';

export interface AuthResponse {
  accessToken: string;
  user?: UserResponse;
  message?: string;
}
