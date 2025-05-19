import { IsOptional, IsUUID, IsNumber, Min, Max } from 'class-validator';

export class GetMessagesQueryDto {
  @IsOptional()
  @IsUUID()
  beforeMessageId?: string;

  @IsOptional()
  @IsUUID()
  afterMessageId?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit = 20;
}
