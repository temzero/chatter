import { IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  identifier: string; // username OR email OR phone

  @IsString()
  @IsNotEmpty()
  password: string;
}
