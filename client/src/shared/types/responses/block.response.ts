import { UserResponse } from "@/shared/types/responses/user.response";

export interface BlockResponse {
  id: string;
  blockerId: string;
  blocked: UserResponse;
  createdAt: string;
  reason: string | null;
}
