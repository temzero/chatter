import { IsPhoneNumber, IsString } from 'class-validator';

export class VerifyPhoneDto {
  @IsString()
  @IsPhoneNumber(undefined, { message: 'Invalid phone number format' })
  phoneNumber: string;
}
