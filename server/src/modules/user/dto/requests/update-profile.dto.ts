import { IsOptional, IsString, Length, IsDate, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';
import { EmptyStringToNull } from 'src/common/utils/dto.utils';

export class UpdateProfileDto {
  @IsOptional()
  @IsUrl()
  // @Length(0, 512)
  @EmptyStringToNull()
  avatarUrl?: string | null;

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
export class PartialUpdateUserDto extends PartialType(UpdateProfileDto) {}
