import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { RegisterRequest } from '@shared/types/requests/auth.request';

export class RegisterDto implements RegisterRequest {
  @IsString()
  @Length(1, 100)
  firstName: string;

  @IsString()
  @Length(1, 100)
  lastName: string;

  @IsString()
  @Length(3, 100)
  @Matches(/^[a-z0-9_.-]+$/)
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @Length(8, 128)
  password: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;
}
