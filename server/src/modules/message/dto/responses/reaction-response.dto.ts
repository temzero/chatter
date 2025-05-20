import { Expose, Type } from 'class-transformer';
import { UserResponseDto } from 'src/modules/user/dto/responses/user-response.dto';

export class ReactionResponseDto {
  @Expose()
  id: string;

  @Expose()
  emoji: string;

  @Expose()
  @Type(() => UserResponseDto)
  user: UserResponseDto;

  @Expose()
  updatedAt: Date;
}
