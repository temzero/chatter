import { UserResponseDto } from '../../user/dto/responses/user-response.dto';
import { BlockResponse } from 'src/shared/types/responses/block.response';

export class BlockResponseDto implements BlockResponse {
  id: string;
  blockerId: string;
  blocked: UserResponseDto;
  createdAt: Date;
  reason: string | null;
}
