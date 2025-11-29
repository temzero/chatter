import {
  IsOptional,
  IsString,
  IsEmail,
  Length,
  IsPhoneNumber,
  IsEnum,
  IsDate,
  IsUrl,
  IsBoolean,
  IsObject,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { UserRole } from '../../constants/user-role.constants';
import { UserStatus } from '../../constants/user-status.constants';
import { PartialType } from '@nestjs/mapped-types';
import { EmptyStringToNull } from '@/common/utils/dto.utils';

export class UpdateUserDto {
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
  @Length(3, 100)
  @EmptyStringToNull()
  username?: string;

  @IsOptional()
  @IsEmail()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.toLowerCase().trim() : value,
  )
  email?: string;

  @IsOptional()
  @IsPhoneNumber()
  @EmptyStringToNull()
  phoneNumber?: string | null;

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

  @IsOptional()
  @IsUrl()
  @EmptyStringToNull()
  avatarUrl?: string | null;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @IsOptional()
  @IsBoolean()
  emailVerified?: boolean;

  @IsOptional()
  @IsBoolean()
  phoneVerified?: boolean;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any> | null;
}

// For partial updates (PATCH requests)
export class PartialUpdateUserDto extends PartialType(UpdateUserDto) {}
