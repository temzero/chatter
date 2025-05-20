import { Transform, Type } from 'class-transformer';
import {
  IsOptional,
  IsInt,
  Min,
  Max,
  IsBoolean,
  IsDate,
} from 'class-validator';

export class GetUsersDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  createdAfter?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  updatedBefore?: Date;

  @IsOptional()
  sortBy?: 'createdAt' | 'updatedAt' | 'lastActiveAt' = 'createdAt';

  @IsOptional()
  @Transform(({ value }) => (value === 'asc' ? 'asc' : 'desc'))
  sortOrder?: 'asc' | 'desc' = 'desc';
}
