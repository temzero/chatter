// pagination-query.dto.ts
import { IsOptional, IsInt, IsString, Min, Max } from 'class-validator';
import { PaginationQuery } from '@shared/types/queries/pagination-query';
import { Type } from 'class-transformer';

export class PaginationQueryDto implements PaginationQuery {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  offset?: number;

  @IsOptional()
  @IsString()
  lastId?: string;
}
