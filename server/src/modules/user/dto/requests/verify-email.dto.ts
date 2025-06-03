import { IsEmail, IsString } from 'class-validator';

export class VerifyEmailDto {
  @IsString()
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;
}

export class VerifyEmailCodeDto {
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsString()
  verificationCode: string;
}
