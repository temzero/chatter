import { Expose } from 'class-transformer';
import { UserResponseDto } from '../../user/dto/responses/user-response.dto';
import { BlockResponse } from 'src/shared/types/responses/block.response';

export class BlockResponseDto implements BlockResponse {
  @Expose() id: string;
  @Expose() blockerId: string;
  @Expose() blockedId: string;
  @Expose() blocked: UserResponseDto;
  @Expose() createdAt: Date;
  @Expose() reason: string | null;
}
