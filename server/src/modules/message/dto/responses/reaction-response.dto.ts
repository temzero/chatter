import { Exclude, Expose, Type } from 'class-transformer';
import { SenderResponseDto } from './sender-response.dto';

@Exclude()
export class ReactionResponseDto {
  @Expose()
  id: string;

  @Expose()
  emoji: string;

  @Expose()
  userId: string;

  @Expose()
  @Type(() => SenderResponseDto)
  user?: SenderResponseDto;

  @Expose()
  updatedAt: Date;
}
