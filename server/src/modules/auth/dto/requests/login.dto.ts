import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { LoginRequest } from '@shared/types/requests/auth.request';

export class LoginDto implements LoginRequest {
  @IsString({ message: 'email or username or phone number' })
  @IsNotEmpty()
  identifier: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean = false;
}
