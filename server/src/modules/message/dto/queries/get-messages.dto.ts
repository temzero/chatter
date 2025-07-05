import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, IsString } from 'class-validator';

export class GetMessagesQuery {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsString()
  beforeMessageId?: string;
}
