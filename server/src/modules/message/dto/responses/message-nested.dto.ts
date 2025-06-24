// message-nested.dto.ts
import { Exclude, Expose, Type } from 'class-transformer';
import { SenderResponseDto } from './sender-response.dto';

@Exclude()
export class NestedMessageDto {
  @Expose() id: string;

  @Expose()
  @Type(() => SenderResponseDto)
  sender?: SenderResponseDto | null;

  @Expose() content: string;
  @Expose() createdAt: Date;

  @Expose()
  attachments?: any[];
}
