import {
  IsEmail,
  IsOptional,
  MinLength,
  IsString,
  IsBoolean,
  IsDate,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Invalid email address' })
  email?: string;

  @IsOptional()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  first_name?: string;

  @IsOptional()
  @IsString()
  last_name?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9+\-\s]+$/, { message: 'Invalid phone number' })
  phone_number?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  birthday?: Date;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsBoolean()
  is_email_verified?: boolean = false;

  @IsOptional()
  @IsBoolean()
  is_deleted?: boolean = false;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  last_seen?: Date;
}
