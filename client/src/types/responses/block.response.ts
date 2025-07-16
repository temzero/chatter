// import { UserResponseDto } from "@/types/responses/user.response";
import { UserResponse } from "@/types/responses/user.response";

export interface BlockResponseDto {
  id: string;
  blockerId: string;
  blocked: UserResponse;
  createdAt: string;
  reason: string | null;
}
