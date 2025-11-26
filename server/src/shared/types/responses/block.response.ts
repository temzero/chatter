import { UserResponse } from 'src/shared/types/responses/user.response';

export interface BlockResponse {
  id: string;
  blockerId: string;
  blockedId: string;
  blocked: UserResponse;
  createdAt: string | Date;
  reason: string | null;
}
