import { IsOptional, IsString, Length, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';
import { EmptyStringToNull } from '@/common/utils/dto.utils';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @EmptyStringToNull()
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  @EmptyStringToNull()
  firstName?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  @EmptyStringToNull()
  lastName?: string;

  @IsOptional()
  @IsString()
  @Length(0, 512)
  @EmptyStringToNull()
  bio?: string | null;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  @EmptyStringToNull()
  birthday?: Date | null;
}

// For partial updates (PATCH requests)
export class PartialUpdateProfileDto extends PartialType(UpdateProfileDto) {}
