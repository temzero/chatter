import { IsOptional, IsUUID, IsNumber, Min, Max } from 'class-validator';

export class GetMessagesDto {
  @IsUUID()
  chatId: string;

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

  @IsOptional()
  @IsNumber()
  @Min(0)
  offset = 0;
}
