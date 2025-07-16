// src/modules/block/dto/responses/block-response.dto.ts
import { UserResponseDto } from '../../user/dto/responses/user-response.dto';

export class BlockResponseDto {
  id: string;
  blockerId: string;
  blocked: UserResponseDto;
  createdAt: Date;
  reason: string | null;
}
