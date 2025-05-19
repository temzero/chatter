// import {
//   IsEmail,
//   IsOptional,
//   IsString,
//   Length,
//   Matches,
// } from 'class-validator';

// export class RegisterDto {
//   @IsString()
//   @Length(1, 100)
//   firstName: string;

//   @IsString()
//   @Length(1, 100)
//   @IsOptional()
//   lastName?: string;

//   @IsString()
//   @Length(3, 100)
//   @Matches(/^[a-z0-9_.-]+$/)
//   username: string;

//   @IsEmail()
//   email: string;

//   @IsString()
//   @Length(8, 128)
//   password: string;

//   @IsString()
//   @Length(8, 128)
//   confirmPassword: string;
// }
